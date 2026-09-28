import { describe, expect, it } from 'vitest'
import { evaluateLightBulb, LIGHT_BULB_MODEL } from './lightBulbModel'

describe('modelo extraído da lâmpada incandescente', () => {
  it('usa os dois terminais e a resistência elétrica fixa de 48 ohms', () => {
    expect(LIGHT_BULB_MODEL).toMatchObject({
      id: 'lightBulb', terminals: ['1', '2'], resistanceOhms: 48,
      source: 'tinkercad-engine-complete-extracted/models/lightBulb--module-9482.js',
    })
  })

  it('mapeia linearmente o módulo da corrente para brilho até 0.25 A', () => {
    expect(evaluateLightBulb(0)).toMatchObject({ currentMagnitudeA: 0, brightness: 0, breakdown: false })
    expect(evaluateLightBulb(0.125)).toMatchObject({ currentMagnitudeA: 0.125, brightness: 0.5, breakdown: false })
    expect(evaluateLightBulb(0.25)).toMatchObject({ currentMagnitudeA: 0.25, brightness: 1, breakdown: false })
  })

  it('usa o módulo da corrente e satura o brilho quando há sobrecorrente', () => {
    expect(evaluateLightBulb(-0.125)).toMatchObject({ currentMagnitudeA: 0.125, brightness: 0.5, breakdown: false })
    expect(evaluateLightBulb(-0.3)).toMatchObject({ currentMagnitudeA: 0.3, brightness: 1, breakdown: true })
    expect(evaluateLightBulb(1)).toMatchObject({ currentMagnitudeA: 1, brightness: 1, breakdown: true })
  })

  it('trata corrente NaN como zero sem contaminar brilho ou breakdown', () => {
    expect(evaluateLightBulb(Number.NaN)).toEqual({ currentMagnitudeA: 0, brightness: 0, breakdown: false })
  })
})
