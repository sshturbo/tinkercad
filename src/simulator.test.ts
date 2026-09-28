import { describe, expect, it } from 'vitest'
import { demoProject, emptyRuntime, initialRuntime, normalizeProjectPinNames, pinNames, type Project } from './model'
import { chipPinRows } from './pinout'
import { boardPoint, terminalPosition } from './layout'
import { generatorLevel, simulate } from './simulator'

describe('contador de bancada', () => {
  it('conta de 0 a 15 e retorna a zero em modo passo', () => {
    const project = demoProject()
    let runtime = simulate(project, initialRuntime(project)).runtime
    for (let expected = 1; expected <= 16; expected++) {
      runtime = simulate(project, runtime, true).runtime
      const result = simulate(project, runtime, true)
      runtime = result.runtime
      const bits = ['u1:1', 'u1:2', 'u2:1', 'u2:2'].map(key => result.simulation.q[key])
      const value = bits.reduce<number>((sum, bit, index) => sum + (bit === '1' ? 2 ** index : 0), 0)
      expect(value).toBe(expected % 16)
      expect(['led1', 'led2', 'led3', 'led4'].map(id => result.simulation.leds[id])).toEqual(bits)
    }
  })
})

describe('componentes editáveis', () => {
  it('aplica amplitude, deslocamento e forma de onda ao nível do gerador', () => {
    const runtime = emptyRuntime()
    runtime.phase = 0.25
    expect(generatorLevel({ amplitude: 5, offset: 2.5, waveform: 'sine' }, runtime)).toBe('1')
    runtime.phase = 0.75
    expect(generatorLevel({ amplitude: 5, offset: 2.5, waveform: 'triangle' }, runtime)).toBe('0')
    expect(generatorLevel({ amplitude: 1, offset: 0, waveform: 'square' }, runtime)).toBe('0')
  })

  it('fecha os contatos do botão apenas enquanto pressionado', () => {
    const project: Project = { version: 1, id: 'button-test', name: 'Botão', parts: [
      { id: 'v', kind: 'vcc', x: 0, y: 0, rotation: 0, label: 'VCC' },
      { id: 'g', kind: 'gnd', x: 0, y: 0, rotation: 0, label: 'GND' },
      { id: 'b', kind: 'button', x: 0, y: 0, rotation: 0, label: 'B1' },
      { id: 'd', kind: 'led', x: 0, y: 0, rotation: 0, label: 'D1' },
    ], wires: [
      { id: 'w1', from: 'v:OUT', to: 'b:A1', color: 'red' },
      { id: 'w2', from: 'b:B1', to: 'd:A', color: 'red' },
      { id: 'w3', from: 'g:OUT', to: 'd:K', color: 'black' },
    ] }
    const released = simulate(project, emptyRuntime())
    expect(released.simulation.leds.d).not.toBe('1')
    const pressed = simulate(project, { ...released.runtime, buttons: { b: true } })
    expect(pressed.simulation.leds.d).toBe('1')
  })
})

describe('nomes físicos dos pinos dos CIs', () => {
  it('usa o mesmo nome visível nos terminais, nos fios e na pinagem', () => {
    for (const kind of ['jk74hc73', 'nand74hc00'] as const) {
      const visibleNames = [...chipPinRows[kind]!.top, ...chipPinRows[kind]!.bottom].map(pin => pin.name)
      expect(pinNames[kind]).toEqual(visibleNames)
    }
  })

  it('migra conexões antigas e mantém a saída da NAND funcionando', () => {
    const project: Project = { version: 1, id: 'legacy-chip', name: 'Compatibilidade', parts: [
      { id: 'v', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'P1' },
      { id: 'a', kind: 'button', x: 0, y: 0, rotation: 0, label: 'A' },
      { id: 'b', kind: 'button', x: 0, y: 0, rotation: 0, label: 'B' },
      { id: 'u', kind: 'nand74hc00', x: 0, y: 0, rotation: 0, label: 'U1' },
    ], wires: [
      { id: 'w1', from: 'v:PLUS', to: 'u:VCC', color: 'red' },
      { id: 'w2', from: 'v:MINUS', to: 'u:GND', color: 'black' },
      { id: 'w3', from: 'a:OUT', to: 'u:A1', color: 'blue' },
      { id: 'w4', from: 'b:OUT', to: 'u:B1', color: 'blue' },
    ] }
    const migrated = normalizeProjectPinNames(project)
    expect(migrated.wires.map(wire => wire.to)).toEqual(['u:Potência', 'u:Solo', 'u:Entrada 1A', 'u:Entrada 1B'])
    expect(normalizeProjectPinNames(migrated)).toBe(migrated)

    const result = simulate(project, emptyRuntime())
    expect(result.simulation.levels['u:Saída 1']).toBe('1')
    expect(result.simulation.levels['u:Y1']).toBeUndefined()
    expect(result.simulation.levels['u:A1']).toBeUndefined()
  })
})

describe('encaixe na protoboard', () => {
  it('alinha todos os terminais ocultos ao centro do furo correspondente no projeto inicial', () => {
    const project = demoProject()
    const snaps = project.wires.filter(wire => wire.hidden)
    expect(snaps).toHaveLength(58)
    for (const wire of snaps) {
      const pin = terminalPosition(project, wire.from)!
      const hole = boardPoint(project, wire.to)!
      expect(pin.x).toBeCloseTo(hole.x, 6)
      expect(pin.y).toBeCloseTo(hole.y, 6)
    }
  })

  it('conecta resistor direto no led e acende', () => {
    const project: Project = {
      version: 1,
      id: 'direct-test',
      name: 'Resistor direto no LED',
      parts: [
        { id: 'v', kind: 'vcc', x: 0, y: 0, rotation: 0, label: 'VCC' },
        { id: 'r', kind: 'resistor', x: 100, y: 100, rotation: 0, label: 'R1' },
        { id: 'd', kind: 'led', x: 200, y: 100, rotation: 0, label: 'D1' },
        { id: 'r2', kind: 'library', x: 100, y: 200, rotation: 0, label: 'R2', properties: { simulationModel: 'resistor' } },
        { id: 'd2', kind: 'library', x: 200, y: 200, rotation: 0, label: 'D2', properties: { simulationModel: 'led2' } },
        { id: 'g', kind: 'gnd', x: 300, y: 100, rotation: 0, label: 'GND' },
      ],
      wires: [
        // Native branch
        { id: 'w1', from: 'v:OUT', to: 'r:A', color: 'red' },
        { id: 'w2', from: 'r:B', to: 'd:A', color: 'green' },
        { id: 'w3', from: 'd:K', to: 'g:OUT', color: 'black' },
        // Library branch with Terminal 1/2 and Anode/Cathode
        { id: 'w4', from: 'v:OUT', to: 'r2:Terminal 2', color: 'red' },
        { id: 'w5', from: 'r2:Terminal 1', to: 'd2:Anode', color: 'green' },
        { id: 'w6', from: 'd2:Cathode', to: 'g:OUT', color: 'black' },
      ],
    }
    const result = simulate(project, emptyRuntime())
    expect(result.simulation.leds.d).toBe('1')
    expect(result.simulation.leds.d2).toBe('1')
  })

  it('alimenta circuito direto com Fonte de Energia (Power Supply)', () => {
    // 1. Circuito correto com fonte nativa (PLUS / MINUS)
    const nativeProject: Project = {
      version: 1,
      id: 'supply-native',
      name: 'Fonte de energia',
      parts: [
        { id: 'ps', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5, current: 5 } },
        { id: 'r', kind: 'resistor', x: 100, y: 100, rotation: 0, label: 'R1' },
        { id: 'd', kind: 'led', x: 200, y: 100, rotation: 0, label: 'D1' },
      ],
      wires: [
        { id: 'w1', from: 'ps:PLUS', to: 'r:A', color: 'red' },
        { id: 'w2', from: 'r:B', to: 'd:A', color: 'green' },
        { id: 'w3', from: 'd:K', to: 'ps:MINUS', color: 'black' },
      ],
    }
    const resNative = simulate(nativeProject, emptyRuntime())
    expect(resNative.simulation.leds.d).toBe('1')

    // 2. Circuito correto com fonte e componentes da biblioteca (Positive/Negative, Terminal 1/2, Anode/Cathode)
    const libProject: Project = {
      version: 1,
      id: 'supply-lib',
      name: 'Fonte da biblioteca',
      parts: [
        { id: 'ps2', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { simulationModel: 'powerSupply', voltage: 30, current: 2 } },
        { id: 'r2', kind: 'library', x: 100, y: 100, rotation: 0, label: 'R2', properties: { simulationModel: 'resistor' } },
        { id: 'd2', kind: 'library', x: 200, y: 100, rotation: 0, label: 'D2', properties: { simulationModel: 'led2' } },
      ],
      wires: [
        { id: 'w1', from: 'ps2:Positive', to: 'r2:Terminal 2', color: 'red' },
        { id: 'w2', from: 'r2:Terminal 1', to: 'd2:Anode', color: 'green' },
        { id: 'w3', from: 'd2:Cathode', to: 'ps2:Negative', color: 'black' },
      ],
    }
    const resLib = simulate(libProject, emptyRuntime())
    expect(resLib.simulation.leds.d2).toBe('1')

    // 3. Circuito com polaridade invertida (LED não deve acender)
    const invertedProject: Project = {
      ...nativeProject,
      wires: [
        { id: 'w1', from: 'ps:PLUS', to: 'r:A', color: 'red' },
        { id: 'w2', from: 'r:B', to: 'd:K', color: 'green' }, // Cátodo no positivo!
        { id: 'w3', from: 'd:A', to: 'ps:MINUS', color: 'black' },
      ],
    }
    const resInverted = simulate(invertedProject, emptyRuntime())
    expect(resInverted.simulation.leds.d).toBe('0')

    // 4. Circuito aberto (apenas um pino do LED conectado)
    const openProject: Project = {
      ...nativeProject,
      wires: [
        { id: 'w1', from: 'ps:PLUS', to: 'r:A', color: 'red' },
        { id: 'w2', from: 'r:B', to: 'd:A', color: 'green' },
        // d:K solto sem fio!
      ],
    }
    const resOpen = simulate(openProject, emptyRuntime())
    expect(resOpen.simulation.leds.d).toBe('0')

    // 5. Circuito com Bateria 9V da biblioteca alimentando LED
    const batteryProject: Project = {
      version: 1,
      id: 'battery-9v',
      name: 'Bateria 9V e LED',
      parts: [
        { id: 'bat', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Bateria 9V', properties: { simulationModel: 'battery9V', voltage: 9 } },
        { id: 'r3', kind: 'library', x: 100, y: 100, rotation: 0, label: 'R3', properties: { simulationModel: 'resistor' } },
        { id: 'd3', kind: 'library', x: 200, y: 100, rotation: 0, label: 'D3', properties: { simulationModel: 'led2' } },
      ],
      wires: [
        { id: 'w1', from: 'bat:Positive', to: 'r3:Terminal 1', color: 'red' },
        { id: 'w2', from: 'r3:Terminal 2', to: 'd3:Anode', color: 'green' },
        { id: 'w3', from: 'd3:Cathode', to: 'bat:Negative', color: 'black' },
      ],
    }
    const resBat = simulate(batteryProject, emptyRuntime())
    expect(resBat.simulation.leds.d3).toBe('1')
  })
})

