import { describe, expect, it } from 'vitest'
import {
  evaluateTiltSensor,
  tiltSensorCurrentFromVoltage,
  TILT_SENSOR_MODEL,
} from './tiltSensorModel'

describe('modelo extraído do sensor de inclinação SW200D', () => {
  it('registra terminais, controle e resistências do módulo 59844', () => {
    expect(TILT_SENSOR_MODEL).toMatchObject({
      id: 'sensor_tilt_sw200d',
      moduleSource: 'tinkercad-engine-complete-extracted/models/sensor_tilt_sw200d--module-59844.js',
      terminals: { first: '1', second: '2' },
      control: {
        property: 'position',
        defaultPosition: 0,
        closeWhenPositionGreaterThan: 0.75,
      },
      closedResistanceOhms: 10,
      openResistanceOhms: 1e10,
    })
  })

  it('fica aberto em 0,75 e fecha somente acima do limiar estrito', () => {
    expect(evaluateTiltSensor(0.75)).toEqual({
      position: 0.75,
      closed: false,
      resistanceOhms: 1e10,
    })
    expect(evaluateTiltSensor(0.750001)).toEqual({
      position: 0.750001,
      closed: true,
      resistanceOhms: 10,
    })
  })

  it('reproduz contato aberto e fechado como resistências de 10 GΩ e 10 Ω', () => {
    expect(evaluateTiltSensor(0).resistanceOhms).toBe(1e10)
    expect(evaluateTiltSensor(1).resistanceOhms).toBe(10)
    expect(tiltSensorCurrentFromVoltage(5, 0.75)).toBeCloseTo(5 / 1e10, 16)
    expect(tiltSensorCurrentFromVoltage(5, 0.750001)).toBeCloseTo(0.5, 12)
  })
})
