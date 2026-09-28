/** Electrical and discrete behavior transcribed from extracted Timer555 module 27251. */
export const TIMER555_MODEL = Object.freeze({
  id: 'Timer555',
  moduleSource: 'tinkercad-engine-complete-extracted/models/Timer555--module-27251.js',
  pins: Object.freeze({
    ground: Object.freeze({ engine: 'GND', aliases: ['Ground', 'GND', '1'] as const }),
    trigger: Object.freeze({ engine: 'TRIG', aliases: ['Trigger', 'TRIG', '2'] as const }),
    output: Object.freeze({ engine: 'OUT', aliases: ['Out', 'OUT', '3'] as const }),
    reset: Object.freeze({ engine: 'Reset', aliases: ['Reset', 'RESET', '4'] as const }),
    control: Object.freeze({ engine: 'CTRL', aliases: ['Control Voltage', 'CTRL', '5'] as const }),
    threshold: Object.freeze({ engine: 'THR', aliases: ['Threshold', 'THR', '6'] as const }),
    discharge: Object.freeze({ engine: 'DIS', aliases: ['Discharge', 'DIS', '7'] as const }),
    vcc: Object.freeze({ engine: 'Vcc', aliases: ['Power', 'Vcc', 'VCC', '8'] as const }),
  }),
  ladder: Object.freeze({ resistorOhms: 5_000, sections: 3 }),
  inputPulls: Object.freeze({ triggerToVccOhms: 10_000_000, thresholdToGroundOhms: 50_000_000, resetToVccOhms: 40_000 }),
  latch: Object.freeze({ initialHigh: true, resetThresholdV: 1, propagationDelaySeconds: 0.5e-6 }),
  output: Object.freeze({ activeResistanceOhms: 15, inactiveResistanceOhms: 100_000_000 }),
  discharge: Object.freeze({ pullupOnOhms: 30_000, pullupOffOhms: 100_000_000, baseToGroundOnOhms: 100_000_000, baseToGroundOffOhms: 1 }),
  transistor: Object.freeze({ model: 'npn', baseEmitterCollectorOrder: ['base', 'emitter', 'collector'] as const }),
})

export type Timer555LatchState = Readonly<{
  latchHigh: boolean
  pendingLatchHigh?: boolean
  delayRemainingSeconds?: number
}>

export type Timer555ComparatorInputs = Readonly<{
  resetV: number
  groundV: number
  thresholdV: number
  controlV: number
  referenceV: number
  triggerV: number
}>

/** Reset and threshold force low, then the lower comparator can set high; otherwise retain state. */
export function requestedTimer555Latch(inputs: Timer555ComparatorInputs): boolean | undefined {
  if (inputs.resetV - inputs.groundV < TIMER555_MODEL.latch.resetThresholdV) return false
  if (inputs.thresholdV > inputs.controlV) return false
  if (inputs.referenceV > inputs.triggerV) return true
  return undefined
}

/** Advance the extracted 0.5 µs signal delay once for an accepted timestep. */
export function advanceTimer555Latch(
  state: Timer555LatchState,
  requestedLatchHigh: boolean | undefined,
  timeStepSeconds: number,
): Timer555LatchState {
  const dt = Number.isFinite(timeStepSeconds) && timeStepSeconds > 0 ? timeStepSeconds : 0
  let pendingLatchHigh = state.pendingLatchHigh
  let delayRemainingSeconds = Number.isFinite(state.delayRemainingSeconds)
    ? Math.max(0, state.delayRemainingSeconds!)
    : undefined

  if (requestedLatchHigh !== undefined) {
    if (requestedLatchHigh === state.latchHigh) {
      pendingLatchHigh = undefined
      delayRemainingSeconds = undefined
    } else if (pendingLatchHigh !== requestedLatchHigh || delayRemainingSeconds === undefined) {
      pendingLatchHigh = requestedLatchHigh
      delayRemainingSeconds = TIMER555_MODEL.latch.propagationDelaySeconds
    }
  }

  let latchHigh = state.latchHigh
  if (pendingLatchHigh !== undefined && delayRemainingSeconds !== undefined && dt > 0) {
    delayRemainingSeconds -= dt
    if (delayRemainingSeconds <= Number.EPSILON) {
      latchHigh = pendingLatchHigh
      pendingLatchHigh = undefined
      delayRemainingSeconds = undefined
    }
  }

  return Object.freeze({ latchHigh, pendingLatchHigh, delayRemainingSeconds })
}

export function canonicalTimer555Pin(pin: string): string | undefined {
  const normalized = pin.trim().toLowerCase().replace(/\s+/g, ' ')
  for (const terminal of Object.values(TIMER555_MODEL.pins)) {
    if (terminal.aliases.some(alias => alias.toLowerCase() === normalized)) return terminal.engine
  }
  return undefined
}
