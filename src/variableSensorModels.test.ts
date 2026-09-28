import { describe, expect, it } from 'vitest'
import {
  isVariableSensorModel,
  VARIABLE_SENSOR_MODELS,
  variableSensorControl,
  variableSensorResistance,
} from './variableSensorModels'

describe('modelos de sensores resistivos extraídos', () => {
  it('reconhece apenas os modelos confirmados no catálogo', () => {
    expect(VARIABLE_SENSOR_MODELS).toEqual(['ldr_v2', 'sensorForce', 'sensorFlex'])
    expect(isVariableSensorModel('ldr_v2')).toBe(true)
    expect(isVariableSensorModel('sensorForce')).toBe(true)
    expect(isVariableSensorModel('sensorFlex')).toBe(true)
    expect(isVariableSensorModel('unknown')).toBe(false)
    expect(isVariableSensorModel(undefined)).toBe(false)
    expect(variableSensorResistance('unknown')).toBeUndefined()
    expect(variableSensorControl('unknown')).toBeUndefined()
  })

  it('aplica a curva logarítmica do LDR desde 1 até 1000 lux', () => {
    const resistanceAtLux = (lux: number) =>
      Math.exp(Math.log(500_000) - 0.85 * (Math.log(lux) - Math.log(0.3)))

    // Default drag position is 0, mapped by the extracted model to 1 lux.
    expect(variableSensorResistance('ldr_v2')).toBeCloseTo(resistanceAtLux(1), 8)
    // Half travel is quantized to step 25/50, yielding 500.5 lux.
    expect(variableSensorResistance('ldr_v2', { lightLevel: 50 })).toBeCloseTo(resistanceAtLux(500.5), 8)
    // Full travel is 1000 lux; out-of-range controls clamp at that endpoint.
    expect(variableSensorResistance('ldr_v2', { lightLevel: 100 })).toBeCloseTo(resistanceAtLux(1_000), 8)
    expect(variableSensorResistance('ldr_v2', { lightLevel: 150 })).toBeCloseTo(resistanceAtLux(1_000), 8)
    expect(variableSensorResistance('ldr_v2', { position: 0.02 })).toBeCloseTo(resistanceAtLux(20.98), 8)
  })

  it('expõe o controle de iluminação em passos de 2 por cento', () => {
    expect(variableSensorControl('ldr_v2')).toEqual({
      label: 'Iluminação', property: 'lightLevel', min: 0, max: 100,
      step: 2, defaultValue: 0, unit: '%', value: 0,
    })
    expect(variableSensorControl('ldr_v2', { lightLevel: 53 })).toMatchObject({ value: 54 })
  })

  it('aplica a curva de força com estado aberto e dois trechos calibrados', () => {
    expect(variableSensorResistance('sensorForce')).toBe(1e10)
    expect(variableSensorResistance('sensorForce', { force: 0.005 })).toBe(1e10)
    expect(variableSensorResistance('sensorForce', { force: 0.01 })).toBeCloseTo(4_245 * Math.pow(0.01, -1.2), 8)
    expect(variableSensorResistance('sensorForce', { force: 0.5 })).toBeCloseTo(6_000 * Math.pow(0.5, -0.7), 8)
    expect(variableSensorResistance('sensorForce', { force: 10 })).toBeCloseTo(6_000 * Math.pow(10, -0.7), 8)
    // Force is bounded by the 10 N travel of the extracted interaction.
    expect(variableSensorResistance('sensorForce', { force: 20 })).toBeCloseTo(6_000 * Math.pow(10, -0.7), 8)
  })

  it('expõe força em newtons e traduz posição antiga do controle extraído', () => {
    expect(variableSensorControl('sensorForce')).toEqual({
      label: 'Força aplicada', property: 'force', min: 0, max: 10,
      step: 0.1, defaultValue: 0, unit: 'N', value: 0,
    })
    expect(variableSensorControl('sensorForce', { position: 0.5 })?.value).toBe(2.575)
    expect(variableSensorResistance('sensorForce', { position: 0.5 })).toBeCloseTo(6_000 * Math.pow(2.575, -0.7), 8)
    expect(variableSensorResistance('sensorForce', { force: -1 })).toBe(1e10)
  })

  it('usa 30 kΩ como resistência plana padrão do sensor flexível', () => {
    expect(variableSensorResistance('sensorFlex')).toBeCloseTo(30_000, 8)
    expect(variableSensorResistance('sensorFlex', { bend: 90 })).toBeCloseTo(30_000 * Math.pow(2.56, 0.9), 8)
    expect(variableSensorResistance('sensorFlex', { bend: 180 })).toBeCloseTo(30_000 * Math.pow(2.56, 1.8), 8)
    // The extracted control ends at 180°; larger imported values clamp there.
    expect(variableSensorResistance('sensorFlex', { bend: 360 })).toBeCloseTo(30_000 * Math.pow(2.56, 1.8), 8)
  })

  it('aceita a propriedade plana editada no painel e o valor canônico em ohms', () => {
    expect(variableSensorResistance('sensorFlex', { flatResistance: 68_000, bend: 0 })).toBeCloseTo(68_000, 8)
    expect(variableSensorResistance('sensorFlex', { 'libraryProperty:flat resistance': 47, bend: 0 })).toBeCloseTo(47_000, 8)
    expect(variableSensorControl('sensorFlex', { bend: 46.6 })).toMatchObject({
      property: 'bend', min: 0, max: 180, step: 1, value: 47,
    })
  })
})
