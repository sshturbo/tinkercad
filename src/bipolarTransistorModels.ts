/**
 * BJT contracts transcribed from the extracted NPN/PNP simulation models and
 * their shared AnalogModel primitive. These descriptors intentionally do not
 * implement or approximate the nonlinear solver equations.
 *
 * The primitive is an Ebers–Moll style two-junction model. Its extracted
 * implementation uses a 25.8 mV thermal voltage and linear continuations once
 * either exponential junction current reaches the numeric thresholds below.
 */

export const BIPOLAR_TRANSISTOR_MODELS = ['npn', 'pnp'] as const
export type BipolarTransistorModel = typeof BIPOLAR_TRANSISTOR_MODELS[number]
export type BipolarTransistorProperties = Readonly<Record<string, unknown>>

export interface BipolarTransistorDescriptor {
  model: BipolarTransistorModel
  /** `addNPN(base, emitter, collector)` / `addPNP(base, emitter, collector)`. */
  terminals: Readonly<{ base: 'B'; emitter: 'E'; collector: 'C' }>
  baseEmitterJunction: Readonly<{
    saturationCurrentA: number
    exponentialVoltageLimitV: number
    linearSlopeS: number
    linearInterceptA: number
  }>
  baseCollectorJunction: Readonly<{
    saturationCurrentA: number
    exponentialVoltageLimitV: number
    linearSlopeS: number
    linearInterceptA: number
  }>
  thermalVoltageV: 0.0258
  forwardTransportFactor: number
  reverseTransportFactor: number
}

const descriptorByModel: Readonly<Record<BipolarTransistorModel, BipolarTransistorDescriptor>> = {
  npn: {
    model: 'npn',
    terminals: { base: 'B', emitter: 'E', collector: 'C' },
    baseEmitterJunction: {
      saturationCurrentA: 239e-16,
      exponentialVoltageLimitV: 1.046841148,
      linearSlopeS: 387596.8922,
      linearInterceptA: -395752.3758,
    },
    baseCollectorJunction: {
      saturationCurrentA: 271e-16,
      exponentialVoltageLimitV: 1.043599242,
      linearSlopeS: 387596.8919,
      linearInterceptA: -394495.8228,
    },
    thermalVoltageV: 0.0258,
    forwardTransportFactor: 0.9966,
    reverseTransportFactor: 0.88,
  },
  pnp: {
    model: 'pnp',
    terminals: { base: 'B', emitter: 'E', collector: 'C' },
    baseEmitterJunction: {
      saturationCurrentA: 384e-16,
      exponentialVoltageLimitV: 1.03460733,
      linearSlopeS: 387596.8964,
      linearInterceptA: -391010.5902,
    },
    baseCollectorJunction: {
      saturationCurrentA: 40885e-18,
      exponentialVoltageLimitV: 1.032989521,
      linearSlopeS: 387596.9033,
      linearInterceptA: -390383.5394,
    },
    thermalVoltageV: 0.0258,
    forwardTransportFactor: 0.997,
    reverseTransportFactor: 0.9369,
  },
}

const modelSet: ReadonlySet<string> = new Set(BIPOLAR_TRANSISTOR_MODELS)

/** True only for the extracted, ordinary NPN and PNP models. */
export function isBipolarTransistorModel(model: unknown): model is BipolarTransistorModel {
  return typeof model === 'string' && modelSet.has(model.trim())
}

/** Return a fresh descriptor for a recognized model; properties do not alter the extracted primitive. */
export function getBipolarTransistorModel(
  model: unknown,
  _properties: BipolarTransistorProperties = {},
): BipolarTransistorDescriptor | undefined {
  if (!isBipolarTransistorModel(model)) return undefined
  const descriptor = descriptorByModel[model.trim() as BipolarTransistorModel]
  return {
    ...descriptor,
    terminals: { ...descriptor.terminals },
    baseEmitterJunction: { ...descriptor.baseEmitterJunction },
    baseCollectorJunction: { ...descriptor.baseCollectorJunction },
  }
}

/**
 * The Circuit Scribe NPN uses the same NPN primitive plus explicit external
 * branches in its extracted module; it is not electrically identical to the
 * ordinary three-terminal NPN component.
 */
export const CIRCUIT_SCRIBE_NPN_MODEL = Object.freeze({
  id: 'circuitScribe_NPN',
  source: 'tinkercad-engine-complete-extracted/models/circuitScribe_NPN--module-45932.js',
  terminals: Object.freeze({ emitter: 'E', base: 'B', collector: 'C' }),
  transistor: Object.freeze({
    model: 'npn' as const,
    base: 'internalBase',
    emitter: 'E' as const,
    collector: 'C' as const,
  }),
  internalBaseNet: 'circuitScribe_NPN_basenet',
  baseSeriesResistanceOhms: 1000,
  addedDiodes: Object.freeze([
    Object.freeze({ anode: 'E' as const, cathode: 'C' as const, saturationCurrentA: 2e-5, thermalVoltageV: 1.1 }),
    Object.freeze({ anode: 'E' as const, cathode: 'internalBase' as const, saturationCurrentA: 2e-5, thermalVoltageV: 1.1 }),
  ]),
})
