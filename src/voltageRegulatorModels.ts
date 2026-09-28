/**
 * Extracted behavioral contracts for the LM7805 and LD1117V33 library parts.
 *
 * These are the original Tinkercad simulation models, not datasheet-accurate
 * regulator models. Their deliberately piecewise transfer curves and input
 * resistance calculation are preserved for the local simulator to consume.
 */

export const VOLTAGE_REGULATOR_MODELS = ['voltageRegulator5V', 'voltageRegulator3p3V'] as const
export type VoltageRegulatorModel = typeof VOLTAGE_REGULATOR_MODELS[number]

export interface VoltageRegulatorDescriptor {
  model: VoltageRegulatorModel
  deviceId: '212155' | '212156'
  catalogId: '48952' | '48953'
  partName: 'LM7805' | 'LD1117V33'
  nominalVoltageV: 5 | 3.3
  terminals: Readonly<{ input: 'in'; ground: 'gnd'; output: 'out' }>
  /** Physical package pin numbers mapped to engine terminal names. */
  packagePins: Readonly<{ '1': 'in' | 'gnd'; '2': 'gnd' | 'out'; '3': 'out' | 'in' }>
  /** Breadboard terminal labels mapped to engine terminal names. */
  breadboardPins: Readonly<{ In: 'in'; Ground: 'gnd'; Out: 'out' }>
  outputCurrentLimitA: 1.5 | 1.3
  outputResistanceOhms: 0.017
  inputQuiescentCurrentA: 0.005
  inputCurrentCutoffA: 1e-6
  inputResistanceWhenIdleOhms: 1e10
  /** Input bounds used to flag component breakdown; comparisons are strict. */
  breakdownInputRangeV: Readonly<{ minimum: -0.25; maximum: 35 | 15 }>
}

const TERMINALS = Object.freeze({ input: 'in', ground: 'gnd', output: 'out' } as const)
const BREADBOARD_PINS = Object.freeze({ In: 'in', Ground: 'gnd', Out: 'out' } as const)

const descriptors: Readonly<Record<VoltageRegulatorModel, VoltageRegulatorDescriptor>> = Object.freeze({
  voltageRegulator5V: Object.freeze({
    model: 'voltageRegulator5V',
    deviceId: '212155',
    catalogId: '48952',
    partName: 'LM7805',
    nominalVoltageV: 5,
    terminals: TERMINALS,
    packagePins: Object.freeze({ '1': 'in', '2': 'gnd', '3': 'out' }),
    breadboardPins: BREADBOARD_PINS,
    outputCurrentLimitA: 1.5,
    outputResistanceOhms: 0.017,
    inputQuiescentCurrentA: 0.005,
    inputCurrentCutoffA: 1e-6,
    inputResistanceWhenIdleOhms: 1e10,
    breakdownInputRangeV: Object.freeze({ minimum: -0.25, maximum: 35 }),
  }),
  voltageRegulator3p3V: Object.freeze({
    model: 'voltageRegulator3p3V',
    deviceId: '212156',
    catalogId: '48953',
    partName: 'LD1117V33',
    nominalVoltageV: 3.3,
    terminals: TERMINALS,
    // Pinmaps extracted from packaged_devices/212156.json: this part's
    // footprint order differs from the LM7805 despite sharing a TO-220 body.
    packagePins: Object.freeze({ '1': 'gnd', '2': 'out', '3': 'in' }),
    breadboardPins: BREADBOARD_PINS,
    outputCurrentLimitA: 1.3,
    outputResistanceOhms: 0.017,
    inputQuiescentCurrentA: 0.005,
    inputCurrentCutoffA: 1e-6,
    inputResistanceWhenIdleOhms: 1e10,
    breakdownInputRangeV: Object.freeze({ minimum: -0.25, maximum: 15 }),
  }),
})

const modelSet: ReadonlySet<string> = new Set(VOLTAGE_REGULATOR_MODELS)

/** Returns true only for the two regulator identifiers verified in extraction. */
export function isVoltageRegulatorModel(model: unknown): model is VoltageRegulatorModel {
  return typeof model === 'string' && modelSet.has(model.trim())
}

/** Returns the immutable descriptor for one of the extracted regulator models. */
export function getVoltageRegulatorModel(model: unknown): VoltageRegulatorDescriptor | undefined {
  if (!isVoltageRegulatorModel(model)) return undefined
  return descriptors[model.trim() as VoltageRegulatorModel]
}

/** Exact piecewise output setpoint from the extracted ProcessedSignal. */
export function voltageRegulatorSetpoint(model: VoltageRegulatorModel, inputVoltageV: number): number {
  if (model === 'voltageRegulator5V') {
    if (inputVoltageV < 2 || inputVoltageV > 36) return 0
    if (inputVoltageV < 7) return inputVoltageV - 2
    if (inputVoltageV < 35) return 5
    return 5 * (36 - inputVoltageV)
  }

  if (inputVoltageV < 1 || inputVoltageV > 16) return 0
  if (inputVoltageV < 4.3) return inputVoltageV - 1
  if (inputVoltageV < 15) return 3.3
  return 3.3 * (16 - inputVoltageV)
}

/** Exact resistance signal connected between input and ground in the bundle. */
export function voltageRegulatorInputResistance(inputVoltageV: number, outputCurrentA: number): number {
  if (outputCurrentA < 1e-6) return 1e10
  return inputVoltageV / (outputCurrentA + 0.005)
}

/**
 * Current delivered by the extracted current-limited Thevenin output source.
 * Positive current flows from output to ground. Reverse current is not clamped.
 */
export function voltageRegulatorOutputCurrent(
  model: VoltageRegulatorModel,
  inputVoltageV: number,
  outputVoltageV: number,
): number {
  const descriptor = descriptors[model]
  const setpointV = voltageRegulatorSetpoint(model, inputVoltageV)
  if (outputVoltageV < setpointV - descriptor.outputCurrentLimitA * descriptor.outputResistanceOhms) {
    return descriptor.outputCurrentLimitA
  }
  return (setpointV - outputVoltageV) / descriptor.outputResistanceOhms
}

/** Breakdown flags raised by the extracted update process (strict thresholds). */
export function voltageRegulatorBreakdown(
  model: VoltageRegulatorModel,
  inputVoltageV: number,
  outputCurrentA: number,
): Readonly<{ inputOutOfRange: boolean; outputOvercurrent: boolean; broken: boolean }> {
  const descriptor = descriptors[model]
  const inputOutOfRange = inputVoltageV < descriptor.breakdownInputRangeV.minimum
    || inputVoltageV > descriptor.breakdownInputRangeV.maximum
  const outputOvercurrent = outputCurrentA > descriptor.outputCurrentLimitA
  return Object.freeze({ inputOutOfRange, outputOvercurrent, broken: inputOutOfRange || outputOvercurrent })
}
