import { describe, expect, it } from 'vitest'
import { getZenerDiodeModel, ZENER_DIODE_MODEL } from './zenerDiodeModel'

describe('modelo extraído do diodo Zener', () => {
  it('usa 5.1 V como valor padrão e fallback para propriedade ausente ou zero', () => {
    expect(getZenerDiodeModel().zenerVoltageV).toBe(5.1)
    expect(getZenerDiodeModel({}).zenerVoltageV).toBe(5.1)
    expect(getZenerDiodeModel({ 'zener voltage': 0 }).zenerVoltageV).toBe(5.1)
    expect(getZenerDiodeModel({ 'libraryProperty:zener voltage': '6.2' }).zenerVoltageV).toBeCloseTo(6.2)
  })

  it('sanitiza propriedade inválida sem produzir fonte não finita', () => {
    expect(getZenerDiodeModel({ 'zener voltage': Number.NaN }).zenerVoltageV).toBe(5.1)
    expect(getZenerDiodeModel({ 'zener voltage': 'bad' }).zenerVoltageV).toBe(5.1)
    expect(Number.isFinite(getZenerDiodeModel({ 'zener voltage': Infinity }).reverseBranch.source.voltageV)).toBe(true)
  })

  it('aceita valor customizado e subtrai 0.48 V na fonte reversa de C ao nó interno', () => {
    const model = getZenerDiodeModel({ 'zener voltage': 9.1 })
    expect(model.zenerVoltageV).toBeCloseTo(9.1)
    expect(model.reverseBranch.source).toEqual({
      positive: 'C', negative: 'reverse_inner_net_', voltageV: 8.62, resistanceOhms: 55,
    })
  })

  it('descreve os dois diodos com pinos e parâmetros extraídos', () => {
    const model = getZenerDiodeModel({ 'zener voltage': '3.3' })
    expect(model.forwardDiode).toEqual({
      anode: 'A', cathode: 'C', saturationCurrentA: 1e-12, idealityFactor: 1,
    })
    expect(model.reverseBranch.diode).toEqual({
      anode: 'reverse_inner_net_', cathode: 'A', saturationCurrentA: 1e-12, idealityFactor: 1,
    })
    expect(ZENER_DIODE_MODEL.source).toContain('zenerDiode--module-1660.js')
  })
})
