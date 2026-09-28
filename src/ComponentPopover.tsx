import { RotateCw, Trash2, X } from 'lucide-react'
import { labels, type Part, type Simulation, type Wire } from './model'
import { chipPinRows } from './pinout'
import { variableSensorControl, variableSensorResistance } from './variableSensorModels'
import { getSensorSourceControls, getSensorSourceModel } from './sensorSourceModels'
import { getPhotodetectorControls, getPhotodetectorModel } from './photodetectorModels'
import { LIGHT_BULB_MODEL } from './lightBulbModel'
import { VIBRATION_MOTOR_MODEL } from './vibrationMotorModel'
import { evaluateTiltSensor, TILT_SENSOR_MODEL } from './tiltSensorModel'
import { evaluateSoilMoisture, SOIL_MOISTURE_MODEL } from './soilMoistureModel'
import { resolveSevenSegmentCommonType, SEVEN_SEGMENT_MODEL, type SevenSegmentName } from './sevenSegmentDisplayModel'
import { normalizeKeypadPushed, type KeypadPushedInput } from './keypadModel'
import { IR_SENSOR_MODEL } from './irSensorModel'
import { GAS_SENSOR_MODEL } from './gasSensorModel'
import { evaluatePIRSensorTarget, pirSensorTargetFromPolar, type PIRSensorPoint } from './pirSensorModel'
import { PIEZO_SOUND_MODEL } from './piezoSoundModel'
import { TIMER555_MODEL } from './timer555Model'
import { evaluateUltrasonicTarget, ULTRASONIC_PING_MODEL, ultrasonicTargetFromPolar, type UltrasonicTargetPoint } from './ultrasonicPingModel'
import { libraryAssetUrl, libraryItemSupportsSimulation, libraryPinNames, libraryReferenceLabels, librarySvgPath, type LibraryCatalogItem, type LibraryProperty, type LibraryRecord } from './library'
import './ComponentPopover.css'

export const standardWireColors = [
  { name: 'Verde', hex: '#43a047' }, { name: 'Preto', hex: '#212121' },
  { name: 'Vermelho', hex: '#e53935' }, { name: 'Azul', hex: '#1e88e5' },
  { name: 'Amarelo', hex: '#fdd835' }, { name: 'Laranja', hex: '#fb8c00' },
  { name: 'Marrom', hex: '#6d4c41' }, { name: 'Cinza', hex: '#757575' },
  { name: 'Roxo', hex: '#8e24aa' }, { name: 'Rosa', hex: '#d81b60' },
  { name: 'Turquesa', hex: '#00acc1' }, { name: 'Branco', hex: '#f5f5f5' },
]
export const circuitWireColors = standardWireColors

const resistanceUnits = [
  { label: 'mΩ', scale: 1e-3 }, { label: 'Ω', scale: 1 }, { label: 'kΩ', scale: 1e3 }, { label: 'MΩ', scale: 1e6 },
]
const prefixScale = (prefix?: string | null) => ({ p: 1e-12, n: 1e-9, 'μ': 1e-6, u: 1e-6, m: 1e-3, k: 1e3, M: 1e6, G: 1e9 } as Record<string, number>)[prefix ?? ''] ?? 1

function formatCurrent(value: number): string {
  const magnitude = Math.abs(value)
  if (magnitude === 0) return '0 A'
  if (magnitude >= 1) return `${magnitude.toFixed(3)} A`
  if (magnitude >= 0.001) return `${(magnitude * 1000).toFixed(2)} mA`
  if (magnitude >= 1e-6) return `${(magnitude * 1_000_000).toFixed(2)} μA`
  if (magnitude >= 1e-9) return `${(magnitude * 1_000_000_000).toFixed(2)} nA`
  return `${(magnitude * 1_000_000_000_000).toFixed(2)} pA`
}
function formatSignedCurrent(value: number): string {
  return `${value > 0 ? '+' : value < 0 ? '−' : ''}${formatCurrent(value)}`
}
function formatResistance(value: number): string {
  const magnitude = Math.abs(value)
  if (magnitude >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(3)} GΩ`
  if (magnitude >= 1_000_000) return `${(value / 1_000_000).toFixed(3)} MΩ`
  if (magnitude >= 1_000) return `${(value / 1_000).toFixed(3)} kΩ`
  return `${value.toFixed(2)} Ω`
}
function formatPower(value: number): string {
  const magnitude = Math.abs(value)
  if (magnitude >= 1) return `${magnitude.toFixed(3)} W`
  if (magnitude >= 0.001) return `${(magnitude * 1000).toFixed(2)} mW`
  return `${(magnitude * 1_000_000).toFixed(2)} μW`
}
function electricalKind(part: Part): string {
  if (part.kind !== 'library') return part.kind
  const model = String(part.properties?.simulationModel ?? '')
  if (model === 'resistor') return 'resistor'
  if (model === 'lightBulb') return 'lightBulb'
  if (model === 'vibration_motor') return 'vibrationMotor'
  if (model === 'sensor_tilt_sw200d') return 'tiltSensor'
  if (model === SOIL_MOISTURE_MODEL.id) return 'soilMoisture'
  if (model === 'USBstandard') return 'usbSource'
  if (model === IR_SENSOR_MODEL.id) return 'irSensor'
  if (model === GAS_SENSOR_MODEL.id) return 'gasSensor'
  if (model === 'sensor_pir') return 'pirSensor'
  if (model === PIEZO_SOUND_MODEL.id) return 'piezo'
  if (model === TIMER555_MODEL.id) return 'timer555'
  if (model === 'timer556') return 'timer556'
  if (model === ULTRASONIC_PING_MODEL.id) return 'ultrasonicPing'
  if (['ldr_v2', 'sensorForce', 'sensorFlex'].includes(model)) return 'variableResistor'
  if (model === 'TMP36') return 'tempSensor'
  if (model === 'solarCell') return 'solarCell'
  if (model === 'inductor') return 'inductor'
  if (model === 'led2') return 'led'
  if (model === 'ledRGB') return 'rgbLed'
  if (model === SEVEN_SEGMENT_MODEL.id) return 'sevenSegment'
  if (model === 'keypad_4x4') return 'keypad'
  if (model === 'diode' || model === 'zenerDiode') return 'diode'
  if (model === 'capacitor' || model === 'capacitor_polarized') return 'capacitor'
  if (['potentiometer', 'potentiometer_v2'].includes(model)) return 'potentiometer'
  if (['dip_switch_spdt', 'dip_switch_4', 'dip_switch_6'].includes(model)) return 'dipSwitch'
  if (['powerSupply', 'battery9V', 'coinCell', 'AABattery', 'batteryLemon', 'batteryPotato'].includes(model)) return 'supply'
  if (model === 'function_generator') return 'generator'
  if (model === 'npn' || model === 'pnp') return model
  if (model === 'tip120') return 'tip120'
  if (['voltageRegulator5V', 'voltageRegulator3p3V'].includes(model)) return 'regulator'
  if (model === 'opAmp_UA741') return 'opAmp'
  if (model === 'lm393' || model === 'lm339') return 'comparator'
  if (model === 'photodiode_v2') return 'photodiode'
  if (model === 'phototransistor') return 'phototransistor'
  if (model === 'relay_spdt' || model === 'relay_dpdt') return 'relay'
  if (['nmos', 'power_nmos', 'pmos', 'power_pmos'].includes(model)) return 'mosfet'
  return 'library'
}

function SimulationWarnings({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null
  return <div role="status" aria-label="Avisos da simulação" style={{ marginTop: 6, padding: '7px 9px', border: '1px solid #fcd34d', borderRadius: 4, background: '#fffbeb', color: '#92400e', fontSize: 11, lineHeight: 1.4 }}>
    {warnings.map((warning, index) => <div key={`${index}:${warning}`}>{warning}</div>)}
  </div>
}

function ElectricalReadings({ part, simulation }: { part: Part; simulation?: Simulation }) {
  if (!simulation) return null
  const warnings = simulation.warnings ?? []
  const kind = electricalKind(part)
  const pinVoltage = (pins: string[]) => pins.map(pin => simulation.voltages?.[`${part.id}:${pin}`]).find(value => value !== undefined)
  const current = simulation.currents?.[part.id]
  const power = simulation.powers?.[part.id]
  const energy = simulation.energies?.[part.id]
  const pair = (positivePins: string[], negativePins: string[]) => {
    const positive = pinVoltage(positivePins), negative = pinVoltage(negativePins)
    return positive === undefined || negative === undefined ? undefined : positive - negative
  }
  const resistorDrop = pair(['A', 'Terminal 2'], ['B', 'Terminal 1'])
  const voltage = kind === 'resistor' || kind === 'variableResistor' ? resistorDrop === undefined ? undefined : Math.abs(resistorDrop)
    : kind === 'lightBulb' ? pair(['1', 'Terminal 1'], ['2', 'Terminal 2'])
      : kind === 'vibrationMotor' ? pair(['pos', 'Positive'], ['neg', 'Negative'])
        : kind === 'tiltSensor' ? pair(['1', 'Terminal 1'], ['2', 'Terminal 2'])
          : kind === 'soilMoisture' ? pair(['Signal', 'sig1', 'sig2'], ['Ground', 'gnd1', 'gnd2'])
          : kind === 'usbSource' ? pair(['5V'], ['GND', 'Ground'])
          : kind === 'irSensor' ? pair(['Out', 'Output'], ['Gnd', 'GND', 'Ground'])
            : kind === 'gasSensor' ? pair(['A1', 'A2'], ['B1', 'B2'])
            : kind === 'pirSensor' ? pair(['Power', 'vcc'], ['Ground', 'gnd'])
              : kind === 'piezo' ? pair(['+', 'Positive', 'pos'], ['-', 'Negative', 'neg'])
                : kind === 'ultrasonicPing' ? pair(['Power', 'pos', 'Vcc'], ['Ground', 'neg', 'GND'])
                : kind === 'timer555' ? pair(['OUT', 'Out', '3'], ['GND', 'Ground', '1'])
                  : kind === 'timer556' ? pair(['output_a', 'Output A', '5'], ['gnd', 'Ground', '7'])
      : kind === 'potentiometer' ? pair(['Wiper'], ['Terminal 2'])
      : kind === 'led' ? pair(['A', 'Anode'], ['K', 'Cathode'])
      : kind === 'diode' ? pair(['ANODE', 'Anode'], ['CATHODE', 'Cathode'])
        : kind === 'capacitor' && part.properties?.simulationModel === 'capacitor_polarized' ? pair(['Positive'], ['Negative'])
          : kind === 'capacitor' ? pair(['Terminal 1', '1'], ['Terminal 2', '2'])
          : kind === 'inductor' ? pair(['Terminal 1', '1'], ['Terminal 2', '2'])
            : kind === 'tempSensor' ? pair(['Vout'], ['Gnd', 'GND'])
              : kind === 'solarCell' ? pair(['Positive'], ['Negative'])
          : kind === 'generator' ? pair(['OUT', 'Positive'], ['GND', 'Negative'])
            : kind === 'npn' ? pair(['B', 'Base', 'base'], ['E', 'Emitter', 'emitter'])
              : kind === 'pnp' ? pair(['E', 'Emitter', 'emitter'], ['B', 'Base', 'base'])
                : kind === 'tip120' ? pair(['B', 'Base', 'base'], ['E', 'Emitter', 'emitter'])
                  : kind === 'regulator' ? pair(['OUT', 'Out', 'out'], ['GND', 'Ground', 'gnd'])
                    : kind === 'opAmp' ? pair(['OUT', 'Out'], ['GND', 'Power-', 'Gnd'])
                    : kind === 'comparator' ? pair(['VCC', 'Power', 'vcc'], ['GND', 'Ground', 'gnd'])
                    : kind === 'photodiode' ? pair(['ANODE', 'Anode'], ['CATHODE', 'Cathode'])
                      : kind === 'phototransistor' ? pair(['C', 'Collector'], ['E', 'Emitter'])
                        : kind === 'relay' ? pair(['COIL1'], ['COIL2'])
                    : kind === 'mosfet' ? pair(['GATE', 'Gate', 'gate'], ['SOURCE', 'Source', 'source']) : undefined
  if (simulation.converged === false) return <><div className="electrical-reading-error" role="alert">{simulation.diagnostics?.[0] ?? 'Não foi possível resolver este circuito.'}</div><SimulationWarnings warnings={warnings} /></>
  if (['capacitor', 'inductor'].includes(kind) && simulation.mode !== 'transient') return <SimulationWarnings warnings={warnings} />
  const hasPIRReadings = kind === 'pirSensor' && simulation.pirSensorPowered?.[part.id] !== undefined
  const hasPiezoReadings = kind === 'piezo' && simulation.piezoVoltageIndicator?.[part.id] !== undefined
  const hasTimer555Readings = kind === 'timer555' && simulation.timer555LatchHigh?.[part.id] !== undefined
  const hasTimer556Readings = kind === 'timer556' && simulation.timer556Channels?.[part.id] !== undefined
  const hasUltrasonicReadings = kind === 'ultrasonicPing' && simulation.ultrasonicPing?.[part.id] !== undefined
  const ultrasonicReadings = simulation.ultrasonicPing?.[part.id]
  if (current === undefined && voltage === undefined && power === undefined && energy === undefined && !hasPIRReadings && !hasPiezoReadings && !hasTimer555Readings && !hasTimer556Readings && !hasUltrasonicReadings) return <SimulationWarnings warnings={warnings} />
  const sensorResistance = kind === 'variableResistor' ? variableSensorResistance(String(part.properties?.simulationModel ?? ''), part.properties ?? {}) : undefined
  return <>
    <div className="electrical-readings" aria-label="Leituras elétricas calculadas">
    {kind === 'resistor' && current !== undefined && <div className="component-row"><span>Corrente</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'lightBulb' && current !== undefined && <div className="component-row"><span>Corrente</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'vibrationMotor' && current !== undefined && <div className="component-row"><span>Corrente do motor</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'tiltSensor' && current !== undefined && <div className="component-row"><span>Corrente do contato</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'soilMoisture' && voltage !== undefined && <div className="component-row"><span>Tensão do sinal</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'soilMoisture' && simulation.soilMoistureProbeResistance?.[part.id] !== undefined && <div className="component-row"><span>Resistência da sonda</span><strong>{formatResistance(simulation.soilMoistureProbeResistance[part.id])}</strong></div>}
    {kind === 'gasSensor' && current !== undefined && <div className="component-row"><span>Corrente do sinal</span><strong>{formatCurrent(simulation.gasSensorSignalCurrent?.[part.id] ?? current)}</strong></div>}
    {kind === 'gasSensor' && simulation.gasSensorHeaterVoltage?.[part.id] !== undefined && <div className="component-row"><span>Tensão do aquecedor</span><strong>{simulation.gasSensorHeaterVoltage[part.id].toFixed(3)} V</strong></div>}
    {kind === 'gasSensor' && simulation.gasSensorHeaterCurrent?.[part.id] !== undefined && <div className="component-row"><span>Corrente do aquecedor</span><strong>{formatCurrent(simulation.gasSensorHeaterCurrent[part.id])}</strong></div>}
    {kind === 'gasSensor' && simulation.gasSensorLevel?.[part.id] !== undefined && <div className="component-row"><span>Nível de detecção</span><strong>{(simulation.gasSensorLevel[part.id] * 100).toFixed(0)}%</strong></div>}
    {kind === 'gasSensor' && simulation.gasSensorSignalResistance?.[part.id] !== undefined && <div className="component-row"><span>Resistência do sinal</span><strong>{formatResistance(simulation.gasSensorSignalResistance[part.id])}</strong></div>}
    {kind === 'gasSensor' && simulation.gasSensorBreakdown?.[part.id] && <div className="component-row"><span>Estado do aquecedor</span><strong>Acima de 5,1 V</strong></div>}
    {kind === 'pirSensor' && simulation.pirSensorSupplyVoltage?.[part.id] !== undefined && <div className="component-row"><span>Alimentação</span><strong>{simulation.pirSensorSupplyVoltage[part.id].toFixed(3)} V · {simulation.pirSensorPowered?.[part.id] ? 'válida' : 'fora de 3–6 V'}</strong></div>}
    {kind === 'pirSensor' && simulation.pirSensorOutputVoltage?.[part.id] !== undefined && <div className="component-row"><span>Saída Signal</span><strong>{simulation.pirSensorOutputVoltage[part.id].toFixed(3)} V · {simulation.pirSensorOutputTriggered?.[part.id] ? 'alto' : 'baixo'}</strong></div>}
    {kind === 'pirSensor' && simulation.pirSensorInRange?.[part.id] !== undefined && <div className="component-row"><span>Alvo</span><strong>{simulation.pirSensorInRange[part.id] ? `na área (${Math.round((simulation.pirSensorNormalizedDistance?.[part.id] ?? 0) * 100)}%)` : 'fora da área'}</strong></div>}
    {kind === 'pirSensor' && simulation.pirSensorDriveActive?.[part.id] !== undefined && <div className="component-row"><span>Pulso de saída</span><strong>{simulation.pirSensorDriveActive[part.id] ? 'ativo' : 'inativo'}</strong></div>}
    {kind === 'pirSensor' && simulation.pirSensorPullupResistance?.[part.id] !== undefined && <div className="component-row"><span>Pull-up</span><strong>{formatResistance(simulation.pirSensorPullupResistance[part.id])}</strong></div>}
    {kind === 'pirSensor' && simulation.pirSensorOutputCurrent?.[part.id] !== undefined && <div className="component-row"><span>Corrente da saída</span><strong>{formatCurrent(simulation.pirSensorOutputCurrent[part.id])}</strong></div>}
    {kind === 'piezo' && voltage !== undefined && <div className="component-row"><span>Tensão (+/−)</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'piezo' && current !== undefined && <div className="component-row"><span>Corrente (+ → −)</span><strong>{formatSignedCurrent(current)}</strong></div>}
    {kind === 'piezo' && <div className="component-row"><span>Resistência do modelo</span><strong>{formatResistance(PIEZO_SOUND_MODEL.resistanceOhms)}</strong></div>}
    {kind === 'piezo' && simulation.piezoVoltageIndicator?.[part.id] !== undefined && <div className="component-row"><span>Indicador visual estimado</span><strong>{Math.round(simulation.piezoVoltageIndicator[part.id] * 100)}% da escala de 25 V</strong></div>}
    {kind === 'piezo' && simulation.piezoBreakdown?.[part.id] !== undefined && <div className="component-row"><span>Limite direto</span><strong>{simulation.piezoBreakdown[part.id] ? 'Acima de +25 V' : 'Normal'}</strong></div>}
    {kind === 'timer555' && simulation.timer555LatchHigh?.[part.id] !== undefined && <div className="component-row"><span>Latch interno</span><strong>{simulation.timer555LatchHigh[part.id] ? 'Alto · OUT ativo' : 'Baixo · descarga ativa'}{simulation.timer555LatchPending?.[part.id] ? ' · transição pendente' : ''}</strong></div>}
    {kind === 'timer555' && simulation.timer555OutputVoltage?.[part.id] !== undefined && <div className="component-row"><span>OUT (pino 3)</span><strong>{simulation.timer555OutputVoltage[part.id].toFixed(3)} V</strong></div>}
    {kind === 'timer555' && simulation.timer555DischargeVoltage?.[part.id] !== undefined && <div className="component-row"><span>DIS (pino 7)</span><strong>{simulation.timer555DischargeVoltage[part.id].toFixed(3)} V</strong></div>}
    {kind === 'timer555' && simulation.timer555ReferenceVoltage?.[part.id] !== undefined && <div className="component-row"><span>Referência interna (1/3 Vcc)</span><strong>{simulation.timer555ReferenceVoltage[part.id].toFixed(3)} V</strong></div>}
    {kind === 'timer555' && simulation.timer555OutputCurrent?.[part.id] !== undefined && <div className="component-row"><span>Corrente em OUT</span><strong>{formatSignedCurrent(simulation.timer555OutputCurrent[part.id])}</strong></div>}
    {kind === 'ultrasonicPing' && ultrasonicReadings && <>
      <div className="component-row"><span>Alimentação</span><strong>{ultrasonicReadings.supplyVoltage.toFixed(3)} V · {ultrasonicReadings.powered ? 'válida' : 'fora de 4,5–6 V'}</strong></div>
      <div className="component-row"><span>Estado interno</span><strong>{ultrasonicReadings.phase === 'trigger' ? 'Aguardando borda de descida' : ultrasonicReadings.phase === 'transmit' ? 'Transmitindo' : 'Ocioso'}</strong></div>
      <div className="component-row"><span>Trigger</span><strong>{ultrasonicReadings.triggerHigh ? 'alto (> 2 V)' : 'baixo'}{ultrasonicReadings.lastTriggerPulseSeconds !== undefined ? ` · último pulso ${(ultrasonicReadings.lastTriggerPulseSeconds * 1e6).toFixed(2)} µs` : ''}</strong></div>
      <div className="component-row"><span>Echo</span><strong>{ultrasonicReadings.echoActive ? ultrasonicReadings.powered ? 'ativo e dirigido' : 'agendado, sem drive (alimentação inválida)' : 'inativo'}</strong></div>
      <div className="component-row"><span>Tensão Echo</span><strong>{ultrasonicReadings.echoVoltage.toFixed(3)} V</strong></div>
      <div className="component-row"><span>Corrente Echo</span><strong>{formatSignedCurrent(ultrasonicReadings.echoCurrent)}</strong></div>
      <div className="component-row"><span>Alvo</span><strong>{ultrasonicReadings.inRange && ultrasonicReadings.distanceCm !== undefined ? `${ultrasonicReadings.distanceCm.toFixed(2)} cm · ${(ultrasonicReadings.normalizedDistance * 100).toFixed(1)}%` : 'fora da área de alcance'}</strong></div>
      <div className="component-row"><span>Pings aceitos</span><strong>{ultrasonicReadings.acceptedPings} · pulsos curtos rejeitados {ultrasonicReadings.rejectedShortPulses}</strong></div>
    </>}
    {kind === 'timer556' && (['A', 'B'] as const).map(channel => {
      const readings = simulation.timer556Channels?.[part.id]?.[channel]
      if (!readings) return null
      return <div key={channel} className="timer556-channel-readings" aria-label={`Leituras do canal ${channel}`}>
        <div className="component-row"><span>Canal {channel} · latch</span><strong>{readings.latchHigh ? 'Alto · OUT ativo' : 'Baixo · descarga ativa'}{readings.pending ? ' · transição pendente' : ''}</strong></div>
        <div className="component-row"><span>OUT {channel}</span><strong>{readings.outputVoltage.toFixed(3)} V · {formatSignedCurrent(readings.outputCurrent)}</strong></div>
        <div className="component-row"><span>DIS {channel}</span><strong>{readings.dischargeVoltage.toFixed(3)} V</strong></div>
        <div className="component-row"><span>Referência {channel} (1/3 Vcc)</span><strong>{readings.referenceVoltage.toFixed(3)} V</strong></div>
      </div>
    })}
    {kind === 'irSensor' && current !== undefined && <div className="component-row"><span>Corrente de alimentação</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'irSensor' && voltage !== undefined && <div className="component-row"><span>Tensão de saída</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'irSensor' && simulation.irSensorSupplyVoltage?.[part.id] !== undefined && <div className="component-row"><span>Alimentação</span><strong>{simulation.irSensorSupplyVoltage[part.id].toFixed(3)} V</strong></div>}
    {kind === 'irSensor' && simulation.irSensorDetected?.[part.id] !== undefined && <div className="component-row"><span>Recepção simulada</span><strong>{simulation.irSensorDetected[part.id] ? 'Sinal detectado' : 'Escuro'}</strong></div>}
    {kind === 'irSensor' && simulation.irSensorOutputResistance?.[part.id] !== undefined && <div className="component-row"><span>Resistência da saída</span><strong>{formatResistance(simulation.irSensorOutputResistance[part.id])}</strong></div>}
    {kind === 'irSensor' && simulation.irSensorBreakdown?.[part.id] && <div className="component-row"><span>Estado</span><strong>Alimentação fora dos limites</strong></div>}
    {kind === 'usbSource' && current !== undefined && <div className="component-row"><span>Corrente fornecida</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'usbSource' && voltage !== undefined && <div className="component-row"><span>Tensão USB</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'usbSource' && simulation.usbBreakdown?.[part.id] !== undefined && <div className="component-row"><span>Estado da saída</span><strong>{simulation.usbBreakdown[part.id] ? 'Sobrecorrente' : 'Normal'}</strong></div>}
    {kind === 'tiltSensor' && voltage !== undefined && <div className="component-row"><span>Tensão entre terminais</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'tiltSensor' && simulation.tiltSensorResistance?.[part.id] !== undefined && <div className="component-row"><span>Resistência do contato</span><strong>{formatResistance(simulation.tiltSensorResistance[part.id])}</strong></div>}
    {kind === 'tiltSensor' && simulation.tiltSensorClosed?.[part.id] !== undefined && <div className="component-row"><span>Contato</span><strong>{simulation.tiltSensorClosed[part.id] ? 'Fechado' : 'Aberto'}</strong></div>}
    {kind === 'vibrationMotor' && voltage !== undefined && <div className="component-row"><span>Tensão entre terminais</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'vibrationMotor' && <div className="component-row"><span>Resistência</span><strong>{formatResistance(VIBRATION_MOTOR_MODEL.resistanceOhms)}</strong></div>}
    {kind === 'vibrationMotor' && simulation.vibrationMotorAmplitude?.[part.id] !== undefined && <div className="component-row"><span>Amplitude da vibração</span><strong>{(simulation.vibrationMotorAmplitude[part.id] * 100).toFixed(1)}%</strong></div>}
    {kind === 'vibrationMotor' && simulation.vibrationMotorAmplitude?.[part.id] !== undefined && <div className="component-row"><span>Estado</span><strong>{simulation.vibrationMotorAmplitude[part.id] > 0 ? 'Vibrando' : 'Parado'}</strong></div>}
    {kind === 'lightBulb' && voltage !== undefined && <div className="component-row"><span>Tensão entre terminais</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'lightBulb' && <div className="component-row"><span>Resistência</span><strong>{formatResistance(LIGHT_BULB_MODEL.resistanceOhms)}</strong></div>}
    {kind === 'lightBulb' && simulation.lightBulbBrightness?.[part.id] !== undefined && <div className="component-row"><span>Brilho</span><strong>{(simulation.lightBulbBrightness[part.id] * 100).toFixed(1)}%</strong></div>}
    {kind === 'variableResistor' && sensorResistance !== undefined && <div className="component-row"><span>Resistência atual</span><strong>{formatResistance(sensorResistance)}</strong></div>}
    {kind === 'variableResistor' && current !== undefined && <div className="component-row"><span>Corrente</span><strong>{formatCurrent(current)}</strong></div>}
    {(kind === 'resistor' || kind === 'variableResistor') && voltage !== undefined && <div className="component-row"><span>Queda de tensão</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'tempSensor' && voltage !== undefined && <div className="component-row"><span>Tensão de saída</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'solarCell' && voltage !== undefined && <div className="component-row"><span>Tensão de saída</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {(kind === 'tempSensor' || kind === 'solarCell') && current !== undefined && <div className="component-row"><span>Corrente de saída</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'photodiode' && current !== undefined && <div className="component-row"><span>Corrente foto-gerada</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'phototransistor' && current !== undefined && <div className="component-row"><span>Corrente de coletor</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'relay' && voltage !== undefined && <div className="component-row"><span>Tensão da bobina</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'relay' && current !== undefined && <div className="component-row"><span>Corrente da bobina</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'relay' && <div className="component-row"><span>Estado dos contatos</span><strong>{simulation.relayStates?.[part.id] ? 'Energizado' : 'Repouso'}</strong></div>}
    {kind === 'phototransistor' && simulation.currents?.[`${part.id}:B`] !== undefined && <div className="component-row"><span>Corrente de base</span><strong>{formatCurrent(simulation.currents[`${part.id}:B`])}</strong></div>}
    {(kind === 'tempSensor' || kind === 'solarCell' || kind === 'photodiode' || kind === 'phototransistor') && power !== undefined && <div className="component-row"><span>Potência</span><strong>{formatPower(power)}</strong></div>}
    {kind === 'potentiometer' && voltage !== undefined && <div className="component-row"><span>Tensão do cursor</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {(kind === 'led' || kind === 'diode') && current !== undefined && <div className="component-row"><span>Corrente</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'led' && simulation.ledBrightness?.[part.id] !== undefined && <div className="component-row"><span>Brilho estimado</span><strong>{(simulation.ledBrightness[part.id] * 100).toFixed(1)}%</strong></div>}
    {kind === 'led' && simulation.ledBreakdown?.[part.id] !== undefined && <div className="component-row"><span>Estado</span><strong>{simulation.ledBreakdown[part.id] ? 'Acima do limite absoluto' : simulation.ledWarning?.[part.id] ? 'Acima do máximo recomendado' : 'Normal'}</strong></div>}
    {kind === 'rgbLed' && (['red', 'green', 'blue'] as const).map(color => {
      const channelCurrent = simulation.rgbLedCurrents?.[part.id]?.[color]
      const brightness = simulation.rgbLedDisplayBrightness?.[part.id]?.[color]
      const breakdown = simulation.rgbLedBreakdown?.[part.id]?.[color]
      return <div className="component-row" key={color}><span>{({ red: 'Canal vermelho', green: 'Canal verde', blue: 'Canal azul' } as const)[color]}</span><strong>{channelCurrent === undefined ? '—' : formatCurrent(channelCurrent)}{brightness === undefined ? '' : ` · ${(brightness * 100).toFixed(0)}% brilho`}{breakdown ? ' · acima do limite' : ''}</strong></div>
    })}
    {kind === 'sevenSegment' && <div className="component-row"><span>Tipo do comum</span><strong>{(simulation.sevenSegmentCommonType?.[part.id] ?? resolveSevenSegmentCommonType(part.properties?.common)) === 'anode' ? 'Ânodo comum' : 'Cátodo comum'}</strong></div>}
    {kind === 'sevenSegment' && pinVoltage(['Common', 'com1', 'com2']) !== undefined && <div className="component-row"><span>Tensão do comum</span><strong>{pinVoltage(['Common', 'com1', 'com2'])!.toFixed(3)} V</strong></div>}
    {kind === 'sevenSegment' && (SEVEN_SEGMENT_MODEL.segments as readonly SevenSegmentName[]).map(segment => {
      const channelCurrent = simulation.sevenSegmentCurrents?.[part.id]?.[segment]
      const brightness = simulation.sevenSegmentDisplayBrightness?.[part.id]?.[segment]
      const breakdown = simulation.sevenSegmentBreakdown?.[part.id]?.[segment]
      return <div className="component-row" key={segment}><span>Segmento {segment.toUpperCase()}</span><strong>{channelCurrent === undefined ? '—' : formatCurrent(channelCurrent)}{brightness === undefined ? '' : ` · ${(brightness * 100).toFixed(0)}% brilho`}{breakdown ? ' · acima do limite' : ''}</strong></div>
    })}
    {(kind === 'led' || kind === 'diode') && voltage !== undefined && <div className="component-row"><span>Tensão ânodo–cátodo</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {['resistor', 'variableResistor', 'led', 'diode', 'lightBulb', 'vibrationMotor', 'tiltSensor', 'usbSource', 'irSensor', 'gasSensor', 'piezo', 'timer555', 'timer556'].includes(kind) && power !== undefined && <div className="component-row"><span>Potência dissipada</span><strong>{formatPower(power)}</strong></div>}
    {kind === 'capacitor' && current !== undefined && <div className="component-row"><span>Corrente no capacitor</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'capacitor' && voltage !== undefined && <div className="component-row"><span>Tensão entre terminais</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'capacitor' && energy !== undefined && <div className="component-row"><span>Energia armazenada</span><strong>{energy >= 1 ? `${energy.toFixed(3)} J` : `${(energy * 1000).toFixed(3)} mJ`}</strong></div>}
    {kind === 'inductor' && current !== undefined && <div className="component-row"><span>Corrente no indutor</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'inductor' && voltage !== undefined && <div className="component-row"><span>Tensão entre terminais</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'inductor' && energy !== undefined && <div className="component-row"><span>Energia magnética</span><strong>{energy >= 1 ? `${energy.toFixed(3)} J` : `${(energy * 1000).toFixed(3)} mJ`}</strong></div>}
    {kind === 'supply' && current !== undefined && <div className="component-row"><span>Corrente da fonte</span><strong>{formatCurrent(current)}</strong></div>}
    {(kind === 'npn' || kind === 'pnp' || kind === 'tip120') && voltage !== undefined && <div className="component-row"><span>{kind === 'pnp' ? 'Tensão emissor–base' : 'Tensão base–emissor'}</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {(kind === 'npn' || kind === 'pnp' || kind === 'tip120') && simulation.currents?.[`${part.id}:B`] !== undefined && <div className="component-row"><span>Corrente de base</span><strong>{formatCurrent(simulation.currents[`${part.id}:B`])}</strong></div>}
    {(kind === 'npn' || kind === 'pnp' || kind === 'tip120') && current !== undefined && <div className="component-row"><span>Corrente de coletor</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'mosfet' && voltage !== undefined && <div className="component-row"><span>Tensão gate–source</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'mosfet' && simulation.voltages?.[`${part.id}:DRAIN`] !== undefined && simulation.voltages?.[`${part.id}:SOURCE`] !== undefined && <div className="component-row"><span>Tensão drain–source</span><strong>{(simulation.voltages[`${part.id}:DRAIN`] - simulation.voltages[`${part.id}:SOURCE`]).toFixed(3)} V</strong></div>}
    {kind === 'mosfet' && current !== undefined && <div className="component-row"><span>Corrente de dreno</span><strong>{formatCurrent(current)}</strong></div>}
    {['npn', 'pnp', 'mosfet', 'tip120'].includes(kind) && power !== undefined && <div className="component-row"><span>Potência no componente</span><strong>{formatPower(power)}</strong></div>}
    {(kind === 'photodiode' || kind === 'phototransistor') && voltage !== undefined && <div className="component-row"><span>{kind === 'photodiode' ? 'Tensão ânodo–cátodo' : 'Tensão coletor–emissor'}</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {(kind === 'generator' || kind === 'regulator' || kind === 'opAmp') && voltage !== undefined && <div className="component-row"><span>Tensão de saída</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'comparator' && voltage !== undefined && <div className="component-row"><span>Alimentação</span><strong>{voltage.toFixed(3)} V</strong></div>}
    {kind === 'comparator' && [1, 2, ...(part.properties?.simulationModel === 'lm339' ? [3, 4] : [])].map(channel => {
      const output = simulation.voltages?.[`${part.id}:output${channel}`]
      const outputCurrent = simulation.currents?.[`${part.id}:OUT${channel}`]
      return <div className="component-row" key={channel}><span>Saída {channel}</span><strong>{output === undefined ? '—' : `${output.toFixed(3)} V`}{outputCurrent === undefined ? '' : ` · ${formatCurrent(outputCurrent)}`}</strong></div>
    })}
    {(kind === 'opAmp' || kind === 'regulator') && current !== undefined && <div className="component-row"><span>Corrente de saída</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'comparator' && current !== undefined && <div className="component-row"><span>Corrente de alimentação</span><strong>{formatCurrent(current)}</strong></div>}
    {(kind === 'opAmp' || kind === 'regulator' || kind === 'comparator' || kind === 'relay') && power !== undefined && <div className="component-row"><span>Potência no componente</span><strong>{formatPower(power)}</strong></div>}
    {kind === 'generator' && current !== undefined && <div className="component-row"><span>Corrente de saída</span><strong>{formatCurrent(current)}</strong></div>}
    {kind === 'generator' && power !== undefined && <div className="component-row"><span>Potência de saída</span><strong>{formatPower(power)}</strong></div>}
    </div>
    <SimulationWarnings warnings={warnings} />
  </>
}

function IRSensorControls({ part, active, detected, onChange }: { part: Part; active: boolean; detected: boolean; onChange?: (partId: string, detected: boolean) => void }) {
  return <section className="library-detail-section" aria-label="Controle do sensor infravermelho">
    <h4>Sensor infravermelho</h4>
    <label className="component-row"><span>Receber sinal IR</span><input type="checkbox" aria-label="Sinal infravermelho detectado" checked={detected} disabled={!active} onChange={event => active && onChange?.(part.id, event.target.checked)} /></label>
    <p className="library-detail-muted">{active ? 'Entrada manual temporária da simulação.' : 'Inicie a simulação para alterar a recepção.'} O modelo elétrico não simula portadora nem demodulação de 38 kHz.</p>
  </section>
}

function GasSensorControls({ part, active, level, onChange }: { part: Part; active: boolean; level: number; onChange?: (partId: string, level: number) => void }) {
  const clampedLevel = Math.max(0, Math.min(1, Number.isFinite(level) ? level : 0.2))
  return <section className="library-detail-section" aria-label="Controle do sensor de gás">
    <h4>Sensor de gás</h4>
    <label className="component-row"><span>Nível de detecção</span><span className="component-control"><input type="range" min="0" max="1" step="0.01" aria-label="Nível de detecção do sensor de gás" value={clampedLevel} disabled={!active} onChange={event => active && onChange?.(part.id, Number(event.target.value))} /><em>{(clampedLevel * 100).toFixed(0)}%</em></span></label>
    <p className="library-detail-muted">{active ? 'Entrada temporária da simulação, normalizada entre 0 e 100%.' : 'Inicie a simulação para alterar o nível de detecção.'} O modelo cobre heater e resistor do sinal, não a química do gás nem a dinâmica térmica.</p>
  </section>
}

function UltrasonicPingControls({ part, active, position, inRange, onChange }: { part: Part; active: boolean; position: UltrasonicTargetPoint; inRange?: boolean; onChange?: (partId: string, position: UltrasonicTargetPoint) => void }) {
  const target = evaluateUltrasonicTarget(position)
  const angle = Number.isFinite(target.angleDegrees) ? target.angleDegrees : 270
  return <section className="library-detail-section" aria-label="Controle do alvo do sensor ultrassônico">
    <h4>Alvo do PING)))</h4>
    <label className="component-row"><span>Distância local</span><span className="component-control"><input type="range" min="0" max="500" step="1" aria-label="Distância do alvo ultrassônico" value={Math.round(target.radiusGraphicalUnits)} disabled={!active} onChange={event => onChange?.(part.id, ultrasonicTargetFromPolar(Number(event.target.value), angle))} /><em>{Math.round(target.radiusGraphicalUnits)}</em></span></label>
    <label className="component-row"><span>Ângulo local</span><span className="component-control"><input type="range" min="0" max="359" step="1" aria-label="Ângulo do alvo ultrassônico" value={Math.round(angle) % 360} disabled={!active} onChange={event => onChange?.(part.id, ultrasonicTargetFromPolar(target.radiusGraphicalUnits, Number(event.target.value)))} /><em>{Math.round(angle)}°</em></span></label>
    <div className="component-row"><span>Alcance</span><strong>{(inRange ?? target.inRange) ? 'Dentro da área' : 'Fora da área'}</strong></div>
    <p className="library-detail-muted">{active ? 'Alvo temporário em coordenadas locais do sensor.' : 'Inicie a simulação para mover o alvo.'} A janela extraída é 100–400 unidades e 240°–300°. O trigger precisa ficar acima de 2 V por pelo menos 2 µs; o pulso curto pode passar despercebido se não cair em uma amostra. A amostragem depende do passo temporal do simulador.</p>
  </section>
}

function PIRSensorControls({ part, active, position, inRange, onChange }: { part: Part; active: boolean; position: PIRSensorPoint; inRange?: boolean; onChange?: (partId: string, position: PIRSensorPoint) => void }) {
  const target = evaluatePIRSensorTarget(position)
  const angle = Number.isFinite(target.angleDegrees) ? target.angleDegrees : 270
  return <section className="library-detail-section" aria-label="Controle do sensor PIR">
    <h4>Alvo do sensor PIR</h4>
    <label className="component-row"><span>Distância local</span><span className="component-control"><input type="range" min="0" max="500" step="1" aria-label="Distância do alvo PIR" value={Math.round(target.radiusGraphicalUnits)} disabled={!active} onChange={event => onChange?.(part.id, pirSensorTargetFromPolar(Number(event.target.value), angle))} /><em>{Math.round(target.radiusGraphicalUnits)}</em></span></label>
    <label className="component-row"><span>Ângulo local</span><span className="component-control"><input type="range" min="0" max="359" step="1" aria-label="Ângulo do alvo PIR" value={Math.round(angle) % 360} disabled={!active} onChange={event => onChange?.(part.id, pirSensorTargetFromPolar(target.radiusGraphicalUnits, Number(event.target.value)))} /><em>{Math.round(angle)}°</em></span></label>
    <div className="component-row"><span>Detecção</span><strong>{(inRange ?? target.inRange) ? 'Dentro da área' : 'Fora da área'}</strong></div>
    <p className="library-detail-muted">{active ? 'Alvo temporário em coordenadas locais do sensor.' : 'Inicie a simulação para mover o alvo.'} A área extraída é de 100–400 unidades e 240°–300°; não simula radiação infravermelha física.</p>
  </section>
}

type Props = {
  part?: Part
  wire?: Wire
  simulation?: Simulation
  simulationActive?: boolean
  keypadPushed?: unknown
  onKeypadPushed?: (partId: string, pushed: string | null) => void
  irDetected?: boolean
  onIRSensorDetected?: (partId: string, detected: boolean) => void
  gasSensorLevel?: number
  onGasSensorLevel?: (partId: string, level: number) => void
  pirTargetPosition?: PIRSensorPoint
  pirInRange?: boolean
  onPIRTargetChange?: (partId: string, position: PIRSensorPoint) => void
  ultrasonicTargetPosition?: UltrasonicTargetPoint
  ultrasonicInRange?: boolean
  onUltrasonicTargetChange?: (partId: string, position: UltrasonicTargetPoint) => void
  libraryItem?: LibraryCatalogItem
  libraryRecord?: LibraryRecord
  onUpdatePart?: (changes: Partial<Part>) => void
  onUpdateWire?: (changes: Partial<Wire>) => void
  onRotatePart?: () => void
  onDelete?: () => void
  onClose: () => void
}

function KeypadControls({ part, active, pushed, onChange }: { part: Part; active: boolean; pushed: unknown; onChange?: (partId: string, pushed: string | null) => void }) {
  const normalized = normalizeKeypadPushed(pushed as KeypadPushedInput)
  const selected = normalized && normalized !== null ? normalized.join('') : null
  const labels = [['1', '2', '3', 'A'], ['4', '5', '6', 'B'], ['7', '8', '9', 'C'], ['*', '0', '#', 'D']]
  const setPressed = (row: number, column: number, pressed: boolean) => {
    if (active) onChange?.(part.id, pressed ? `${row}${column}` : null)
  }

  return <section className="library-detail-section keypad-controls">
    <h4>Teclado matricial</h4>
    <p>{active ? 'Pressione e segure uma tecla.' : 'Inicie a simulação para pressionar uma tecla.'}</p>
    <div className="keypad-control-grid" aria-label="Teclado 4 por 4">
      {labels.flatMap((rowLabels, rowIndex) => rowLabels.map((label, columnIndex) => {
        const row = rowIndex + 1
        const column = columnIndex + 1
        const code = `${row}${column}`
        return <button
          key={code}
          type="button"
          disabled={!active}
          aria-label={`Tecla ${label}, linha ${row}, coluna ${column}`}
          aria-pressed={selected === code}
          title={`Linha ${row}, coluna ${column}`}
          onPointerDown={event => {
            if (!active) return
            event.preventDefault()
            event.currentTarget.setPointerCapture(event.pointerId)
            setPressed(row, column, true)
          }}
          onPointerUp={() => setPressed(row, column, false)}
          onPointerCancel={() => setPressed(row, column, false)}
          onLostPointerCapture={() => setPressed(row, column, false)}
          onKeyDown={event => {
            if (event.repeat || (event.key !== ' ' && event.key !== 'Enter')) return
            event.preventDefault()
            setPressed(row, column, true)
          }}
          onKeyUp={event => {
            if (event.key === ' ' || event.key === 'Enter') setPressed(row, column, false)
          }}
        >{label}</button>
      }))}
    </div>
    <div className="keypad-current-state" aria-live="polite">{selected ? `Ativa: linha ${selected[0]}, coluna ${selected[1]}` : 'Nenhuma tecla pressionada'}</div>
  </section>
}

function propertyOptions(property: LibraryProperty): { value: string; label: string }[] {
  if (!property.unit?.trim().startsWith('[')) return []
  try {
    const parsed: unknown = JSON.parse(property.unit)
    return Array.isArray(parsed) ? parsed.flatMap(item => Array.isArray(item) && item.length > 1 ? [{ value: String(item[0]), label: String(item[1]) }] : []) : []
  } catch { return [] }
}
function propertyBinding(part: Part, property: LibraryProperty) {
  const name = property.name.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (part.kind === 'library' && name === 'capacitance') return { key: 'capacitance', scale: prefixScale(property.default_prefix) }
  if (part.kind === 'library' && name === 'inductance') return { key: 'inductance', scale: prefixScale(property.default_prefix) }
  if (electricalKind(part) === 'supply' && name === 'voltage') return { key: 'voltage', scale: 1 }
  if (electricalKind(part) === 'supply' && name === 'resistance') return { key: 'internalResistance', scale: prefixScale(property.default_prefix) }
  if (electricalKind(part) === 'potentiometer' && name === 'resistance') return { key: 'resistance', scale: prefixScale(property.default_prefix) }
  if (electricalKind(part) === 'variableResistor' && name === 'flatresistance') return { key: 'flatResistance', scale: prefixScale(property.default_prefix) }
  if (electricalKind(part) === 'resistor' && name === 'resistance') return { key: 'ohms', scale: prefixScale(property.default_prefix) }
  return { key: `libraryProperty:${property.name}`, scale: 1 }
}
function propertyUnit(property: LibraryProperty) {
  const unit = property.unit?.trim() ?? ''
  if (unit === 'hidden' && property.default_prefix === 'k') return 'kΩ'
  const prefix = property.default_prefix
  if (prefix === 'v' && !unit) return 'V'
  if (!prefix || prefix === 'none') return unit === 'ohm' ? 'Ω' : unit
  return `${prefix === 'u' ? 'μ' : prefix}${unit === 'ohm' ? 'Ω' : unit}`
}

function LibraryPropertyFields({ part, record, onUpdatePart }: { part: Part; record?: LibraryRecord; onUpdatePart?: (changes: Partial<Part>) => void }) {
  if (!record?.properties?.length) return null
  const model = String(part.properties?.simulationModel ?? '')
  const editable = record.properties.filter(property => {
    if (property.sim_read_only) return false
    const normalized = property.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    const switchPosition = ['slide_switch', 'slide_switch_v2'].includes(model) && normalized === 'switch'
    const potentiometerPosition = ['potentiometer', 'potentiometer_v2'].includes(model) && normalized === 'position'
    const dipSwitchPosition = ['dip_switch_spdt', 'dip_switch_4', 'dip_switch_6'].includes(model) && /^switch[1-6]?$/.test(normalized)
    const sevenSegmentCommon = model === SEVEN_SEGMENT_MODEL.id && normalized === 'common'
    const pirRuntimeTarget = model === 'sensor_pir' && ['targetx', 'targety'].includes(normalized)
    const ultrasonicRuntimeTarget = model === ULTRASONIC_PING_MODEL.id && ['targetx', 'targety'].includes(normalized)
    return !(electricalKind(part) === 'resistor' && normalized === 'resistance') && !switchPosition && !potentiometerPosition && !dipSwitchPosition && !sevenSegmentCommon && !pirRuntimeTarget && !ultrasonicRuntimeTarget
  })
  if (!editable.length) return null
  return <section className="library-detail-section">
    <h4>Propriedades</h4>
    {editable.map((property, index) => {
      const binding = propertyBinding(part, property)
      const options = propertyOptions(property)
      const directSaved = part.properties?.[binding.key]
      const legacyRaw = part.properties?.[`libraryProperty:${property.name}`]
      const legacyNumber = legacyRaw === undefined ? undefined : Number(legacyRaw)
      const saved = directSaved ?? (legacyRaw === undefined ? undefined : legacyNumber !== undefined && Number.isFinite(legacyNumber) ? legacyNumber * binding.scale : legacyRaw)
      const fallback = options.length ? options[0].value : property.default
      const value = saved === undefined ? String(fallback ?? '') : String(typeof saved === 'number' && binding.scale !== 1 ? Number((saved / binding.scale).toPrecision(12)) : saved)
      const numeric = !options.length && typeof (property.default ?? saved) === 'number'
      const update = (raw: string) => onUpdatePart?.({ properties: { ...part.properties, [binding.key]: numeric ? Number(raw) * binding.scale : raw } })
      return <label className="component-row library-property-row" key={`${property.name}-${index}`}>
        <span>{property.name}</span>
        {options.length ? <select aria-label={property.name} value={value} onChange={event => update(event.target.value)}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          : <span className="component-control"><input aria-label={property.name} type={numeric ? 'number' : 'text'} step={numeric ? 'any' : undefined} value={value} onChange={event => update(event.target.value)} /><em>{propertyUnit(property)}</em></span>}
      </label>
    })}
  </section>
}

function SensorSourceControls({ part, onUpdatePart }: { part: Part; onUpdatePart?: (changes: Partial<Part>) => void }) {
  const model = String(part.properties?.simulationModel ?? '')
  const control = getSensorSourceControls(model)?.[0]
  const source = getSensorSourceModel(model, part.properties ?? {})
  if (!control || !source) return null
  const value = source.model === 'TMP36' && source.kind === 'thevenin'
    ? source.metadata.temperatureC
    : source.kind === 'norton' ? source.metadata.illuminationPercent : control.default
  return <section className="library-detail-section">
    <h4>Condição do sensor</h4>
    <label className="component-row">
      <span>{control.label} ({value}{control.unit})</span>
      <input aria-label={control.label} type="range" min={control.min} max={control.max} step={control.step} value={value}
        onChange={event => onUpdatePart?.({ properties: { ...part.properties, [control.property]: Number(event.target.value) } })} />
    </label>
    <small>{control.description}</small>
  </section>
}

function PhotodetectorControls({ part, onUpdatePart }: { part: Part; onUpdatePart?: (changes: Partial<Part>) => void }) {
  const model = String(part.properties?.simulationModel ?? '')
  const control = getPhotodetectorControls(model)
  const descriptor = getPhotodetectorModel(model, part.properties ?? {})
  if (!control || !descriptor) return null
  const value = descriptor.illuminationPosition
  return <section className="library-detail-section">
    <h4>Condição do sensor</h4>
    <label className="component-row">
      <span>{control.label} ({Math.round(value * 100)}{control.unit === 'fração' ? '%' : control.unit})</span>
      <input aria-label={control.label} type="range" min={control.min} max={control.max} step={control.step} value={value}
        onChange={event => onUpdatePart?.({ properties: { ...part.properties, [control.property]: Number(event.target.value) } })} />
    </label>
    <small>{control.description}</small>
  </section>
}

function VariableSensorControls({ part, onUpdatePart }: { part: Part; onUpdatePart?: (changes: Partial<Part>) => void }) {
  const model = String(part.properties?.simulationModel ?? '')
  const control = variableSensorControl(model, part.properties ?? {})
  if (!control) return null
  const resistance = variableSensorResistance(model, part.properties ?? {})
  return <section className="library-detail-section">
    <h4>Condição do sensor</h4>
    <label className="component-row">
      <span>{control.label} ({control.value}{control.unit})</span>
      <input aria-label={control.label} type="range" min={control.min} max={control.max} step={control.step} value={control.value}
        onChange={event => onUpdatePart?.({ properties: { ...part.properties, [control.property]: Number(event.target.value) } })} />
    </label>
    {resistance !== undefined && <div className="component-row"><span>Resistência calculada</span><strong>{formatResistance(resistance)}</strong></div>}
  </section>
}

function TiltSensorControls({ part, onUpdatePart }: { part: Part; onUpdatePart?: (changes: Partial<Part>) => void }) {
  const rawPosition = Number(part.properties?.[TILT_SENSOR_MODEL.control.property] ?? TILT_SENSOR_MODEL.control.defaultPosition)
  const position = Number.isFinite(rawPosition) ? rawPosition : TILT_SENSOR_MODEL.control.defaultPosition
  const sliderPosition = Math.min(1, Math.max(0, position))
  const behavior = evaluateTiltSensor(position)
  return <section className="library-detail-section">
    <h4>Posição do sensor</h4>
    <label className="component-row">
      <span>Inclinação ({(position * 100).toFixed(1)}%)</span>
      <input aria-label="Posição do sensor de inclinação" type="range" min="0" max="1" step="any" value={sliderPosition}
        onChange={event => onUpdatePart?.({ properties: { ...part.properties, [TILT_SENSOR_MODEL.control.property]: Number(event.target.value) } })} />
    </label>
    <div className="component-row"><span>Contato</span><strong>{behavior.closed ? 'Fechado' : 'Aberto'}</strong></div>
    <small>O contato fecha quando a posição ultrapassa 75%.</small>
  </section>
}

function SoilMoistureControls({ part, onUpdatePart }: { part: Part; onUpdatePart?: (changes: Partial<Part>) => void }) {
  const rawPosition = Number(part.properties?.[SOIL_MOISTURE_MODEL.control.property] ?? SOIL_MOISTURE_MODEL.control.defaultPosition)
  const position = Number.isFinite(rawPosition) ? rawPosition : SOIL_MOISTURE_MODEL.control.defaultPosition
  const sliderPosition = Math.min(1, Math.max(0, position))
  const resistance = evaluateSoilMoisture(position).probeResistanceOhms
  return <section className="library-detail-section">
    <h4>Umidade do solo</h4>
    <label className="component-row">
      <span>Umidade ({(position * 100).toFixed(1)}%)</span>
      <input aria-label="Umidade do solo" type="range" min="0" max="1" step="any" value={sliderPosition}
        onChange={event => onUpdatePart?.({ properties: { ...part.properties, [SOIL_MOISTURE_MODEL.control.property]: Number(event.target.value) } })} />
    </label>
    <div className="component-row"><span>Resistência da sonda</span><strong>{formatResistance(resistance)}</strong></div>
  </section>
}

function StoredEnergyInitialControls({ part, onUpdatePart }: { part: Part; onUpdatePart?: (changes: Partial<Part>) => void }) {
  const kind = electricalKind(part)
  const control = kind === 'capacitor'
    ? { key: 'initialVoltage', label: 'Tensão inicial', unit: 'V' }
    : kind === 'inductor' ? { key: 'initialCurrent', label: 'Corrente inicial', unit: 'A' } : undefined
  if (!control) return null
  const rawValue = Number(part.properties?.[control.key] ?? 0)
  const value = Number.isFinite(rawValue) ? rawValue : 0
  return <section className="library-detail-section">
    <h4>Condição inicial</h4>
    <label className="component-row">
      <span>{control.label}</span>
      <span className="component-control">
        <input aria-label={control.label} type="number" step="any" value={value}
          onChange={event => onUpdatePart?.({ properties: { ...part.properties, [control.key]: Number(event.target.value) } })} />
        <em>{control.unit}</em>
      </span>
    </label>
  </section>
}

function LibraryDetails({ part, item, record, onUpdatePart }: { part: Part; item?: LibraryCatalogItem; record?: LibraryRecord; onUpdatePart?: (changes: Partial<Part>) => void }) {
  const name = record?.name ?? item?.name ?? part.label
  const thumbnail = item?.thumbnail ?? record?.thumbnail ?? String(part.properties?.libraryThumbnail ?? '')
  const svg = record && item ? librarySvgPath(item, record) : undefined
  const pins = libraryPinNames(record)
  const references = libraryReferenceLabels(record)
  const supported = !!item && libraryItemSupportsSimulation(item)
  const description = record?.description
  const model = String(part.properties?.simulationModel ?? '')
  const hasBuiltInSwitch = model === 'AABattery' && String(part.properties?.['libraryProperty:built-in switch'] ?? 'no').toLowerCase() === 'yes'
  const switchOn = (key: string) => {
    const value = part.properties?.[key] ?? part.properties?.[`libraryProperty:${key}`]
    return value === true || value === 1 || ['true', '1', 'yes', 'on'].includes(String(value ?? '').toLowerCase())
  }
  const dipCount = model === 'dip_switch_spdt' ? 1 : model === 'dip_switch_4' ? 4 : model === 'dip_switch_6' ? 6 : 0
  const potentiometerPosition = Number(part.properties?.position ?? part.properties?.['libraryProperty:Position'] ?? part.properties?.Position ?? 0)
  const slideSwitchOnTerminal2 = switchOn('Switch')
  return <div className="library-detail-body">
    <div className="library-detail-media-grid">
      {thumbnail && <figure><img src={libraryAssetUrl(thumbnail)} alt={`Miniatura de ${name}`} /><figcaption>Biblioteca local</figcaption></figure>}
      {svg && <figure><img src={libraryAssetUrl(svg)} alt={`Desenho de ${name}`} /><figcaption>Componente</figcaption></figure>}
    </div>
    {description && <p className="library-detail-description">{description}</p>}
    <div className={`library-visual-note ${supported ? 'library-simulation-note' : ''}`}>
      {supported ? 'Modelo disponível para simulação (conforme o modo indicado na bancada).' : 'Peça visual: ainda não possui modelo elétrico neste simulador.'}
    </div>
    {record?.categories?.length || record?.tags?.length ? <section className="library-detail-section"><h4>Categoria</h4><div className="library-detail-tags">{[...new Set([...(record.categories ?? []), ...(record.tags ?? [])])].map(tag => <span key={tag}>{tag}</span>)}</div></section> : null}
    {pins.length > 0 && <section className="library-detail-section"><h4>Terminais ({pins.length})</h4><div className="library-detail-pins">{pins.slice(0, 18).map(pin => <span key={pin}>{pin}</span>)}</div>{pins.length > 18 && <details className="library-more-pins"><summary>Mostrar todos</summary><div className="library-detail-pins">{pins.slice(18).map(pin => <span key={pin}>{pin}</span>)}</div></details>}</section>}
    {record?.extents && <dl className="library-detail-facts"><div><dt>Modelo</dt><dd>{record.simulation_model ?? 'visual'}</dd></div><div><dt>Dimensões</dt><dd>{record.extents.width.toFixed(1)} × {record.extents.height.toFixed(1)}</dd></div></dl>}
    <LibraryPropertyFields part={part} record={record} onUpdatePart={onUpdatePart} />
    {model === SEVEN_SEGMENT_MODEL.id && <section className="library-detail-section">
      <h4>Configuração elétrica</h4>
      <label className="component-row"><span>Tipo do comum</span><select aria-label="Tipo do comum do display" value={resolveSevenSegmentCommonType(part.properties?.common)} onChange={event => onUpdatePart?.({ properties: { ...part.properties, common: event.target.value } })}><option value="anode">Ânodo comum</option><option value="cathode">Cátodo comum</option></select></label>
    </section>}
    {electricalKind(part) === 'variableResistor' && <VariableSensorControls part={part} onUpdatePart={onUpdatePart} />}
    {electricalKind(part) === 'tiltSensor' && <TiltSensorControls part={part} onUpdatePart={onUpdatePart} />}
    {electricalKind(part) === 'soilMoisture' && <SoilMoistureControls part={part} onUpdatePart={onUpdatePart} />}
    {['capacitor', 'inductor'].includes(electricalKind(part)) && <StoredEnergyInitialControls part={part} onUpdatePart={onUpdatePart} />}
    {['tempSensor', 'solarCell'].includes(electricalKind(part)) && <SensorSourceControls part={part} onUpdatePart={onUpdatePart} />}
    {['photodiode', 'phototransistor'].includes(electricalKind(part)) && <PhotodetectorControls part={part} onUpdatePart={onUpdatePart} />}
    {['potentiometer', 'potentiometer_v2'].includes(model) ? <section className="library-detail-section">
      <h4>Posição do cursor</h4>
      <label className="component-row"><span>Cursor ({Math.round(Math.min(1, Math.max(0, Number.isFinite(potentiometerPosition) ? potentiometerPosition : 0)) * 100)}%)</span><input aria-label="Posição do cursor do potenciômetro" type="range" min="0" max="1" step="0.01" value={Math.min(1, Math.max(0, Number.isFinite(potentiometerPosition) ? potentiometerPosition : 0))} onChange={event => onUpdatePart?.({ properties: { ...part.properties, position: Number(event.target.value) } })} /></label>
    </section> : null}
    {dipCount > 0 ? <section className="library-detail-section">
      <h4>Chaves DIP</h4>
      {Array.from({ length: dipCount }, (_, index) => {
        const channel = index + 1
        const key = model === 'dip_switch_spdt' ? 'Switch' : `Switch${channel}`
        return <label className="component-row" key={key}><span>{model === 'dip_switch_spdt' ? `Polos ${channel === 1 ? '1 e 2' : ''}`.trim() : `Chave ${channel}`}</span><select aria-label={`Estado ${model === 'dip_switch_spdt' ? 'dos polos' : `da chave ${channel}`}`} value={switchOn(key) ? 'closed' : 'open'} onChange={event => onUpdatePart?.({ properties: { ...part.properties, [key]: event.target.value === 'closed' } })}><option value="open">Aberta</option><option value="closed">Fechada</option></select></label>
      })}
    </section> : null}
    {model === 'slide_switch' || model === 'slide_switch_v2' ? <section className="library-detail-section">
      <h4>Chave deslizante</h4>
      <label className="component-row"><span>Contato ligado ao comum</span><select aria-label="Contato ligado ao comum" value={slideSwitchOnTerminal2 ? '2' : '1'} onChange={event => onUpdatePart?.({ properties: { ...part.properties, Switch: event.target.value === '2' } })}><option value="1">Terminal 1</option><option value="2">Terminal 2</option></select></label>
    </section> : null}
    {hasBuiltInSwitch ? <section className="library-detail-section">
      <h4>Chave integrada</h4>
      <label className="component-row"><span>Estado</span><select aria-label="Estado da chave integrada" value={part.properties?.switchOn === false || ['false', '0', 'no', 'off'].includes(String(part.properties?.switchOn ?? '').toLowerCase()) ? 'off' : 'on'} onChange={event => onUpdatePart?.({ properties: { ...part.properties, switchOn: event.target.value === 'on' } })}><option value="on">Ligada</option><option value="off">Desligada</option></select></label>
    </section> : null}
    {references.length > 0 && <section className="library-detail-section"><h4>Referências</h4>{references.map(reference => <div className="library-detail-muted" key={reference}>{reference}</div>)}</section>}
  </div>
}

function PinOverview({ part }: { part: Part }) {
  const rows = chipPinRows[part.kind]
  if (!rows) return null
  const render = (side: 'top' | 'bottom') => <div className={`pin-overview-grid ${side === 'bottom' ? 'bottom-pins' : ''}`}>{rows[side].map(pin => <div className="pin-badge" key={pin.number}><span className="pin-num">{pin.number}</span><span className="pin-lbl" title={pin.name}>{pin.name}</span></div>)}</div>
  return <section className="component-pin-section"><span className="pin-section-title">Pinagem (entalhe à esquerda)</span>{render('top')}{render('bottom')}</section>
}

export default function ComponentPopover({ part, wire, simulation, simulationActive = false, keypadPushed, onKeypadPushed, irDetected = false, onIRSensorDetected, gasSensorLevel = 0.2, onGasSensorLevel, pirTargetPosition, pirInRange, onPIRTargetChange, ultrasonicTargetPosition, ultrasonicInRange, onUltrasonicTargetChange, libraryItem, libraryRecord, onUpdatePart, onUpdateWire, onRotatePart, onDelete, onClose }: Props) {
  const setProperty = (key: string, value: string | number) => part && onUpdatePart?.({ properties: { ...part.properties, [key]: value } })
  if (!part && !wire) return null
  const selectedColor = wire ? standardWireColors.find(color => color.hex.toLowerCase() === wire.color.toLowerCase()) : undefined
  const title = wire ? `Fio ${selectedColor?.name ?? ''}` : part!.kind === 'library' ? libraryRecord?.name ?? libraryItem?.name ?? part!.label : labels[part!.kind]
  const kind = part?.kind
  const visualOnly = !!part && kind === 'library' && !!libraryItem && !libraryItemSupportsSimulation(libraryItem)
  const resistance = Number(part?.properties?.ohms ?? 220)
  const selectedUnit = String(part?.properties?.resistanceUnit ?? (resistance >= 1000 ? 'kΩ' : 'Ω'))
  const unitScale = resistanceUnits.find(unit => unit.label === selectedUnit)?.scale ?? 1
  const numberField = (label: string, key: string, fallback: number, unit: string) => <label className="component-row"><span>{label}</span><span className="component-control"><input type="number" step="any" value={Number(part?.properties?.[key] ?? fallback)} onChange={event => setProperty(key, Number(event.target.value))} /><em>{unit}</em></span></label>

  return <aside className="component-popover" aria-label={wire ? 'Propriedades do fio' : `Propriedades de ${title}`}>
    <header className="component-popover-head">
      <div className="popover-title-row">{wire ? <span className="popover-icon-dot" style={{ background: wire.color }} /> : <span className="popover-icon-dot" style={{ background: part?.kind === 'led' ? String(part.properties?.color ?? 'green') : '#43a047' }} />}<strong>{title}</strong></div>
      <button aria-label="Fechar propriedades" title="Fechar" onClick={onClose}><X size={16} /></button>
    </header>
    <div className="component-popover-body">
      {wire && <>
        <label className="component-row"><span>Cor do fio</span><span className="component-color-picker"><select value={wire.color} onChange={event => onUpdateWire?.({ color: event.target.value })}>{standardWireColors.map(color => <option key={color.hex} value={color.hex}>{color.name}</option>)}</select><i className="color-swatch-badge" style={{ background: wire.color }} /></span></label>
        <div className="component-row"><span>Conexão</span><div className="component-value-text">{wire.from} ↔ {wire.to}</div></div>
      </>}
      {part && <>
        {kind === 'library' && <LibraryDetails part={part} item={libraryItem} record={libraryRecord} onUpdatePart={onUpdatePart} />}
        {kind === 'library' && electricalKind(part) === 'keypad' && <KeypadControls part={part} active={simulationActive} pushed={keypadPushed ?? simulation?.keypadPushed?.[part.id] ?? part.properties?.pushed} onChange={onKeypadPushed} />}
        {kind === 'library' && electricalKind(part) === 'irSensor' && <IRSensorControls part={part} active={simulationActive} detected={irDetected} onChange={onIRSensorDetected} />}
        {kind === 'library' && electricalKind(part) === 'gasSensor' && <GasSensorControls part={part} active={simulationActive} level={gasSensorLevel} onChange={onGasSensorLevel} />}
        {kind === 'library' && electricalKind(part) === 'pirSensor' && <PIRSensorControls part={part} active={simulationActive} position={pirTargetPosition ?? { x: 0, y: -200 }} inRange={pirInRange} onChange={onPIRTargetChange} />}
        {kind === 'library' && electricalKind(part) === 'ultrasonicPing' && <UltrasonicPingControls part={part} active={simulationActive} position={ultrasonicTargetPosition ?? ULTRASONIC_PING_MODEL.target.defaultPosition} inRange={ultrasonicInRange} onChange={onUltrasonicTargetChange} />}
        {kind === 'library' && electricalKind(part) === 'piezo' && <p className="library-detail-muted">Este modelo calcula tensão, corrente e potência. O áudio e a intensidade acústica não são implementados; o indicador visual é apenas uma estimativa normalizada pela tensão (não representa som nem dB).</p>}
        {kind === 'library' && electricalKind(part) === 'timer555' && <p className="library-detail-muted">O latch usa atraso de 0,5 µs, amostrado uma vez por subpasso; transições menores que o passo escolhido ficam quantizadas. O equivalente preserva a ladder, os pulls, a saída resistiva e o NPN de descarga, mas idealiza efeitos parasitas e resolução submicrosegundo.</p>}
        {kind === 'library' && electricalKind(part) === 'ultrasonicPing' && <p className="library-detail-muted">Modelo elétrico de 3 ou 4 pinos: resistência de alimentação 166,7 Ω, pull-down Echo de 20 kΩ e pull-up de 100 Ω apenas com alimentação válida durante o pulso. A máquina agenda Echo após 750 µs; transições entre amostras não são reconstruídas.</p>}
        {kind === 'library' && electricalKind(part) === 'timer556' && <p className="library-detail-muted">Os dois canais reproduzem núcleos 555 independentes com alimentação compartilhada. Cada latch tem atraso de 0,5 µs, amostrado uma vez por subpasso; transições e períodos abaixo da resolução escolhida ficam quantizados.</p>}
        {visualOnly && <div className="library-visual-note">As propriedades visuais são editáveis, mas este componente ainda não altera o cálculo elétrico.</div>}
        {kind === 'resistor' && <>
          <label className="component-row"><span>Resistência</span><span className="component-control"><input type="number" step="any" value={resistance / unitScale} onChange={event => setProperty('ohms', Number(event.target.value) * unitScale)} /><select aria-label="Unidade da resistência" value={selectedUnit} onChange={event => { const unit = resistanceUnits.find(candidate => candidate.label === event.target.value)!; setProperty('resistanceUnit', unit.label); setProperty('ohms', resistance / unitScale * unit.scale) }}>{resistanceUnits.map(unit => <option key={unit.label} value={unit.label}>{unit.label}</option>)}</select></span></label>
          <ElectricalReadings part={part} simulation={simulation} />
        </>}
        {kind === 'led' && <>
          <label className="component-row"><span>Cor</span><span className="component-color-picker"><select value={String(part.properties?.color ?? 'green')} onChange={event => setProperty('color', event.target.value)}>{['red', 'orange', 'yellow', 'green', 'blue', 'white'].map(color => <option key={color} value={color}>{({ red: 'Vermelho', orange: 'Laranja', yellow: 'Amarelo', green: 'Verde', blue: 'Azul', white: 'Branco' } as Record<string, string>)[color]}</option>)}</select><i className="color-swatch-badge" style={{ background: String(part.properties?.color ?? 'green') }} /></span></label>
          <ElectricalReadings part={part} simulation={simulation} />
        </>}
        {kind === 'library' && ['resistor', 'variableResistor', 'led', 'diode', 'capacitor', 'inductor', 'potentiometer', 'supply', 'tempSensor', 'solarCell', 'generator', 'npn', 'pnp', 'mosfet', 'tip120', 'regulator', 'opAmp', 'comparator', 'photodiode', 'phototransistor', 'relay', 'lightBulb', 'vibrationMotor', 'tiltSensor', 'usbSource', 'soilMoisture', 'rgbLed', 'sevenSegment', 'keypad', 'irSensor', 'gasSensor', 'pirSensor', 'piezo', 'timer555', 'timer556', 'ultrasonicPing'].includes(electricalKind(part)) && <ElectricalReadings part={part} simulation={simulation} />}
        {kind === 'generator' && <>
          {numberField('Frequência', 'frequency', 1, 'Hz')}{numberField('Amplitude', 'amplitude', 5, 'V')}{numberField('Offset DC', 'offset', 2.5, 'V')}
          <label className="component-row"><span>Forma de onda</span><select value={String(part.properties?.waveform ?? 'square')} onChange={event => setProperty('waveform', event.target.value)}><option value="square">Quadrada</option><option value="sine">Senoidal</option><option value="triangle">Triangular</option></select></label>
          <ElectricalReadings part={part} simulation={simulation} />
        </>}
        {kind === 'supply' && <>{numberField('Tensão', 'voltage', 5, 'V')}{numberField('Corrente limite', 'current', 5, 'A')}<ElectricalReadings part={part} simulation={simulation} /></>}
        {kind === 'vcc' && numberField('Tensão', 'voltage', 5, 'V')}
        {(kind === 'jk74hc73' || kind === 'dff7474') && simulation && <div className="component-row"><span>Saídas</span><div className="component-value-text">{Object.entries(simulation.q).filter(([id]) => id.startsWith(`${part.id}:`)).map(([id, value]) => `${id.split(':').pop()} = ${value}`).join(' · ') || 'X'}</div></div>}
        <PinOverview part={part} />
        <div className="component-popover-actions">
          {onRotatePart && kind !== 'breadboard' && <button className="popover-action-btn" onClick={onRotatePart}><RotateCw size={14} /> Girar (R)</button>}
          {onDelete && <button className="popover-danger-btn" onClick={onDelete}><Trash2 size={14} /> Excluir</button>}
        </div>
      </>}
      {wire && <div className="component-popover-actions">{onDelete && <button className="popover-danger-btn" onClick={onDelete}><Trash2 size={14} /> Excluir fio</button>}</div>}
    </div>
  </aside>
}
