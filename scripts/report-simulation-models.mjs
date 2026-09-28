import { readFile, writeFile } from 'node:fs/promises'

const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
const catalog = await readJson('assets/circuit-library/catalog/components-all.json')
const map = await readJson('tinkercad-engine-complete-extracted/indexes/component-model-map.json')
const modelIndex = await readJson('tinkercad-engine-complete-extracted/indexes/model-index.json')
const extractedSource = await readFile('src/extracted-models.ts', 'utf8')
const localLogicModels = new Set([
  ...[...extractedSource.matchAll(/^  '([^']+)': \{/gm)].map(match => match[1]),
  ...[...(extractedSource.match(/export const extractedModelNames = new Set\(\[([\s\S]*?)\]\)/)?.[1] ?? '').matchAll(/'([^']+)'/g)].map(match => match[1]),
])
const analogModels = new Set([
  'resistor', 'led2', 'ledRGB', 'diode', 'lightBulb', 'vibration_motor', 'sensor_tilt_sw200d', 'USBstandard', 'sensorSoilMoisture', 'IRsensor', 'sensor_gas', 'sensor_pir', 'piezoSound', 'Timer555', 'timer556', 'sensor_ultrasonic_ping', 'button', 'capacitor', 'capacitor_polarized', 'inductor', 'function_generator',
  'powerSupply', 'battery9V', 'coinCell', 'AABattery', 'batteryLemon', 'batteryPotato',
  'slide_switch', 'slide_switch_v2', 'potentiometer', 'potentiometer_v2',
  'dip_switch_spdt', 'dip_switch_4', 'dip_switch_6', 'seven_segment_digit_5011bh', 'keypad_4x4', 'zenerDiode', 'npn', 'pnp', 'nmos', 'power_nmos', 'pmos', 'power_pmos', 'tip120', 'voltageRegulator5V', 'voltageRegulator3p3V', 'opAmp_UA741', 'lm393', 'lm339', 'photodiode_v2', 'phototransistor', 'relay_spdt', 'relay_dpdt', 'ldr_v2', 'sensorForce', 'sensorFlex', 'TMP36', 'solarCell',
])
const digitalModels = new Set([...localLogicModels].filter(model => model !== 'function_generator'))
const extractedByName = new Map(map.filter(item => item.simulation_model).map(item => [item.simulation_model, item]))
const moduleByName = new Map(modelIndex.map(item => [item.simulation_model, item]))
// piezoSound is registered in the extracted core module rather than model-index.
if (!moduleByName.has('piezoSound')) moduleByName.set('piezoSound', { simulation_model: 'piezoSound', module_id: '97250', file: 'engine/core/module-97250.js' })
const counts = new Map()
for (const item of catalog) {
  if (!item.simulation_model) continue
  counts.set(item.simulation_model, (counts.get(item.simulation_model) ?? 0) + 1)
}
const rows = [...counts.keys()].sort((a, b) => a.localeCompare(b)).map(model => {
  const extracted = extractedByName.get(model)
  const module = moduleByName.get(model)
  const status = model === 'sensor_ultrasonic_ping' ? 'MNA transitório parcial; echo por deadlines e trigger amostrado'
    : model === 'Timer555' ? 'MNA transitório parcial; latch amostrado por timestep'
    : model === 'timer556' ? 'MNA dual transitório parcial; latches A/B independentes'
      : model === 'function_generator' ? 'MNA transitório parcial; fonte temporal'
      : analogModels.has(model) ? 'MNA DC/transitório parcial'
      : digitalModels.has(model) ? 'Digital/lógico parcial'
      : 'Visual; sem modelo local'
  const found = extracted?.implementation_found ? `sim (módulo ${extracted.module_id})`
    : module ? `sim (módulo ${module.module_id})`
      : 'não encontrado'
  return `| \`${model}\` | ${counts.get(model)} | ${found} | ${status} |`
})
const supportedItems = catalog.filter(item => {
  if (!item.simulation_model) return item.name?.toLowerCase().startsWith('breadboard')
  return analogModels.has(item.simulation_model) || digitalModels.has(item.simulation_model)
}).length
const localModels = counts.size
const availableModels = [...counts.keys()].filter(model => {
  const found = extractedByName.get(model)
  return Boolean(found?.implementation_found || moduleByName.has(model))
}).length
const report = `# Inventário dos modelos de simulação\n\nGerado a partir do catálogo offline, do mapa e dos índices em \`tinkercad-engine-complete-extracted\`. Atualize com \`npm run report:sim-models\`. “Encontrado” quer dizer que a extração contém um módulo, não que esse modelo esteja implementado no simulador local. Os estados locais descrevem o comportamento atual e podem ser parciais.\n\n- Componentes no catálogo: ${catalog.length}.\n- Componentes com lógica elétrica/digital/continuidade local reconhecida: ${supportedItems}; os demais são visuais.\n- Modelos distintos no catálogo: ${localModels}; com implementação encontrada na extração: ${availableModels}.\n- Modelos locais sem implementação encontrada: ${[...counts.keys()].filter(model => !extractedByName.get(model)?.implementation_found && !moduleByName.has(model)).join(', ')}.\n\nDiodo comum e LED 2 pinos usam curvas Shockley extraídas (diodo Is=1e−12 A/n=1; LED Is=1e−20 A, 6 Ω série e n por cor); a continuação numérica do MNA mantém uma pequena fuga reversa aproximada, sem comportamento térmico ou dano. O LED avisa acima de 20 mA e marca breakdown a partir de 120 mA sem limitar a corrente. O modelo piezoSound usa o resistor extraído de 600 Ω e o limite direto >25 V; áudio e intensidade acústica não são implementados. O Timer555 reproduz a ladder/pulls, o latch e a saída/discharge analógicos; o atraso de 0,5 µs é amostrado por timestep. O timer556 contém dois núcleos 555 com estado independente e rails compartilhados, também amostrados pelo timestep. O modelo sensor_ultrasonic_ping reproduz branches MNA e o scheduler de echo nos prazos extraídos, mas os triggers são amostrados pelo passo do caller; pulsos entre amostras baixas são perdidos e não se afirma captura a 2 µs em passos de dezenas de milissegundos.\n\n| Modelo | Itens no catálogo | Implementação extraída | Estado no simulador local |\n|---|---:|---|---|\n${rows.join('\n')}\n`
await writeFile('docs/inventario-modelos-simulacao.md', report)
console.log(`Inventário atualizado: ${localModels} modelos; ${availableModels} com módulo encontrado; ${supportedItems}/${catalog.length} itens reconhecidos localmente.`)
