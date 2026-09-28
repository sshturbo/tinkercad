/**
 * Small, pure descriptions of the analog networks instantiated by the extracted
 * UA741, LM393, and LM339 modules. These helpers do not solve or stamp the circuit.
 */

export const UA741_MODEL = Object.freeze({
  id: 'opAmp_UA741',
  moduleSource: 'tinkercad-engine-complete-extracted/models/opAmp_UA741--module-72622.js',
  primitiveSource: 'tinkercad-engine-complete-extracted/raw/circuits-compiled.js:AnalogModel.prototype.addOpAmp',
  terminals: {
    nonInvertingInput: 'V+' as const,
    invertingInput: 'V-' as const,
    positiveSupply: 'Vcc' as const,
    negativeSupply: 'Gnd' as const,
    output: 'OUT' as const,
    offset1: 'Offset1' as const,
    offset2: 'Offset2' as const,
    noConnect: 'Nc' as const,
  },
  inputResistanceOhms: 2e6,
  inputReferenceLeakageOhms: 1e10,
  outputResistanceOhms: 75,
  openLoopGain: 2e5,
  supplyLoadResistanceOhms: 30 / 0.0033,
})

export type OpAmpNewtonTerms = Readonly<{
  supplySpanV: number
  differentialInputV: number
  normalizedDrive: number
  saturation: number
  biasCurrentA: number
  differentialCoefficientAperV: number
  supplyCoefficientAperV: number
}>

/**
 * Return the nonlinear coefficients used by the extracted AnalogModel.addOpAmp
 * Newton stamp. The separate Rin and Rout resistors are described on UA741_MODEL.
 */
export function getOpAmpNewtonTerms(
  differentialInputV: number,
  positiveSupplyV: number,
  negativeSupplyV: number,
  openLoopGain = UA741_MODEL.openLoopGain,
  outputResistanceOhms = UA741_MODEL.outputResistanceOhms,
): OpAmpNewtonTerms {
  const supplySpanV = positiveSupplyV - negativeSupplyV
  if (!(supplySpanV > 0)) {
    return {
      supplySpanV,
      differentialInputV,
      normalizedDrive: 0,
      saturation: 0,
      biasCurrentA: 0,
      differentialCoefficientAperV: 0,
      supplyCoefficientAperV: 0,
    }
  }

  const normalizedDrive = 2 * openLoopGain * differentialInputV / supplySpanV
  // The source uses exp(2*x) with hard saturation beyond +/-10.
  const saturation = normalizedDrive > 10 ? 1
    : normalizedDrive < -10 ? -1
      : Math.tanh(normalizedDrive)
  const biasCurrentA = -(saturation + 1) * supplySpanV / (2 * outputResistanceOhms)
  const differentialCoefficientAperV = -(1 - saturation * saturation) * openLoopGain / outputResistanceOhms
  const supplyCoefficientAperV = (
    -differentialCoefficientAperV * differentialInputV + biasCurrentA
  ) / supplySpanV

  return {
    supplySpanV,
    differentialInputV,
    normalizedDrive,
    saturation,
    biasCurrentA,
    differentialCoefficientAperV,
    supplyCoefficientAperV,
  }
}

export type ComparatorModelId = 'lm393' | 'lm339'

export type ComparatorModel = Readonly<{
  id: ComparatorModelId
  moduleSource: string
  supplyPositiveTerminal: 'vcc'
  supplyNegativeTerminal: 'gnd'
  channelNumbers: readonly string[]
  supplyLoadResistanceOhms: number
  inputLeakResistanceOhms: 1e10
  inputPositiveTerminal: (channel: string) => string
  inputNegativeTerminal: (channel: string) => string
  outputTerminal: (channel: string) => string
  triggerHighCondition: 'Vpositive > Vnegative and Vcc - Gnd > 2 V'
  limits: Readonly<{
    maximumSupplyVoltageV: 36
    maximumAbsoluteOutputCurrentA: 0.02
  }>
  outputArchitecture: Readonly<{
    type: 'open-collector NPN'
    outputSeriesResistanceOhms: 0.001
    /** Resistance from Vcc to the output transistor base, selected by trigger state. */
    pullupFromVccToBaseOhmsByTriggerState: Readonly<{
      triggerHigh: 1e10
      triggerLow: number
    }>
    baseToGroundResistanceOhms: 100e3
  }>
}>

const comparatorModels: Record<ComparatorModelId, ComparatorModel> = {
  lm393: Object.freeze({
    id: 'lm393',
    moduleSource: 'tinkercad-engine-complete-extracted/models/lm393--module-43877.js',
    supplyPositiveTerminal: 'vcc',
    supplyNegativeTerminal: 'gnd',
    channelNumbers: ['1', '2'],
    supplyLoadResistanceOhms: 8333,
    inputLeakResistanceOhms: 1e10,
    inputPositiveTerminal: channel => `input${channel}_pos`,
    inputNegativeTerminal: channel => `input${channel}_neg`,
    outputTerminal: channel => `output${channel}`,
    triggerHighCondition: 'Vpositive > Vnegative and Vcc - Gnd > 2 V',
    limits: Object.freeze({
      maximumSupplyVoltageV: 36,
      maximumAbsoluteOutputCurrentA: 0.02,
    }),
    outputArchitecture: Object.freeze({
      type: 'open-collector NPN',
      outputSeriesResistanceOhms: 0.001,
      pullupFromVccToBaseOhmsByTriggerState: Object.freeze({
        triggerHigh: 1e10,
        triggerLow: 100e3,
      }),
      baseToGroundResistanceOhms: 100e3,
    }),
  }),
  lm339: Object.freeze({
    id: 'lm339',
    moduleSource: 'tinkercad-engine-complete-extracted/models/lm339--module-46173.js',
    supplyPositiveTerminal: 'vcc',
    supplyNegativeTerminal: 'gnd',
    channelNumbers: ['1', '2', '3', '4'],
    supplyLoadResistanceOhms: 6250,
    inputLeakResistanceOhms: 1e10,
    inputPositiveTerminal: channel => `input${channel}_pos`,
    inputNegativeTerminal: channel => `input${channel}_neg`,
    outputTerminal: channel => `output${channel}`,
    triggerHighCondition: 'Vpositive > Vnegative and Vcc - Gnd > 2 V',
    limits: Object.freeze({
      maximumSupplyVoltageV: 36,
      maximumAbsoluteOutputCurrentA: 0.02,
    }),
    outputArchitecture: Object.freeze({
      type: 'open-collector NPN',
      outputSeriesResistanceOhms: 0.001,
      pullupFromVccToBaseOhmsByTriggerState: Object.freeze({
        triggerHigh: 1e10,
        triggerLow: 100,
      }),
      baseToGroundResistanceOhms: 100e3,
    }),
  }),
}

export function getComparatorModel(id: string): ComparatorModel | undefined {
  return id === 'lm393' || id === 'lm339' ? comparatorModels[id] : undefined
}

/** Return the extracted Vcc-to-base resistance for the named trigger state. */
export function getComparatorOutputBasePullupResistanceOhms(
  id: string,
  triggerHigh: boolean,
): number | undefined {
  const model = getComparatorModel(id)
  if (!model) return undefined
  return model.outputArchitecture.pullupFromVccToBaseOhmsByTriggerState[
    triggerHigh ? 'triggerHigh' : 'triggerLow'
  ]
}

/** The extracted trigger callback is strict at both the input and supply thresholds. */
export function evaluateComparatorTrigger(
  positiveInputV: number,
  negativeInputV: number,
  positiveSupplyV: number,
  negativeSupplyV: number,
): boolean {
  return positiveInputV > negativeInputV && positiveSupplyV - negativeSupplyV > 2
}

/** Trigger-high changes the base pullup to 10 GΩ, switching the output NPN off. */
export function isComparatorOutputTransistorConducting(triggerHigh: boolean): boolean {
  return !triggerHigh
}
