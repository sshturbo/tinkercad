import {
  getVoltageRegulatorModel,
  voltageRegulatorSetpoint,
  type VoltageRegulatorModel,
} from './voltageRegulatorModels'
import type { ThreeTerminalEvaluation } from './transistorEquations'

function regulatorSetpointSlope(model: VoltageRegulatorModel, inputVoltage: number): number {
  if (model === 'voltageRegulator5V') {
    if (inputVoltage < 2 || inputVoltage > 36) return 0
    if (inputVoltage < 7) return 1
    if (inputVoltage < 35) return 0
    return -5
  }
  if (inputVoltage < 1 || inputVoltage > 16) return 0
  if (inputVoltage < 4.3) return 1
  if (inputVoltage < 15) return 0
  return -3.3
}

/** Exact three-terminal static MNA model for the extracted LM7805/LD1117V33. */
export function evaluateVoltageRegulator(
  modelName: unknown,
  terminalVoltages: readonly [number, number, number],
): ThreeTerminalEvaluation | undefined {
  const descriptor = getVoltageRegulatorModel(String(modelName ?? ''))
  if (!descriptor) return undefined
  const [inputNode, groundNode, outputNode] = terminalVoltages
  const inputVoltage = inputNode - groundNode
  const outputVoltage = outputNode - groundNode
  const targetVoltage = voltageRegulatorSetpoint(descriptor.model, inputVoltage)
  const targetSlope = regulatorSetpointSlope(descriptor.model, inputVoltage)
  const unconstrainedOutputCurrent = (targetVoltage - outputVoltage) / descriptor.outputResistanceOhms
  const currentLimited = unconstrainedOutputCurrent > descriptor.outputCurrentLimitA
  const deliveredOutputCurrent = currentLimited ? descriptor.outputCurrentLimitA : unconstrainedOutputCurrent
  const currentSlopeInput = currentLimited ? 0 : targetSlope / descriptor.outputResistanceOhms
  const currentSlopeOutput = currentLimited ? 0 : -1 / descriptor.outputResistanceOhms
  const outputCurrentIntoDevice = -deliveredOutputCurrent

  const inputIsIdle = deliveredOutputCurrent < descriptor.inputCurrentCutoffA
  const inputCurrentIntoDevice = inputIsIdle
    ? inputVoltage / descriptor.inputResistanceWhenIdleOhms
    : deliveredOutputCurrent + descriptor.inputQuiescentCurrentA
  const inputSlopeInput = inputIsIdle ? 1 / descriptor.inputResistanceWhenIdleOhms : currentSlopeInput
  const inputSlopeOutput = inputIsIdle ? 0 : currentSlopeOutput
  const outputCurrentSlopeInput = -currentSlopeInput
  const outputCurrentSlopeOutput = -currentSlopeOutput

  const currents = [inputCurrentIntoDevice, -inputCurrentIntoDevice - outputCurrentIntoDevice, outputCurrentIntoDevice]
  const jacobian = Array.from({ length: 3 }, () => [0, 0, 0] as number[])
  const stampRelativePair = (row: number, inputSlope: number, outputSlope: number) => {
    jacobian[row][0] += inputSlope
    jacobian[row][1] -= inputSlope + outputSlope
    jacobian[row][2] += outputSlope
  }
  stampRelativePair(0, inputSlopeInput, inputSlopeOutput)
  stampRelativePair(2, outputCurrentSlopeInput, outputCurrentSlopeOutput)
  for (let column = 0; column < 3; column++) jacobian[1][column] = -jacobian[0][column] - jacobian[2][column]

  return {
    currents: currents as ThreeTerminalEvaluation['currents'],
    jacobian: jacobian as ThreeTerminalEvaluation['jacobian'],
  }
}
