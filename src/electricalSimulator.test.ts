import { describe, expect, it } from 'vitest'
import { emptyRuntime, initialRuntime, type Project } from './model'
import { simulateDc, simulateElectrical, supportsDcSimulation } from './electricalSimulator'
import { functionGeneratorOutputResistanceOhms } from './functionGeneratorModel'
import { RGB_LED_MODEL, type RgbLedColor, type RgbLedPinoutName, type RgbLedTerminal } from './rgbLedModel'
import { SEVEN_SEGMENT_MODEL } from './sevenSegmentDisplayModel'
import { resetPIRSensorRuntimeEdges } from './pirSensorModel'
import { getTwoPinDiodeDescriptor, TWO_PIN_DIODE_MODEL } from './twoPinDiodeModel'

function ledJunctionVoltageForCurrent(currentA: number, color = 'red'): number {
  const led = getTwoPinDiodeDescriptor('led', color)
  return led.thermalVoltageV * Math.log1p(currentA / led.saturationCurrentA)
}

function expectedLedCurrent(sourceVoltage: number, resistance: number, color = 'red'): number {
  let low = 0, high = Math.max(1, sourceVoltage / resistance)
  for (let i = 0; i < 100; i++) {
    const current = (low + high) / 2
    const required = ledJunctionVoltageForCurrent(current, color) + current * (resistance + TWO_PIN_DIODE_MODEL.led.seriesResistanceOhms)
    if (required < sourceVoltage) low = current
    else high = current
  }
  return (low + high) / 2
}

function expectedDiodeCurrent(sourceVoltage: number, resistance: number): number {
  const diode = getTwoPinDiodeDescriptor('diode')
  let low = 0, high = Math.max(1, sourceVoltage / resistance)
  for (let i = 0; i < 100; i++) {
    const current = (low + high) / 2
    const required = diode.thermalVoltageV * Math.log1p(current / diode.saturationCurrentA) + current * resistance
    if (required < sourceVoltage) low = current
    else high = current
  }
  return (low + high) / 2
}

function ledCircuitAtCurrent(currentA: number, resistance: number, color: string): Project {
  const sourceVoltage = ledJunctionVoltageForCurrent(currentA, color) + currentA * (resistance + TWO_PIN_DIODE_MODEL.led.seriesResistanceOhms)
  const project = ledCircuit(resistance)
  project.parts.find(part => part.id === 's')!.properties = { voltage: sourceVoltage, internalResistance: 0 }
  project.parts.find(part => part.id === 'd')!.properties = { color }
  return project
}

function ledCircuit(resistance = 220, reversed = false): Project {
  return {
    version: 1, id: 'dc-led', name: 'Fonte, resistor e LED',
    parts: [
      { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
      { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: resistance } },
      { id: 'd', kind: 'led', x: 0, y: 0, rotation: 0, label: 'D1', properties: { color: 'red' } },
    ],
    wires: [
      { id: 'positive', from: 's:PLUS', to: 'r:A', color: 'red' },
      { id: 'direct-contact', from: 'r:B', to: reversed ? 'd:K' : 'd:A', color: 'green', hidden: true },
      { id: 'return', from: reversed ? 'd:A' : 'd:K', to: 's:MINUS', color: 'black' },
    ],
  }
}

describe('solver elétrico DC', () => {
  it('calcula a corrente e as tensões de uma fonte, resistor e LED', () => {
    const result = simulateDc(ledCircuit(), emptyRuntime()).simulation
    expect(result.converged).toBe(true)
    expect(result.diagnostics).toEqual([])
    expect(result.leds.d).toBe('1')
    expect(result.voltages?.['s:PLUS']).toBeCloseTo(5, 8)
    expect(result.voltages?.['s:MINUS']).toBeCloseTo(0, 8)
    const expected = expectedLedCurrent(5, 220, 'red')
    expect(result.currents?.r).toBeCloseTo(expected, 7)
    expect(result.currents?.d).toBeCloseTo(expected, 7)
    expect(result.voltages?.['r:A']! - result.voltages?.['r:B']!).toBeCloseTo(expected * 220, 7)
    expect(result.ledBrightness?.d).toBeCloseTo(expected / 0.02, 7)
  })

  it('simula lâmpada de 48 ohms, brilho, polaridade, sobrecorrente e circuito aberto', () => {
    const bulbCircuit = (voltage: number, reverse = false, open = false): Project => ({
      version: 1, id: `bulb-${voltage}-${reverse}-${open}`, name: 'Lâmpada 48 Ω',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage, internalResistance: 0 } },
        { id: 'bulb', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Lâmpada', properties: { simulationModel: 'lightBulb' } },
      ],
      wires: open ? [] : [
        { id: 'positive', from: 's:PLUS', to: `bulb:Terminal ${reverse ? '2' : '1'}`, color: 'red' },
        { id: 'return', from: `bulb:Terminal ${reverse ? '1' : '2'}`, to: 's:MINUS', color: 'black' },
      ],
    })

    const nominalProject = bulbCircuit(5)
    expect(supportsDcSimulation(nominalProject)).toBe(true)
    const nominal = simulateDc(nominalProject, emptyRuntime()).simulation
    expect(nominal.converged).toBe(true)
    expect(nominal.currents?.bulb).toBeCloseTo(5 / 48, 10)
    expect(nominal.voltages?.['bulb:Terminal 1']! - nominal.voltages?.['bulb:Terminal 2']!).toBeCloseTo(5, 10)
    expect(nominal.powers?.bulb).toBeCloseTo(25 / 48, 10)
    expect(nominal.lightBulbBrightness?.bulb).toBeCloseTo((5 / 48) / 0.25, 10)
    expect(nominal.warnings).toEqual([])

    const reversed = simulateDc(bulbCircuit(5, true), emptyRuntime()).simulation
    expect(reversed.converged).toBe(true)
    expect(reversed.currents?.bulb).toBeCloseTo(-5 / 48, 10)
    expect(reversed.lightBulbBrightness?.bulb).toBeCloseTo((5 / 48) / 0.25, 10)
    expect(reversed.warnings).toEqual([])

    const overloaded = simulateDc(bulbCircuit(15), emptyRuntime()).simulation
    expect(overloaded.converged).toBe(true)
    expect(overloaded.currents?.bulb).toBeCloseTo(15 / 48, 10)
    expect(overloaded.voltages?.['bulb:Terminal 1']! - overloaded.voltages?.['bulb:Terminal 2']!).toBeCloseTo(15, 10)
    expect(overloaded.lightBulbBrightness?.bulb).toBe(1)
    expect(overloaded.warnings?.some(warning => warning.includes('0,25 A'))).toBe(true)

    const open = simulateDc(bulbCircuit(5, false, true), emptyRuntime()).simulation
    expect(open.converged).toBe(true)
    expect(open.currents?.bulb).toBeCloseTo(0, 12)
    expect(open.lightBulbBrightness?.bulb).toBe(0)
    expect(open.warnings).toEqual([])
  })

  it('simula motor vibratório, amplitude, sobrecorrente, polaridade reversa e circuito aberto', () => {
    const motorCircuit = (voltage: number, reverse = false, open = false): Project => ({
      version: 1, id: `vibration-${voltage}-${reverse}-${open}`, name: 'Motor vibratório',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage, internalResistance: 0 } },
        { id: 'motor', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Motor', properties: { simulationModel: 'vibration_motor' } },
      ],
      wires: open ? [] : [
        { id: 'positive', from: 's:PLUS', to: `motor:${reverse ? 'Negative' : 'Positive'}`, color: 'red' },
        { id: 'return', from: `motor:${reverse ? 'Positive' : 'Negative'}`, to: 's:MINUS', color: 'black' },
      ],
    })

    const threshold = simulateDc(motorCircuit(2), emptyRuntime()).simulation
    expect(supportsDcSimulation(motorCircuit(2))).toBe(true)
    expect(threshold.converged).toBe(true)
    expect(threshold.currents?.motor).toBeCloseTo(0.04, 12)
    expect(threshold.vibrationMotorAmplitude?.motor).toBe(0)
    expect(threshold.warnings).toEqual([])

    const nominal = simulateDc(motorCircuit(5), emptyRuntime()).simulation
    expect(nominal.converged).toBe(true)
    expect(nominal.voltages?.['motor:Positive']).toBeCloseTo(5, 12)
    expect(nominal.voltages?.['motor:Negative']).toBeCloseTo(0, 12)
    expect(nominal.currents?.motor).toBeCloseTo(0.1, 12)
    expect(nominal.powers?.motor).toBeCloseTo(0.5, 12)
    expect(nominal.vibrationMotorAmplitude?.motor).toBe(1)
    expect(nominal.warnings).toEqual([])

    const overloaded = simulateDc(motorCircuit(6), emptyRuntime()).simulation
    expect(overloaded.converged).toBe(true)
    expect(overloaded.currents?.motor).toBeCloseTo(0.12, 12)
    expect(overloaded.vibrationMotorAmplitude?.motor).toBe(0)
    expect(overloaded.warnings?.some(warning => warning.includes('0.10 A'))).toBe(true)

    const reversed = simulateDc(motorCircuit(5, true), emptyRuntime()).simulation
    expect(reversed.converged).toBe(true)
    expect(reversed.currents?.motor).toBeCloseTo(-0.1, 12)
    expect(reversed.vibrationMotorAmplitude?.motor).toBe(0)
    expect(reversed.warnings).toEqual([])

    const open = simulateDc(motorCircuit(5, false, true), emptyRuntime()).simulation
    expect(open.converged).toBe(true)
    expect(open.currents?.motor).toBeCloseTo(0, 12)
    expect(open.vibrationMotorAmplitude?.motor).toBe(0)
    expect(open.warnings).toEqual([])
  })

  it('integra o sensor tilt SW200D no MNA com aliases físicos, limiar estrito e circuito aberto', () => {
    const tiltCircuit = (position: number, open = false): Project => ({
      version: 1, id: `tilt-${position}-${open}`, name: 'Sensor de inclinação SW200D',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'tilt', kind: 'library', x: 0, y: 0, rotation: 0, label: 'SW200D', properties: { simulationModel: 'sensor_tilt_sw200d', position } },
      ],
      wires: open ? [] : [
        { id: 'positive', from: 's:PLUS', to: 'tilt:1', color: 'red' },
        { id: 'return', from: 'tilt:Terminal 2', to: 's:MINUS', color: 'black' },
      ],
    })

    const boundaryProject = tiltCircuit(0.75)
    expect(supportsDcSimulation(boundaryProject)).toBe(true)
    const boundary = simulateDc(boundaryProject, emptyRuntime()).simulation
    expect(boundary.converged).toBe(true)
    expect(boundary.tiltSensorClosed?.tilt).toBe(false)
    expect(boundary.tiltSensorResistance?.tilt).toBe(1e10)
    expect(boundary.currents?.tilt).toBeCloseTo(5e-10, 18)
    expect(boundary.voltages?.['tilt:Terminal 1']).toBeCloseTo(boundary.voltages?.['tilt:1']!, 12)
    expect(boundary.voltages?.['tilt:Terminal 2']).toBeCloseTo(boundary.voltages?.['tilt:2']!, 12)

    const closed = simulateDc(tiltCircuit(0.76), emptyRuntime()).simulation
    expect(closed.converged).toBe(true)
    expect(closed.tiltSensorClosed?.tilt).toBe(true)
    expect(closed.tiltSensorResistance?.tilt).toBe(10)
    expect(closed.currents?.tilt).toBeCloseTo(0.5, 10)
    expect(closed.powers?.tilt).toBeCloseTo(2.5, 10)

    const open = simulateDc(tiltCircuit(0.76, true), emptyRuntime()).simulation
    expect(open.converged).toBe(true)
    expect(open.tiltSensorClosed?.tilt).toBe(true)
    expect(open.currents?.tilt).toBeCloseTo(0, 12)
    expect(open.warnings).toEqual([])
  })

  it('simula o sensor de umidade com pares unidos, sonda variável e saída Signal', () => {
    const soilCircuit = (position?: number): Project => ({
      version: 1, id: `soil-${position ?? 'default'}`, name: 'Sensor de umidade do solo',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'soil', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Soil Moisture Sensor', properties: { simulationModel: 'sensorSoilMoisture', ...(position === undefined ? {} : { position }) } },
      ],
      wires: [
        { id: 'positive', from: 's:PLUS', to: 'soil:vcc1', color: 'red' },
        { id: 'return', from: 'soil:gnd2', to: 's:MINUS', color: 'black' },
      ],
    })

    const dryProject = soilCircuit()
    expect(supportsDcSimulation(dryProject)).toBe(true)
    const dry = simulateDc(dryProject, emptyRuntime()).simulation
    expect(dry.converged).toBe(true)
    expect(dry.soilMoistureProbeResistance?.soil).toBeCloseTo(5.7544e9, -5)
    expect(dry.voltages?.['soil:Power']).toBeCloseTo(dry.voltages?.['soil:vcc1']!, 12)
    expect(dry.voltages?.['soil:vcc1']).toBeCloseTo(dry.voltages?.['soil:vcc2']!, 12)
    expect(dry.voltages?.['soil:Ground']).toBeCloseTo(dry.voltages?.['soil:gnd1']!, 12)
    expect(dry.voltages?.['soil:gnd1']).toBeCloseTo(dry.voltages?.['soil:gnd2']!, 12)
    expect(dry.voltages?.['soil:Signal']).toBeCloseTo(dry.voltages?.['soil:sig1']!, 12)
    expect(dry.voltages?.['soil:sig1']).toBeCloseTo(dry.voltages?.['soil:sig2']!, 12)

    const wet = simulateDc(soilCircuit(1), emptyRuntime()).simulation
    expect(wet.converged).toBe(true)
    expect(wet.soilMoistureProbeResistance?.soil).toBeCloseTo(75.8578e3, 0)
    expect(wet.voltages?.['soil:Signal']).not.toBeCloseTo(dry.voltages?.['soil:Signal']!, 6)
    expect(wet.voltages?.['soil:Signal']).toBeCloseTo(wet.voltages?.['soil:sig1']!, 12)
    expect(wet.voltages?.['soil:sig1']).toBeCloseTo(wet.voltages?.['soil:sig2']!, 12)
  })

  it('resolve um divisor de tensão e calcula potência dissipada', () => {
    const project: Project = {
      version: 1, id: 'voltage-divider', name: 'Divisor resistivo',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'r1', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 1000 } },
        { id: 'r2', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R2', properties: { ohms: 1000 } },
      ],
      wires: [
        { id: 'w1', from: 's:PLUS', to: 'r1:A', color: 'red' },
        { id: 'w2', from: 'r1:B', to: 'r2:A', color: 'red' },
        { id: 'w3', from: 'r2:B', to: 's:MINUS', color: 'black' },
      ],
    }
    const result = simulateDc(project, emptyRuntime()).simulation
    expect(result.converged).toBe(true)
    expect(result.currents?.r1).toBeCloseTo(0.0025, 9)
    expect(result.currents?.r2).toBeCloseTo(0.0025, 9)
    expect(result.powers?.r1).toBeCloseTo(0.00625, 9)
    expect(result.powers?.r2).toBeCloseTo(0.00625, 9)
    expect(result.voltages?.['r1:B']).toBeCloseTo(2.5, 9)
  })

  it('resolve cargas em paralelo em uma rede flutuante e conserva corrente da fonte', () => {
    const project: Project = {
      version: 1, id: 'parallel-floating', name: 'Duas cargas em paralelo',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'r1', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 1000 } },
        { id: 'r2', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R2', properties: { ohms: 1000 } },
      ],
      wires: [
        { id: 'positive-1', from: 's:PLUS', to: 'r1:A', color: 'red' },
        { id: 'negative-1', from: 'r1:B', to: 's:MINUS', color: 'black' },
        { id: 'positive-2', from: 's:PLUS', to: 'r2:A', color: 'red' },
        { id: 'negative-2', from: 'r2:B', to: 's:MINUS', color: 'black' },
      ],
    }
    const result = simulateDc(project, emptyRuntime()).simulation
    expect(result.converged).toBe(true)
    expect(result.currents?.r1).toBeCloseTo(0.005, 10)
    expect(result.currents?.r2).toBeCloseTo(0.005, 10)
    expect(result.currents?.s).toBeCloseTo(-0.01, 10)
  })

  it('diagnostica fontes ideais conflitantes em paralelo', () => {
    const project: Project = {
      version: 1, id: 'conflicting-sources', name: 'Fontes incompatíveis',
      parts: [
        { id: 's1', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte 5 V', properties: { voltage: 5 } },
        { id: 's2', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte 3 V', properties: { voltage: 3 } },
      ],
      wires: [
        { id: 'plus', from: 's1:PLUS', to: 's2:PLUS', color: 'red' },
        { id: 'minus', from: 's1:MINUS', to: 's2:MINUS', color: 'black' },
      ],
    }
    const result = simulateDc(project, emptyRuntime()).simulation
    expect(result.converged).toBe(false)
    expect(result.diagnostics?.length).toBeGreaterThan(0)
  })

  it('usa a resistência do fotoresistor conforme a iluminação na malha DC', () => {
    const project: Project = {
      version: 1, id: 'ldr-divider', name: 'Fotoresistor e carga',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 1000 } },
        { id: 'ldr', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Fotoresistor', properties: { simulationModel: 'ldr_v2', lightLevel: 0 } },
      ],
      wires: [
        { id: 'positive', from: 's:PLUS', to: 'r:A', color: 'red' },
        { id: 'sensor', from: 'r:B', to: 'ldr:Terminal 1', color: 'green', hidden: true },
        { id: 'return', from: 'ldr:Terminal 2', to: 's:MINUS', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const dark = simulateDc(project, emptyRuntime()).simulation
    expect(dark.converged).toBe(true)
    project.parts[2].properties!.lightLevel = 100
    const bright = simulateDc(project, emptyRuntime()).simulation
    expect(bright.converged).toBe(true)
    expect(bright.currents?.r).toBeGreaterThan((dark.currents?.r ?? 0) * 100)
    expect(Math.abs(bright.currents?.ldr ?? 0)).toBeCloseTo(Math.abs(bright.currents?.r ?? 0), 10)
    expect(bright.voltages?.['ldr:Terminal 1']).toBeDefined()
  })

  it('usa a força aplicada e a flexão como resistências variáveis reais', () => {
    const project: Project = {
      version: 1, id: 'force-divider', name: 'Sensor de força',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 1000 } },
        { id: 'force', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Sensor de força', properties: { simulationModel: 'sensorForce', force: 0 } },
      ],
      wires: [
        { id: 'positive', from: 's:PLUS', to: 'r:A', color: 'red' },
        { id: 'sensor', from: 'r:B', to: 'force:1', color: 'green', hidden: true },
        { id: 'return', from: 'force:2', to: 's:MINUS', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const released = simulateDc(project, emptyRuntime()).simulation
    expect(released.converged).toBe(true)
    project.parts[2].properties!.force = 1
    const pressed = simulateDc(project, emptyRuntime()).simulation
    expect(pressed.converged).toBe(true)
    expect(pressed.currents?.r).toBeGreaterThan((released.currents?.r ?? 0) * 100)

    project.parts[2] = { ...project.parts[2], label: 'Sensor flexível', properties: { simulationModel: 'sensorFlex', bend: 0 } }
    const flat = simulateDc(project, emptyRuntime()).simulation
    project.parts[2].properties!.bend = 180
    const bent = simulateDc(project, emptyRuntime()).simulation
    expect(flat.converged).toBe(true)
    expect(bent.converged).toBe(true)
    expect(bent.currents?.r).toBeLessThan(flat.currents?.r ?? 0)
  })

  it('simula TMP36 com saída dependente de temperatura e alimentação mínima', () => {
    const project: Project = {
      version: 1, id: 'tmp36', name: 'TMP36 com carga',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 't', kind: 'library', x: 0, y: 0, rotation: 0, label: 'TMP36', properties: { simulationModel: 'TMP36', temperatureC: 25 } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 100_000 } },
      ],
      wires: [
        { id: 'power', from: 's:PLUS', to: 't:Power', color: 'red' },
        { id: 'ground', from: 's:MINUS', to: 't:GND', color: 'black' },
        { id: 'output', from: 't:Vout', to: 'r:A', color: 'green' },
        { id: 'load-return', from: 'r:B', to: 's:MINUS', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const at25 = simulateDc(project, emptyRuntime()).simulation
    expect(at25.converged).toBe(true)
    expect(at25.voltages?.['t:Vout']).toBeCloseTo(0.375, 5)
    project.parts[1].properties!.temperatureC = 75
    const at75 = simulateDc(project, emptyRuntime()).simulation
    expect(at75.converged).toBe(true)
    expect(at75.voltages?.['t:Vout']).toBeCloseTo(0.625, 5)

    project.parts[0].properties!.voltage = 2.5
    const underpowered = simulateDc(project, emptyRuntime()).simulation
    expect(underpowered.converged).toBe(true)
    expect(underpowered.voltages?.['t:Vout']).toBeCloseTo(0, 8)
  })

  it('simula célula solar como fonte de corrente dependente de luz', () => {
    const project: Project = {
      version: 1, id: 'solar-cell', name: 'Célula solar com carga',
      parts: [
        { id: 'solar', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Célula solar', properties: { simulationModel: 'solarCell', illumination: 100 } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 10 } },
      ],
      wires: [
        { id: 'load', from: 'solar:Positive', to: 'r:A', color: 'red' },
        { id: 'return', from: 'r:B', to: 'solar:Negative', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const lit = simulateDc(project, emptyRuntime()).simulation
    expect(lit.converged).toBe(true)
    expect(lit.currents?.r).toBeGreaterThan(0.09)
    expect(lit.currents?.solar).toBeCloseTo(lit.currents?.r ?? 0, 6)
    expect(lit.powers?.solar).toBeGreaterThan(0)
    expect(lit.voltages?.['solar:Positive']).toBeGreaterThan(0)

    project.parts[0].properties!.illumination = 0
    const dark = simulateDc(project, emptyRuntime()).simulation
    expect(dark.converged).toBe(true)
    expect(Math.abs(dark.currents?.r ?? 0)).toBeLessThan(1e-8)
    expect(dark.voltages?.['solar:Positive']).toBeCloseTo(0, 8)

    project.parts[0].properties!.illumination = 100
    project.parts = project.parts.filter(part => part.id !== 'r')
    project.wires = []
    const openCircuit = simulateDc(project, emptyRuntime()).simulation
    expect(openCircuit.converged).toBe(true)
    expect(openCircuit.voltages?.['solar:Positive']).toBeGreaterThan(3)
    expect(openCircuit.voltages?.['solar:Positive']).toBeLessThan(4)
    expect(Math.abs(openCircuit.currents?.solar ?? 0)).toBeLessThan(1e-8)
  })

  it('une os cinco furos do mesmo grupo na protoboard', () => {
    const project: Project = {
      version: 1, id: 'breadboard-divider', name: 'Divisor na protoboard',
      parts: [
        { id: 'bb', kind: 'breadboard', x: 0, y: 0, rotation: 0, label: 'Protoboard' },
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'r1', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 1000 } },
        { id: 'r2', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R2', properties: { ohms: 1000 } },
      ],
      wires: [
        { id: 'w1', from: 's:PLUS', to: 'r1:A', color: 'red' },
        { id: 'w2', from: 'r1:B', to: 'board:bb:row:0:left:0', color: 'green', hidden: true },
        { id: 'w3', from: 'r2:A', to: 'board:bb:row:0:left:4', color: 'green', hidden: true },
        { id: 'w4', from: 'r2:B', to: 's:MINUS', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const result = simulateDc(project, emptyRuntime()).simulation
    expect(result.converged).toBe(true)
    expect(result.currents?.r1).toBeCloseTo(0.0025, 9)
    expect(result.voltages?.['r1:B']).toBeCloseTo(result.voltages?.['r2:A']!, 9)
  })

  it('integra um circuito RL e preserva a corrente do indutor entre passos', () => {
    const project: Project = {
      version: 1, id: 'rl-step', name: 'Degrau RL',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 10 } },
        { id: 'l', kind: 'library', x: 0, y: 0, rotation: 0, label: 'L1', properties: { simulationModel: 'inductor', inductance: 1 } },
      ],
      wires: [
        { id: 'w1', from: 's:PLUS', to: 'r:A', color: 'red' },
        { id: 'w2', from: 'r:B', to: 'l:Terminal 1', color: 'red' },
        { id: 'w3', from: 'l:Terminal 2', to: 's:MINUS', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const dc = simulateDc(project, emptyRuntime()).simulation
    expect(dc.converged).toBe(true)
    expect(dc.currents?.l).toBeCloseTo(0.5, 9)
    expect(dc.voltages?.['l:Terminal 1']).toBeCloseTo(0, 9)

    let runtime = emptyRuntime()
    let result = simulateElectrical(project, runtime, 0.01)
    runtime = result.runtime
    expect(result.simulation.mode).toBe('transient')
    expect(result.simulation.converged).toBe(true)
    expect(result.simulation.currents?.l).toBeCloseTo(0.05 / 1.1, 9)
    expect(result.simulation.voltages?.['l:Terminal 1']).toBeCloseTo(5 - 10 * 0.05 / 1.1, 9)
    expect(runtime.inductorCurrents?.l).toBeCloseTo(result.simulation.currents?.l ?? 0, 12)

    for (let i = 1; i < 100; i++) {
      result = simulateElectrical(project, runtime, 0.01)
      runtime = result.runtime
    }
    expect(result.simulation.currents?.l).toBeCloseTo(0.5 * (1 - Math.exp(-10)), 6)
    expect(result.simulation.energies?.l).toBeCloseTo(0.5 * (result.simulation.currents?.l ?? 0) ** 2, 10)

    project.parts.find(part => part.id === 'l')!.properties!.initialCurrent = 0.2
    const initialized = simulateElectrical(project, emptyRuntime(), 0.01)
    expect(initialized.simulation.converged).toBe(true)
    expect(initialized.simulation.currents?.l).toBeCloseTo(0.25 / 1.1, 10)
  })

  it('integra a carga RC com passo inicial backward Euler e passos trapezoidais', () => {
    const project: Project = {
      version: 1, id: 'rc-charge', name: 'Carga RC',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 1000 } },
        { id: 'c', kind: 'library', x: 0, y: 0, rotation: 0, label: 'C1', properties: { simulationModel: 'capacitor', capacitance: 0.001 } },
      ],
      wires: [
        { id: 'w1', from: 's:PLUS', to: 'r:A', color: 'red' },
        { id: 'w2', from: 'r:B', to: 'c:Terminal 1', color: 'red' },
        { id: 'w3', from: 'c:Terminal 2', to: 's:MINUS', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    let runtime = emptyRuntime()
    const timeStep = 0.01
    let result = simulateElectrical(project, runtime, timeStep)
    runtime = result.runtime
    expect(result.simulation.mode).toBe('transient')
    expect(result.simulation.converged).toBe(true)
    const initialChargeCurrent = 5 / 1010.01
    const firstIdealVoltage = initialChargeCurrent * 10
    const firstTerminalVoltage = firstIdealVoltage + initialChargeCurrent * 0.01
    expect(result.simulation.currents?.c).toBeCloseTo(initialChargeCurrent, 10)
    expect(result.simulation.voltages?.['c:Terminal 1']).toBeCloseTo(firstTerminalVoltage, 10)
    expect(runtime.capacitorVoltages?.c).toBeCloseTo(firstIdealVoltage, 10)

    for (let i = 1; i < 100; i++) {
      result = simulateElectrical(project, runtime, timeStep)
      runtime = result.runtime
    }
    const terminalVoltage = result.simulation.voltages?.['c:Terminal 1'] ?? 0
    const idealVoltage = runtime.capacitorVoltages?.c ?? 0
    const analytic = 5 * (1 - Math.exp(-1 / 1.00001))
    expect(Math.abs(idealVoltage - analytic)).toBeLessThan(0.0002)
    expect(terminalVoltage).toBeGreaterThan(idealVoltage)
    expect(result.simulation.energies?.c).toBeCloseTo(0.5 * 0.001 * idealVoltage * idealVoltage, 10)

    const coarse = simulateElectrical(project, emptyRuntime(), 0.05, 0.05, 0.01)
    const fine = simulateElectrical(project, emptyRuntime(), 0.05, 0.05, 0.001)
    expect(coarse.simulation.converged).toBe(true)
    expect(fine.simulation.converged).toBe(true)
    expect(fine.runtime.capacitorVoltages?.c).toBeGreaterThan(coarse.runtime.capacitorVoltages?.c ?? 0)
  })

  it('valida resposta transitória RLC amortecida contra a solução analítica', () => {
    const project: Project = {
      version: 1, id: 'rlc-step', name: 'Degrau RLC série',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 10 } },
        { id: 'l', kind: 'library', x: 0, y: 0, rotation: 0, label: 'L1', properties: { simulationModel: 'inductor', inductance: 1 } },
        { id: 'c', kind: 'library', x: 0, y: 0, rotation: 0, label: 'C1', properties: { simulationModel: 'capacitor', capacitance: 0.001 } },
      ],
      wires: [
        { id: 'w1', from: 's:PLUS', to: 'r:A', color: 'red' },
        { id: 'w2', from: 'r:B', to: 'l:Terminal 1', color: 'red' },
        { id: 'w3', from: 'l:Terminal 2', to: 'c:Terminal 1', color: 'red' },
        { id: 'w4', from: 'c:Terminal 2', to: 's:MINUS', color: 'black' },
      ],
    }
    let runtime = emptyRuntime()
    let result = simulateElectrical(project, runtime, 0.001, 0.001, 0.001)
    runtime = result.runtime
    for (let step = 2; step <= 100; step++) {
      result = simulateElectrical(project, runtime, 0.001, step * 0.001, 0.001)
      runtime = result.runtime
    }
    expect(result.simulation.converged, result.simulation.diagnostics?.join('; ')).toBe(true)
    const time = 0.1
    const resistance = 10.01 // Includes the extracted capacitor ESR.
    const inductance = 1
    const capacitance = 0.001
    const alpha = resistance / (2 * inductance)
    const dampedFrequency = Math.sqrt(1 / (inductance * capacitance) - alpha * alpha)
    const analytic = 5 * (1 - Math.exp(-alpha * time) * (Math.cos(dampedFrequency * time) + alpha / dampedFrequency * Math.sin(dampedFrequency * time)))
    expect(Math.abs((runtime.capacitorVoltages?.c ?? 0) - analytic)).toBeLessThan(0.002)
    expect(runtime.inductorCurrents?.l).toBeGreaterThan(0)

    const runAtStep = (step: number) => {
      let history = emptyRuntime()
      let output = simulateElectrical(project, history, step, step, step)
      history = output.runtime
      for (let index = 2; index <= Math.round(time / step); index++) {
        output = simulateElectrical(project, history, step, index * step, step)
        history = output.runtime
      }
      return history.capacitorVoltages?.c ?? 0
    }
    const analyticError = (step: number) => Math.abs(runAtStep(step) - analytic)
    expect(analyticError(0.001)).toBeLessThan(analyticError(0.002))
    expect(analyticError(0.0005)).toBeLessThan(analyticError(0.001))
  })

  it('integra descarga RC a partir da condição inicial do capacitor', () => {
    const project: Project = {
      version: 1, id: 'rc-discharge', name: 'Descarga RC',
      parts: [
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 1000 } },
        { id: 'c', kind: 'library', x: 0, y: 0, rotation: 0, label: 'C1', properties: { simulationModel: 'capacitor', capacitance: 0.001, initialVoltage: 5 } },
      ],
      wires: [
        { id: 'top', from: 'c:Terminal 1', to: 'r:A', color: 'red' },
        { id: 'bottom', from: 'r:B', to: 'c:Terminal 2', color: 'black' },
      ],
    }
    let runtime = emptyRuntime()
    let result = simulateElectrical(project, runtime, 0.01)
    runtime = result.runtime
    expect(result.simulation.converged).toBe(true)
    expect(result.simulation.currents?.c).toBeLessThan(0)
    expect(runtime.capacitorVoltages?.c).toBeCloseTo(5 / (1 + 0.01 / (1000.01 * 0.001)), 9)
    const firstVoltage = runtime.capacitorVoltages?.c ?? 0
    for (let index = 1; index < 100; index++) {
      result = simulateElectrical(project, runtime, 0.01)
      runtime = result.runtime
    }
    expect(result.simulation.converged).toBe(true)
    expect(runtime.capacitorVoltages?.c).toBeLessThan(firstVoltage)
    expect(runtime.capacitorVoltages?.c).toBeGreaterThan(0)
  })

  it('usa a tensão inicial do capacitor e informa breakdown do polarizado sem falhar o circuito', () => {
    const rc: Project = {
      version: 1, id: 'rc-initial', name: 'Condição inicial RC',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 1000 } },
        { id: 'c', kind: 'library', x: 0, y: 0, rotation: 0, label: 'C1', properties: { simulationModel: 'capacitor', capacitance: 0.001, initialVoltage: 2 } },
      ],
      wires: [
        { id: 'w1', from: 's:PLUS', to: 'r:A', color: 'red' },
        { id: 'w2', from: 'r:B', to: 'c:Terminal 1', color: 'red' },
        { id: 'w3', from: 'c:Terminal 2', to: 's:MINUS', color: 'black' },
      ],
    }
    const initialStep = simulateElectrical(rc, emptyRuntime(), 0.01)
    expect(initialStep.simulation.converged).toBe(true)
    expect(initialStep.simulation.currents?.c).toBeCloseTo(3 / 1010.01, 10)
    expect(initialStep.runtime.capacitorVoltages?.c).toBeCloseTo(2 + 30 / 1010.01, 10)

    const polarized: Project = {
      version: 1, id: 'polarized-breakdown', name: 'Capacitor polarizado',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 20 } },
        { id: 'c', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Cpolar', properties: { simulationModel: 'capacitor_polarized', capacitance: 1e-6, 'libraryProperty:voltage rating': 16 } },
      ],
      wires: [
        { id: 'positive', from: 's:PLUS', to: 'c:Positive', color: 'red' },
        { id: 'negative', from: 's:MINUS', to: 'c:Negative', color: 'black' },
      ],
    }
    const overVoltage = simulateDc(polarized, emptyRuntime()).simulation
    expect(overVoltage.converged).toBe(true)
    expect(overVoltage.diagnostics).toEqual([])
    expect(overVoltage.warnings?.[0]).toContain('tensão acima de 16 V')

    polarized.parts[0].properties!.voltage = 5
    polarized.wires[0] = { ...polarized.wires[0], to: 'c:Negative' }
    polarized.wires[1] = { ...polarized.wires[1], to: 'c:Positive' }
    const reversePolarity = simulateDc(polarized, emptyRuntime()).simulation
    expect(reversePolarity.converged).toBe(true)
    expect(reversePolarity.warnings?.[0]).toContain('polaridade invertida')
  })

  it('mantém o capacitor aberto no ponto DC e reinicia a carga com estado novo', () => {
    const project: Project = {
      version: 1, id: 'rc-reset', name: 'Reset RC',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 1000 } },
        { id: 'c', kind: 'library', x: 0, y: 0, rotation: 0, label: 'C1', properties: { simulationModel: 'capacitor', capacitance: 0.001 } },
      ],
      wires: [
        { id: 'w1', from: 's:PLUS', to: 'r:A', color: 'red' },
        { id: 'w2', from: 'r:B', to: 'c:Terminal 1', color: 'red' },
        { id: 'w3', from: 'c:Terminal 2', to: 's:MINUS', color: 'black' },
      ],
    }
    const dc = simulateDc(project, emptyRuntime()).simulation
    expect(dc.mode).toBe('dc')
    expect(dc.currents?.c).toBe(0)
    const firstStep = simulateElectrical(project, emptyRuntime(), 0.01).simulation
    expect(firstStep.voltages?.['c:Terminal 1']).toBeCloseTo(5 * 10.01 / 1010.01, 10)
  })

  it('acompanha Shockley por cor, incluindo a transição próxima de Vf e polarização reversa', () => {
    for (const color of ['red', 'orange', 'yellow', 'green', 'blue', 'white']) {
      const target = 0.01
      const result = simulateDc(ledCircuitAtCurrent(target, 100, color), emptyRuntime()).simulation
      expect(result.converged).toBe(true)
      expect(result.currents?.d).toBeCloseTo(target, 6)
      expect(result.currents?.r).toBeCloseTo(target, 6)
    }
    const nearTurnOn = simulateDc(ledCircuitAtCurrent(1e-5, 100, 'red'), emptyRuntime()).simulation
    expect(nearTurnOn.converged).toBe(true)
    expect(nearTurnOn.currents?.d).toBeCloseTo(1e-5, 8)
    const reversed = simulateDc(ledCircuit(220, true), emptyRuntime()).simulation
    expect(reversed.converged).toBe(true)
    expect(reversed.currents?.d).toBeLessThan(0)
    expect(reversed.ledWarning?.d).toBe(false)
    expect(reversed.ledBreakdown?.d).toBe(false)
    expect(reversed.warnings).toEqual([])
  })

  it('aplica os limites extraídos do LED sem limitar a corrente do circuito', () => {
    const warning = simulateDc(ledCircuitAtCurrent(0.020001, 10, 'red'), emptyRuntime()).simulation
    expect(warning.converged).toBe(true)
    expect(warning.currents?.d).toBeCloseTo(0.020001, 6)
    expect(warning.ledWarning?.d).toBe(true)
    expect(warning.ledBreakdown?.d).toBe(false)
    expect(warning.warnings?.some(message => message.includes('máximo recomendado de 20 mA'))).toBe(true)

    const atBoundary = simulateDc(ledCircuitAtCurrent(0.12, 10, 'red'), emptyRuntime()).simulation
    expect(atBoundary.converged).toBe(true)
    expect(atBoundary.currents?.d).toBeCloseTo(0.12, 5)
    expect(atBoundary.ledWarning?.d).toBe(false)
    expect(atBoundary.ledBreakdown?.d).toBe(true)
    expect(atBoundary.warnings?.some(message => message.includes('limite absoluto de 120 mA'))).toBe(true)

    const above = simulateDc(ledCircuitAtCurrent(0.1201, 10, 'red'), emptyRuntime()).simulation
    expect(above.converged).toBe(true)
    expect(above.currents?.d).toBeCloseTo(0.1201, 5)
    expect(above.ledBreakdown?.d).toBe(true)
  })

  it('faz a corrente cair quando a resistência aumenta', () => {
    const low = simulateDc(ledCircuit(220), emptyRuntime()).simulation.currents?.r ?? 0
    const high = simulateDc(ledCircuit(1000), emptyRuntime()).simulation.currents?.r ?? 0
    expect(high).toBeCloseTo(expectedLedCurrent(5, 1000), 7)
    expect(high).toBeLessThan(low)
  })

  it('mantém o LED apagado em polaridade invertida e sem retorno', () => {
    const reversed = simulateDc(ledCircuit(220, true), emptyRuntime()).simulation
    expect(reversed.converged).toBe(true)
    expect(reversed.leds.d).toBe('0')
    const open = ledCircuit()
    open.wires = open.wires.filter(wire => wire.id !== 'return')
    const openResult = simulateDc(open, emptyRuntime()).simulation
    expect(openResult.converged).toBe(true)
    expect(openResult.leds.d).toBe('0')
    expect(Math.abs(openResult.currents?.r ?? 0)).toBeLessThan(1e-8)
  })

  it('sinaliza uma fonte em curto e não afirma que o LED está aceso', () => {
    const project = ledCircuit()
    project.wires.push({ id: 'short', from: 's:PLUS', to: 's:MINUS', color: 'black' })
    const result = simulateDc(project, emptyRuntime()).simulation
    expect(result.converged).toBe(false)
    expect(result.diagnostics).toContain('Não foi possível resolver o ponto DC. Verifique fontes em curto ou conexões incompatíveis.')
    expect(result.leds.d).toBe('X')
  })

  it('simula o botão como chave aberta e fechada', () => {
    const project: Project = {
      ...ledCircuit(),
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 220 } },
        { id: 'b', kind: 'button', x: 0, y: 0, rotation: 0, label: 'Botão' },
        { id: 'd', kind: 'led', x: 0, y: 0, rotation: 0, label: 'LED', properties: { color: 'red' } },
      ],
      wires: [
        { id: 'w1', from: 's:PLUS', to: 'r:A', color: 'red' },
        { id: 'w2', from: 'r:B', to: 'b:A1', color: 'red' },
        { id: 'w3', from: 'b:B1', to: 'd:A', color: 'red' },
        { id: 'w4', from: 'd:K', to: 's:MINUS', color: 'black' },
      ],
    }
    const released = simulateDc(project, emptyRuntime()).simulation
    expect(released.converged).toBe(true)
    expect(released.leds.d).toBe('0')
    const pressed = simulateDc(project, { ...emptyRuntime(), buttons: { b: true } }).simulation
    expect(pressed.converged).toBe(true)
    expect(pressed.leds.d).toBe('1')
    expect(pressed.currents?.r).toBeCloseTo(expectedLedCurrent(5, 220), 7)
  })

  it('simula o diodo físico do catálogo com sua polaridade', () => {
    const project: Project = {
      ...ledCircuit(),
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 220 } },
        { id: 'd', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Diodo', properties: { simulationModel: 'diode' } },
      ],
      wires: [
        { id: 'w1', from: 's:PLUS', to: 'r:A', color: 'red' },
        { id: 'w2', from: 'r:B', to: 'd:Anode', color: 'red' },
        { id: 'w3', from: 'd:Cathode', to: 's:MINUS', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const forward = simulateDc(project, emptyRuntime()).simulation
    expect(forward.converged).toBe(true)
    expect(forward.currents?.d).toBeCloseTo(expectedDiodeCurrent(5, 220), 6)
    project.wires[1] = { ...project.wires[1], to: 'd:Cathode' }
    project.wires[2] = { ...project.wires[2], from: 'd:Anode' }
    const reversed = simulateDc(project, emptyRuntime()).simulation
    expect(reversed.converged).toBe(true)
    expect(Math.abs(reversed.currents?.d ?? 0)).toBeLessThan(1e-8)
  })

  it('simula o Zener extraído em polarização reversa e direta', () => {
    const project: Project = {
      version: 1, id: 'zener-reverse', name: 'Regulador com Zener',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 12 } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Limitador', properties: { ohms: 1000 } },
        { id: 'z', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Zener', properties: { simulationModel: 'zenerDiode', 'libraryProperty:zener voltage': 5.1 } },
      ],
      wires: [
        { id: 'source', from: 's:PLUS', to: 'r:A', color: 'red' },
        { id: 'zener-reverse', from: 'r:B', to: 'z:Cathode', color: 'green' },
        { id: 'return', from: 'z:Anode', to: 's:MINUS', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const reverse = simulateDc(project, emptyRuntime()).simulation
    expect(reverse.converged).toBe(true)
    expect(reverse.diagnostics).toEqual([])
    expect(reverse.voltages?.['z:C']).toBeGreaterThan(5.1)
    expect(reverse.voltages?.['z:C']).toBeLessThan(6.2)
    expect(reverse.currents?.z).toBeLessThan(-0.005)
    expect(reverse.currents?.r).toBeGreaterThan(0.005)

    project.parts[0].properties!.voltage = 5
    project.wires[1] = { ...project.wires[1], to: 'z:Anode' }
    project.wires[2] = { ...project.wires[2], from: 'z:Cathode' }
    project.parts[2].properties!['zener voltage'] = 5.1
    const forward = simulateDc(project, emptyRuntime()).simulation
    expect(forward.converged).toBe(true)
    expect(forward.voltages?.['z:A']! - forward.voltages?.['z:C']!).toBeGreaterThan(0.45)
    expect(forward.voltages?.['z:A']! - forward.voltages?.['z:C']!).toBeLessThan(1)
    expect(forward.currents?.z).toBeGreaterThan(0.004)
  })

  it('reconhece conexões diretas ocultas e terminais antigos da biblioteca', () => {
    const project: Project = {
      ...ledCircuit(),
      parts: [
        { id: 's', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Bateria 9V', properties: { simulationModel: 'battery9V' } },
        { id: 'r', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Resistor', properties: { simulationModel: 'resistor', ohms: 220 } },
        { id: 'd', kind: 'library', x: 0, y: 0, rotation: 0, label: 'LED', properties: { simulationModel: 'led2', color: 'red' } },
      ],
      wires: [
        { id: 'positive', from: 's:Positive', to: 'r:Terminal 2', color: 'red' },
        { id: 'contact:rd', from: 'r:Terminal 1', to: 'd:Anode', color: 'green', hidden: true },
        { id: 'return', from: 'd:Cathode', to: 's:Negative', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const result = simulateDc(project, emptyRuntime()).simulation
    expect(result.converged).toBe(true)
    expect(result.leds.d).toBe('1')
    const expected = expectedLedCurrent(9, 221.5, 'red')
    expect(result.currents?.s).toBeCloseTo(-expected, 7)
    expect(result.currents?.d).toBeCloseTo(expected, 7)
    expect(result.voltages?.['s:Positive']).toBeCloseTo(9 - 1.5 * expected, 8)
  })

  it('aplica tensão e resistência interna extraídas das diferentes baterias', () => {
    const cases = [
      { model: 'battery9V', voltage: 9, internalResistance: 1.5 },
      { model: 'coinCell', voltage: 3, internalResistance: 10 },
      { model: 'AABattery', voltage: 3, internalResistance: 1, properties: { 'libraryProperty:count': '2' } },
      { model: 'batteryLemon', voltage: 0.52, internalResistance: 5900 },
      { model: 'batteryPotato', voltage: 0.67, internalResistance: 5650 },
    ]
    for (const { model, voltage, internalResistance, properties = {} } of cases) {
      const project: Project = {
        version: 1, id: `battery-${model}`, name: 'Bateria e carga',
        parts: [
          { id: 's', kind: 'library', x: 0, y: 0, rotation: 0, label: model, properties: { simulationModel: model, ...properties } },
          { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 1000 } },
        ],
        wires: [
          { id: 'positive', from: 's:Positive', to: 'r:A', color: 'red' },
          { id: 'return', from: 'r:B', to: 's:Negative', color: 'black' },
        ],
      }
      expect(supportsDcSimulation(project)).toBe(true)
      const result = simulateDc(project, emptyRuntime()).simulation
      expect(result.converged).toBe(true)
      expect(result.currents?.r).toBeCloseTo(voltage / (1000 + internalResistance), 9)
      expect(result.voltages?.['s:Positive']).toBeCloseTo(voltage - result.currents!.r * internalResistance, 8)
      if (model === 'batteryLemon' || model === 'batteryPotato') {
        const transient = simulateElectrical(project, emptyRuntime(), 0.001).simulation
        expect(transient.mode).toBe('transient')
        expect(transient.converged).toBe(true)
        expect(transient.energies?.s).toBeGreaterThan(0)
      }
    }
  })

  it('simula as duas posições da chave deslizante entre seus contatos', () => {
    const project: Project = {
      version: 1, id: 'slide-switch', name: 'Chave deslizante',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'sw', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Slideswitch', properties: { simulationModel: 'slide_switch_v2', Switch: false } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 220 } },
        { id: 'd', kind: 'led', x: 0, y: 0, rotation: 0, label: 'LED' },
      ],
      wires: [
        { id: 'positive', from: 's:PLUS', to: 'sw:Terminal 1', color: 'red' },
        { id: 'negative', from: 's:MINUS', to: 'sw:Terminal 2', color: 'black' },
        { id: 'load', from: 'sw:Common', to: 'r:A', color: 'green' },
        { id: 'led', from: 'r:B', to: 'd:A', color: 'green' },
        { id: 'return', from: 'd:K', to: 's:MINUS', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const terminal1 = simulateDc(project, emptyRuntime()).simulation
    expect(terminal1.converged).toBe(true)
    expect(terminal1.leds.d).toBe('1')
    expect(terminal1.currents?.r).toBeCloseTo(expectedLedCurrent(5, 220.000001), 7)
    project.parts.find(part => part.id === 'sw')!.properties!.Switch = true
    const terminal2 = simulateDc(project, emptyRuntime()).simulation
    expect(terminal2.converged).toBe(true)
    expect(terminal2.leds.d).toBe('0')
    expect(Math.abs(terminal2.currents?.r ?? 0)).toBeLessThan(1e-8)
  })

  it('simula o cursor do potenciômetro e sua resistência entre os terminais', () => {
    const project: Project = {
      version: 1, id: 'potentiometer-divider', name: 'Divisor com potenciômetro',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'p', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Potenciômetro', properties: { simulationModel: 'potentiometer_v2', resistance: 10_000, position: 0.25 } },
      ],
      wires: [
        { id: 'positive', from: 's:PLUS', to: 'p:Terminal 1', color: 'red' },
        { id: 'negative', from: 's:MINUS', to: 'p:Terminal 2', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const middle = simulateDc(project, emptyRuntime()).simulation
    expect(middle.converged).toBe(true)
    expect(middle.voltages?.['p:Wiper']).toBeCloseTo(5 - (2500.5 * 5 / 10_001), 8)
    project.parts[1].properties!.position = 1
    const end = simulateDc(project, emptyRuntime()).simulation
    expect(end.converged).toBe(true)
    expect(end.voltages?.['p:Wiper']).toBeCloseTo(0.5 * 5 / 10_001, 8)
  })

  it('mantém as chaves de um DIP de quatro/seis canais independentes', () => {
    for (const model of ['dip_switch_4', 'dip_switch_6'] as const) {
      const project: Project = {
        version: 1, id: model, name: 'DIP independente',
        parts: [
          { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
          { id: 'sw', kind: 'library', x: 0, y: 0, rotation: 0, label: 'DIP', properties: { simulationModel: model, Switch1: true } },
          { id: 'r1', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga 1', properties: { ohms: 100 } },
          { id: 'r2', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga 2', properties: { ohms: 100 } },
        ],
        wires: [
          { id: 'plus-1', from: 's:PLUS', to: 'sw:1A', color: 'red' },
          { id: 'load-1', from: 'sw:1B', to: 'r1:A', color: 'red' },
          { id: 'return-1', from: 'r1:B', to: 's:MINUS', color: 'black' },
          { id: 'plus-2', from: 's:PLUS', to: 'sw:2A', color: 'red' },
          { id: 'load-2', from: 'sw:2B', to: 'r2:A', color: 'red' },
          { id: 'return-2', from: 'r2:B', to: 's:MINUS', color: 'black' },
        ],
      }
      expect(supportsDcSimulation(project)).toBe(true)
      const result = simulateDc(project, emptyRuntime()).simulation
      expect(result.converged).toBe(true)
      expect(result.currents?.r1).toBeCloseTo(0.05, 8)
      expect(Math.abs(result.currents?.r2 ?? 0)).toBeLessThan(1e-8)
    }
  })

  it('abre e fecha simultaneamente os dois polos do DIP DPST', () => {
    const project: Project = {
      version: 1, id: 'dip-dpst', name: 'DIP DPST',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'sw', kind: 'library', x: 0, y: 0, rotation: 0, label: 'DIP DPST', properties: { simulationModel: 'dip_switch_spdt', Switch: false } },
        { id: 'r1', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga 1', properties: { ohms: 100 } },
        { id: 'r2', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga 2', properties: { ohms: 100 } },
      ],
      wires: [
        { id: 'plus-1', from: 's:PLUS', to: 'sw:1A', color: 'red' },
        { id: 'load-1', from: 'sw:1B', to: 'r1:A', color: 'red' },
        { id: 'return-1', from: 'r1:B', to: 's:MINUS', color: 'black' },
        { id: 'plus-2', from: 's:PLUS', to: 'sw:2A', color: 'red' },
        { id: 'load-2', from: 'sw:2B', to: 'r2:A', color: 'red' },
        { id: 'return-2', from: 'r2:B', to: 's:MINUS', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const open = simulateDc(project, emptyRuntime()).simulation
    expect(open.converged).toBe(true)
    expect(Math.abs(open.currents?.r1 ?? 0)).toBeLessThan(1e-8)
    project.parts[1].properties!.Switch = true
    const closed = simulateDc(project, emptyRuntime()).simulation
    expect(closed.converged).toBe(true)
    expect(closed.currents?.r1).toBeCloseTo(0.05, 8)
    expect(closed.currents?.r2).toBeCloseTo(0.05, 8)
  })

  it('desliga a bateria AA quando sua chave integrada está aberta', () => {
    const project = ledCircuit()
    project.parts[0] = { ...project.parts[0], kind: 'library', label: 'Bateria AA', properties: { simulationModel: 'AABattery', 'libraryProperty:built-in switch': 'yes', switchOn: false } }
    project.wires[0] = { ...project.wires[0], from: 's:Positive' }
    project.wires[2] = { ...project.wires[2], to: 's:Negative' }
    const result = simulateDc(project, emptyRuntime()).simulation
    expect(result.converged).toBe(true)
    expect(result.leds.d).toBe('0')
    expect(result.currents?.r).toBeCloseTo(0, 10)
  })

  it('simula a saída quadrada do gerador com resistência de 50 ohms sob carga', () => {
    const project: Project = {
      version: 1, id: 'function-generator-load', name: 'Gerador quadrado com carga',
      parts: [
        { id: 'gen', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Gerador', properties: { simulationModel: 'function_generator', frequency: 1, amplitude: 4, offset: 1, waveform: 'square' } },
        { id: 'load', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 50 } },
        { id: 'gnd', kind: 'gnd', x: 0, y: 0, rotation: 0, label: 'GND' },
      ],
      wires: [
        { id: 'signal', from: 'gen:OUT', to: 'load:A', color: 'green' },
        { id: 'return', from: 'load:B', to: 'gen:GND', color: 'black' },
        { id: 'reference', from: 'gen:GND', to: 'gnd:OUT', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    expect(functionGeneratorOutputResistanceOhms()).toBe(50)

    const high = simulateElectrical(project, emptyRuntime(), 0, 0).simulation
    expect(high.converged).toBe(true)
    expect(high.diagnostics).toEqual([])
    expect(high.voltages?.['gen:OUT']).toBeCloseTo(1.5, 10)
    expect(high.currents?.load).toBeCloseTo(0.03, 10)

    const low = simulateElectrical(project, emptyRuntime(), 0, 0.5).simulation
    expect(low.converged).toBe(true)
    expect(low.diagnostics).toEqual([])
    expect(low.voltages?.['gen:OUT']).toBeCloseTo(-0.5, 10)
    expect(low.currents?.load).toBeCloseTo(-0.01, 10)

    const runningLow = simulateElectrical(project, emptyRuntime(), 0.01, 0.5).simulation
    expect(runningLow.mode).toBe('transient')
    expect(runningLow.voltages?.['gen:OUT']).toBeCloseTo(-0.5, 10)
  })

  it('simula NPN e PNP com corrente real de base e polaridades extraídas', () => {
    const makeCircuit = (model: 'npn' | 'pnp', driven: boolean): Project => ({
      version: 1, id: `${model}-${driven}`, name: `${model} transistor`,
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 't', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Transistor', properties: { simulationModel: model } },
        { id: 'load', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 1000 } },
        { id: 'base', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Base', properties: { ohms: 10_000 } },
      ],
      wires: model === 'npn' ? [
        { id: 'collector-load', from: 's:Positive', to: 'load:A', color: 'red' },
        { id: 'collector', from: 'load:B', to: 't:Collector', color: 'green' },
        { id: 'emitter', from: 't:emitter', to: 's:Negative', color: 'black' },
        { id: 'base-drive', from: driven ? 's:Positive' : 's:Negative', to: 'base:A', color: 'red' },
        { id: 'base', from: 'base:B', to: 't:Base', color: 'green' },
      ] : [
        { id: 'emitter', from: 's:Positive', to: 't:Emitter', color: 'red' },
        { id: 'load', from: 't:Collector', to: 'load:A', color: 'green' },
        { id: 'load-return', from: 'load:B', to: 's:Negative', color: 'black' },
        { id: 'base-drive', from: 't:base', to: 'base:A', color: 'green' },
        { id: 'base-return', from: 'base:B', to: driven ? 's:Negative' : 's:Positive', color: 'black' },
      ],
    })
    const npnOnProject = makeCircuit('npn', true)
    expect(supportsDcSimulation(npnOnProject)).toBe(true)
    const npnOn = simulateDc(npnOnProject, emptyRuntime()).simulation
    const npnOff = simulateDc(makeCircuit('npn', false), emptyRuntime()).simulation
    const pnpOn = simulateDc(makeCircuit('pnp', true), emptyRuntime()).simulation
    expect(npnOn.converged, npnOn.diagnostics?.join('; ')).toBe(true)
    expect(npnOff.converged, npnOff.diagnostics?.join('; ')).toBe(true)
    expect(pnpOn.converged, pnpOn.diagnostics?.join('; ')).toBe(true)
    expect(npnOn.currents?.t).toBeGreaterThan(0.003)
    expect(npnOff.currents?.t).toBeCloseTo(2.71e-14, 12)
    expect(pnpOn.currents?.t).toBeLessThan(-0.003)
    expect(npnOn.currents?.['t:B']).toBeGreaterThan(0)
    expect(pnpOn.currents?.['t:B']).toBeLessThan(0)
  })

  it('simula nMOS ligado/desligado e pMOS de canal alto', () => {
    const makeNmos = (gateHigh: boolean, model = 'nmos'): Project => ({
      version: 1, id: `nmos-${gateHigh}-${model}`, name: 'nMOS com carga',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 't', kind: 'library', x: 0, y: 0, rotation: 0, label: 'nMOS', properties: { simulationModel: model } },
        { id: 'load', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 1000 } },
      ],
      wires: [
        { id: 'load-positive', from: 's:Positive', to: 'load:A', color: 'red' },
        { id: 'drain', from: 'load:B', to: 't:Drain', color: 'green' },
        { id: 'source', from: 't:source', to: 's:Negative', color: 'black' },
        { id: 'gate', from: gateHigh ? 's:Positive' : 's:Negative', to: 't:gate', color: 'blue' },
      ],
    })
    const nmosOnProject = makeNmos(true)
    expect(supportsDcSimulation(nmosOnProject)).toBe(true)
    const nmosOn = simulateDc(nmosOnProject, emptyRuntime()).simulation
    const nmosOff = simulateDc(makeNmos(false), emptyRuntime()).simulation
    const powerNmos = simulateDc(makeNmos(true, 'power_nmos'), emptyRuntime()).simulation
    expect(nmosOn.converged, nmosOn.diagnostics?.join('; ')).toBe(true)
    expect(nmosOff.converged, nmosOff.diagnostics?.join('; ')).toBe(true)
    expect(powerNmos.converged, powerNmos.diagnostics?.join('; ')).toBe(true)
    expect(nmosOn.currents?.load).toBeGreaterThan(0.004)
    expect(nmosOff.currents?.load).toBeLessThan(1e-8)
    expect(powerNmos.currents?.load).toBeGreaterThan(0.004)

    const pmos: Project = {
      ...makeNmos(false), id: 'pmos-high-side', name: 'pMOS com carga',
      parts: makeNmos(false).parts.map(part => part.id === 't' ? { ...part, properties: { simulationModel: 'power_pmos' } } : part),
      wires: [
        { id: 'source', from: 's:Positive', to: 't:Source', color: 'red' },
        { id: 'drain', from: 't:drain', to: 'load:A', color: 'green' },
        { id: 'load-return', from: 'load:B', to: 's:Negative', color: 'black' },
        { id: 'gate', from: 's:Negative', to: 't:Gate', color: 'blue' },
      ],
    }
    const pmosOn = simulateDc(pmos, emptyRuntime()).simulation
    expect(pmosOn.converged, pmosOn.diagnostics?.join('; ')).toBe(true)
    expect(pmosOn.currents?.load).toBeGreaterThan(0.004)
    expect(pmosOn.currents?.t).toBeLessThan(-0.004)
  })

  it('simula o TIP120 como o Darlington composto extraído', () => {
    const project: Project = {
      version: 1, id: 'tip120', name: 'TIP120',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 't', kind: 'library', x: 0, y: 0, rotation: 0, label: 'TIP120', properties: { simulationModel: 'tip120' } },
        { id: 'load', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 1000 } },
        { id: 'base', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Base', properties: { ohms: 10_000 } },
      ],
      wires: [
        { id: 'load-positive', from: 's:Positive', to: 'load:A', color: 'red' },
        { id: 'collector', from: 'load:B', to: 't:Collector', color: 'green' },
        { id: 'emitter', from: 't:emitter', to: 's:Negative', color: 'black' },
        { id: 'drive', from: 's:Positive', to: 'base:A', color: 'red' },
        { id: 'base', from: 'base:B', to: 't:Base', color: 'green' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const on = simulateDc(project, emptyRuntime()).simulation
    expect(on.converged, on.diagnostics?.join('; ')).toBe(true)
    expect(on.currents?.load).toBeGreaterThan(0.003)
    expect(on.currents?.t).toBeGreaterThan(0.003)
    expect(on.voltages?.['t:Emitter']).toBeCloseTo(0, 8)
    expect(on.voltages?.['t:Collector']).toBeLessThan(1)
  })

  it('regula LM7805 e LD1117 com carga e respeita o limite de corrente', () => {
    const makeRegulatorCircuit = (model: 'voltageRegulator5V' | 'voltageRegulator3p3V', inputVoltage: number, loadOhms: number): Project => ({
      version: 1, id: `${model}-${inputVoltage}-${loadOhms}`, name: 'Regulador com carga',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Entrada', properties: { voltage: inputVoltage } },
        { id: 'reg', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Regulador', properties: { simulationModel: model } },
        { id: 'load', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: loadOhms } },
      ],
      wires: [
        { id: 'input', from: 's:Positive', to: 'reg:In', color: 'red' },
        { id: 'ground-reg', from: 'reg:Ground', to: 's:Negative', color: 'black' },
        { id: 'ground-load', from: 'load:B', to: 's:Negative', color: 'black' },
        { id: 'output', from: 'reg:Out', to: 'load:A', color: 'green' },
      ],
    })
    const lm7805 = simulateDc(makeRegulatorCircuit('voltageRegulator5V', 12, 1000), emptyRuntime()).simulation
    const ld1117 = simulateDc(makeRegulatorCircuit('voltageRegulator3p3V', 5, 1000), emptyRuntime()).simulation
    const currentLimited = simulateDc(makeRegulatorCircuit('voltageRegulator5V', 12, 0.01), emptyRuntime()).simulation
    expect(supportsDcSimulation(makeRegulatorCircuit('voltageRegulator5V', 12, 1000))).toBe(true)
    expect(lm7805.converged, lm7805.diagnostics?.join('; ')).toBe(true)
    expect(ld1117.converged, ld1117.diagnostics?.join('; ')).toBe(true)
    expect(currentLimited.converged, currentLimited.diagnostics?.join('; ')).toBe(true)
    expect(lm7805.voltages?.['reg:Out']).toBeCloseTo(5, 3)
    expect(lm7805.currents?.load).toBeCloseTo(0.005, 3)
    expect(ld1117.voltages?.['reg:Out']).toBeCloseTo(3.3, 3)
    expect(currentLimited.currents?.reg).toBeCloseTo(1.5, 8)
    expect(currentLimited.currents?.load).toBeCloseTo(1.5, 8)
  })

  it('publica aviso de sobretensão no modelo do regulador sem gravar dano', () => {
    const project: Project = {
      version: 1, id: 'regulator-breakdown', name: 'Regulador acima da faixa',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Entrada', properties: { voltage: 40 } },
        { id: 'reg', kind: 'library', x: 0, y: 0, rotation: 0, label: 'LM7805', properties: { simulationModel: 'voltageRegulator5V' } },
      ],
      wires: [
        { id: 'input', from: 's:Positive', to: 'reg:In', color: 'red' },
        { id: 'ground', from: 's:Negative', to: 'reg:Ground', color: 'black' },
      ],
    }
    const result = simulateDc(project, emptyRuntime()).simulation
    expect(result.converged).toBe(true)
    expect(result.warnings?.some(warning => warning.includes('limites'))).toBe(true)
    expect(project.parts[1].properties?.breakdown).toBeUndefined()
  })

  it('simula o UA741 com ganho aberto, trilhos de alimentação e resistência de saída', () => {
    const project: Project = {
      version: 1, id: 'ua741', name: 'UA741 não inversor',
      parts: [
        { id: 'rails', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Trilhos', properties: { voltage: 15 } },
        { id: 'input', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Entrada', properties: { voltage: 5 } },
        { id: 'amp', kind: 'library', x: 0, y: 0, rotation: 0, label: 'UA741', properties: { simulationModel: 'opAmp_UA741' } },
        { id: 'load', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 1000 } },
      ],
      wires: [
        { id: 'positive-rail', from: 'rails:Positive', to: 'amp:Power+', color: 'red' },
        { id: 'negative-rail', from: 'rails:Negative', to: 'amp:Power-', color: 'black' },
        { id: 'input-positive', from: 'input:Positive', to: 'amp:In+', color: 'green' },
        { id: 'input-negative', from: 'input:Negative', to: 'amp:In-', color: 'black' },
        { id: 'load', from: 'amp:Out', to: 'load:A', color: 'blue' },
        { id: 'load-return', from: 'load:B', to: 'rails:Negative', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    const result = simulateDc(project, emptyRuntime()).simulation
    expect(result.converged, result.diagnostics?.join('; ')).toBe(true)
    expect(result.voltages?.['amp:Out']).toBeCloseTo(15 * 1000 / 1075, 5)
    expect(result.currents?.load).toBeGreaterThan(0.013)
    expect(result.currents?.amp).toBeGreaterThan(0.013)
    expect(result.powers?.amp).toBeGreaterThan(0)
  })

  it('comuta o relé SPDT após 3 ms e aplica os contatos de repouso e energizado', () => {
    const project: Project = {
      version: 1, id: 'relay-spdt', name: 'Relé SPDT',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'relay', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Relé SPDT', properties: { simulationModel: 'relay_spdt' } },
        { id: 'load1', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga R1', properties: { ohms: 1000 } },
        { id: 'load2', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga R2', properties: { ohms: 2000 } },
      ],
      wires: [
        { id: 'coil1', from: 's:Positive', to: 'relay:COIL1', color: 'red' },
        { id: 'coil2', from: 's:Negative', to: 'relay:COIL2', color: 'black' },
        { id: 'common', from: 's:Positive', to: 'relay:COM1', color: 'red' },
        { id: 'rest-load', from: 'relay:R2', to: 'load2:A', color: 'green' },
        { id: 'rest-return', from: 'load2:B', to: 's:Negative', color: 'black' },
        { id: 'energized-load', from: 'relay:R1', to: 'load1:A', color: 'blue' },
        { id: 'energized-return', from: 'load1:B', to: 's:Negative', color: 'black' },
      ],
    }
    expect(supportsDcSimulation(project)).toBe(true)
    let step = simulateElectrical(project, emptyRuntime(), 0.002, 0.002)
    expect(step.simulation.converged, step.simulation.diagnostics?.join('; ')).toBe(true)
    expect(step.simulation.mode).toBe('transient')
    expect(step.simulation.relayStates?.relay).toBeFalsy()
    expect(step.simulation.currents?.load2).toBeCloseTo(0.0025, 5)
    expect(step.simulation.currents?.load1).toBeLessThan(1e-8)

    step = simulateElectrical(project, step.runtime, 0.001, 0.003)
    expect(step.simulation.relayStates?.relay).toBe(true)
    step = simulateElectrical(project, step.runtime, 0.001, 0.004)
    expect(step.simulation.converged, step.simulation.diagnostics?.join('; ')).toBe(true)
    expect(step.simulation.currents?.load1).toBeCloseTo(0.005, 5)
    expect(step.simulation.currents?.load2).toBeLessThan(1e-8)
    expect(step.simulation.currents?.relay).toBeCloseTo(0.04, 8)
  })

  it('comuta os dois polos do relé DPDT no mesmo atraso', () => {
    const project: Project = {
      version: 1, id: 'relay-dpdt', name: 'Relé DPDT',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'relay', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Relé DPDT', properties: { simulationModel: 'relay_dpdt' } },
        ...['a1', 'a2', 'b1', 'b2'].map((id, index) => ({ id, kind: 'resistor' as const, x: 0, y: 0, rotation: 0, label: id, properties: { ohms: 1000 * (index + 1) } })),
      ],
      wires: [
        { id: 'coil1', from: 's:Positive', to: 'relay:COIL1', color: 'red' },
        { id: 'coil2', from: 's:Negative', to: 'relay:COIL2', color: 'black' },
        { id: 'coma', from: 's:Positive', to: 'relay:COMA', color: 'red' },
        { id: 'comb', from: 's:Positive', to: 'relay:COMB', color: 'red' },
        ...([['A1', 'a1'], ['A2', 'a2'], ['B1', 'b1'], ['B2', 'b2']] as const).flatMap(([terminal, load]) => [
          { id: `${load}-contact`, from: `relay:${terminal}`, to: `${load}:A`, color: 'green' },
          { id: `${load}-return`, from: `${load}:B`, to: 's:Negative', color: 'black' },
        ]),
      ],
    }
    const result = simulateElectrical(project, emptyRuntime(), 0.004, 0.004)
    expect(result.simulation.converged, result.simulation.diagnostics?.join('; ')).toBe(true)
    expect(result.simulation.relayStates?.relay).toBe(true)
    expect(result.simulation.currents?.a2).toBeGreaterThan(0.001)
    expect(result.simulation.currents?.b2).toBeGreaterThan(0.0005)
    expect(result.simulation.currents?.a1).toBeLessThan(1e-8)
    expect(result.simulation.currents?.b1).toBeLessThan(1e-8)
  })

  it('simula o fotodiodo em paralelo com diodo, resistor e fonte dependente de luz', () => {
    const makePhotodiode = (position: number): Project => ({
      version: 1, id: `photodiode-${position}`, name: 'Fotodiodo com corrente de polarização',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'photo', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Fotodiodo', properties: { simulationModel: 'photodiode_v2', position } },
        { id: 'load', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 1000 } },
      ],
      wires: [
        { id: 'bias', from: 's:Positive', to: 'load:A', color: 'red' },
        { id: 'anode', from: 'load:B', to: 'photo:Cathode', color: 'green' },
        { id: 'return', from: 'photo:Anode', to: 's:Negative', color: 'black' },
      ],
    })
    const darkProject = makePhotodiode(0)
    const dark = simulateDc(darkProject, emptyRuntime()).simulation
    const bright = simulateDc(makePhotodiode(1), emptyRuntime()).simulation
    expect(supportsDcSimulation(darkProject)).toBe(true)
    expect(dark.converged, dark.diagnostics?.join('; ')).toBe(true)
    expect(bright.converged, bright.diagnostics?.join('; ')).toBe(true)
    expect(bright.currents?.load).toBeGreaterThan(dark.currents?.load ?? 0)
    expect(Math.abs(bright.currents?.photo ?? 0)).toBeGreaterThan(Math.abs(dark.currents?.photo ?? 0))
  })

  it('simula o fototransistor com corrente de base gerada pela iluminação', () => {
    const makePhototransistor = (position: number): Project => ({
      version: 1, id: `phototransistor-${position}`, name: 'Fototransistor com carga',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
        { id: 'photo', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Fototransistor', properties: { simulationModel: 'phototransistor', position } },
        { id: 'load', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 1000 } },
      ],
      wires: [
        { id: 'bias', from: 's:Positive', to: 'load:A', color: 'red' },
        { id: 'collector', from: 'load:B', to: 'photo:Collector', color: 'green' },
        { id: 'emitter', from: 'photo:Emitter', to: 's:Negative', color: 'black' },
      ],
    })
    const darkProject = makePhototransistor(0)
    const dark = simulateDc(darkProject, emptyRuntime()).simulation
    const bright = simulateDc(makePhototransistor(1), emptyRuntime()).simulation
    expect(supportsDcSimulation(darkProject)).toBe(true)
    expect(dark.converged, dark.diagnostics?.join('; ')).toBe(true)
    expect(bright.converged, bright.diagnostics?.join('; ')).toBe(true)
    expect(bright.currents?.load).toBeGreaterThan(dark.currents?.load ?? 0)
  })

  it.each([
    ['lm393', 'input1_pos', 'input1_neg', 'output1'],
    ['lm339', 'input1_pos', 'input1_neg', 'output1'],
  ] as const)('simula o comparador %s com saída open-collector e pull-up externo', (model, inputPlusPin, inputMinusPin, outputPin) => {
    const makeComparator = (positiveInput: number, negativeInput: number): Project => ({
      version: 1, id: `${model}-${positiveInput}-${negativeInput}`, name: model,
      parts: [
        { id: 'rails', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Alimentação', properties: { voltage: 5 } },
        { id: 'vip', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Entrada +', properties: { voltage: positiveInput } },
        { id: 'vin', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Entrada -', properties: { voltage: negativeInput } },
        { id: 'cmp', kind: 'library', x: 0, y: 0, rotation: 0, label: model.toUpperCase(), properties: { simulationModel: model } },
        { id: 'pullup', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Pull-up', properties: { ohms: 10_000 } },
      ],
      wires: [
        { id: 'power', from: 'rails:Positive', to: 'cmp:vcc', color: 'red' },
        { id: 'ground-cmp', from: 'rails:Negative', to: 'cmp:gnd', color: 'black' },
        { id: 'input-plus', from: 'vip:Positive', to: `cmp:${inputPlusPin}`, color: 'green' },
        { id: 'vip-ground', from: 'vip:Negative', to: 'rails:Negative', color: 'black' },
        { id: 'input-minus', from: 'vin:Positive', to: `cmp:${inputMinusPin}`, color: 'blue' },
        { id: 'vin-ground', from: 'vin:Negative', to: 'rails:Negative', color: 'black' },
        { id: 'pullup-power', from: 'rails:Positive', to: 'pullup:A', color: 'red' },
        { id: 'pullup-output', from: 'pullup:B', to: `cmp:${outputPin}`, color: 'yellow' },
      ],
    })
    const high = simulateDc(makeComparator(3, 2), emptyRuntime()).simulation
    const low = simulateDc(makeComparator(2, 3), emptyRuntime()).simulation
    expect(supportsDcSimulation(makeComparator(3, 2))).toBe(true)
    expect(high.converged, high.diagnostics?.join('; ')).toBe(true)
    expect(low.converged, low.diagnostics?.join('; ')).toBe(true)
    expect(high.voltages?.[`cmp:${outputPin}`]).toBeGreaterThan(4.8)
    expect(low.voltages?.[`cmp:${outputPin}`]).toBeLessThan(0.5)
    expect(low.currents?.['cmp:OUT1']).toBeGreaterThan(0)
    expect(low.currents?.cmp).toBeGreaterThan(0)
  })

  it('simula a fonte USB, o limiar estrito de sobrecorrente, os pinos de dados e a saída sem carga', () => {
    const makeUsbCircuit = (resistance?: number, dataLoad = false): Project => ({
      version: 1, id: `usb-${resistance ?? 'open'}-${dataLoad}`, name: 'Fonte USB com carga',
      parts: [
        { id: 'usb', kind: 'library', x: 0, y: 0, rotation: 0, label: 'USB A', properties: { simulationModel: 'USBstandard' } },
        ...(resistance === undefined ? [] : [{ id: 'load', kind: 'resistor' as const, x: 0, y: 0, rotation: 0, label: 'Carga USB', properties: { ohms: resistance } }]),
        ...(dataLoad ? [{ id: 'data', kind: 'resistor' as const, x: 0, y: 0, rotation: 0, label: 'Carga de dados', properties: { ohms: 100 } }] : []),
      ],
      wires: [
        ...(resistance === undefined ? [] : [
          { id: 'usb-power', from: 'usb:5V', to: 'load:A', color: 'red' },
          { id: 'usb-return', from: 'load:B', to: 'usb:Ground', color: 'black' },
        ]),
        ...(dataLoad ? [
          { id: 'data-plus', from: 'usb:Data +', to: 'data:A', color: 'green' },
          { id: 'data-minus', from: 'data:B', to: 'usb:D-', color: 'blue' },
        ] : []),
      ],
    })
    const at100Ohms = makeUsbCircuit(100)
    const result100 = simulateDc(at100Ohms, emptyRuntime()).simulation
    expect(supportsDcSimulation(at100Ohms)).toBe(true)
    expect(result100.converged, result100.diagnostics?.join('; ')).toBe(true)
    expect(result100.currents?.usb).toBeCloseTo(5 / 100.001, 8)
    expect(result100.currents?.load).toBeCloseTo(5 / 100.001, 8)
    expect(result100.voltages?.['usb:5V']).toBeCloseTo(5 - 0.001 * (5 / 100.001), 8)
    expect(result100.usbBreakdown?.usb).toBe(false)
    expect(result100.warnings).toEqual([])

    const at10Ohms = simulateDc(makeUsbCircuit(10), emptyRuntime()).simulation
    expect(at10Ohms.converged, at10Ohms.diagnostics?.join('; ')).toBe(true)
    expect(at10Ohms.currents?.usb).toBeCloseTo(5 / 10.001, 8)
    expect(at10Ohms.currents?.usb).toBeLessThanOrEqual(0.5)
    expect(at10Ohms.usbBreakdown?.usb).toBe(false)
    expect(at10Ohms.warnings).toEqual([])

    const at9Ohms = simulateDc(makeUsbCircuit(9), emptyRuntime()).simulation
    expect(at9Ohms.converged, at9Ohms.diagnostics?.join('; ')).toBe(true)
    expect(at9Ohms.currents?.usb).toBeCloseTo(5 / 9.001, 8)
    expect(at9Ohms.currents?.usb).toBeGreaterThan(0.5)
    expect(at9Ohms.currents?.load).toBeCloseTo(at9Ohms.currents?.usb ?? 0, 8)
    expect(at9Ohms.usbBreakdown?.usb).toBe(true)
    expect(at9Ohms.warnings?.some(warning => warning.includes('acima do limite extraído de 0,5 A'))).toBe(true)

    const dataOnly = simulateDc(makeUsbCircuit(undefined, true), emptyRuntime()).simulation
    expect(dataOnly.converged, dataOnly.diagnostics?.join('; ')).toBe(true)
    expect(dataOnly.currents?.data).toBeCloseTo(0, 12)
    expect(dataOnly.voltages?.['usb:D+']).toBeCloseTo(dataOnly.voltages?.['usb:D-'] ?? 0, 12)

    const openProject = makeUsbCircuit()
    const open = simulateDc(openProject, emptyRuntime()).simulation
    expect(open.converged, open.diagnostics?.join('; ')).toBe(true)
    expect(open.currents?.usb).toBe(0)
    expect(open.voltages?.['usb:5V']).toBeCloseTo(5, 12)
    expect(open.usbBreakdown?.usb).toBe(false)
    expect(open.warnings).toEqual([])
  })

  it('simula os segmentos do display 7-seg em common anode/cathode e une os aliases common', () => {
    const makeCircuit = (common: 'anode' | 'cathode', segment = 'A', resistance = 220, voltage = 5, open = false): Project => {
      const physicalSegment = segment === 'dp' ? 'DP' : segment.toUpperCase()
      const activeWires = common === 'anode'
        ? [
            { id: 'common-feed', from: 'source:PLUS', to: 'display:com1', color: 'red' },
            { id: 'output', from: `display:${physicalSegment}`, to: 'resistor:A', color: 'green' },
            { id: 'return', from: 'resistor:B', to: 'source:MINUS', color: 'black' },
          ]
        : [
            { id: 'feed', from: 'source:PLUS', to: 'resistor:A', color: 'red' },
            { id: 'output', from: 'resistor:B', to: `display:${physicalSegment}`, color: 'green' },
            { id: 'common-return', from: 'display:com2', to: 'source:MINUS', color: 'black' },
          ]
      return {
        version: 1, id: `7seg-${common}-${segment}-${resistance}-${voltage}-${open}`, name: 'Display 7 segmentos',
        parts: [
          { id: 'source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage, internalResistance: 0 } },
          { id: 'display', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Display', properties: { simulationModel: 'seven_segment_digit_5011bh', common } },
          { id: 'resistor', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Rsegment', properties: { ohms: resistance } },
        ],
        wires: open ? [] : activeWires,
      }
    }

    const standardFive = simulateDc(ledCircuit(), emptyRuntime()).simulation
    const displayFive = simulateDc(makeCircuit('anode', 'A', 220, 5), emptyRuntime()).simulation
    expect(standardFive.converged, standardFive.diagnostics?.join('; ')).toBe(true)
    expect(displayFive.converged, displayFive.diagnostics?.join('; ')).toBe(true)
    expect(displayFive.sevenSegmentCurrents?.display.a).toBeGreaterThan(0)
    const anodeProject = makeCircuit('anode', 'A', 100, 1.8)
    expect(supportsDcSimulation(anodeProject)).toBe(true)
    const anode = simulateDc(anodeProject, emptyRuntime()).simulation
    expect(anode.converged, anode.diagnostics?.join('; ')).toBe(true)
    expect(anode.sevenSegmentCommonType?.display).toBe('anode')
    expect(anode.sevenSegmentCurrents?.display.a).toBeGreaterThan(0)
    expect(anode.sevenSegmentDisplayBrightness?.display.a).toBeGreaterThan(0)
    // DSU aliases replace each extracted active 1µΩ branch in the solver. Against
    // the explicit-resistor reference (1.710821370043 mA), the error is <15 pA;
    // two active drops stay below 40 nV even at the extracted 20 mA limit.
    expect(anode.sevenSegmentCurrents?.display.a).toBeCloseTo(0.001710821359119, 12)
    expect(2 * SEVEN_SEGMENT_MODEL.resistor.activeOhms * SEVEN_SEGMENT_MODEL.maximumCurrentA).toBeCloseTo(40e-9, 16)
    for (const segment of SEVEN_SEGMENT_MODEL.segments.filter(name => name !== 'a')) {
      expect(Math.abs(anode.sevenSegmentCurrents?.display[segment] ?? 0)).toBeLessThan(1e-10)
    }
    expect(anode.voltages?.['display:com1']).toBeCloseTo(1.8, 8)
    expect(anode.voltages?.['display:com2']).toBeCloseTo(1.8, 8)
    expect(anode.voltages?.['display:Common']).toBeCloseTo(1.8, 8)
    expect(anode.currents?.display).toBeCloseTo(anode.sevenSegmentCurrents?.display.a ?? 0, 8)
    expect(anode.warnings).toEqual([])

    const cathodeProject = makeCircuit('cathode', 'dp', 100, 1.8)
    const cathode = simulateDc(cathodeProject, emptyRuntime()).simulation
    expect(cathode.converged, cathode.diagnostics?.join('; ')).toBe(true)
    expect(cathode.sevenSegmentCommonType?.display).toBe('cathode')
    expect(cathode.sevenSegmentCurrents?.display.dp).toBeGreaterThan(0)
    expect(cathode.sevenSegmentDisplayBrightness?.display.dp).toBeGreaterThan(0)
    for (const segment of SEVEN_SEGMENT_MODEL.segments.filter(name => name !== 'dp')) {
      expect(Math.abs(cathode.sevenSegmentCurrents?.display[segment] ?? 0)).toBeLessThan(1e-10)
    }
    expect(cathode.voltages?.['display:com1']).toBeCloseTo(0, 8)
    expect(cathode.voltages?.['display:com2']).toBeCloseTo(0, 8)

    const diodeVoltageAtCurrent = (targetCurrent: number) =>
      SEVEN_SEGMENT_MODEL.diode.thermalVoltageReferenceAt25CV * SEVEN_SEGMENT_MODEL.diode.idealityFactor
      * Math.log1p(targetCurrent / SEVEN_SEGMENT_MODEL.diode.saturationCurrentA)
    const sourceVoltageForCurrent = (targetCurrent: number, seriesResistance: number) =>
      diodeVoltageAtCurrent(targetCurrent) + targetCurrent * seriesResistance
    const atLimitCurrent = 0.02
    const boundary = simulateDc(makeCircuit('anode', 'A', 100, sourceVoltageForCurrent(atLimitCurrent, 100)), emptyRuntime()).simulation
    expect(boundary.converged, boundary.diagnostics?.join('; ')).toBe(true)
    expect(boundary.sevenSegmentCurrents?.display.a).toBeCloseTo(atLimitCurrent, 6)
    expect(boundary.sevenSegmentBreakdown?.display.a).toBe(false)
    expect(boundary.warnings).toEqual([])

    const aboveLimitCurrent = 0.0205
    const overloaded = simulateDc(makeCircuit('cathode', 'DP', 100, sourceVoltageForCurrent(aboveLimitCurrent, 100)), emptyRuntime()).simulation
    expect(overloaded.converged, overloaded.diagnostics?.join('; ')).toBe(true)
    expect(overloaded.sevenSegmentCurrents?.display.dp).toBeGreaterThan(0.02)
    expect(overloaded.sevenSegmentBreakdown?.display.dp).toBe(true)
    expect(overloaded.sevenSegmentBreakdown?.display.a).toBe(false)
    expect(overloaded.warnings?.filter(warning => warning.includes('segmento dp') && warning.includes('limite extraído de 0,020 A'))).toHaveLength(1)

    const open = simulateDc(makeCircuit('anode', 'A', 220, 5, true), emptyRuntime()).simulation
    expect(open.converged, open.diagnostics?.join('; ')).toBe(true)
    expect(open.sevenSegmentCurrents?.display.a).toBeCloseTo(0, 10)
    expect(open.sevenSegmentDisplayBrightness?.display.a).toBe(0)
    expect(open.sevenSegmentBreakdown?.display.a).toBe(false)
    expect(open.warnings).toEqual([])
  })

  it('simula LED RGB por canal e respeita os pinouts físicos padrão e remapeado', () => {
    const makeRgbCircuit = (pinout: RgbLedPinoutName, options: { reverseColor?: RgbLedColor; resistances?: Partial<Record<RgbLedColor, number>>; voltage?: number } = {}): Project => {
      const mapping = RGB_LED_MODEL.pinouts[pinout]
      const terminalFor = (role: RgbLedColor | 'cathode') => Object.entries(mapping).find(([, mappedRole]) => mappedRole === role)![0] as RgbLedTerminal
      const pinName = (terminal: RgbLedTerminal) => RGB_LED_MODEL.terminals[terminal].breadboard
      const colors = options.reverseColor ? [options.reverseColor] : ['red', 'green', 'blue'] as const
      return {
        version: 1, id: `rgb-${pinout}-${options.reverseColor ?? 'forward'}`, name: 'LED RGB por canal',
        parts: [
          { id: 'source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: options.voltage ?? 5 } },
          { id: 'rgb', kind: 'library', x: 0, y: 0, rotation: 0, label: 'LED RGB', properties: { simulationModel: 'ledRGB', pinout } },
          ...colors.map(color => ({ id: `r-${color}`, kind: 'resistor' as const, x: 0, y: 0, rotation: 0, label: `R-${color}`, properties: { ohms: options.resistances?.[color] ?? ({ red: 220, green: 330, blue: 470 }[color]) } })),
        ],
        wires: options.reverseColor
          ? [
              { id: 'reverse-feed', from: 'source:PLUS', to: `r-${options.reverseColor}:A`, color: 'red' },
              { id: 'reverse-common', from: `r-${options.reverseColor}:B`, to: `rgb:${pinName(terminalFor('cathode'))}`, color: 'red' },
              { id: 'reverse-return', from: `rgb:${pinName(terminalFor(options.reverseColor))}`, to: 'source:MINUS', color: 'black' },
            ]
          : [
              ...colors.map(color => ({ id: `feed-${color}`, from: 'source:PLUS', to: `r-${color}:A`, color: 'red' })),
              ...colors.map(color => ({ id: `anode-${color}`, from: `r-${color}:B`, to: `rgb:${pinName(terminalFor(color))}`, color: 'green' })),
              { id: 'common-return', from: `rgb:${pinName(terminalFor('cathode'))}`, to: 'source:MINUS', color: 'black' },
            ],
      }
    }

    const standardProject = makeRgbCircuit('rcbg')
    const standard = simulateDc(standardProject, emptyRuntime()).simulation
    expect(supportsDcSimulation(standardProject)).toBe(true)
    expect(standard.converged, standard.diagnostics?.join('; ')).toBe(true)
    const standardChannels = standard.rgbLedCurrents?.rgb
    expect(standardChannels?.red).toBeGreaterThan(0)
    expect(standardChannels?.green).toBeGreaterThan(0)
    expect(standardChannels?.blue).toBeGreaterThan(0)
    expect(standardChannels?.red).toBeGreaterThan(standardChannels?.green ?? 0)
    expect(standardChannels?.green).toBeGreaterThan(standardChannels?.blue ?? 0)
    expect(standard.rgbLedBrightness?.rgb?.red).toBeCloseTo((standardChannels?.red ?? 0) / 0.02, 8)
    expect(standard.rgbLedBrightness?.rgb?.green).toBeCloseTo((standardChannels?.green ?? 0) / 0.02, 8)
    expect(standard.rgbLedBrightness?.rgb?.blue).toBeCloseTo((standardChannels?.blue ?? 0) / 0.02, 8)
    expect(standard.rgbLedDisplayBrightness?.rgb?.red).toBeGreaterThan(0)
    expect(standard.rgbLedDisplayBrightness?.rgb?.green).toBeGreaterThan(0)
    expect(standard.rgbLedDisplayBrightness?.rgb?.blue).toBeGreaterThan(0)
    expect(standard.rgbLedBreakdown?.rgb).toEqual({ red: false, green: false, blue: false })
    expect(standard.warnings).toEqual([])
    expect(standardChannels?.red).toBeCloseTo(standard.currents?.['r-red'] ?? 0, 7)
    expect(standardChannels?.green).toBeCloseTo(standard.currents?.['r-green'] ?? 0, 7)
    expect(standardChannels?.blue).toBeCloseTo(standard.currents?.['r-blue'] ?? 0, 7)
    expect(standard.currents?.['rgb:red']).toBeCloseTo(standardChannels?.red ?? 0, 8)
    expect(standard.currents?.['rgb:cathode']).toBeLessThan(1e-12)

    const remappedProject = makeRgbCircuit('brcg')
    const remapped = simulateDc(remappedProject, emptyRuntime()).simulation
    expect(remapped.converged, remapped.diagnostics?.join('; ')).toBe(true)
    expect(remapped.rgbLedCurrents?.rgb).toEqual(standardChannels)
    expect(remapped.rgbLedBrightness?.rgb).toEqual(standard.rgbLedBrightness?.rgb)
    expect(remapped.rgbLedDisplayBrightness?.rgb).toEqual(standard.rgbLedDisplayBrightness?.rgb)

    const overloadProject = makeRgbCircuit('rcbg', { voltage: 1.8, resistances: { red: 1, green: 330, blue: 470 } })
    const overloaded = simulateDc(overloadProject, emptyRuntime()).simulation
    expect(overloaded.converged, overloaded.diagnostics?.join('; ')).toBe(true)
    expect(overloaded.rgbLedCurrents?.rgb?.red).toBeGreaterThan(0.02)
    expect(overloaded.rgbLedCurrents?.rgb?.green).toBeGreaterThan(0)
    expect(overloaded.rgbLedCurrents?.rgb?.blue).toBeGreaterThan(0)
    expect(overloaded.rgbLedBreakdown?.rgb).toEqual({ red: true, green: false, blue: false })
    expect(overloaded.warnings?.filter(warning => warning.includes('limite extraído de 0.020 A'))).toHaveLength(1)
    expect(overloaded.rgbLedCurrents?.rgb?.red).toBeCloseTo(overloaded.currents?.['r-red'] ?? 0, 7)

    const tangentProject = makeRgbCircuit('rcbg', { resistances: { red: 5 } })
    const tangent = simulateDc(tangentProject, emptyRuntime()).simulation
    expect(tangent.converged, tangent.diagnostics?.join('; ')).toBe(true)
    expect(tangent.rgbLedCurrents?.rgb?.red).toBeGreaterThan(0.02)
    expect(tangent.rgbLedCurrents?.rgb?.red).toBeCloseTo(tangent.currents?.['r-red'] ?? 0, 7)

    const reverseProject = makeRgbCircuit('rcbg', { reverseColor: 'red' })
    const reverse = simulateDc(reverseProject, emptyRuntime()).simulation
    expect(reverse.converged, reverse.diagnostics?.join('; ')).toBe(true)
    expect(reverse.rgbLedCurrents?.rgb?.red).toBeLessThan(0)
    expect(reverse.rgbLedBreakdown?.rgb).toEqual({ red: false, green: false, blue: false })
    expect(reverse.rgbLedDisplayBrightness?.rgb?.red).toBe(0)
    expect(reverse.rgbLedBrightness?.rgb?.red).toBeLessThan(0)
    expect(reverse.warnings).toEqual([])
  })

  it('integra keypad 4x4 com estado pressionado transitório, aliases físicos e rejeição de múltiplas teclas', () => {
    const keypadCircuit = (extraProperties: Record<string, string | number | boolean> = {}): Project => ({
      version: 1, id: 'keypad-4x4', name: 'Teclado matricial 4x4',
      parts: [
        { id: 'source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'resistor', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 1000 } },
        { id: 'keypad', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Keypad', properties: { simulationModel: 'keypad_4x4', ...extraProperties } },
      ],
      wires: [
        { id: 'feed', from: 'source:PLUS', to: 'resistor:A', color: 'red' },
        { id: 'row-alias', from: 'resistor:B', to: 'keypad:Row 2', color: 'green' },
        { id: 'column-alias', from: 'keypad:Column 3', to: 'source:MINUS', color: 'black' },
      ],
    })

    const project = keypadCircuit()
    expect(supportsDcSimulation(project)).toBe(true)

    const open = simulateDc(project, emptyRuntime()).simulation
    expect(open.converged, open.diagnostics?.join('; ')).toBe(true)
    expect(open.currents?.resistor ?? 0).toBeLessThan(1e-9)
    expect(open.keypadPushed?.keypad).toBeNull()
    expect(open.voltages?.['keypad:row2']).toBeCloseTo(open.voltages?.['resistor:B'] ?? NaN, 10)
    expect(open.voltages?.['keypad:column3']).toBeCloseTo(open.voltages?.['source:MINUS'] ?? NaN, 10)

    const pressedRuntime = { ...emptyRuntime(), keypadPushed: { keypad: '23' } }
    const pressed = simulateDc(project, pressedRuntime).simulation
    expect(pressed.converged, pressed.diagnostics?.join('; ')).toBe(true)
    expect(pressed.keypadPushed?.keypad).toBe('23')
    expect(pressed.currents?.resistor).toBeCloseTo(5 / 1000.002, 8)
    expect(pressed.currents?.resistor).toBeGreaterThan(0.0049)
    expect(pressed.voltages?.['keypad:row2']).toBeGreaterThan(pressed.voltages?.['keypad:column3'] ?? Infinity)

    const released = simulateDc(project, { ...pressedRuntime, keypadPushed: { keypad: null } }).simulation
    expect(released.converged, released.diagnostics?.join('; ')).toBe(true)
    expect(released.keypadPushed?.keypad).toBeNull()
    expect(released.currents?.resistor ?? 0).toBeLessThan(1e-9)

    const multiple = simulateDc(keypadCircuit({ pushed: '1234' }), emptyRuntime()).simulation
    expect(multiple.converged).toBe(false)
    expect(multiple.diagnostics?.some(diagnostic => diagnostic.includes('uma única tecla'))).toBe(true)
  })

  it('simula sensor IR por resistor-network, aliases de terminais e entrada detectada de runtime', () => {
    const irCircuit = (voltage = 5, connected = true): Project => ({
      version: 1, id: `ir-${voltage}-${connected}`, name: 'Sensor IR TSOP41',
      parts: [
        { id: 'source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage, internalResistance: 0 } },
        { id: 'ir', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Sensor IR', properties: { simulationModel: 'IRsensor' } },
      ],
      wires: connected ? [
        { id: 'vcc', from: 'source:PLUS', to: 'ir:Power', color: 'red' },
        { id: 'ground', from: 'source:MINUS', to: 'ir:GND', color: 'black' },
      ] : [],
    })

    const darkProject = irCircuit()
    expect(supportsDcSimulation(darkProject)).toBe(true)
    const dark = simulateDc(darkProject, emptyRuntime()).simulation
    expect(dark.converged, dark.diagnostics?.join('; ')).toBe(true)
    expect(dark.irSensorDetected?.ir).toBe(false)
    expect(dark.irSensorOutputResistance?.ir).toBe(1e8)
    expect(dark.irSensorSupplyVoltage?.ir).toBeCloseTo(5, 10)
    expect(dark.irSensorBreakdown?.ir).toBe(false)
    expect(dark.voltages?.['ir:Power']).toBeCloseTo(5, 10)
    expect(dark.voltages?.['ir:Vcc']).toBeCloseTo(5, 10)
    expect(dark.voltages?.['ir:GND']).toBeCloseTo(dark.voltages?.['ir:Gnd'] ?? NaN, 12)
    expect(dark.voltages?.['ir:Out']).toBeCloseTo(4.9987503124, 9)
    expect(dark.currents?.ir).toBeCloseTo(5 / 3300 + 5 / (25000 + 1e8), 14)
    expect(dark.warnings).toEqual([])

    const detected = simulateDc(darkProject, { ...emptyRuntime(), irDetected: { ir: true } }).simulation
    expect(detected.converged, detected.diagnostics?.join('; ')).toBe(true)
    expect(detected.irSensorDetected?.ir).toBe(true)
    expect(detected.irSensorOutputResistance?.ir).toBe(250)
    expect(detected.voltages?.['ir:Out']).toBeCloseTo(0.0495049505, 9)
    expect(detected.voltages?.['ir:Output']).toBeCloseTo(detected.voltages?.['ir:Out'] ?? NaN, 12)

    const open = simulateDc(irCircuit(5, false), emptyRuntime()).simulation
    expect(open.converged, open.diagnostics?.join('; ')).toBe(true)
    expect(open.currents?.ir ?? 0).toBeCloseTo(0, 12)
    expect(open.irSensorDetected?.ir).toBe(false)
    expect(open.warnings).toEqual([])
  })

  it('avisa o sensor IR somente fora dos limites estritos de alimentação extraídos', () => {
    const powered = (voltage: number): Project => ({
      version: 1, id: `ir-limits-${voltage}`, name: 'Limites do sensor IR',
      parts: [
        { id: 'source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage, internalResistance: 0 } },
        { id: 'ir', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Sensor IR', properties: { simulationModel: 'IRsensor' } },
      ],
      wires: [
        { id: 'vcc', from: 'source:PLUS', to: 'ir:Vcc', color: 'red' },
        { id: 'ground', from: 'source:MINUS', to: 'ir:Gnd', color: 'black' },
      ],
    })

    for (const voltage of [-0.3, 6]) {
      const result = simulateDc(powered(voltage), emptyRuntime()).simulation
      expect(result.converged, result.diagnostics?.join('; ')).toBe(true)
      expect(result.irSensorBreakdown?.ir).toBe(false)
      expect(result.warnings).toEqual([])
    }
    for (const voltage of [-0.301, 6.001]) {
      const result = simulateDc(powered(voltage), emptyRuntime()).simulation
      expect(result.converged, result.diagnostics?.join('; ')).toBe(true)
      expect(result.irSensorBreakdown?.ir).toBe(true)
      expect(result.warnings?.some(warning => warning.includes('fora da faixa extraída'))).toBe(true)
    }
  })

  it('integra sensor_gas com nível runtime, heater de 26 Ω, corrente de sinal final e aliases', () => {
    const gasCircuit = (): Project => ({
      version: 1, id: 'gas-sensor', name: 'Sensor de gás',
      parts: [
        { id: 'heater-source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte do heater', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'signal-source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte de sinal', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'gas', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Sensor de gás', properties: { simulationModel: 'sensor_gas' } },
      ],
      wires: [
        { id: 'heater-positive', from: 'heater-source:PLUS', to: 'gas:H1', color: 'red' },
        { id: 'heater-negative', from: 'heater-source:MINUS', to: 'gas:H2', color: 'black' },
        { id: 'signal-positive', from: 'signal-source:PLUS', to: 'gas:A2', color: 'red' },
        { id: 'signal-negative', from: 'signal-source:MINUS', to: 'gas:B2', color: 'black' },
      ],
    })

    const project = gasCircuit()
    expect(supportsDcSimulation(project)).toBe(true)
    const defaultLevel = simulateDc(project, emptyRuntime()).simulation
    expect(defaultLevel.converged, defaultLevel.diagnostics?.join('; ')).toBe(true)
    expect(defaultLevel.gasSensorLevel?.gas).toBeCloseTo(0.2, 12)
    expect(defaultLevel.gasSensorHeaterVoltage?.gas).toBeCloseTo(5, 10)
    expect(defaultLevel.voltages?.['gas:H1']! - defaultLevel.voltages?.['gas:H2']!).toBeCloseTo(5, 10)
    expect(defaultLevel.gasSensorHeaterCurrent?.gas).toBeCloseTo(5 / 26, 12)
    expect(defaultLevel.gasSensorSignalResistance?.gas).toBeCloseTo(9130, 10)
    expect(defaultLevel.gasSensorSignalCurrent?.gas).toBeCloseTo(5 / 9130, 12)
    expect(defaultLevel.currents?.gas).toBeCloseTo(5 / 9130, 12)
    expect(defaultLevel.voltages?.['gas:A1']).toBeCloseTo(defaultLevel.voltages?.['gas:A2'] ?? NaN, 12)
    expect(defaultLevel.voltages?.['gas:B1']).toBeCloseTo(defaultLevel.voltages?.['gas:B2'] ?? NaN, 12)

    const fullLevel = simulateDc(project, { ...emptyRuntime(), gasSensorLevel: { gas: 1 } }).simulation
    expect(fullLevel.converged, fullLevel.diagnostics?.join('; ')).toBe(true)
    expect(fullLevel.gasSensorLevel?.gas).toBe(1)
    expect(fullLevel.gasSensorSignalResistance?.gas).toBeCloseTo(1650, 10)
    expect(fullLevel.gasSensorSignalCurrent?.gas).toBeCloseTo(5 / 1650, 12)
  })

  it('aplica limites do sensor_gas estritamente à magnitude assinada do heater', () => {
    const atHeaterVoltage = (heaterVoltage: number) => {
      const project: Project = {
        version: 1, id: 'gas-bound-' + heaterVoltage, name: 'Limite do heater',
        parts: [
          { id: 'heater-source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte do heater', properties: { voltage: heaterVoltage, internalResistance: 0 } },
          { id: 'signal-source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte de sinal', properties: { voltage: 5, internalResistance: 0 } },
          { id: 'gas', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Sensor de gás', properties: { simulationModel: 'sensor_gas' } },
        ],
        wires: [
          { id: 'heater-positive', from: 'heater-source:PLUS', to: 'gas:H1', color: 'red' },
          { id: 'heater-negative', from: 'heater-source:MINUS', to: 'gas:H2', color: 'black' },
          { id: 'signal-positive', from: 'signal-source:PLUS', to: 'gas:A1', color: 'red' },
          { id: 'signal-negative', from: 'signal-source:MINUS', to: 'gas:B1', color: 'black' },
        ],
      }
      return simulateDc(project, { ...emptyRuntime(), gasSensorLevel: { gas: 1 } }).simulation
    }

    for (const voltage of [3.99, 4]) {
      const result = atHeaterVoltage(voltage)
      expect(result.converged, result.diagnostics?.join('; ')).toBe(true)
      expect(result.gasSensorSignalResistance?.gas).toBe(11_000)
      expect(result.gasSensorBreakdown?.gas).toBe(false)
      expect(result.warnings).toEqual([])
    }
    const five = atHeaterVoltage(5)
    expect(five.gasSensorSignalResistance?.gas).toBeCloseTo(1650, 10)
    const limit = atHeaterVoltage(5.1)
    expect(limit.gasSensorSignalResistance?.gas).toBeCloseTo(715, 10)
    expect(limit.gasSensorBreakdown?.gas).toBe(false)
    expect(limit.warnings).toEqual([])
    const above = atHeaterVoltage(5.1001)
    expect(above.converged).toBe(true)
    expect(above.gasSensorSignalResistance?.gas).toBeCloseTo(715, 10)
    expect(above.gasSensorBreakdown?.gas).toBe(true)
    expect(above.warnings?.some(warning => warning.includes('5,1 V'))).toBe(true)
    const reverseLimit = atHeaterVoltage(-5.1)
    expect(reverseLimit.gasSensorBreakdown?.gas).toBe(false)
    const reverseAbove = atHeaterVoltage(-5.1001)
    expect(reverseAbove.gasSensorBreakdown?.gas).toBe(true)
    expect(reverseAbove.gasSensorSignalResistance?.gas).toBeCloseTo(715, 10)
  })

  it('executa uma só atualização transitória de capacitor e relé durante as tentativas do ponto fixo', () => {
    const coupledProject = (withGas: boolean): Project => ({
      version: 1, id: 'gas-dynamic-' + withGas, name: 'Estado dinâmico com sensor de gás',
      parts: [
        { id: 'rc-source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte RC', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'rc-resistor', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R RC', properties: { ohms: 1000 } },
        { id: 'capacitor', kind: 'library', x: 0, y: 0, rotation: 0, label: 'C RC', properties: { simulationModel: 'capacitor', capacitance: 0.001 } },
        { id: 'heater-source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte do heater', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'relay', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Relé SPDT', properties: { simulationModel: 'relay_spdt' } },
        ...(withGas ? [
          { id: 'signal-source', kind: 'supply' as const, x: 0, y: 0, rotation: 0, label: 'Fonte de sinal', properties: { voltage: 5, internalResistance: 0 } },
          { id: 'gas', kind: 'library' as const, x: 0, y: 0, rotation: 0, label: 'Sensor de gás', properties: { simulationModel: 'sensor_gas' } },
        ] : []),
      ],
      wires: [
        { id: 'rc-feed', from: 'rc-source:PLUS', to: 'rc-resistor:A', color: 'red' },
        { id: 'rc-node', from: 'rc-resistor:B', to: 'capacitor:Terminal 1', color: 'green' },
        { id: 'rc-return', from: 'capacitor:Terminal 2', to: 'rc-source:MINUS', color: 'black' },
        { id: 'relay-coil1', from: 'heater-source:PLUS', to: 'relay:COIL1', color: 'red' },
        { id: 'relay-coil2', from: 'heater-source:MINUS', to: 'relay:COIL2', color: 'black' },
        ...(withGas ? [
          { id: 'gas-heater1', from: 'heater-source:PLUS', to: 'gas:H1', color: 'red' },
          { id: 'gas-heater2', from: 'heater-source:MINUS', to: 'gas:H2', color: 'black' },
          { id: 'gas-signal1', from: 'signal-source:PLUS', to: 'gas:A1', color: 'red' },
          { id: 'gas-signal2', from: 'signal-source:MINUS', to: 'gas:B1', color: 'black' },
        ] : []),
      ],
    })

    const reference = simulateElectrical(coupledProject(false), emptyRuntime(), 0.001, 0.001)
    const withOuterSolve = simulateElectrical(coupledProject(true), emptyRuntime(), 0.001, 0.001)
    expect(reference.simulation.converged).toBe(true)
    expect(withOuterSolve.simulation.converged, withOuterSolve.simulation.diagnostics?.join('; ')).toBe(true)
    expect(withOuterSolve.runtime.capacitorVoltages?.capacitor).toBeCloseTo(reference.runtime.capacitorVoltages?.capacitor ?? NaN, 12)
    expect(withOuterSolve.runtime.relayActuationSeconds?.relay).toBeCloseTo(0.001, 12)
    expect(withOuterSolve.runtime.relayStates?.relay ?? false).toBe(false)
  })

  it('integra sensor_pir com alimentação, aliases, alvo runtime, pulso e estado isolado por sensor', () => {
    const pirCircuit = (voltage = 5, secondPir = false): Project => ({
      version: 1, id: `pir-${voltage}-${secondPir}`, name: 'Sensor PIR',
      parts: [
        { id: 'source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage, internalResistance: 0 } },
        { id: 'pirA', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PIR A', properties: { simulationModel: 'sensor_pir' } },
        { id: 'loadA', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga A', properties: { ohms: 10_000 } },
        ...(secondPir ? [
          { id: 'pirB', kind: 'library' as const, x: 0, y: 0, rotation: 0, label: 'PIR B', properties: { simulationModel: 'sensor_pir' } },
          { id: 'loadB', kind: 'resistor' as const, x: 0, y: 0, rotation: 0, label: 'Carga B', properties: { ohms: 10_000 } },
        ] : []),
      ],
      wires: [
        { id: 'vccA', from: 'source:PLUS', to: 'pirA:Power', color: 'red' },
        { id: 'gndA', from: 'pirA:Ground', to: 'source:MINUS', color: 'black' },
        { id: 'signalA', from: 'pirA:Signal', to: 'loadA:A', color: 'green' },
        { id: 'returnA', from: 'loadA:B', to: 'source:MINUS', color: 'black' },
        ...(secondPir ? [
          { id: 'vccB', from: 'source:PLUS', to: 'pirB:vcc', color: 'red' },
          { id: 'gndB', from: 'pirB:gnd', to: 'source:MINUS', color: 'black' },
          { id: 'signalB', from: 'pirB:out', to: 'loadB:A', color: 'green' },
          { id: 'returnB', from: 'loadB:B', to: 'source:MINUS', color: 'black' },
        ] : []),
      ],
    })

    const project = pirCircuit(5, true)
    expect(supportsDcSimulation(project)).toBe(true)
    const first = simulateDc(project, { ...emptyRuntime(), pirTargetPositions: { pirB: { x: 0, y: -500 } } })
    expect(first.simulation.converged, first.simulation.diagnostics?.join('; ')).toBe(true)
    expect(first.runtime.pirInRange).toMatchObject({ pirA: true, pirB: false })
    expect(first.runtime.pirDrivePulses).toMatchObject({ pirA: 1, pirB: 0 })
    expect(first.simulation.pirSensorOutputDriven).toMatchObject({ pirA: true, pirB: false })
    expect(first.simulation.pirSensorPullupResistance?.pirA).toBe(100)
    expect(first.simulation.pirSensorPullupResistance?.pirB).toBe(1e10)
    expect(first.simulation.pirSensorOutputVoltage?.pirA).toBeGreaterThan(2)
    expect(first.simulation.pirSensorOutputVoltage?.pirB).toBeLessThan(1e-5)
    expect(first.simulation.voltages?.['pirA:Power']).toBeCloseTo(first.simulation.voltages?.['pirA:vcc'] ?? NaN, 12)
    expect(first.simulation.voltages?.['pirA:Ground']).toBeCloseTo(first.simulation.voltages?.['pirA:gnd'] ?? NaN, 12)
    expect(first.simulation.voltages?.['pirA:Signal']).toBeCloseTo(first.simulation.voltages?.['pirA:out'] ?? NaN, 12)

    const stopped = resetPIRSensorRuntimeEdges(first.runtime)
    expect(stopped.pirTargetPositions?.pirA).toEqual({ x: 0, y: -200 })
    expect(stopped.pirInRange).toEqual({})
    expect(stopped.pirDrivePulses).toEqual({})
    const restarted = simulateDc(pirCircuit(), stopped)
    expect(restarted.simulation.pirSensorDriveActive?.pirA).toBe(true)
    expect(restarted.runtime.pirDrivePulses?.pirA).toBe(1)

    const targetMoved = simulateDc(project, {
      ...first.runtime,
      pirDrivePulses: { pirA: 0, pirB: 0 },
      pirTargetPositions: { pirA: { x: 0, y: -200 }, pirB: { x: 0, y: -200 } },
      pirInRange: { pirA: true, pirB: false },
    })
    expect(targetMoved.runtime.pirDrivePulses).toMatchObject({ pirA: 0, pirB: 1 })
    expect(targetMoved.simulation.pirSensorDriveActive).toMatchObject({ pirA: false, pirB: true })
    expect(targetMoved.simulation.pirSensorOutputTriggered?.pirB).toBe(true)
    const nextTick = simulateDc(project, { ...targetMoved.runtime, pirDrivePulses: { pirA: 0, pirB: 0 } })
    expect(nextTick.runtime.pirDrivePulses).toMatchObject({ pirA: 0, pirB: 0 })
    expect(nextTick.simulation.pirSensorOutputDriven).toMatchObject({ pirA: false, pirB: false })

    for (const voltage of [3, 6]) {
      const boundary = simulateDc(pirCircuit(voltage), emptyRuntime()).simulation
      expect(boundary.pirSensorPowered?.pirA).toBe(true)
      expect(boundary.pirSensorOutputDriven?.pirA).toBe(true)
    }
    for (const voltage of [2.999, 6.001]) {
      const outside = simulateDc(pirCircuit(voltage), emptyRuntime()).simulation
      expect(outside.converged, outside.diagnostics?.join('; ')).toBe(true)
      expect(outside.pirSensorPowered?.pirA).toBe(false)
      expect(outside.pirSensorOutputDriven?.pirA).toBe(false)
      expect(outside.pirSensorPullupResistance?.pirA).toBe(1e10)
    }
  })

  it('simula piezoSound como ramo de 600 Ω com leituras, aliases e breakdown orientado', () => {
    const piezoCircuit = (voltage: number, loaded = false, open = false): Project => ({
      version: 1, id: `piezo-${voltage}-${loaded}-${open}`, name: 'Piezo 600 Ω',
      parts: [
        { id: 'source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage, internalResistance: 0 } },
        ...(loaded ? [{ id: 'load', kind: 'resistor' as const, x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 600 } }] : []),
        { id: 'piezo', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Piezo', properties: { simulationModel: 'piezoSound' } },
      ],
      wires: open ? [] : loaded ? [
        { id: 'feed', from: 'source:PLUS', to: 'load:A', color: 'red' },
        { id: 'load-piezo', from: 'load:B', to: 'piezo:Positive', color: 'green' },
        { id: 'return', from: 'piezo:-', to: 'source:MINUS', color: 'black' },
      ] : [
        { id: 'feed', from: 'source:PLUS', to: 'piezo:Positive', color: 'red' },
        { id: 'return', from: 'piezo:-', to: 'source:MINUS', color: 'black' },
      ],
    })

    const loadedProject = piezoCircuit(30, true)
    expect(supportsDcSimulation(loadedProject)).toBe(true)
    const loaded = simulateDc(loadedProject, emptyRuntime()).simulation
    expect(loaded.converged, loaded.diagnostics?.join('; ')).toBe(true)
    expect(loaded.voltages?.['piezo:+']).toBeCloseTo(loaded.voltages?.['piezo:Positive'] ?? NaN, 12)
    expect(loaded.voltages?.['piezo:-']).toBeCloseTo(loaded.voltages?.['piezo:Negative'] ?? NaN, 12)
    expect(loaded.voltages?.['piezo:Positive']! - loaded.voltages?.['piezo:Negative']!).toBeCloseTo(15, 10)
    expect(loaded.currents?.piezo).toBeCloseTo(15 / 600, 10)
    expect(loaded.currents?.load).toBeCloseTo(15 / 600, 10)
    expect(loaded.powers?.piezo).toBeCloseTo(15 * (15 / 600), 10)
    expect(loaded.piezoVoltageIndicator?.piezo).toBeCloseTo(0.6, 10)
    expect(loaded.piezoBreakdown?.piezo).toBe(false)
    expect(loaded.warnings).toEqual([])

    const exactLimit = simulateDc(piezoCircuit(25), emptyRuntime()).simulation
    expect(exactLimit.currents?.piezo).toBeCloseTo(25 / 600, 10)
    expect(exactLimit.piezoBreakdown?.piezo).toBe(false)
    expect(exactLimit.warnings).toEqual([])

    const aboveLimit = simulateDc(piezoCircuit(25.001), emptyRuntime()).simulation
    expect(aboveLimit.converged, aboveLimit.diagnostics?.join('; ')).toBe(true)
    expect(aboveLimit.currents?.piezo).toBeCloseTo(25.001 / 600, 10)
    expect(aboveLimit.piezoBreakdown?.piezo).toBe(true)
    expect(aboveLimit.warnings?.some(warning => warning.includes('acima do limite estrito extraído de 25 V'))).toBe(true)

    const reversed = simulateDc(piezoCircuit(-25.001), emptyRuntime()).simulation
    expect(reversed.currents?.piezo).toBeCloseTo(-25.001 / 600, 10)
    expect(reversed.piezoBreakdown?.piezo).toBe(false)
    expect(reversed.warnings).toEqual([])

    const open = simulateDc(piezoCircuit(25, false, true), emptyRuntime()).simulation
    expect(open.converged, open.diagnostics?.join('; ')).toBe(true)
    expect(open.currents?.piezo).toBeCloseTo(0, 12)
    expect(open.piezoVoltageIndicator?.piezo).toBeCloseTo(0, 12)
  })

  it('integra Timer555 DIP8, divisor interno, Reset, Trigger e prioridade do Threshold', () => {
    const timerCircuit = (resetLow = false, thresholdHigh = false): Project => ({
      version: 1, id: `timer555-${resetLow}-${thresholdHigh}`, name: 'Timer555 DIP8',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5, internalResistance: 0 } },
        { id: 't', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Timer 555', properties: { simulationModel: 'Timer555' } },
      ],
      wires: [
        { id: 'vcc', from: 's:PLUS', to: 't:8', color: 'red' },
        { id: 'ground', from: 't:1', to: 's:MINUS', color: 'black' },
        { id: 'reset', from: resetLow ? 't:Reset' : 't:4', to: resetLow ? 's:MINUS' : 's:PLUS', color: 'red' },
        { id: 'trigger-low', from: 't:2', to: 's:MINUS', color: 'black' },
        ...(thresholdHigh ? [
          { id: 'threshold-high', from: 't:6', to: 's:PLUS', color: 'red' },
          { id: 'control-low', from: 't:5', to: 's:MINUS', color: 'black' },
        ] : []),
      ],
    })

    const normalProject = timerCircuit()
    expect(supportsDcSimulation(normalProject)).toBe(true)
    const initial = initialRuntime(normalProject)
    expect(initial.timer555Latch?.t).toBe(true)
    const normal = simulateDc(normalProject, initial).simulation
    expect(normal.converged, normal.diagnostics?.join('; ')).toBe(true)
    expect(normal.timer555LatchHigh?.t).toBe(true)
    expect(normal.timer555OutputVoltage?.t).toBeCloseTo(5, 5)
    expect(normal.timer555ReferenceVoltage?.t).toBeCloseTo(5 / 3, 6)
    expect(normal.voltages?.['t:Control Voltage']).toBeCloseTo(10 / 3, 6)
    expect(normal.voltages?.['t:CTRL']).toBeCloseTo(normal.voltages?.['t:5'] ?? NaN, 12)
    expect(normal.voltages?.['t:Power']).toBeCloseTo(normal.voltages?.['t:Vcc'] ?? NaN, 12)

    const resetProject = timerCircuit(true)
    const resetQueued = simulateElectrical(resetProject, initialRuntime(resetProject), 0)
    expect(resetQueued.runtime.timer555Latch?.t).toBe(true)
    expect(resetQueued.runtime.timer555PendingLatch?.t).toBe(false)
    const loadedResetProject: Project = {
      ...resetProject,
      parts: [
        ...resetProject.parts,
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga', properties: { ohms: 1000 } },
        { id: 'c', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Capacitor de saída', properties: { simulationModel: 'capacitor', capacitance: 1e-6 } },
      ],
      wires: [
        ...resetProject.wires,
        { id: 'out-load', from: 't:3', to: 'r:A', color: 'red' },
        { id: 'load-cap', from: 'r:B', to: 'c:Terminal 1', color: 'green' },
        { id: 'cap-ground', from: 'c:Terminal 2', to: 's:MINUS', color: 'black' },
      ],
    }
    const timedReset = simulateElectrical(loadedResetProject, { ...resetQueued.runtime, capacitorVoltages: { c: 5 } }, 1e-3, 1e-3, 1e-3)
    expect(timedReset.simulation.converged, timedReset.simulation.diagnostics?.join('; ')).toBe(true)
    expect(timedReset.runtime.timer555Latch?.t).toBe(false)
    expect(timedReset.runtime.capacitorVoltages?.c).toBeGreaterThan(2.5)
    expect(timedReset.runtime.capacitorVoltages?.c).toBeLessThan(4)

    const resetApplied = simulateElectrical(resetProject, resetQueued.runtime, 1e-6, 1e-6)
    expect(resetApplied.simulation.converged, resetApplied.simulation.diagnostics?.join('; ')).toBe(true)
    expect(resetApplied.runtime.timer555Latch?.t).toBe(false)
    const resetReadback = simulateDc(resetProject, resetApplied.runtime).simulation
    expect(resetReadback.timer555LatchHigh?.t).toBe(false)
    expect(resetReadback.timer555OutputVoltage?.t).toBeLessThan(1e-5)
    expect(resetReadback.timer555DischargeVoltage?.t).toBeLessThan(0.2)

    const releasedProject = timerCircuit(false)
    const triggerApplied = simulateElectrical(releasedProject, resetApplied.runtime, 1e-6, 2e-6)
    expect(triggerApplied.runtime.timer555Latch?.t).toBe(true)
    expect(simulateDc(releasedProject, triggerApplied.runtime).simulation.timer555LatchHigh?.t).toBe(true)

    const thresholdPriorityProject = timerCircuit(false, true)
    const thresholdApplied = simulateElectrical(thresholdPriorityProject, initialRuntime(thresholdPriorityProject), 1e-6, 1e-6)
    expect(thresholdApplied.runtime.timer555Latch?.t).toBe(false)
    expect(simulateDc(thresholdPriorityProject, thresholdApplied.runtime).simulation.timer555LatchHigh?.t).toBe(false)
  })

  it('mantém Timer556 A/B e cada instância independentes, mapeia DIP14 e reinicia os latches', () => {
    const timer556Circuit = (resetA = false, resetB = false): Project => ({
      version: 1, id: `timer556-${resetA}-${resetB}`, name: 'Timer556 DIP14',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'dual', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Timer 556', properties: { simulationModel: 'timer556' } },
        { id: 'other', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Timer 556 secundário', properties: { simulationModel: 'timer556' } },
      ],
      wires: [
        { id: 'power-a', from: 's:PLUS', to: 'dual:vcc', color: 'red' },
        { id: 'ground-a', from: 'dual:Ground', to: 's:MINUS', color: 'black' },
        { id: 'power-b', from: 's:PLUS', to: 'other:14', color: 'red' },
        { id: 'ground-b', from: 'other:7', to: 's:MINUS', color: 'black' },
        { id: 'reset-a-a', from: 'dual:reset_a', to: resetA ? 's:MINUS' : 's:PLUS', color: 'red' },
        { id: 'reset-b-a', from: 'dual:Reset B', to: resetB ? 's:MINUS' : 's:PLUS', color: 'red' },
        { id: 'reset-a-b', from: 'other:4', to: 's:PLUS', color: 'red' },
        { id: 'reset-b-b', from: 'other:10', to: 's:PLUS', color: 'red' },
        { id: 'trigger-a-a', from: 'dual:Trigger A', to: 's:MINUS', color: 'black' },
        { id: 'trigger-b-a', from: 'dual:trigger_b', to: 's:MINUS', color: 'black' },
        { id: 'trigger-a-b', from: 'other:6', to: 's:MINUS', color: 'black' },
        { id: 'trigger-b-b', from: 'other:8', to: 's:MINUS', color: 'black' },
      ],
    })

    const initialProject = timer556Circuit()
    expect(supportsDcSimulation(initialProject)).toBe(true)
    const initial = initialRuntime(initialProject)
    expect(initial.timer556Latch).toMatchObject({ dual: { A: true, B: true }, other: { A: true, B: true } })
    const normal = simulateDc(initialProject, initial).simulation
    expect(normal.converged, normal.diagnostics?.join('; ')).toBe(true)
    expect(normal.timer556Channels?.dual.A.latchHigh).toBe(true)
    expect(normal.timer556Channels?.dual.B.latchHigh).toBe(true)
    expect(normal.timer556Channels?.dual.A.outputVoltage).toBeCloseTo(5, 5)
    expect(normal.timer556Channels?.dual.B.outputVoltage).toBeCloseTo(5, 5)
    expect(normal.timer556Channels?.dual.A.referenceVoltage).toBeCloseTo(5 / 3, 10)
    expect(normal.timer556Channels?.dual.B.referenceVoltage).toBeCloseTo(5 / 3, 10)
    expect(normal.voltages?.['dual:1']).toBeCloseTo(normal.voltages?.['dual:discharge_a'] ?? NaN, 12)
    expect(normal.voltages?.['dual:Trigger A']).toBeCloseTo(normal.voltages?.['dual:trigger_a'] ?? NaN, 12)
    expect(normal.voltages?.['dual:Power']).toBeCloseTo(normal.voltages?.['dual:vcc'] ?? NaN, 12)

    const resetAProject = timer556Circuit(true)
    const resetQueued = simulateElectrical(resetAProject, initialRuntime(resetAProject), 0)
    expect(resetQueued.runtime.timer556Latch?.dual).toEqual({ A: true, B: true })
    expect(resetQueued.runtime.timer556PendingLatch?.dual?.A).toBe(false)
    const resetAApplied = simulateElectrical(resetAProject, resetQueued.runtime, 1e-6, 1e-6)
    expect(resetAApplied.runtime.timer556Latch).toMatchObject({ dual: { A: false, B: true }, other: { A: true, B: true } })

    const triggerAProject = timer556Circuit()
    const triggerAApplied = simulateElectrical(triggerAProject, resetAApplied.runtime, 1e-6, 2e-6)
    expect(triggerAApplied.runtime.timer556Latch).toMatchObject({ dual: { A: true, B: true }, other: { A: true, B: true } })

    const resetBProject = timer556Circuit(false, true)
    const resetBApplied = simulateElectrical(resetBProject, triggerAApplied.runtime, 1e-6, 3e-6)
    expect(resetBApplied.runtime.timer556Latch).toMatchObject({ dual: { A: true, B: false }, other: { A: true, B: true } })
    // Stop does not advance or couple either channel; a zero-dt restart retains the committed latch.
    const stoppedAndResumed = simulateElectrical(resetBProject, resetBApplied.runtime, 0, 3e-6)
    expect(stoppedAndResumed.runtime.timer556Latch).toMatchObject({ dual: { A: true, B: false }, other: { A: true, B: true } })
    // The explicit Reset control uses initialRuntime and restarts both channel latches high.
    const restarted = initialRuntime(resetBProject)
    expect(restarted.timer556Latch).toMatchObject({ dual: { A: true, B: true }, other: { A: true, B: true } })
  })

  it('avança atraso Timer556 e capacitor uma vez após retries do ponto fixo do sensor de gás', () => {
    const project: Project = {
      version: 1, id: 'timer556-gas-retry', name: 'Timer556 e sensor gás',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'dual', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Timer 556', properties: { simulationModel: 'timer556' } },
        { id: 'gas', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Gás', properties: { simulationModel: 'sensor_gas' } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga RC', properties: { ohms: 10_000 } },
        { id: 'c', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Capacitor', properties: { simulationModel: 'capacitor', capacitance: 1e-6 } },
      ],
      wires: [
        { id: 'vcc', from: 's:PLUS', to: 'dual:vcc', color: 'red' },
        { id: 'ground', from: 'dual:gnd', to: 's:MINUS', color: 'black' },
        { id: 'reset-a', from: 'dual:reset_a', to: 's:MINUS', color: 'black' },
        { id: 'reset-b', from: 'dual:reset_b', to: 's:PLUS', color: 'red' },
        { id: 'trigger-a', from: 'dual:trigger_a', to: 's:MINUS', color: 'black' },
        { id: 'trigger-b', from: 'dual:trigger_b', to: 's:MINUS', color: 'black' },
        { id: 'heater-a', from: 's:PLUS', to: 'gas:H1', color: 'red' },
        { id: 'heater-b', from: 'gas:H2', to: 's:MINUS', color: 'black' },
        { id: 'gas-a', from: 's:PLUS', to: 'gas:A1', color: 'red' },
        { id: 'gas-b', from: 'gas:B1', to: 's:MINUS', color: 'black' },
        { id: 'rc-source', from: 's:PLUS', to: 'r:A', color: 'red' },
        { id: 'rc-r-c', from: 'r:B', to: 'c:Terminal 1', color: 'green' },
        { id: 'rc-ground', from: 'c:Terminal 2', to: 's:MINUS', color: 'black' },
      ],
    }
    const baseline: Project = {
      ...project,
      id: 'capacitor-one-retry-baseline',
      parts: project.parts.filter(part => ['s', 'r', 'c'].includes(part.id)),
      wires: project.wires.filter(wire => ['rc-source', 'rc-r-c', 'rc-ground'].includes(wire.id)),
    }
    const dt = 0.000_000_2
    const expectedCap = simulateElectrical(baseline, initialRuntime(baseline), dt, dt, dt)
    const runtime = initialRuntime(project)
    const queued = simulateElectrical(project, runtime, 0)
    expect(queued.runtime.timer556PendingLatch?.dual?.A).toBe(false)
    const coupled = simulateElectrical(project, queued.runtime, dt, dt, dt)
    expect(coupled.simulation.converged, coupled.simulation.diagnostics?.join('; ')).toBe(true)
    expect(coupled.runtime.timer556DelayRemainingSeconds?.dual?.A).toBeCloseTo(0.3e-6, 13)
    expect(coupled.runtime.timer556Latch?.dual?.A).toBe(true)
    expect(coupled.runtime.capacitorVoltages?.c).toBeCloseTo(expectedCap.runtime.capacitorVoltages?.c ?? NaN, 10)
  })

  it('simula Timer555 astável por RC e melhora o período ao reduzir o timestep', () => {
    const project: Project = {
      version: 1, id: 'timer555-astable', name: 'Timer555 astável',
      parts: [
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5, internalResistance: 0 } },
        { id: 't', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Timer 555', properties: { simulationModel: 'Timer555' } },
        { id: 'ra', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'RA', properties: { ohms: 10_000 } },
        { id: 'rb', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'RB', properties: { ohms: 10_000 } },
        { id: 'c', kind: 'library', x: 0, y: 0, rotation: 0, label: 'C', properties: { simulationModel: 'capacitor', capacitance: 10e-6 } },
      ],
      wires: [
        { id: 'vcc', from: 's:PLUS', to: 't:Vcc', color: 'red' },
        { id: 'ground', from: 's:MINUS', to: 't:GND', color: 'black' },
        { id: 'reset', from: 's:PLUS', to: 't:Reset', color: 'red' },
        { id: 'ra-source', from: 's:PLUS', to: 'ra:A', color: 'red' },
        { id: 'ra-dis', from: 'ra:B', to: 't:DIS', color: 'red' },
        { id: 'rb-dis', from: 't:7', to: 'rb:A', color: 'green' },
        { id: 'rb-timing', from: 'rb:B', to: 'c:Terminal 1', color: 'green' },
        { id: 'trigger-timing', from: 't:TRIG', to: 'c:Terminal 1', color: 'green' },
        { id: 'threshold-timing', from: 't:THR', to: 'c:Terminal 1', color: 'green' },
        { id: 'timing-ground', from: 'c:Terminal 2', to: 's:MINUS', color: 'black' },
      ],
    }

    const measurePeriod = (step: number) => {
      let runtime = initialRuntime(project)
      let previousLatch = true
      const risingEdges: number[] = []
      const duration = 0.8
      const steps = Math.round(duration / step)
      let lastSimulation = simulateDc(project, runtime).simulation
      for (let index = 0; index < steps; index++) {
        const time = (index + 1) * step
        const result = simulateElectrical(project, runtime, step, time, step)
        expect(result.simulation.converged, result.simulation.diagnostics?.join('; ')).toBe(true)
        runtime = result.runtime
        const latch = runtime.timer555Latch?.t ?? true
        if (!previousLatch && latch) risingEdges.push(time)
        previousLatch = latch
        lastSimulation = result.simulation
      }
      expect(risingEdges.length).toBeGreaterThanOrEqual(2)
      expect(lastSimulation.mode).toBe('transient')
      return (risingEdges[risingEdges.length - 1] - risingEdges[0]) / (risingEdges.length - 1)
    }

    const theoreticalPeriod = 0.69314718056 * (10_000 + 2 * 10_000) * 10e-6
    const coarsePeriod = measurePeriod(0.005)
    const finePeriod = measurePeriod(0.001)
    expect(Math.abs(finePeriod - theoreticalPeriod)).toBeLessThan(Math.abs(coarsePeriod - theoreticalPeriod))
    expect(finePeriod).toBeCloseTo(theoreticalPeriod, 1)
  })

  it('resolve sensor_gas, PIR, piezo e Timer555 juntos sem perder seus estados', () => {
    const project: Project = {
      version: 1, id: 'gas-pir-coupled', name: 'PIR e gás',
      parts: [
        { id: 'source', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte comum', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'gas', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Sensor de gás', properties: { simulationModel: 'sensor_gas' } },
        { id: 'pir1', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PIR 1', properties: { simulationModel: 'sensor_pir' } },
        { id: 'pir2', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PIR 2', properties: { simulationModel: 'sensor_pir' } },
        { id: 'piezo', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Piezo', properties: { simulationModel: 'piezoSound' } },
        { id: 'timer555', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Timer 555', properties: { simulationModel: 'Timer555' } },
        { id: 'timer556', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Timer 556', properties: { simulationModel: 'timer556' } },
        { id: 'load1', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga PIR 1', properties: { ohms: 10_000 } },
        { id: 'load2', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga PIR 2', properties: { ohms: 10_000 } },
      ],
      wires: [
        { id: 'heater1', from: 'source:PLUS', to: 'gas:H1', color: 'red' },
        { id: 'heater2', from: 'gas:H2', to: 'source:MINUS', color: 'black' },
        { id: 'gas-signal1', from: 'source:PLUS', to: 'gas:A1', color: 'red' },
        { id: 'gas-signal2', from: 'gas:B1', to: 'source:MINUS', color: 'black' },
        { id: 'pir1-power', from: 'source:PLUS', to: 'pir1:vcc', color: 'red' },
        { id: 'pir1-ground', from: 'pir1:gnd', to: 'source:MINUS', color: 'black' },
        { id: 'pir1-output', from: 'pir1:out', to: 'load1:A', color: 'green' },
        { id: 'pir1-load', from: 'load1:B', to: 'source:MINUS', color: 'black' },
        { id: 'pir2-power', from: 'source:PLUS', to: 'pir2:Power', color: 'red' },
        { id: 'pir2-ground', from: 'pir2:Ground', to: 'source:MINUS', color: 'black' },
        { id: 'pir2-output', from: 'pir2:Signal', to: 'load2:A', color: 'green' },
        { id: 'pir2-load', from: 'load2:B', to: 'source:MINUS', color: 'black' },
        { id: 'piezo-power', from: 'source:PLUS', to: 'piezo:+', color: 'red' },
        { id: 'piezo-ground', from: 'piezo:Negative', to: 'source:MINUS', color: 'black' },
        { id: 'timer-power', from: 'source:PLUS', to: 'timer555:8', color: 'red' },
        { id: 'timer-ground', from: 'timer555:1', to: 'source:MINUS', color: 'black' },
        { id: 'timer-reset', from: 'source:PLUS', to: 'timer555:4', color: 'red' },
        { id: 'timer-trigger', from: 'timer555:2', to: 'source:MINUS', color: 'black' },
        { id: 'timer556-power', from: 'source:PLUS', to: 'timer556:14', color: 'red' },
        { id: 'timer556-ground', from: 'timer556:7', to: 'source:MINUS', color: 'black' },
        { id: 'timer556-reset-a', from: 'timer556:reset_a', to: 'source:PLUS', color: 'red' },
        { id: 'timer556-reset-b', from: 'timer556:10', to: 'source:PLUS', color: 'red' },
        { id: 'timer556-trigger-a', from: 'timer556:6', to: 'source:MINUS', color: 'black' },
        { id: 'timer556-trigger-b', from: 'timer556:trigger_b', to: 'source:MINUS', color: 'black' },
      ],
    }
    const result = simulateElectrical(project, emptyRuntime(), 0.001, 0.001)
    expect(result.simulation.converged, result.simulation.diagnostics?.join('; ')).toBe(true)
    expect(result.simulation.gasSensorHeaterVoltage?.gas).toBeCloseTo(5, 9)
    expect(result.simulation.gasSensorSignalResistance?.gas).toBeCloseTo(9130, 8)
    expect(result.simulation.pirSensorPullupResistance).toMatchObject({ pir1: 100, pir2: 100 })
    expect(result.simulation.pirSensorOutputDriven).toMatchObject({ pir1: true, pir2: true })
    expect(result.runtime.pirInRange).toMatchObject({ pir1: true, pir2: true })
    expect(result.runtime.pirDrivePulses).toMatchObject({ pir1: 1, pir2: 1 })
    expect(result.simulation.voltages?.['piezo:+']).toBeCloseTo(5, 10)
    expect(result.simulation.currents?.piezo).toBeCloseTo(5 / 600, 10)
    expect(result.simulation.piezoBreakdown?.piezo).toBe(false)
    expect(result.runtime.timer555Latch?.timer555).toBe(true)
    expect(result.simulation.timer555LatchHigh?.timer555).toBe(true)
    expect(result.simulation.timer555ReferenceVoltage?.timer555).toBeCloseTo(5 / 3, 8)
    expect(result.runtime.timer556Latch?.timer556).toEqual({ A: true, B: true })
    expect(result.simulation.timer556Channels?.timer556).toMatchObject({ A: { latchHigh: true }, B: { latchHigh: true } })
  })


  it('integra PING 3 pinos: amostra trigger em chamadas sequenciais e fatia o eco nos deadlines', () => {
    const project = (triggerVoltage: number, inputOhms = 100, supplyVoltage = 5): Project => ({
      version: 1, id: `ping-3-${triggerVoltage}`, name: 'PING 3 pinos',
      parts: [
        { id: 'power', kind: 'supply', x: 0, y: 0, rotation: 0, label: '5 V', properties: { voltage: supplyVoltage, internalResistance: 0 } },
        { id: 'trigger', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Entrada SIG', properties: { voltage: triggerVoltage, internalResistance: 0 } },
        { id: 'input', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Entrada', properties: { ohms: inputOhms } },
        { id: 'ping', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PING)))', properties: { simulationModel: 'sensor_ultrasonic_ping' } },
      ],
      wires: [
        { id: 'vcc', from: 'power:PLUS', to: 'ping:5V', color: 'red' },
        { id: 'ground', from: 'ping:GND', to: 'power:MINUS', color: 'black' },
        { id: 'signal-drive', from: 'trigger:PLUS', to: 'input:A', color: 'red' },
        { id: 'signal', from: 'input:B', to: 'ping:Signal', color: 'green' },
        { id: 'trigger-ground', from: 'trigger:MINUS', to: 'power:MINUS', color: 'black' },
      ],
    })

    const rising = simulateElectrical(project(5), emptyRuntime(), 1e-6, 1e-6)
    expect(rising.simulation.converged, rising.simulation.diagnostics?.join('; ')).toBe(true)
    expect(rising.simulation.voltages?.['ping:SIG']).toBeGreaterThan(2)
    expect(rising.runtime.ultrasonicStates?.ping).toMatchObject({ phase: 'trigger', acceptedPings: 0 })

    const falling = simulateElectrical(project(0), rising.runtime, 2e-6, 3e-6)
    expect(falling.simulation.converged, falling.simulation.diagnostics?.join('; ')).toBe(true)
    expect(falling.runtime.ultrasonicStates?.ping).toMatchObject({ phase: 'transmit', acceptedPings: 1 })
    expect(falling.runtime.ultrasonicStates?.ping?.lastTriggerPulseSeconds).toBeCloseTo(2e-6, 15)
    expect(falling.runtime.ultrasonicStates?.ping?.echoStartsAtSeconds).toBeCloseTo(753e-6, 15)
    expect(falling.runtime.ultrasonicStates?.ping?.echoEndsAtSeconds).toBeCloseTo(753e-6 + 115e-6 + 18.385e-3 / 3, 15)

    // This single outer call spans the rising deadline. Event slicing must
    // produce an active, electrically driven SIG echo after exactly +750 µs.
    const echo = simulateElectrical(project(0, 1_000_000), falling.runtime, 1e-3, 1.003e-3)
    expect(echo.simulation.converged, echo.simulation.diagnostics?.join('; ')).toBe(true)
    expect(echo.simulation.ultrasonicPing?.ping).toMatchObject({ echoActive: true, acceptedPings: 1 })
    expect(echo.simulation.ultrasonicPing?.ping?.echoVoltage).toBeGreaterThan(4)

    // The shared SIG line rises and falls as the echo is driven; those edges
    // are ignored while transmitting and do not recursively schedule a ping.
    const afterEcho = simulateElectrical(project(0, 1_000_000), echo.runtime, 7e-3, 8.003e-3)
    expect(afterEcho.simulation.converged, afterEcho.simulation.diagnostics?.join('; ')).toBe(true)
    expect(afterEcho.runtime.ultrasonicStates?.ping).toMatchObject({ phase: 'idle', acceptedPings: 1 })

    // The extracted state machine still schedules a valid echo with invalid
    // supply, while the electrical 100 Ω pull-up remains disabled.
    const invalidRise = simulateElectrical(project(5, 100, 4.499), emptyRuntime(), 1e-6, 1e-6)
    const invalidFall = simulateElectrical(project(0, 100, 4.499), invalidRise.runtime, 2e-6, 3e-6)
    const invalidEcho = simulateElectrical(project(0, 1e10, 4.499), invalidFall.runtime, 1e-3, 1.003e-3)
    expect(invalidFall.runtime.ultrasonicStates?.ping).toMatchObject({ phase: 'transmit', acceptedPings: 1 })
    expect(invalidEcho.simulation.ultrasonicPing?.ping).toMatchObject({ powered: false, echoActive: true, acceptedPings: 1 })
    expect(invalidEcho.simulation.ultrasonicPing?.ping?.echoVoltage).toBeLessThan(1e-5)
    expect(invalidEcho.simulation.ultrasonicPing?.ping?.echoCurrent).toBeLessThan(1e-9)
  })


  it('integra PING de 4 pinos com somente Echo conectado e pull-up em TRIG', () => {
    const project: Project = {
      version: 1, id: 'ping-four-echo-only', name: 'PING 4 pinos Echo',
      parts: [
        { id: 'power', kind: 'supply', x: 0, y: 0, rotation: 0, label: '5 V', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'ping', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PING)))', properties: { simulationModel: 'sensor_ultrasonic_ping' } },
        { id: 'load', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Carga Echo', properties: { ohms: 20_000 } },
      ],
      wires: [
        { id: 'vcc', from: 'power:PLUS', to: 'ping:Power', color: 'red' },
        { id: 'ground', from: 'ping:GND', to: 'power:MINUS', color: 'black' },
        { id: 'echo-load', from: 'ping:ECHO', to: 'load:A', color: 'green' },
        { id: 'load-ground', from: 'load:B', to: 'power:MINUS', color: 'black' },
      ],
    }
    const result = simulateElectrical(project, emptyRuntime(), 1e-6, 1e-6)
    expect(result.simulation.converged, result.simulation.diagnostics?.join('; ')).toBe(true)
    expect(result.simulation.ultrasonicPing?.ping).toMatchObject({ powered: true, phase: 'trigger', triggerHigh: true, echoActive: false })
    expect(result.simulation.voltages?.['ping:TRIG']).toBeGreaterThan(4)
    expect(result.simulation.ultrasonicPing?.ping?.echoVoltage).toBeCloseTo(0, 3)
    expect(result.simulation.ultrasonicPing?.ping?.echoCurrent).toBeCloseTo(5e-10, 10)
  })

  it('mantém dois PINGs independentes, incluindo seus deadlines de echo', () => {
    const circuit = (a: number, b: number, highImpedance = false): Project => ({
      version: 1, id: 'ping-pair-' + a + '-' + b + '-' + highImpedance, name: 'Dois PINGs',
      parts: [
        { id: 'power', kind: 'supply', x: 0, y: 0, rotation: 0, label: '5 V', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'srcA', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Trigger A', properties: { voltage: a, internalResistance: 0 } },
        { id: 'srcB', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Trigger B', properties: { voltage: b, internalResistance: 0 } },
        { id: 'rA', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Entrada A', properties: { ohms: highImpedance ? 1e10 : 100 } },
        { id: 'rB', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Entrada B', properties: { ohms: highImpedance ? 1e10 : 100 } },
        { id: 'pingA', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PING A', properties: { simulationModel: 'sensor_ultrasonic_ping' } },
        { id: 'pingB', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PING B', properties: { simulationModel: 'sensor_ultrasonic_ping' } },
      ],
      wires: [
        { id: 'powerA', from: 'power:PLUS', to: 'pingA:pos', color: 'red' },
        { id: 'groundA', from: 'pingA:neg', to: 'power:MINUS', color: 'black' },
        { id: 'powerB', from: 'power:PLUS', to: 'pingB:pos', color: 'red' },
        { id: 'groundB', from: 'pingB:neg', to: 'power:MINUS', color: 'black' },
        { id: 'feedA', from: 'srcA:PLUS', to: 'rA:A', color: 'red' },
        { id: 'sigA', from: 'rA:B', to: 'pingA:sig', color: 'green' },
        { id: 'gndA', from: 'srcA:MINUS', to: 'power:MINUS', color: 'black' },
        { id: 'feedB', from: 'srcB:PLUS', to: 'rB:A', color: 'red' },
        { id: 'sigB', from: 'rB:B', to: 'pingB:sig', color: 'green' },
        { id: 'gndB', from: 'srcB:MINUS', to: 'power:MINUS', color: 'black' },
      ],
    })
    expect(supportsDcSimulation(circuit(0, 0))).toBe(true)

    const aRising = simulateElectrical(circuit(5, 0), emptyRuntime(), 1e-6, 1e-6)
    expect(aRising.runtime.ultrasonicStates?.pingA).toMatchObject({ phase: 'trigger', acceptedPings: 0 })
    expect(aRising.runtime.ultrasonicStates?.pingB).toMatchObject({ phase: 'idle', acceptedPings: 0 })
    const aFalling = simulateElectrical(circuit(0, 0), aRising.runtime, 2e-6, 3e-6)
    expect(aFalling.runtime.ultrasonicStates?.pingA).toMatchObject({ phase: 'transmit', acceptedPings: 1 })
    expect(aFalling.runtime.ultrasonicStates?.pingB).toMatchObject({ phase: 'idle', acceptedPings: 0 })

    const bRising = simulateElectrical(circuit(0, 5), aFalling.runtime, 1e-6, 4e-6)
    const bFalling = simulateElectrical(circuit(0, 0), bRising.runtime, 2e-6, 6e-6)
    expect(bFalling.runtime.ultrasonicStates?.pingA?.acceptedPings).toBe(1)
    expect(bFalling.runtime.ultrasonicStates?.pingB).toMatchObject({ phase: 'transmit', acceptedPings: 1 })
    expect(bFalling.runtime.ultrasonicStates?.pingA?.echoStartsAtSeconds).toBeCloseTo(753e-6, 15)
    expect(bFalling.runtime.ultrasonicStates?.pingB?.echoStartsAtSeconds).toBeCloseTo(756e-6, 15)

    const duringEcho = simulateElectrical(circuit(0, 0, true), bFalling.runtime, 1.994e-3, 2e-3)
    expect(duringEcho.simulation.converged, duringEcho.simulation.diagnostics?.join('; ')).toBe(true)
    expect(duringEcho.simulation.ultrasonicPing?.pingA?.echoActive).toBe(true)
    expect(duringEcho.simulation.ultrasonicPing?.pingB?.echoActive).toBe(true)
    const afterEcho = simulateElectrical(circuit(0, 0, true), duringEcho.runtime, 6e-3, 8e-3)
    expect(afterEcho.simulation.converged, afterEcho.simulation.diagnostics?.join('; ')).toBe(true)
    expect(afterEcho.runtime.ultrasonicStates?.pingA).toMatchObject({ phase: 'idle', acceptedPings: 1 })
    expect(afterEcho.runtime.ultrasonicStates?.pingB).toMatchObject({ phase: 'idle', acceptedPings: 1 })
  })


  it('preserva um passo de capacitor, relay e timers ao coexistir com o PING e sensores acoplados', () => {
    const circuit = (includeSensors: boolean): Project => {
      const parts: Project['parts'] = [
        { id: 'source', kind: 'supply', x: 0, y: 0, rotation: 0, label: '5 V', properties: { voltage: 5, internalResistance: 0 } },
        { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R', properties: { ohms: 1_000 } },
        { id: 'c', kind: 'library', x: 0, y: 0, rotation: 0, label: 'C', properties: { simulationModel: 'capacitor', capacitance: 1e-6 } },
        { id: 'relay', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Relay', properties: { simulationModel: 'relay_spdt' } },
        { id: 'timer555', kind: 'library', x: 0, y: 0, rotation: 0, label: '555', properties: { simulationModel: 'Timer555' } },
        { id: 'timer556', kind: 'library', x: 0, y: 0, rotation: 0, label: '556', properties: { simulationModel: 'timer556' } },
      ]
      const wires: Project['wires'] = [
        { id: 'r-plus', from: 'source:PLUS', to: 'r:A', color: 'red' },
        { id: 'r-cap', from: 'r:B', to: 'c:1', color: 'red' },
        { id: 'cap-ground', from: 'c:2', to: 'source:MINUS', color: 'black' },
        { id: 'relay-plus', from: 'source:PLUS', to: 'relay:COIL1', color: 'red' },
        { id: 'relay-ground', from: 'relay:COIL2', to: 'source:MINUS', color: 'black' },
        { id: '555-power', from: 'source:PLUS', to: 'timer555:8', color: 'red' },
        { id: '555-ground', from: 'timer555:1', to: 'source:MINUS', color: 'black' },
        { id: '555-reset', from: 'timer555:4', to: 'source:MINUS', color: 'black' },
        { id: '555-trigger', from: 'timer555:2', to: 'source:MINUS', color: 'black' },
        { id: '556-power', from: 'source:PLUS', to: 'timer556:14', color: 'red' },
        { id: '556-ground', from: 'timer556:7', to: 'source:MINUS', color: 'black' },
        { id: '556-reset-a', from: 'timer556:4', to: 'source:MINUS', color: 'black' },
        { id: '556-reset-b', from: 'timer556:10', to: 'source:MINUS', color: 'black' },
        { id: '556-trigger-a', from: 'timer556:6', to: 'source:MINUS', color: 'black' },
        { id: '556-trigger-b', from: 'timer556:8', to: 'source:MINUS', color: 'black' },
      ]
      if (includeSensors) {
        parts.push(
          { id: 'gas', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Gas', properties: { simulationModel: 'sensor_gas' } },
          { id: 'pir', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PIR', properties: { simulationModel: 'sensor_pir' } },
          { id: 'piezo', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Piezo', properties: { simulationModel: 'piezoSound' } },
          { id: 'ping', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PING', properties: { simulationModel: 'sensor_ultrasonic_ping' } },
        )
        wires.push(
          { id: 'gas-heater+', from: 'source:PLUS', to: 'gas:H1', color: 'red' },
          { id: 'gas-heater-', from: 'gas:H2', to: 'source:MINUS', color: 'black' },
          { id: 'gas-signal+', from: 'source:PLUS', to: 'gas:A1', color: 'red' },
          { id: 'gas-signal-', from: 'gas:B1', to: 'source:MINUS', color: 'black' },
          { id: 'pir-power', from: 'source:PLUS', to: 'pir:Power', color: 'red' },
          { id: 'pir-ground', from: 'pir:Ground', to: 'source:MINUS', color: 'black' },
          { id: 'piezo+', from: 'source:PLUS', to: 'piezo:+', color: 'red' },
          { id: 'piezo-', from: 'piezo:-', to: 'source:MINUS', color: 'black' },
          { id: 'ping-power', from: 'source:PLUS', to: 'ping:pos', color: 'red' },
          { id: 'ping-ground', from: 'ping:neg', to: 'source:MINUS', color: 'black' },
        )
      }
      return { version: 1, id: 'ping-coupled-' + includeSensors, name: 'Coexistência PING', parts, wires }
    }

    const baseline = simulateElectrical(circuit(false), emptyRuntime(), 1e-3, 1e-3)
    const coupled = simulateElectrical(circuit(true), emptyRuntime(), 1e-3, 1e-3)
    expect(baseline.simulation.converged, baseline.simulation.diagnostics?.join('; ')).toBe(true)
    expect(coupled.simulation.converged, coupled.simulation.diagnostics?.join('; ')).toBe(true)
    expect(coupled.simulation.gasSensorHeaterVoltage?.gas).toBeCloseTo(5, 9)
    expect(coupled.simulation.pirSensorDriveActive?.pir).toBe(true)
    expect(coupled.simulation.currents?.piezo).toBeCloseTo(5 / 600, 10)
    expect(coupled.simulation.ultrasonicPing?.ping).toMatchObject({ powered: true, acceptedPings: 0, echoActive: false })

    expect(coupled.runtime.capacitorVoltages?.c).toBeCloseTo(baseline.runtime.capacitorVoltages?.c ?? NaN, 12)
    expect(coupled.runtime.relayStates?.relay).toBe(baseline.runtime.relayStates?.relay)
    expect(coupled.runtime.relayActuationSeconds?.relay).toBeCloseTo(baseline.runtime.relayActuationSeconds?.relay ?? NaN, 12)
    expect(coupled.runtime.timer555Latch?.timer555).toBe(baseline.runtime.timer555Latch?.timer555)
    expect(coupled.runtime.timer556Latch?.timer556).toEqual(baseline.runtime.timer556Latch?.timer556)
    expect(coupled.runtime.timer556PendingLatch?.timer556).toEqual(baseline.runtime.timer556PendingLatch?.timer556)
  })

  it('não aceita circuitos com tipos fora do modelo DC disponível', () => {
    const project = ledCircuit()
    project.parts.push({ id: 'u', kind: 'nand74hc00', x: 0, y: 0, rotation: 0, label: 'U1' })
    expect(supportsDcSimulation(project)).toBe(false)
  })

  it('mantém o pino OUT auxiliar do botão no simulador digital legado', () => {
    const project: Project = {
      version: 1, id: 'legacy-button', name: 'Botão lógico',
      parts: [{ id: 'b', kind: 'button', x: 0, y: 0, rotation: 0, label: 'Botão' }],
      wires: [{ id: 'w', from: 'b:OUT', to: 'signal', color: 'red' }],
    }
    expect(supportsDcSimulation(project)).toBe(false)
  })
})
