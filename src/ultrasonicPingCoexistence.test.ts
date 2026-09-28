import { describe, expect, it } from 'vitest'
import { emptyRuntime, type Project } from './model'
import { simulateElectrical } from './electricalSimulator'

function coupledProject(includePing: boolean, triggerVoltage = 0): Project {
  const project: Project = {
    version: 1,
    id: `ping-coupled-${includePing}`,
    name: 'PING com estados dinâmicos e sensores',
    parts: [
      { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte 5 V', properties: { voltage: 5, internalResistance: 0 } },
      { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R RC', properties: { ohms: 1000 } },
      { id: 'c', kind: 'library', x: 0, y: 0, rotation: 0, label: 'C RC', properties: { simulationModel: 'capacitor', capacitance: 1e-6 } },
      { id: 'timer555', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Timer 555', properties: { simulationModel: 'Timer555' } },
      { id: 'timer556', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Timer 556', properties: { simulationModel: 'timer556' } },
      { id: 'relay', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Relé', properties: { simulationModel: 'relay_spdt' } },
      { id: 'gas', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Sensor gás', properties: { simulationModel: 'sensor_gas' } },
      { id: 'pir', kind: 'library', x: 0, y: 0, rotation: 0, label: 'PIR', properties: { simulationModel: 'sensor_pir' } },
      { id: 'pirLoad', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R PIR', properties: { ohms: 10_000 } },
      { id: 'piezo', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Piezo', properties: { simulationModel: 'piezoSound' } },
      ...(includePing ? [
        { id: 'driver', kind: 'supply' as const, x: 0, y: 0, rotation: 0, label: 'TRIG', properties: { voltage: triggerVoltage, internalResistance: 0 } },
        { id: 'ping', kind: 'library' as const, x: 0, y: 0, rotation: 0, label: 'PING', properties: { simulationModel: 'sensor_ultrasonic_ping' } },
        { id: 'echoLoad', kind: 'resistor' as const, x: 0, y: 0, rotation: 0, label: 'R echo', properties: { ohms: 10_000 } },
      ] : []),
    ],
    wires: [
      { id: 'rc-feed', from: 's:PLUS', to: 'r:A', color: 'red' },
      { id: 'rc-node', from: 'r:B', to: 'c:Terminal 1', color: 'green' },
      { id: 'rc-ground', from: 'c:Terminal 2', to: 's:MINUS', color: 'black' },
      { id: '555-vcc', from: 's:PLUS', to: 'timer555:8', color: 'red' },
      { id: '555-gnd', from: 'timer555:1', to: 's:MINUS', color: 'black' },
      { id: '555-reset', from: 's:PLUS', to: 'timer555:4', color: 'red' },
      { id: '555-trigger', from: 'timer555:2', to: 's:MINUS', color: 'black' },
      { id: '556-vcc', from: 's:PLUS', to: 'timer556:14', color: 'red' },
      { id: '556-gnd', from: 'timer556:7', to: 's:MINUS', color: 'black' },
      { id: '556-resetA', from: 's:PLUS', to: 'timer556:4', color: 'red' },
      { id: '556-resetB', from: 's:PLUS', to: 'timer556:10', color: 'red' },
      { id: '556-triggerA', from: 'timer556:6', to: 's:MINUS', color: 'black' },
      { id: '556-triggerB', from: 'timer556:8', to: 's:MINUS', color: 'black' },
      { id: 'relay-coil+', from: 's:PLUS', to: 'relay:COIL1', color: 'red' },
      { id: 'relay-coil-', from: 'relay:COIL2', to: 's:MINUS', color: 'black' },
      { id: 'gas-heater+', from: 's:PLUS', to: 'gas:H1', color: 'red' },
      { id: 'gas-heater-', from: 'gas:H2', to: 's:MINUS', color: 'black' },
      { id: 'gas-signal+', from: 's:PLUS', to: 'gas:A1', color: 'red' },
      { id: 'gas-signal-', from: 'gas:B1', to: 's:MINUS', color: 'black' },
      { id: 'pir-power', from: 's:PLUS', to: 'pir:Power', color: 'red' },
      { id: 'pir-ground', from: 'pir:Ground', to: 's:MINUS', color: 'black' },
      { id: 'pir-output', from: 'pir:Signal', to: 'pirLoad:A', color: 'green' },
      { id: 'pir-load-ground', from: 'pirLoad:B', to: 's:MINUS', color: 'black' },
      { id: 'piezo+', from: 's:PLUS', to: 'piezo:positive', color: 'red' },
      { id: 'piezo-', from: 'piezo:negative', to: 's:MINUS', color: 'black' },
      ...(includePing ? [
        { id: 'ping-vcc', from: 's:PLUS', to: 'ping:pos', color: 'red' },
        { id: 'ping-gnd', from: 'ping:neg', to: 's:MINUS', color: 'black' },
        { id: 'ping-trig', from: 'driver:PLUS', to: 'ping:trig', color: 'orange' },
        { id: 'driver-gnd', from: 'driver:MINUS', to: 's:MINUS', color: 'black' },
        { id: 'ping-echo', from: 'ping:echo', to: 'echoLoad:A', color: 'green' },
        { id: 'echo-ground', from: 'echoLoad:B', to: 's:MINUS', color: 'black' },
      ] : []),
    ],
  }
  return project
}

function withTriggerVoltage(project: Project, voltage: number): Project {
  return { ...project, parts: project.parts.map(part => part.id === 'driver' ? { ...part, properties: { ...part.properties, voltage } } : part) }
}

describe('coexistência do PING com os estados temporais existentes', () => {
  it('não duplica avanço de capacitor, timers ou relé nos retries do ponto fixo gas/PIR/echo', () => {
    const baseline = coupledProject(false)
    const withPingHigh = coupledProject(true, 5)
    const withPingLow = withTriggerVoltage(withPingHigh, 0)

    const reference = simulateElectrical(baseline, emptyRuntime(), 2e-6, 2e-6, 2e-6)
    const rising = simulateElectrical(withPingHigh, emptyRuntime(), 0, 0)
    const coupled = simulateElectrical(withPingLow, rising.runtime, 2e-6, 2e-6, 2e-6)

    expect(reference.simulation.converged, reference.simulation.diagnostics?.join('; ')).toBe(true)
    expect(coupled.simulation.converged, coupled.simulation.diagnostics?.join('; ')).toBe(true)
    expect(coupled.runtime.ultrasonicStates?.ping?.acceptedPings).toBe(1)
    expect(coupled.runtime.capacitorVoltages?.c).toBeCloseTo(reference.runtime.capacitorVoltages?.c ?? NaN, 10)
    expect(coupled.runtime.relayActuationSeconds?.relay ?? 0).toBeCloseTo(reference.runtime.relayActuationSeconds?.relay ?? 0, 12)
    expect(coupled.runtime.timer555Latch?.timer555).toBe(reference.runtime.timer555Latch?.timer555)
    expect(coupled.runtime.timer556Latch?.timer556).toEqual(reference.runtime.timer556Latch?.timer556)
    expect(coupled.simulation.gasSensorHeaterVoltage?.gas).toBeCloseTo(5, 6)
    expect(coupled.simulation.pirSensorPowered?.pir).toBe(true)
    expect(coupled.simulation.piezoVoltageIndicator?.piezo).toBeCloseTo(0.2, 8)
  })
})
