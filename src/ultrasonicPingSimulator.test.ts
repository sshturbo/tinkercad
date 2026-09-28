import { describe, expect, it } from 'vitest'
import { emptyRuntime, type Project } from './model'
import { simulateDc, simulateElectrical, supportsDcSimulation } from './electricalSimulator'

function poweredThreePinSensor(voltage = 5): Project {
  return {
    version: 1,
    id: 'ultrasonic-dc',
    name: 'PING 3 pinos alimentado',
    parts: [
      { id: 'supply', kind: 'supply', x: 0, y: 0, rotation: 0, label: '5 V', properties: { voltage, internalResistance: 0 } },
      { id: 'sensor', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PING)))', properties: { simulationModel: 'sensor_ultrasonic_ping' } },
    ],
    wires: [
      { id: 'vcc', from: 'supply:PLUS', to: 'sensor:Power', color: 'red' },
      { id: 'ground', from: 'supply:MINUS', to: 'sensor:Ground', color: 'black' },
    ],
  }
}

describe('integração MNA DC do PING)))', () => {
  it('reconhece os aliases de três pinos e reporta alimentação, corrente e alvo padrão', () => {
    const project = poweredThreePinSensor()
    expect(supportsDcSimulation(project)).toBe(true)

    const { simulation } = simulateDc(project, emptyRuntime())
    expect(simulation.converged).toBe(true)
    expect(simulation.diagnostics).toEqual([])
    expect(simulation.mode).toBe('dc')
    expect(simulation.voltages?.['sensor:Power']).toBeCloseTo(5, 10)
    expect(simulation.voltages?.['sensor:pos']).toBeCloseTo(5, 10)
    expect(simulation.voltages?.['sensor:Ground']).toBeCloseTo(0, 10)
    expect(simulation.voltages?.['sensor:neg']).toBeCloseTo(0, 10)
    expect(simulation.voltages?.['sensor:SIG']).toBeCloseTo(1e-5, 9)
    expect(simulation.currents?.sensor).toBeCloseTo(0.0300000005, 10)
    expect(simulation.ultrasonicPing?.sensor).toMatchObject({
      powered: true,
      supplyVoltage: 5,
      phase: 'idle',
      echoActive: false,
      inRange: true,
      normalizedDistance: expect.closeTo(1 / 3, 10),
      distanceCm: expect.closeTo(113.44, 2),
    })
  })

  it('usa o mesmo stamp de potência fora da faixa e reporta sensor sem alimentação válida', () => {
    const { simulation } = simulateDc(poweredThreePinSensor(4.499), emptyRuntime())
    expect(simulation.converged).toBe(true)
    expect(simulation.ultrasonicPing?.sensor?.powered).toBe(false)
    expect(simulation.ultrasonicPing?.sensor?.supplyVoltage).toBeCloseTo(4.499, 10)
    expect(simulation.currents?.sensor).toBeCloseTo(4.499 / (5 / 0.03), 9)
  })
})

function poweredFourPinSensor(triggerVoltage = 0, capacitance = 0, powerVoltage = 5): Project {
  return {
    version: 1,
    id: 'ultrasonic-four-pin',
    name: 'PING 4 pinos',
    parts: [
      { id: 'power', kind: 'supply', x: 0, y: 0, rotation: 0, label: '5 V', properties: { voltage: powerVoltage, internalResistance: 0 } },
      { id: 'driver', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'TRIG', properties: { voltage: triggerVoltage, internalResistance: 0 } },
      { id: 'sensor', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PING)))', properties: { simulationModel: 'sensor_ultrasonic_ping' } },
      { id: 'load', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R echo', properties: { ohms: 10_000 } },
      ...(capacitance > 0 ? [{ id: 'cap', kind: 'library' as const, x: 0, y: 0, rotation: 0, label: 'C echo', properties: { simulationModel: 'capacitor', capacitance } }] : []),
    ],
    wires: [
      { id: 'power+', from: 'power:PLUS', to: 'sensor:pos', color: 'red' },
      { id: 'power-', from: 'power:MINUS', to: 'sensor:neg', color: 'black' },
      { id: 'trigger+', from: 'driver:PLUS', to: 'sensor:trig', color: 'orange' },
      { id: 'trigger-', from: 'driver:MINUS', to: 'sensor:neg', color: 'black' },
      { id: 'echo-load', from: 'sensor:echo', to: 'load:A', color: 'green' },
      { id: 'load-ground', from: 'load:B', to: 'sensor:neg', color: 'black' },
      ...(capacitance > 0 ? [
        { id: 'echo-cap', from: 'sensor:echo', to: 'cap:Terminal 1', color: 'green' },
        { id: 'cap-ground', from: 'cap:Terminal 2', to: 'sensor:neg', color: 'black' },
      ] : []),
    ],
  }
}

function poweredThreePinSignal(triggerVoltage = 0): Project {
  const project = poweredThreePinSensor()
  return {
    ...project,
    parts: [...project.parts, { id: 'driver', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'SIG drive', properties: { voltage: triggerVoltage, internalResistance: 0 } }],
    wires: [
      ...project.wires,
      { id: 'signal-drive', from: 'driver:PLUS', to: 'sensor:SIG', color: 'orange' },
      { id: 'signal-ground', from: 'driver:MINUS', to: 'sensor:Ground', color: 'black' },
    ],
  }
}

function setTriggerVoltage(project: Project, voltage: number): Project {
  return {
    ...project,
    parts: project.parts.map(part => part.id === 'driver' ? { ...part, properties: { ...part.properties, voltage } } : part),
  }
}

describe('scheduler temporal do PING)))', () => {
  it.each([
    [1.999e-6, 0],
    [2e-6, 1],
    [2.001e-6, 1],
  ])('aplica falling edge com largura %s s', (pulseWidth, accepted) => {
    const low = poweredFourPinSensor(0)
    const high = setTriggerVoltage(low, 5)
    const risingAt = 0.001
    const rising = simulateElectricalForPing(high, emptyRuntime(), 0, risingAt)
    const fallingAt = risingAt + pulseWidth
    const falling = simulateElectricalForPing(low, rising.runtime, pulseWidth, fallingAt)
    const reading = falling.simulation.ultrasonicPing?.sensor
    expect(falling.simulation.converged).toBe(true)
    expect(reading?.acceptedPings).toBe(accepted)
    expect(reading?.rejectedShortPulses).toBe(accepted ? 0 : 1)
    expect(reading?.lastTriggerPulseSeconds).toBeCloseTo(pulseWidth, 12)
    if (accepted) {
      expect(reading?.phase).toBe('transmit')
      expect(reading?.echoStartsAtSeconds).toBeCloseTo(fallingAt + 750e-6, 12)
      const normalizedDistance = 1 / 3
      const expectedWidth = 115e-6 + 18.385e-3 * normalizedDistance
      expect(reading?.echoEndsAtSeconds).toBeCloseTo(fallingAt + 750e-6 + expectedWidth, 10)
    }
  })

  it.each([
    [1.999, 0],
    [2, 0],
    [2.001, 1],
  ])('exige trigger estritamente acima de 2 V: %s V', (highVoltage, accepted) => {
    const low = poweredFourPinSensor(0)
    const high = setTriggerVoltage(low, highVoltage)
    const rising = simulateElectricalForPing(high, emptyRuntime(), 0, 0.001)
    const falling = simulateElectricalForPing(low, rising.runtime, 2e-6, 0.001002)
    expect(falling.simulation.ultrasonicPing?.sensor?.acceptedPings).toBe(accepted)
  })

  it('corta o solve nos deadlines de subida/queda e preserva carga no capacitor durante o echo', () => {
    const low = poweredFourPinSensor(0, 1e-6)
    const high = setTriggerVoltage(low, 5)
    const risingAt = simulateElectricalForPing(high, emptyRuntime(), 0, 0.001)
    const fallingAt = simulateElectricalForPing(low, risingAt.runtime, 2e-6, 0.001002)
    const ping = fallingAt.simulation.ultrasonicPing!.sensor
    const echoEnd = ping.echoEndsAtSeconds!
    const elapsed = echoEnd + 2e-6 - 0.001002
    const afterPulse = simulateElectricalForPing(low, fallingAt.runtime, elapsed, echoEnd + 2e-6)

    expect(afterPulse.simulation.converged).toBe(true)
    expect(afterPulse.runtime.ultrasonicStates?.sensor?.phase).toBe('idle')
    expect(afterPulse.simulation.ultrasonicPing?.sensor?.echoActive).toBe(false)
    // Although the final sample is after the pulse, the capacitor charged while the
    // scheduler used the 100 Ω active pull-up between the exact echo deadlines.
    expect(afterPulse.simulation.voltages?.['sensor:echo']).toBeGreaterThan(4.5)
  })

  it('reconhece a interface de quatro pinos quando apenas Echo está conectado', () => {
    const fourPin = poweredFourPinSensor()
    const echoOnly = { ...fourPin, wires: fourPin.wires.filter(wire => wire.id !== 'trigger+') }
    const result = simulateElectricalForPing(echoOnly, emptyRuntime(), 0, 0)
    expect(result.simulation.converged).toBe(true)
    expect(result.simulation.voltages?.['sensor:Trigger']).toBeCloseTo(5, 8)
    expect(result.simulation.voltages?.['sensor:SIG']).toBeCloseTo(0, 8)
  })

  it('documenta amostragem: uma mudança alta/baixa entre duas amostras baixas não é reconstruída', () => {
    const low = poweredFourPinSensor(0)
    const initial = simulateElectricalForPing(low, emptyRuntime(), 0, 0)
    // Caller only presents low at both endpoints; no solver can infer the omitted
    // 1 µs high pulse from these snapshots.
    const skipped = simulateElectricalForPing(low, initial.runtime, 5e-6, 5e-6)
    expect(skipped.simulation.ultrasonicPing?.sensor?.phase).toBe('idle')
    expect(skipped.simulation.ultrasonicPing?.sensor?.acceptedPings).toBe(0)
  })

  it('usa SIG como trigger/echo no modelo de três pinos e não reaciona ao próprio pulso', () => {
    const low = poweredThreePinSignal(0)
    const high = poweredThreePinSignal(5)
    const rising = simulateElectricalForPing(high, emptyRuntime(), 0, 0.001)
    expect(rising.simulation.ultrasonicPing?.sensor?.acceptedPings).toBe(0)
    const falling = simulateElectricalForPing(low, rising.runtime, 2e-6, 0.001002)
    expect(falling.simulation.ultrasonicPing?.sensor?.acceptedPings).toBe(1)
    expect(falling.simulation.ultrasonicPing?.sensor?.echoStartsAtSeconds).toBeCloseTo(0.001752, 12)

    const ping = falling.simulation.ultrasonicPing!.sensor
    const afterTransmit = simulateElectricalForPing(low, falling.runtime, ping.echoEndsAtSeconds! + 0.001 - 0.001002, ping.echoEndsAtSeconds! + 0.001)
    expect(afterTransmit.runtime.ultrasonicStates?.sensor?.phase).toBe('idle')
    expect(afterTransmit.simulation.ultrasonicPing?.sensor?.acceptedPings).toBe(1)
  })

  it.each([
    [4.499, false],
    [4.5, true],
    [6, true],
    [6.001, false],
  ])('aplica os limites inclusivos da alimentação: %s V', (voltage, powered) => {
    const result = simulateElectricalForPing(poweredFourPinSensor(0, 0, voltage), emptyRuntime(), 0, 0)
    expect(result.simulation.converged).toBe(true)
    expect(result.simulation.ultrasonicPing?.sensor?.powered).toBe(powered)
    expect(result.simulation.ultrasonicPing?.sensor?.supplyVoltage).toBeCloseTo(voltage, 10)
  })

  it('mantém o timing interno sem alimentação válida, mas não dirige o pino echo', () => {
    const low = poweredFourPinSensor(0, 0, 4.499)
    const high = poweredFourPinSensor(5, 0, 4.499)
    const rising = simulateElectricalForPing(high, emptyRuntime(), 0, 0.001)
    const falling = simulateElectricalForPing(low, rising.runtime, 2e-6, 0.001002)
    const echoStart = falling.simulation.ultrasonicPing!.sensor.echoStartsAtSeconds!
    const sampleTime = echoStart + 100e-6
    const during = simulateElectricalForPing(low, falling.runtime, sampleTime - 0.001002, sampleTime)
    expect(during.simulation.ultrasonicPing?.sensor?.phase).toBe('transmit')
    expect(during.simulation.ultrasonicPing?.sensor?.echoActive).toBe(true)
    expect(during.simulation.ultrasonicPing?.sensor?.powered).toBe(false)
    expect(during.simulation.voltages?.['sensor:echo']).toBeLessThan(0.1)
  })
})

function simulateElectricalForPing(project: Project, runtime: ReturnType<typeof emptyRuntime>, dt: number, time: number) {
  return simulateElectrical(project, runtime, dt, time)
}

function twoIndependentPingSensors(triggerA: number, triggerB: number): Project {
  return {
    version: 1,
    id: 'ultrasonic-two-sensors',
    name: 'Dois PING)))',
    parts: [
      { id: 'power', kind: 'supply', x: 0, y: 0, rotation: 0, label: '5 V', properties: { voltage: 5, internalResistance: 0 } },
      { id: 'driverA', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'TRIG A', properties: { voltage: triggerA, internalResistance: 0 } },
      { id: 'driverB', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'TRIG B', properties: { voltage: triggerB, internalResistance: 0 } },
      { id: 'pingA', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PING A', properties: { simulationModel: 'sensor_ultrasonic_ping' } },
      { id: 'pingB', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PING B', properties: { simulationModel: 'sensor_ultrasonic_ping', 'Target X': 0, 'Target Y': -400 } },
      { id: 'loadA', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Echo A', properties: { ohms: 10_000 } },
      { id: 'loadB', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Echo B', properties: { ohms: 10_000 } },
    ],
    wires: [
      { id: 'powerA+', from: 'power:PLUS', to: 'pingA:pos', color: 'red' },
      { id: 'powerA-', from: 'power:MINUS', to: 'pingA:neg', color: 'black' },
      { id: 'powerB+', from: 'power:PLUS', to: 'pingB:pos', color: 'red' },
      { id: 'powerB-', from: 'power:MINUS', to: 'pingB:neg', color: 'black' },
      { id: 'triggerA+', from: 'driverA:PLUS', to: 'pingA:trig', color: 'orange' },
      { id: 'triggerA-', from: 'driverA:MINUS', to: 'pingA:neg', color: 'black' },
      { id: 'triggerB+', from: 'driverB:PLUS', to: 'pingB:trig', color: 'orange' },
      { id: 'triggerB-', from: 'driverB:MINUS', to: 'pingB:neg', color: 'black' },
      { id: 'echoA', from: 'pingA:echo', to: 'loadA:A', color: 'green' },
      { id: 'echoB', from: 'pingB:echo', to: 'loadB:A', color: 'green' },
      { id: 'loadAGround', from: 'loadA:B', to: 'pingA:neg', color: 'black' },
      { id: 'loadBGround', from: 'loadB:B', to: 'pingB:neg', color: 'black' },
    ],
  }
}

describe('isolamento entre sensores PING)))', () => {
  it('mantém pulsos, deadlines e alvo por instância', () => {
    const highA = twoIndependentPingSensors(5, 0)
    let step = simulateElectricalForPing(highA, emptyRuntime(), 0, 0)
    expect(step.runtime.ultrasonicStates?.pingA?.phase).toBe('trigger')
    expect(step.runtime.ultrasonicStates?.pingB?.phase).toBe('idle')

    const lowAHighB = twoIndependentPingSensors(0, 5)
    step = simulateElectricalForPing(lowAHighB, step.runtime, 2e-6, 2e-6)
    expect(step.runtime.ultrasonicStates?.pingA?.acceptedPings).toBe(1)
    expect(step.runtime.ultrasonicStates?.pingB?.phase).toBe('trigger')
    expect(step.runtime.ultrasonicStates?.pingA?.echoStartsAtSeconds).toBeCloseTo(752e-6, 12)
    expect(step.runtime.ultrasonicTargetPositions?.pingA).toEqual({ x: 0, y: -200 })
    expect(step.runtime.ultrasonicTargetPositions?.pingB).toEqual({ x: 0, y: -400 })

    const bothLow = twoIndependentPingSensors(0, 0)
    step = simulateElectricalForPing(bothLow, step.runtime, 2e-6, 4e-6)
    expect(step.runtime.ultrasonicStates?.pingA?.acceptedPings).toBe(1)
    expect(step.runtime.ultrasonicStates?.pingB?.acceptedPings).toBe(1)
    expect(step.runtime.ultrasonicStates?.pingB?.echoStartsAtSeconds).toBeCloseTo(754e-6, 12)
  })
})
