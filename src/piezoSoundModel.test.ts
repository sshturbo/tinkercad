import { describe, expect, it } from 'vitest'
import { evaluatePiezoSound, PIEZO_SOUND_MODEL } from './piezoSoundModel'

describe('modelo elétrico do piezo extraído', () => {
  it('identifica os terminais e o resistor de 600 ohms do módulo local', () => {
    expect(PIEZO_SOUND_MODEL).toMatchObject({
      id: 'piezoSound',
      moduleSource: 'tinkercad-engine-complete-extracted/engine/core/module-97250.js',
      terminals: {
        positive: { engine: '+', breadboard: 'Positive', schematic: '+' },
        negative: { engine: '-', breadboard: 'Negative', schematic: '-' },
      },
      resistanceOhms: 600,
      breakdownVoltageSampleFloorV: 0.001,
      breakdownVoltageV: 25,
    })
  })

  it('calcula corrente assinada, potência resistiva e indicador visual separado de acústica', () => {
    expect(evaluatePiezoSound(12)).toEqual({
      voltageV: 12,
      voltageForBreakdownCheckV: 12,
      currentA: 0.02,
      dissipatedPowerW: 0.24,
      voltageIndicatorFraction: 12 / 25,
      breakdown: false,
    })
    expect(evaluatePiezoSound(-12)).toMatchObject({ voltageV: -12, currentA: -0.02, dissipatedPowerW: 0.24, breakdown: false })
    expect(evaluatePiezoSound(12).voltageIndicatorFraction).toBeCloseTo(0.48)
    expect(evaluatePiezoSound(-12).voltageIndicatorFraction).toBeCloseTo(0.48)
  })

  it('usa limiar de 1 mV apenas para a comparação de breakdown e mantém corrente do ramo', () => {
    expect(evaluatePiezoSound(0.0009)).toMatchObject({ voltageForBreakdownCheckV: 0, currentA: 0.0009 / 600, breakdown: false })
    expect(evaluatePiezoSound(0.001)).toMatchObject({ voltageForBreakdownCheckV: 0.001, breakdown: false })
    expect(evaluatePiezoSound(-0.001)).toMatchObject({ voltageForBreakdownCheckV: 0, currentA: -0.001 / 600, breakdown: false })
  })

  it('avisa somente acima de +25 V, sem usar magnitude nem limitar o resistor', () => {
    expect(evaluatePiezoSound(25)).toMatchObject({ voltageV: 25, currentA: 25 / 600, breakdown: false })
    expect(evaluatePiezoSound(25.0001)).toMatchObject({ voltageV: 25.0001, currentA: 25.0001 / 600, breakdown: true })
    expect(evaluatePiezoSound(-25.0001)).toMatchObject({ voltageV: -25.0001, currentA: -25.0001 / 600, breakdown: false })
    expect(evaluatePiezoSound(50).voltageIndicatorFraction).toBe(1)
  })

  it('sanitiza tensão não finita sem inventar saída de áudio', () => {
    expect(evaluatePiezoSound(Number.NaN)).toMatchObject({ voltageV: 0, currentA: 0, dissipatedPowerW: 0, voltageIndicatorFraction: 0, breakdown: false })
  })
})
