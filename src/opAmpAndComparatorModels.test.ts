import { describe, expect, it } from 'vitest'
import {
  evaluateComparatorTrigger,
  getComparatorModel,
  getComparatorOutputBasePullupResistanceOhms,
  getOpAmpNewtonTerms,
  isComparatorOutputTransistorConducting,
  UA741_MODEL,
} from './opAmpAndComparatorModels'

describe('descritores extraídos de amplificador operacional e comparadores', () => {
  it('descreve os pinos e parâmetros efetivamente passados ao modelo UA741', () => {
    expect(UA741_MODEL).toMatchObject({
      id: 'opAmp_UA741',
      terminals: {
        nonInvertingInput: 'V+', invertingInput: 'V-',
        positiveSupply: 'Vcc', negativeSupply: 'Gnd', output: 'OUT',
        offset1: 'Offset1', offset2: 'Offset2', noConnect: 'Nc',
      },
      inputResistanceOhms: 2e6,
      inputReferenceLeakageOhms: 1e10,
      outputResistanceOhms: 75,
      openLoopGain: 2e5,
    })
    expect(UA741_MODEL.supplyLoadResistanceOhms).toBeCloseTo(9090.9090909, 6)
  })

  it('calcula os coeficientes pequenos-sinais extraídos perto do equilíbrio', () => {
    const terms = getOpAmpNewtonTerms(0, 15, -15)
    expect(terms).toMatchObject({
      supplySpanV: 30,
      differentialInputV: 0,
      normalizedDrive: 0,
      saturation: 0,
      biasCurrentA: -0.2,
      differentialCoefficientAperV: -2e5 / 75,
      supplyCoefficientAperV: -1 / 150,
    })
  })

  it('satura a saída suave nos dois extremos do ganho aberto', () => {
    const positive = getOpAmpNewtonTerms(0.001, 15, -15)
    const negative = getOpAmpNewtonTerms(-0.001, 15, -15)
    expect(positive.saturation).toBe(1)
    expect(positive.biasCurrentA).toBeCloseTo(-0.4, 12)
    expect(positive.differentialCoefficientAperV).toBeCloseTo(0, 12)
    expect(negative.saturation).toBe(-1)
    expect(negative.biasCurrentA).toBeCloseTo(0, 12)
    expect(negative.differentialCoefficientAperV).toBeCloseTo(0, 12)
  })

  it('desativa o bloco não linear quando a alimentação positiva não supera a negativa', () => {
    expect(getOpAmpNewtonTerms(1, 0, 5)).toMatchObject({
      supplySpanV: -5,
      saturation: 0,
      biasCurrentA: 0,
      differentialCoefficientAperV: 0,
      supplyCoefficientAperV: 0,
    })
  })

  it('descreve os canais e os estados reais da rede open-collector', () => {
    expect(getComparatorModel('lm393')).toMatchObject({
      channelNumbers: ['1', '2'],
      supplyLoadResistanceOhms: 8333,
      inputLeakResistanceOhms: 1e10,
      limits: { maximumSupplyVoltageV: 36, maximumAbsoluteOutputCurrentA: 0.02 },
      outputArchitecture: {
        type: 'open-collector NPN',
        outputSeriesResistanceOhms: 0.001,
        pullupFromVccToBaseOhmsByTriggerState: {
          triggerHigh: 1e10,
          triggerLow: 100e3,
        },
        baseToGroundResistanceOhms: 100e3,
      },
    })
    expect(getComparatorModel('lm339')).toMatchObject({
      channelNumbers: ['1', '2', '3', '4'],
      supplyLoadResistanceOhms: 6250,
      limits: { maximumSupplyVoltageV: 36, maximumAbsoluteOutputCurrentA: 0.02 },
      outputArchitecture: {
        outputSeriesResistanceOhms: 0.001,
        pullupFromVccToBaseOhmsByTriggerState: {
          triggerHigh: 1e10,
          triggerLow: 100,
        },
        baseToGroundResistanceOhms: 100e3,
      },
    })
    expect(getComparatorModel('lm339')?.outputTerminal('4')).toBe('output4')
    expect(getComparatorModel('lm393')?.inputPositiveTerminal('2')).toBe('input2_pos')
    expect(getComparatorModel('other')).toBeUndefined()
  })

  it('seleciona o pullup correto para cada estado do trigger por modelo', () => {
    expect(getComparatorOutputBasePullupResistanceOhms('lm393', true)).toBe(10e9)
    expect(getComparatorOutputBasePullupResistanceOhms('lm393', false)).toBe(100e3)
    expect(getComparatorOutputBasePullupResistanceOhms('lm339', true)).toBe(10e9)
    expect(getComparatorOutputBasePullupResistanceOhms('lm339', false)).toBe(100)
    expect(getComparatorOutputBasePullupResistanceOhms('other', false)).toBeUndefined()
  })

  it('preserva o limiar estrito de 2 V e o sentido do transistor de saída', () => {
    expect(evaluateComparatorTrigger(2.01, 2, 5, 0)).toBe(true)
    expect(evaluateComparatorTrigger(2, 2, 5, 0)).toBe(false)
    expect(evaluateComparatorTrigger(3, 2, 2, 0)).toBe(false)
    expect(isComparatorOutputTransistorConducting(false)).toBe(true)
    expect(isComparatorOutputTransistorConducting(true)).toBe(false)
  })
})
