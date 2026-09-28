import { describe, expect, it } from 'vitest'
import {
  BIPOLAR_TRANSISTOR_MODELS,
  CIRCUIT_SCRIBE_NPN_MODEL,
  getBipolarTransistorModel,
  isBipolarTransistorModel,
} from './bipolarTransistorModels'

describe('extracted bipolar transistor descriptors', () => {
  it('recognizes only the extracted ordinary NPN and PNP models', () => {
    expect(BIPOLAR_TRANSISTOR_MODELS).toEqual(['npn', 'pnp'])
    expect(isBipolarTransistorModel('npn')).toBe(true)
    expect(isBipolarTransistorModel(' pnp ')).toBe(true)
    expect(isBipolarTransistorModel('mosfet')).toBe(false)
    expect(getBipolarTransistorModel('unknown')).toBeUndefined()
  })

  it('preserves the addNPN(base, emitter, collector) contract and parameters', () => {
    const npn = getBipolarTransistorModel('npn')!
    expect(npn.terminals).toEqual({ base: 'B', emitter: 'E', collector: 'C' })
    expect(npn.thermalVoltageV).toBe(0.0258)
    expect(npn.forwardTransportFactor).toBe(0.9966)
    expect(npn.reverseTransportFactor).toBe(0.88)
    expect(npn.baseEmitterJunction).toEqual({
      saturationCurrentA: 239e-16,
      exponentialVoltageLimitV: 1.046841148,
      linearSlopeS: 387596.8922,
      linearInterceptA: -395752.3758,
    })
    expect(npn.baseCollectorJunction).toEqual({
      saturationCurrentA: 271e-16,
      exponentialVoltageLimitV: 1.043599242,
      linearSlopeS: 387596.8919,
      linearInterceptA: -394495.8228,
    })
  })

  it('preserves the addPNP(base, emitter, collector) contract and parameters', () => {
    const pnp = getBipolarTransistorModel('pnp')!
    expect(pnp.terminals).toEqual({ base: 'B', emitter: 'E', collector: 'C' })
    expect(pnp.thermalVoltageV).toBe(0.0258)
    expect(pnp.forwardTransportFactor).toBe(0.997)
    expect(pnp.reverseTransportFactor).toBe(0.9369)
    expect(pnp.baseEmitterJunction).toEqual({
      saturationCurrentA: 384e-16,
      exponentialVoltageLimitV: 1.03460733,
      linearSlopeS: 387596.8964,
      linearInterceptA: -391010.5902,
    })
    expect(pnp.baseCollectorJunction).toEqual({
      saturationCurrentA: 40885e-18,
      exponentialVoltageLimitV: 1.032989521,
      linearSlopeS: 387596.9033,
      linearInterceptA: -390383.5394,
    })
  })

  it('returns isolated descriptor objects so callers cannot mutate shared model data', () => {
    const first = getBipolarTransistorModel('npn')!
    Object.assign(first.baseEmitterJunction, { saturationCurrentA: 9 })
    expect(getBipolarTransistorModel('npn')!.baseEmitterJunction.saturationCurrentA).toBe(239e-16)
  })

  it('records the Circuit Scribe NPN composite topology separately', () => {
    expect(CIRCUIT_SCRIBE_NPN_MODEL.terminals).toEqual({ emitter: 'E', base: 'B', collector: 'C' })
    expect(CIRCUIT_SCRIBE_NPN_MODEL.transistor).toEqual({
      model: 'npn', base: 'internalBase', emitter: 'E', collector: 'C',
    })
    expect(CIRCUIT_SCRIBE_NPN_MODEL.internalBaseNet).toBe('circuitScribe_NPN_basenet')
    expect(CIRCUIT_SCRIBE_NPN_MODEL.baseSeriesResistanceOhms).toBe(1000)
    expect(CIRCUIT_SCRIBE_NPN_MODEL.addedDiodes).toEqual([
      { anode: 'E', cathode: 'C', saturationCurrentA: 2e-5, thermalVoltageV: 1.1 },
      { anode: 'E', cathode: 'internalBase', saturationCurrentA: 2e-5, thermalVoltageV: 1.1 },
    ])
  })
})
