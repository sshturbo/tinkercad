import { getBipolarTransistorModel } from './bipolarTransistorModels'
import { getMOSFETModel } from './mosfetModels'

export type ThreeTerminalEvaluation = { currents: [number, number, number]; jacobian: [[number, number, number], [number, number, number], [number, number, number]] }

type JunctionEvaluation = { current: number; conductance: number }

function junctionCurrent(voltage: number, saturationCurrent: number, thermalVoltage: number, limit: number, slope: number, intercept: number): JunctionEvaluation {
  if (voltage >= limit) return { current: slope * voltage + intercept, conductance: slope }
  const exponent = Math.max(-700, voltage / thermalVoltage)
  const exponential = Math.exp(exponent)
  return { current: saturationCurrent * (exponential - 1), conductance: saturationCurrent * exponential / thermalVoltage }
}

function addControlledJunction(
  currents: number[], jacobian: number[][], positive: number, negative: number,
  terminalCoefficients: readonly number[], junction: JunctionEvaluation,
) {
  for (let row = 0; row < 3; row++) {
    const coefficient = terminalCoefficients[row]
    currents[row] += coefficient * junction.current
    jacobian[row][positive] += coefficient * junction.conductance
    jacobian[row][negative] -= coefficient * junction.conductance
  }
}

/** Ebers–Moll equations and current Jacobian transcribed from addNPN/addPNP. */
export function evaluateBipolarTransistor(model: unknown, terminalVoltages: readonly [number, number, number]): ThreeTerminalEvaluation | undefined {
  const descriptor = getBipolarTransistorModel(model)
  if (!descriptor) return undefined
  const [base, emitter, collector] = terminalVoltages
  const currents = [0, 0, 0]
  const jacobian = Array.from({ length: 3 }, () => [0, 0, 0] as number[])
  const forward = descriptor.forwardTransportFactor
  const reverse = descriptor.reverseTransportFactor
  const isPnp = descriptor.model === 'pnp'
  const be = descriptor.baseEmitterJunction
  const bc = descriptor.baseCollectorJunction
  const beVoltage = isPnp ? emitter - base : base - emitter
  const bcVoltage = isPnp ? collector - base : base - collector
  const beCurrent = junctionCurrent(beVoltage, be.saturationCurrentA, descriptor.thermalVoltageV, be.exponentialVoltageLimitV, be.linearSlopeS, be.linearInterceptA)
  const bcCurrent = junctionCurrent(bcVoltage, bc.saturationCurrentA, descriptor.thermalVoltageV, bc.exponentialVoltageLimitV, bc.linearSlopeS, bc.linearInterceptA)
  if (isPnp) {
    addControlledJunction(currents, jacobian, 1, 0, [-(1 - forward), 1, -forward], beCurrent)
    addControlledJunction(currents, jacobian, 2, 0, [-(1 - reverse), -reverse, 1], bcCurrent)
  } else {
    addControlledJunction(currents, jacobian, 0, 1, [1 - forward, -1, forward], beCurrent)
    addControlledJunction(currents, jacobian, 0, 2, [1 - reverse, reverse, -1], bcCurrent)
  }
  return { currents: currents as ThreeTerminalEvaluation['currents'], jacobian: jacobian as ThreeTerminalEvaluation['jacobian'] }
}

function mosBodyDiodeCurrent(voltage: number, model: NonNullable<ReturnType<typeof getMOSFETModel>>): JunctionEvaluation {
  const diode = model.bodyDiode
  const thermalVoltage = diode.thermalVoltageV * diode.emissionFactor
  return junctionCurrent(
    voltage, diode.saturationCurrentA, thermalVoltage, diode.linearContinuation.voltageV,
    diode.linearContinuation.conductanceS, diode.linearContinuation.currentOffsetA,
  )
}

/** Piecewise MOS channel, body diode, and 1 TΩ gate-source leakage from addNMOS/addPMOS. */
export function evaluateMOSFET(modelName: unknown, terminalVoltages: readonly [number, number, number]): ThreeTerminalEvaluation | undefined {
  const model = getMOSFETModel(modelName)
  if (!model) return undefined
  const [gate, source, drain] = terminalVoltages
  const currents = [0, 0, 0]
  const jacobian = Array.from({ length: 3 }, () => [0, 0, 0] as number[])
  const lambda = model.channelLengthModulationPerV
  const beta = model.betaAperV2
  const gateOverSource = gate - source
  const drainOverSource = drain - source
  const threshold = model.thresholdVoltageV
  let channelCurrent = 0
  let dIdD = 0
  let dIdG = 0
  if (model.polarity === 'n-channel' && gateOverSource > threshold) {
    const overdrive = gateOverSource - threshold
    if (drainOverSource < overdrive) {
      const triode = overdrive * drainOverSource - drainOverSource ** 2 / 2
      channelCurrent = beta * triode * (1 + lambda * drainOverSource)
      dIdD = beta * ((overdrive - drainOverSource) * (1 + lambda * drainOverSource) + triode * lambda)
      dIdG = beta * drainOverSource * (1 + lambda * drainOverSource)
    } else {
      channelCurrent = beta / 2 * overdrive ** 2 * (1 + lambda * drainOverSource)
      dIdD = beta / 2 * lambda * overdrive ** 2
      dIdG = beta * overdrive * (1 + lambda * drainOverSource)
    }
  } else if (model.polarity === 'p-channel' && gateOverSource < threshold) {
    const overdrive = gateOverSource - threshold
    if (drainOverSource > overdrive) {
      const triode = overdrive * drainOverSource - drainOverSource ** 2 / 2
      channelCurrent = -beta * triode * (1 - lambda * drainOverSource)
      dIdD = -beta * ((overdrive - drainOverSource) * (1 - lambda * drainOverSource) - triode * lambda)
      dIdG = -beta * drainOverSource * (1 - lambda * drainOverSource)
    } else {
      channelCurrent = -beta / 2 * overdrive ** 2 * (1 - lambda * drainOverSource)
      dIdD = beta / 2 * lambda * overdrive ** 2
      dIdG = -beta * overdrive * (1 - lambda * drainOverSource)
    }
  }
  currents[2] += channelCurrent
  currents[1] -= channelCurrent
  jacobian[2][0] += dIdG
  jacobian[2][1] -= dIdG + dIdD
  jacobian[2][2] += dIdD
  jacobian[1][0] -= dIdG
  jacobian[1][1] += dIdG + dIdD
  jacobian[1][2] -= dIdD

  const diode = model.bodyDiode
  const bodyAnode = diode.anode === 'source' ? 1 : 2
  const bodyCathode = diode.cathode === 'source' ? 1 : 2
  const body = mosBodyDiodeCurrent(terminalVoltages[bodyAnode] - terminalVoltages[bodyCathode], model)
  const bodyCoefficients = [0, 0, 0]
  bodyCoefficients[bodyAnode] = 1
  bodyCoefficients[bodyCathode] = -1
  addControlledJunction(currents, jacobian, bodyAnode, bodyCathode, bodyCoefficients, body)

  const leakageConductance = 1 / model.gateSourceLeakageOhms
  const leakageCurrent = (gate - source) * leakageConductance
  currents[0] += leakageCurrent
  currents[1] -= leakageCurrent
  jacobian[0][0] += leakageConductance
  jacobian[0][1] -= leakageConductance
  jacobian[1][0] -= leakageConductance
  jacobian[1][1] += leakageConductance
  return { currents: currents as ThreeTerminalEvaluation['currents'], jacobian: jacobian as ThreeTerminalEvaluation['jacobian'] }
}
