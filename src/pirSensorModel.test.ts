import { describe, expect, it } from 'vitest'
import {
  createPIRSensorTopology,
  evaluatePIRSensorTarget,
  pirSensorDrivePulseOnTransition,
  pirSensorPowerValid,
  pirSensorTargetFromPolar,
  resetPIRSensorRuntimeEdges,
  PIR_SENSOR_MODEL,
  resolvePIRSensorTargetPosition,
} from './pirSensorModel'

describe('modelo extraído do sensor PIR', () => {
  it('descreve terminais, rede resistiva e limites extraídos', () => {
    expect(PIR_SENSOR_MODEL).toMatchObject({
      id: 'sensor_pir',
      moduleSource: 'tinkercad-engine-complete-extracted/models/sensor_pir--module-61384.js',
      terminals: {
        vcc: { engine: 'vcc', breadboard: 'Power', schematic: 'vcc' },
        ground: { engine: 'gnd', breadboard: 'Ground', schematic: 'gnd' },
        output: { engine: 'out', breadboard: 'Signal', schematic: 'out' },
      },
      power: { resistorOhms: 5 / 0.023, minimumVoltageV: 3, maximumVoltageV: 6 },
      output: { activePullupOhms: 100, inactivePullupOhms: 1e10, groundShuntOhms: 20_000, triggerVoltageV: 2 },
      target: {
        defaultPosition: { x: 0, y: -200 }, rangeMinimumGraphicalUnits: 100,
        rangeMaximumGraphicalUnits: 400, viewAngleMinimumDegrees: 240, viewAngleMaximumDegrees: 300,
      },
      drivePulse: { activeValue: 1, inactiveValue: 0, transitionFrom: 0, transitionTo: 1, durationEngineTicks: 1 },
    })
    expect(resolvePIRSensorTargetPosition()).toEqual({ x: 0, y: -200 })
    expect(resolvePIRSensorTargetPosition({ 'libraryProperty:Target X': 15, 'libraryProperty:Target Y': -125 })).toEqual({ x: 15, y: -125 })
    expect(resolvePIRSensorTargetPosition({ 'libraryProperty:Target X': 15 })).toEqual({ x: 0, y: -200 })
  })

  it('aplica as faixas radiais inclusivas, distância normalizada e janela angular', () => {
    expect(evaluatePIRSensorTarget({ x: 0, y: -99 }).inRange).toBe(false)
    expect(evaluatePIRSensorTarget({ x: 0, y: -100 })).toMatchObject({ inRange: true, normalizedDistance: 0, angleDegrees: 270 })
    expect(evaluatePIRSensorTarget({ x: 0, y: -400 })).toMatchObject({ inRange: true, normalizedDistance: 1, angleDegrees: 270 })
    expect(evaluatePIRSensorTarget({ x: 0, y: -401 }).inRange).toBe(false)
    expect(evaluatePIRSensorTarget({ x: 0, y: -200 })).toMatchObject({ inRange: true, normalizedDistance: 1 / 3 })
    expect(evaluatePIRSensorTarget(pirSensorTargetFromPolar(200, 240)).inRange).toBe(true)
    expect(evaluatePIRSensorTarget(pirSensorTargetFromPolar(200, 300)).inRange).toBe(true)
    expect(evaluatePIRSensorTarget(pirSensorTargetFromPolar(200, 239.999)).inRange).toBe(false)
    expect(evaluatePIRSensorTarget(pirSensorTargetFromPolar(200, 300.001)).inRange).toBe(false)
    expect(evaluatePIRSensorTarget({ x: Number.NaN, y: 1 })).toMatchObject({ inRange: false, normalizedDistance: -1 })
  })

  it('aceita power apenas entre 3 e 6 V, inclusive', () => {
    for (const voltage of [3, 4.5, 6]) expect(pirSensorPowerValid(voltage)).toBe(true)
    for (const voltage of [2.999, 6.001, -5, Number.NaN]) expect(pirSensorPowerValid(voltage)).toBe(false)
  })

  it('altera pullup somente em pulso e power válidos, preservando os outros dois resistores', () => {
    expect(createPIRSensorTopology(5, true)).toEqual({
      powered: true, drive: true, outputDriven: true, pullupResistanceOhms: 100,
      branches: [
        { name: 'powerShunt', from: 'vcc', to: 'gnd', resistanceOhms: 5 / 0.023 },
        { name: 'pullup', from: 'vcc', to: 'out', resistanceOhms: 100 },
        { name: 'outputShunt', from: 'out', to: 'gnd', resistanceOhms: 20_000 },
      ],
    })
    expect(createPIRSensorTopology(5, false).pullupResistanceOhms).toBe(1e10)
    expect(createPIRSensorTopology(2.999, true).pullupResistanceOhms).toBe(1e10)
    expect(createPIRSensorTopology(6.001, true).pullupResistanceOhms).toBe(1e10)
  })

  it('limpa bordas e pulsos ao parar preservando a posição temporária do alvo', () => {
    const position = { x: 12, y: -180 }
    expect(resetPIRSensorRuntimeEdges({ pirTargetPositions: { pir: position }, pirInRange: { pir: true }, pirDrivePulses: { pir: 1 } })).toEqual({
      pirTargetPositions: { pir: position }, pirInRange: {}, pirDrivePulses: {},
    })
  })

  it('gera pulso nas transições para dentro e para fora e não gera pulso dentro de um estado estável', () => {
    expect(pirSensorDrivePulseOnTransition(null, true)).toBe(true)
    expect(pirSensorDrivePulseOnTransition(false, true)).toBe(true)
    expect(pirSensorDrivePulseOnTransition(true, false)).toBe(true)
    expect(pirSensorDrivePulseOnTransition(true, true)).toBe(false)
    expect(pirSensorDrivePulseOnTransition(false, false)).toBe(false)
    expect(pirSensorDrivePulseOnTransition(null, false)).toBe(false)
  })
})
