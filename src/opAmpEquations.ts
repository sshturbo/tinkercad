import { UA741_MODEL, getOpAmpNewtonTerms } from './opAmpAndComparatorModels'

export type OpAmpEvaluation = {
  currents: [number, number, number, number, number]
  jacobian: number[][]
}

/** Quasi-static UA741 model: extracted tanh transfer, input/output resistance and rail load. */
export function evaluateUA741(
  terminalVoltages: readonly [number, number, number, number, number],
): OpAmpEvaluation {
  const [inputPlus, inputMinus, positiveSupply, negativeSupply, output] = terminalVoltages
  const span = positiveSupply - negativeSupply
  const differential = inputPlus - inputMinus
  const terms = getOpAmpNewtonTerms(differential, positiveSupply, negativeSupply)
  const saturation = terms.saturation
  const target = span > 0 ? negativeSupply + span * (saturation + 1) / 2 : negativeSupply
  const routConductance = 1 / UA741_MODEL.outputResistanceOhms
  const outputCurrent = (output - target) * routConductance
  const inputCurrent = differential / UA741_MODEL.inputResistanceOhms
  const inputReferenceLeakage = (inputMinus - negativeSupply) / UA741_MODEL.inputReferenceLeakageOhms
  const supplyLoadCurrent = span / UA741_MODEL.supplyLoadResistanceOhms
  const currents = [
    inputCurrent,
    -inputCurrent + inputReferenceLeakage,
    supplyLoadCurrent,
    -supplyLoadCurrent - inputReferenceLeakage,
    outputCurrent,
  ]
  const jacobian = Array.from({ length: 5 }, () => Array(5).fill(0) as number[])

  const inputConductance = 1 / UA741_MODEL.inputResistanceOhms
  jacobian[0][0] += inputConductance
  jacobian[0][1] -= inputConductance
  jacobian[1][0] -= inputConductance
  jacobian[1][1] += inputConductance
  const referenceLeakageConductance = 1 / UA741_MODEL.inputReferenceLeakageOhms
  jacobian[1][1] += referenceLeakageConductance
  jacobian[1][3] -= referenceLeakageConductance
  jacobian[3][1] -= referenceLeakageConductance
  jacobian[3][3] += referenceLeakageConductance

  const supplyConductance = 1 / UA741_MODEL.supplyLoadResistanceOhms
  jacobian[2][2] += supplyConductance
  jacobian[2][3] -= supplyConductance
  jacobian[3][2] -= supplyConductance
  jacobian[3][3] += supplyConductance

  let targetPlus = 0, targetMinus = 0, targetPositiveSupply = 0, targetNegativeSupply = 1
  if (span > 0) {
    const drive = terms.normalizedDrive
    const slope = Math.abs(drive) >= 10 ? 0 : 1 - saturation * saturation
    targetPlus = UA741_MODEL.openLoopGain * slope
    targetMinus = -targetPlus
    targetPositiveSupply = (saturation + 1 - drive * slope) / 2
    targetNegativeSupply = 1 - targetPositiveSupply
  }
  jacobian[4][0] -= targetPlus * routConductance
  jacobian[4][1] -= targetMinus * routConductance
  jacobian[4][2] -= targetPositiveSupply * routConductance
  jacobian[4][3] -= targetNegativeSupply * routConductance
  jacobian[4][4] += routConductance
  // The output stage takes current from Vcc when sourcing and returns it through Gnd when sinking.
  for (let column = 0; column < 5; column++) jacobian[2][column] -= jacobian[4][column]
  currents[2] -= outputCurrent
  return { currents: currents as OpAmpEvaluation['currents'], jacobian }
}
