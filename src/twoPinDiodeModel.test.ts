import { describe, expect, it } from 'vitest'
import { evaluateTwoPinLed, getTwoPinDiodeDescriptor, shockleyDiodeCurrentA, shockleyDiodeCurrentWithContinuationA, TWO_PIN_DIODE_MODEL } from './twoPinDiodeModel'

describe('modelos Shockley para diodo e LED de dois pinos', () => {
  it('descreve o diodo extraído sem queda fixa nem resistência série', () => {
    expect(getTwoPinDiodeDescriptor('diode')).toMatchObject({ saturationCurrentA: 1e-12, idealityFactor: 1, seriesResistanceOhms: 0, thermalVoltageV: 0.0258 })
    expect(TWO_PIN_DIODE_MODEL.diode.moduleSource).toContain('diode--module-8338.js')
  })

  it('mapeia Is, resistor série e idealidade dos LEDs extraídos por cor', () => {
    expect(TWO_PIN_DIODE_MODEL.led.seriesResistanceOhms).toBe(6)
    expect(getTwoPinDiodeDescriptor('led', 'red')).toMatchObject({ saturationCurrentA: 1e-20, idealityFactor: 1.8, seriesResistanceOhms: 6 })
    expect(getTwoPinDiodeDescriptor('led', 'orange').idealityFactor).toBe(1.93)
    expect(getTwoPinDiodeDescriptor('led', 'yellow').idealityFactor).toBe(1.95)
    expect(getTwoPinDiodeDescriptor('led', 'green').idealityFactor).toBe(2.2)
    expect(getTwoPinDiodeDescriptor('led', 'blue').idealityFactor).toBe(3.45)
    expect(getTwoPinDiodeDescriptor('led', 'white').idealityFactor).toBe(3.1)
    expect(getTwoPinDiodeDescriptor('led', 'unknown').idealityFactor).toBe(1.8)
  })

  it('segue Shockley nos sweeps forward e reverso dentro da janela numérica', () => {
    const diode = getTwoPinDiodeDescriptor('diode')
    for (const voltage of [-0.5, -0.1, 0, 0.1, 0.3, 0.55, 0.8]) {
      expect(shockleyDiodeCurrentA(voltage, diode)).toBeCloseTo(1e-12 * Math.expm1(voltage / 0.0258), 18)
      expect(shockleyDiodeCurrentWithContinuationA(voltage, diode)).toBeCloseTo(shockleyDiodeCurrentA(voltage, diode), 16)
    }
    const led = getTwoPinDiodeDescriptor('led', 'red')
    for (const voltage of [-0.5, 0, 1.5, 1.8, 2, 2.1]) {
      expect(shockleyDiodeCurrentWithContinuationA(voltage, led)).toBeCloseTo(shockleyDiodeCurrentA(voltage, led), 12)
    }
  })

  it('aplica os limites literais de brilho, warning e breakdown do LED', () => {
    expect(evaluateTwoPinLed(0.02)).toMatchObject({ brightness: 1, warning: false, breakdown: false })
    expect(evaluateTwoPinLed(0.020001)).toMatchObject({ brightness: 1, warning: true, breakdown: false })
    expect(evaluateTwoPinLed(0.119999)).toMatchObject({ brightness: 1, warning: true, breakdown: false })
    expect(evaluateTwoPinLed(0.12)).toMatchObject({ brightness: 1, warning: false, breakdown: true })
    expect(evaluateTwoPinLed(0.120001)).toMatchObject({ brightness: 1, warning: false, breakdown: true })
    expect(evaluateTwoPinLed(-0.01)).toMatchObject({ brightness: -0.5, warning: false, breakdown: false })
  })
})
