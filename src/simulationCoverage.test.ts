import { describe, expect, it } from 'vitest'
import { emptyRuntime, type Project } from './model'
import { simulateDc, supportsDcSimulation } from './electricalSimulator'

const analogModels = [
  'resistor', 'led2', 'ledRGB', 'diode', 'lightBulb', 'vibration_motor', 'sensor_tilt_sw200d', 'USBstandard',
  'sensorSoilMoisture', 'IRsensor', 'sensor_gas', 'sensor_pir', 'piezoSound', 'Timer555', 'timer556',
  'sensor_ultrasonic_ping', 'button', 'capacitor', 'capacitor_polarized', 'inductor', 'function_generator',
  'powerSupply', 'battery9V', 'coinCell', 'AABattery', 'batteryLemon', 'batteryPotato', 'slide_switch',
  'slide_switch_v2', 'potentiometer', 'potentiometer_v2', 'dip_switch_spdt', 'dip_switch_4', 'dip_switch_6',
  'seven_segment_digit_5011bh', 'keypad_4x4', 'zenerDiode', 'npn', 'pnp', 'nmos', 'power_nmos', 'pmos',
  'power_pmos', 'tip120', 'voltageRegulator5V', 'voltageRegulator3p3V', 'opAmp_UA741', 'lm393', 'lm339',
  'photodiode_v2', 'phototransistor', 'relay_spdt', 'relay_dpdt', 'ldr_v2', 'sensorForce', 'sensorFlex',
  'TMP36', 'solarCell',
] as const

function isolatedProject(model: string): Project {
  return {
    version: 1,
    id: `coverage-${model}`,
    name: `Cobertura ${model}`,
    parts: [{ id: 'device', kind: 'library', x: 0, y: 0, rotation: 0, label: model, properties: { simulationModel: model, ...(model === 'capacitor' || model === 'capacitor_polarized' ? { capacitance: 1e-6 } : {}), ...(model === 'inductor' ? { inductance: 1e-3 } : {}) } }],
    wires: [],
  }
}

describe('registro de modelos elétricos locais', () => {
  it.each(analogModels)('%s está conectado ao solver MNA', model => {
    const project = isolatedProject(model)
    expect(supportsDcSimulation(project), model).toBe(true)
    const result = simulateDc(project, emptyRuntime()).simulation
    expect(result.converged, `${model}: ${result.diagnostics?.join('; ')}`).toBe(true)
  })
})
