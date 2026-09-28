import { describe, expect, it } from 'vitest'
import {
  evaluateGasSensor,
  gasSensorLevelFromDistance,
  gasSensorLevelFromTargetPosition,
  gasSensorSignalResistanceOhms,
  gasSensorTargetDistance,
  GAS_SENSOR_MODEL,
} from './gasSensorModel'

describe('modelo extraído do sensor de gás', () => {
  it('registra módulo, aliases, resistências e geometria do alvo', () => {
    expect(GAS_SENSOR_MODEL).toMatchObject({
      id: 'sensor_gas',
      moduleSource: 'tinkercad-engine-complete-extracted/models/sensor_gas--module-58766.js',
      terminals: { sensorA: ['A1', 'A2'], sensorB: ['B1', 'B2'], heater: ['H1', 'H2'] },
      mergedTerminalPairs: [['A1', 'A2'], ['B1', 'B2']],
      heaterResistanceOhms: 26,
      sensingResistanceOhms: {
        lowHeaterVoltageOhms: 11_000,
        heaterVoltageStartV: 4,
        heaterVoltageCapV: 5.1,
        voltageCoefficientOhmsPerV: 9_350,
      },
      target: {
        defaultPosition: { x: 0, y: -200 },
        origin: { x: 0, y: 0 },
        maximumDistanceGraphicalUnits: 250,
      },
      operatingLimits: { maximumAbsoluteHeaterVoltageV: 5.1 },
    })
    expect(gasSensorTargetDistance(GAS_SENSOR_MODEL.target.defaultPosition)).toBe(200)
    expect(gasSensorLevelFromTargetPosition()).toBeCloseTo(0.2, 12)
  })

  it('calcula sensorLevel radialmente a partir da origem e limita em 250 unidades', () => {
    expect(gasSensorLevelFromDistance(0)).toBe(1)
    expect(gasSensorLevelFromDistance(125)).toBe(0.5)
    expect(gasSensorLevelFromDistance(200)).toBeCloseTo(0.2, 12)
    expect(gasSensorLevelFromDistance(250)).toBe(0)
    expect(gasSensorLevelFromDistance(250.001)).toBe(0)
    expect(gasSensorLevelFromDistance(Number.NaN)).toBe(0)
    expect(gasSensorLevelFromTargetPosition({ x: 150, y: 200 })).toBe(0)
  })

  it('usa 11 kΩ abaixo e exatamente em 4 V, com a regra do intervalo linear', () => {
    expect(gasSensorSignalResistanceOhms(3.99, 1)).toBe(11_000)
    expect(gasSensorSignalResistanceOhms(4, 1)).toBe(11_000)
    expect(gasSensorSignalResistanceOhms(5, 1)).toBe(1_650)
    expect(gasSensorSignalResistanceOhms(5, 0.2)).toBe(9_130)
    expect(gasSensorSignalResistanceOhms(5, 0)).toBe(11_000)
  })

  it('capa a equação em 5.1 V e só marca breakdown estritamente acima do limite', () => {
    const atLimit = evaluateGasSensor({ heaterVoltageV: 5.1, sensorLevel: 1 })
    expect(atLimit.signalResistanceOhms).toBeCloseTo(715, 10)
    expect(atLimit.breakdown).toBe(false)

    const above = evaluateGasSensor({ heaterVoltageV: 5.1001, sensorLevel: 1 })
    expect(above.signalResistanceOhms).toBe(atLimit.signalResistanceOhms)
    expect(above.breakdown).toBe(true)

    const reverseAbove = evaluateGasSensor({ heaterVoltageV: -5.1001, sensorLevel: 0 })
    expect(reverseAbove.signalResistanceOhms).toBe(11_000)
    expect(reverseAbove.breakdown).toBe(true)

    expect(evaluateGasSensor({ heaterVoltageV: -5.1, sensorLevel: 1 }).breakdown).toBe(false)
  })

  it('usa alvo padrão (0, -200) se não houver nível ou distância explícita', () => {
    expect(evaluateGasSensor({ heaterVoltageV: 5 }).sensorLevel).toBeCloseTo(0.2, 12)
    expect(evaluateGasSensor({ heaterVoltageV: 5 }).signalResistanceOhms).toBeCloseTo(9_130, 10)
    expect(evaluateGasSensor({ heaterVoltageV: 5, targetDistance: 0 }).sensorLevel).toBe(1)
    expect(evaluateGasSensor({ heaterVoltageV: 5, sensorLevel: 0, targetDistance: 0 }).sensorLevel).toBe(0)
  })

  it('clampa o nível explícito ao intervalo físico e trata tensão não finita como zero', () => {
    expect(evaluateGasSensor({ heaterVoltageV: 5, sensorLevel: -1 }).sensorLevel).toBe(0)
    expect(evaluateGasSensor({ heaterVoltageV: 5, sensorLevel: 2 }).sensorLevel).toBe(1)
    expect(evaluateGasSensor({ heaterVoltageV: Number.NaN, sensorLevel: 1 })).toMatchObject({
      heaterVoltageV: 0,
      heaterVoltageMagnitudeV: 0,
      signalResistanceOhms: 11_000,
      breakdown: false,
    })
  })
})
