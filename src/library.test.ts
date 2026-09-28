import { describe, expect, it } from 'vitest'
import { libraryBoardConnections, libraryItemSupportsSimulation, type LibraryCatalogItem, type LibraryRecord } from './library'
import { emptyRuntime, type Project } from './model'
import { simulate } from './simulator'

const mini: LibraryRecord = {
  id: 'mini', device_id: 'mini', name: 'Breadboard Mini',
  extents: { left: -10, top: -60, width: 20, height: 120 },
  pins_and_terminals: [
    ...['A', 'B', 'C', 'D', 'E'].map((name, index) => ({ name: `${name}1`, x: 0, y: 55 - index * 10, terminal_type: 'breadboard_female' })),
    ...['F', 'G', 'H', 'I', 'J'].map((name, index) => ({ name: `${name}1`, x: 0, y: -15 - index * 10, terminal_type: 'breadboard_female' })),
    ...['A', 'B'].map((name, index) => ({ name: `${name}2`, x: 10, y: 55 - index * 10, terminal_type: 'breadboard_female' })),
  ],
}

describe('ligações da protoboard local', () => {
  it('classifica todas as protoboards como simuláveis e modelos sem motor como visuais', () => {
    const item = (name: string, simulation_model: string | null): LibraryCatalogItem => ({
      kind: 'component', id: name, device_id: name, name, path: '', record_json: '', thumbnail: '', simulation_model,
    })
    for (const name of ['Breadboard Small', 'Breadboard Mini', 'Breadboard']) {
      expect(libraryItemSupportsSimulation(item(name, null))).toBe(true)
    }
    expect(libraryItemSupportsSimulation(item('4-Bit Binary Counter', '74HC93'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('Diode', 'diode'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('LED RGB', 'ledRGB'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('7 Segment Display', 'seven_segment_digit_5011bh'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('Keypad 4x4', 'keypad_4x4'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('PIR Sensor', 'sensor_pir'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('Zener Diode', 'zenerDiode'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('Dual Timer', 'timer556'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('Light bulb', 'lightBulb'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('USB standard A', 'USBstandard'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('Soil Moisture Sensor', 'sensorSoilMoisture'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('IR sensor', 'IRsensor'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('Gas sensor', 'sensor_gas'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('Piezo sound', 'piezoSound'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('Timer', 'Timer555'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('Ultrasonic distance sensor', 'sensor_ultrasonic_ping'))).toBe(true)
    for (const model of ['npn', 'pnp', 'nmos', 'power_nmos', 'pmos', 'power_pmos', 'tip120', 'voltageRegulator5V', 'voltageRegulator3p3V', 'opAmp_UA741', 'lm393', 'lm339', 'photodiode_v2', 'phototransistor', 'relay_spdt', 'relay_dpdt', 'vibration_motor', 'sensor_tilt_sw200d']) {
      expect(libraryItemSupportsSimulation(item(model, model))).toBe(true)
    }
    expect(libraryItemSupportsSimulation(item('Capacitor', 'capacitor'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('Polarized Capacitor', 'capacitor_polarized'))).toBe(true)
    expect(libraryItemSupportsSimulation(item('Inductor', 'inductor'))).toBe(true)
    for (const model of ['AABattery', 'battery9V', 'coinCell', 'batteryLemon', 'batteryPotato', 'slide_switch_v2', 'potentiometer_v2', 'dip_switch_spdt', 'dip_switch_4', 'dip_switch_6']) {
      expect(libraryItemSupportsSimulation(item(model, model))).toBe(true)
    }
  })

  it('conduz entre furos da mesma faixa sem atravessar o canal central', () => {
    const internal = libraryBoardConnections(mini).map(([from, to], index) => ({
      id: `internal-${index}`, from: `bb:${from}`, to: `bb:${to}`, color: 'gray', hidden: true,
    }))
    const project: Project = {
      version: 1, id: 'mini-board', name: 'Faixas da protoboard',
      parts: [
        { id: 'bb', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Breadboard Mini' },
        { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte' },
        { id: 'on', kind: 'led', x: 0, y: 0, rotation: 0, label: 'LED 1' },
        { id: 'off', kind: 'led', x: 0, y: 0, rotation: 0, label: 'LED 2' },
      ],
      wires: [
        ...internal,
        { id: 'w1', from: 's:PLUS', to: 'bb:A1', color: 'red' },
        { id: 'w2', from: 'bb:E1', to: 'on:A', color: 'red' },
        { id: 'w3', from: 'bb:F1', to: 'off:A', color: 'red' },
        { id: 'w4', from: 's:MINUS', to: 'on:K', color: 'black' },
        { id: 'w5', from: 's:MINUS', to: 'off:K', color: 'black' },
      ],
    }
    const { simulation } = simulate(project, emptyRuntime())
    expect(simulation.leds.on).toBe('1')
    expect(simulation.leds.off).not.toBe('1')
  })

  it('mantém separadas as seções do trilho quando há um intervalo entre furos', () => {
    const full: LibraryRecord = {
      id: 'full', device_id: 'full', name: 'Breadboard',
      pins_and_terminals: [0, 10, 30, 40].map((x, index) => ({ name: `R${index}`, x, y: 85, terminal_type: 'breadboard_female' })),
    }
    expect(libraryBoardConnections(full)).toEqual([['R0', 'R1'], ['R2', 'R3']])
  })
})
