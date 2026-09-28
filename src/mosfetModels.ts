/**
 * Parameters copied from the extracted Tinkercad MOSFET simulation models:
 * `nmos--module-68610.js`, `pmos--module-87092.js`,
 * `power_nmos--module-24531.js`, and `power_pmos--module-53181.js`.
 *
 * These are level-1, three-terminal behavioral models, not fitted datasheet
 * models. The extracted analog engine evaluates a piecewise MOS channel with
 * channel-length modulation, a body diode, and a 1 TΩ gate-to-source leak.
 * The descriptor preserves those values so the local solver can implement
 * the same contract without coupling to extracted bundle code.
 */

export const MOSFET_MODELS = ['nmos', 'pmos', 'power_nmos', 'power_pmos'] as const
export type MOSFETModel = typeof MOSFET_MODELS[number]

export interface MOSFETDescriptor {
  model: MOSFETModel
  polarity: 'n-channel' | 'p-channel'
  size: 'small-signal' | 'power'
  /** Canonical terminal names used by the engine's `getNetbyTerminalName`. */
  terminals: Readonly<{ gate: 'gate'; source: 'source'; drain: 'drain' }>
  /** Signed threshold voltage; the extracted PMOS thresholds are negative. */
  thresholdVoltageV: number
  /** Extracted beta parameter in A/V² (without an additional scale factor). */
  betaAperV2: number
  /** Channel-length modulation factor lambda in V⁻¹. */
  channelLengthModulationPerV: 0.01
  /** Extracted body diode constants and high-voltage linear continuation. */
  bodyDiode: Readonly<{
    anode: 'source' | 'drain'
    cathode: 'source' | 'drain'
    saturationCurrentA: 1e-12
    thermalVoltageV: 0.0258
    emissionFactor: 0.9505071264
    linearContinuation: Readonly<{
      voltageV: 0.9505071264
      currentOffsetA: -358413.6156
      conductanceS: 387596.9
    }>
  }>
  /** The engine also connects a 1 TΩ resistor from gate to source. */
  gateSourceLeakageOhms: 1e12
  /** Circuit Library device identity, when present in the extracted catalog. */
  deviceId: '116838' | '116839' | '58627' | '59076'
  catalogId: '28784' | '28785' | '17924' | '18104'
  breadboardPins: Readonly<{
    gate: string
    drain: string
    source: string
  }>
}

const TERMINALS = Object.freeze({ gate: 'gate', source: 'source', drain: 'drain' } as const)
const BODY_DIODE_LINEAR_CONTINUATION = Object.freeze({
  voltageV: 0.9505071264,
  currentOffsetA: -358413.6156,
  conductanceS: 387596.9,
})

const descriptors: Readonly<Record<MOSFETModel, MOSFETDescriptor>> = Object.freeze({
  nmos: Object.freeze({
    model: 'nmos',
    polarity: 'n-channel',
    size: 'small-signal',
    terminals: TERMINALS,
    thresholdVoltageV: 0.7,
    betaAperV2: 0.006,
    channelLengthModulationPerV: 0.01,
    bodyDiode: Object.freeze({
      anode: 'source',
      cathode: 'drain',
      saturationCurrentA: 1e-12,
      thermalVoltageV: 0.0258,
      emissionFactor: 0.9505071264,
      linearContinuation: BODY_DIODE_LINEAR_CONTINUATION,
    }),
    gateSourceLeakageOhms: 1e12,
    deviceId: '116838',
    catalogId: '28784',
    breadboardPins: Object.freeze({ gate: 'Gate', drain: 'Drain', source: 'Source' }),
  }),
  pmos: Object.freeze({
    model: 'pmos',
    polarity: 'p-channel',
    size: 'small-signal',
    terminals: TERMINALS,
    thresholdVoltageV: -0.7,
    betaAperV2: 0.00192,
    channelLengthModulationPerV: 0.01,
    bodyDiode: Object.freeze({
      anode: 'drain',
      cathode: 'source',
      saturationCurrentA: 1e-12,
      thermalVoltageV: 0.0258,
      emissionFactor: 0.9505071264,
      linearContinuation: BODY_DIODE_LINEAR_CONTINUATION,
    }),
    gateSourceLeakageOhms: 1e12,
    deviceId: '116839',
    catalogId: '28785',
    breadboardPins: Object.freeze({ gate: 'Gate', drain: 'Drain', source: 'Source' }),
  }),
  power_nmos: Object.freeze({
    model: 'power_nmos',
    polarity: 'n-channel',
    size: 'power',
    terminals: TERMINALS,
    thresholdVoltageV: 2,
    betaAperV2: 1.1,
    channelLengthModulationPerV: 0.01,
    bodyDiode: Object.freeze({
      anode: 'source',
      cathode: 'drain',
      saturationCurrentA: 1e-12,
      thermalVoltageV: 0.0258,
      emissionFactor: 0.9505071264,
      linearContinuation: BODY_DIODE_LINEAR_CONTINUATION,
    }),
    gateSourceLeakageOhms: 1e12,
    deviceId: '58627',
    catalogId: '17924',
    breadboardPins: Object.freeze({ gate: 'Gate', drain: 'Drain', source: 'Source' }),
  }),
  power_pmos: Object.freeze({
    model: 'power_pmos',
    polarity: 'p-channel',
    size: 'power',
    terminals: TERMINALS,
    thresholdVoltageV: -2,
    betaAperV2: 0.352,
    channelLengthModulationPerV: 0.01,
    bodyDiode: Object.freeze({
      anode: 'drain',
      cathode: 'source',
      saturationCurrentA: 1e-12,
      thermalVoltageV: 0.0258,
      emissionFactor: 0.9505071264,
      linearContinuation: BODY_DIODE_LINEAR_CONTINUATION,
    }),
    gateSourceLeakageOhms: 1e12,
    deviceId: '59076',
    catalogId: '18104',
    breadboardPins: Object.freeze({ gate: 'Gate', drain: 'Drain', source: 'Source' }),
  }),
})

const modelSet: ReadonlySet<string> = new Set(MOSFET_MODELS)

/** Returns true only for MOSFET model identifiers verified in the extraction. */
export function isMOSFETModel(model: unknown): model is MOSFETModel {
  return typeof model === 'string' && modelSet.has(model.trim())
}

/** Return the immutable extracted descriptor for a native model id. */
export function getMOSFETModel(model: unknown): MOSFETDescriptor | undefined {
  if (!isMOSFETModel(model)) return undefined
  return descriptors[model.trim() as MOSFETModel]
}

