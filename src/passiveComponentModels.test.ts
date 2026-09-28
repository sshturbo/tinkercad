import { describe, expect, it } from 'vitest'
import {
  checkPolarizedCapacitorVoltage,
  getPassiveComponentModel,
  isPassiveComponentModel,
  PASSIVE_COMPONENT_MODELS,
} from './passiveComponentModels'

describe('modelos passivos extraídos', () => {
  it('lista e identifica apenas capacitor, capacitor polarizado e indutor', () => {
    expect(PASSIVE_COMPONENT_MODELS).toEqual(['capacitor', 'capacitor_polarized', 'inductor'])
    for (const model of PASSIVE_COMPONENT_MODELS) expect(isPassiveComponentModel(model)).toBe(true)
    expect(isPassiveComponentModel('Capacitor')).toBe(false)
    expect(isPassiveComponentModel(undefined)).toBe(false)
    expect(getPassiveComponentModel('unknown')).toBeUndefined()
  })

  it('usa 0 F e ESR de 10 mΩ no capacitor comum quando não há propriedades', () => {
    expect(getPassiveComponentModel('capacitor')).toEqual({
      model: 'capacitor', kind: 'capacitor', terminals: ['1', '2'],
      capacitanceF: 0, seriesResistanceOhms: 0.01,
    })
    expect(getPassiveComponentModel('capacitor', { capacitance: 2.2e-6 })).toMatchObject({
      capacitanceF: 2.2e-6, seriesResistanceOhms: 0.01,
    })
  })

  it('converte aliases de catálogo para SI e dá precedência às propriedades canônicas', () => {
    const ordinaryCapacitor = getPassiveComponentModel('capacitor', { 'libraryProperty:capacitance': 100 })
    const polarizedCapacitor = getPassiveComponentModel('capacitor_polarized', { 'libraryProperty:Capacitance': '47' })
    expect(ordinaryCapacitor && 'capacitanceF' in ordinaryCapacitor ? ordinaryCapacitor.capacitanceF : undefined)
      .toBeCloseTo(100e-9, 15)
    expect(polarizedCapacitor && 'capacitanceF' in polarizedCapacitor ? polarizedCapacitor.capacitanceF : undefined)
      .toBeCloseTo(47e-6, 15)
    expect(getPassiveComponentModel('capacitor_polarized', {
      capacitanceF: 4.7e-6,
      'libraryProperty:capacitance': 47,
    })).toMatchObject({ capacitanceF: 4.7e-6 })
    const inductor = getPassiveComponentModel('inductor', { 'libraryProperty:inductance': '220' })
    expect(inductor && 'inductanceH' in inductor ? inductor.inductanceH : undefined)
      .toBeCloseTo(220e-6, 15)
    expect(getPassiveComponentModel('inductor', { inductance: 0.0033 }))
      .toMatchObject({ inductanceH: 0.0033 })
  })

  it('mantém o capacitor polarizado orientado sem inventar rating ausente', () => {
    const descriptor = getPassiveComponentModel('capacitor_polarized')
    expect(descriptor).toMatchObject({
      kind: 'polarized-capacitor',
      terminals: { positive: '+', negative: '-' },
      capacitanceF: 0,
      seriesResistanceOhms: 0.01,
    })
    expect(descriptor && 'voltageRatingV' in descriptor).toBe(false)
    expect(checkPolarizedCapacitorVoltage({}, 100)).toEqual({
      reversePolarity: false, overVoltage: undefined, breakdown: false,
    })
    expect(checkPolarizedCapacitorVoltage({}, -0.1)).toEqual({
      reversePolarity: true, overVoltage: undefined, breakdown: true,
    })
  })

  it('lê a tensão nominal em volts e aplica os limites de polaridade/rating extraídos', () => {
    const props = { 'libraryProperty:voltage rating': '16' }
    expect(getPassiveComponentModel('capacitor_polarized', props)).toMatchObject({ voltageRatingV: 16 })
    expect(checkPolarizedCapacitorVoltage(props, 16)).toEqual({
      reversePolarity: false, overVoltage: false, breakdown: false, voltageRatingV: 16,
    })
    expect(checkPolarizedCapacitorVoltage(props, 16.01)).toEqual({
      reversePolarity: false, overVoltage: true, breakdown: true, voltageRatingV: 16,
    })
    expect(checkPolarizedCapacitorVoltage({ voltageRatingV: 16 }, -1)).toEqual({
      reversePolarity: true, overVoltage: false, breakdown: true, voltageRatingV: 16,
    })
    expect(checkPolarizedCapacitorVoltage({}, Number.NaN)).toBeUndefined()
  })

  it('descreve o indutor extraído como ideal e sem resistência série inventada', () => {
    expect(getPassiveComponentModel('inductor')).toEqual({
      model: 'inductor', kind: 'inductor', terminals: ['1', '2'],
      inductanceH: 0, ideal: true, seriesResistanceOhms: 0,
    })
  })
})
