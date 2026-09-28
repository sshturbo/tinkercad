/** Parallax PING))) electrical, geometry and state behavior from modules 81629/32986. */
export const ULTRASONIC_PING_MODEL = Object.freeze({
  id: 'sensor_ultrasonic_ping',
  moduleSource: 'tinkercad-engine-complete-extracted/models/sensor_ultrasonic_ping--module-81629.js',
  stateMachineSource: 'tinkercad-engine-complete-extracted/engine/core/module-32986.js',
  terminals: Object.freeze({
    positive: Object.freeze({ engine: 'pos', aliases: ['Power', '5V', 'Vcc', 'VCC', 'pos'] as const }),
    negative: Object.freeze({ engine: 'neg', aliases: ['Ground', 'GND', 'neg'] as const }),
    signal: Object.freeze({ engine: 'sig', aliases: ['Signal', 'SIG', 'sig'] as const }),
    trigger: Object.freeze({ engine: 'trig', aliases: ['Trigger', 'TRIG', 'trig'] as const }),
    echo: Object.freeze({ engine: 'echo', aliases: ['Echo', 'ECHO', 'echo'] as const }),
  }),
  electrical: Object.freeze({
    powerResistanceOhms: 5 / 0.03,
    minimumPowerVoltageV: 4.5,
    maximumPowerVoltageV: 6,
    echoGroundResistanceOhms: 20_000,
    echoActivePullupOhms: 100,
    echoInactivePullupOhms: 10_000_000_000,
    triggerPullupOhms: 20_000,
    triggerThresholdV: 2,
  }),
  target: Object.freeze({
    defaultPosition: Object.freeze({ x: 0, y: -200 }),
    rangeMinimumGraphicalUnits: 100,
    rangeMaximumGraphicalUnits: 400,
    viewAngleMinimumDegrees: 240,
    viewAngleMaximumDegrees: 300,
    distanceMinimumCm: 1.98,
    distanceMaximumCm: 336.36,
  }),
  timing: Object.freeze({
    minimumTriggerPulseSeconds: 2e-6,
    echoHoldoffSeconds: 750e-6,
    echoBasePulseSeconds: 115e-6,
    echoSecondsPerNormalizedDistance: 18.385e-3,
    echoOutOfRangeSeconds: 18.5e-3,
  }),
})

export type UltrasonicTargetPoint = Readonly<{ x: number; y: number }>
export type UltrasonicPingPhase = 'idle' | 'trigger' | 'transmit'
export type UltrasonicPingRuntimeState = Readonly<{
  phase: UltrasonicPingPhase
  triggerLevelHigh: boolean
  triggerStartedAtSeconds?: number
  echoStartsAtSeconds?: number
  echoEndsAtSeconds?: number
  lastTriggerPulseSeconds?: number
  acceptedPings: number
  rejectedShortPulses: number
}>
export type UltrasonicTargetState = Readonly<{
  targetPosition: UltrasonicTargetPoint
  radiusGraphicalUnits: number
  angleDegrees: number
  normalizedDistance: number
  inRange: boolean
  distanceCm?: number
}>

const finiteTime = (time: number) => Number.isFinite(time) ? time : 0
const normalizePin = (pin: string) => pin.trim().toLowerCase().replace(/[\s-]+/g, '_')

export function canonicalUltrasonicPingPin(pin: string): string | undefined {
  const normalized = normalizePin(pin)
  for (const terminal of Object.values(ULTRASONIC_PING_MODEL.terminals)) {
    if (terminal.aliases.some((alias: string) => normalizePin(alias) === normalized)) return terminal.engine
  }
  return undefined
}

export function resolveUltrasonicTargetPosition(properties?: Record<string, unknown>): UltrasonicTargetPoint {
  const get = (name: string) => {
    const raw = properties?.[name] ?? properties?.[`libraryProperty:${name}`]
    if (raw === undefined || raw === null || raw === '') return undefined
    const value = typeof raw === 'number' ? raw : Number(raw)
    return Number.isFinite(value) ? value : undefined
  }
  const x = get('Target X'), y = get('Target Y')
  return x === undefined || y === undefined
    ? ULTRASONIC_PING_MODEL.target.defaultPosition
    : Object.freeze({ x, y })
}

export function ultrasonicTargetFromPolar(radius: number, angleDegrees: number): UltrasonicTargetPoint {
  if (!Number.isFinite(radius) || !Number.isFinite(angleDegrees)) return ULTRASONIC_PING_MODEL.target.defaultPosition
  const angle = angleDegrees * Math.PI / 180
  const safeRadius = Math.max(0, radius)
  return Object.freeze({ x: safeRadius * Math.cos(angle), y: safeRadius * Math.sin(angle) })
}

export function evaluateUltrasonicTarget(position: UltrasonicTargetPoint = ULTRASONIC_PING_MODEL.target.defaultPosition): UltrasonicTargetState {
  if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
    return Object.freeze({ targetPosition: ULTRASONIC_PING_MODEL.target.defaultPosition, radiusGraphicalUnits: Number.NaN, angleDegrees: Number.NaN, normalizedDistance: -1, inRange: false })
  }
  const radiusGraphicalUnits = Math.hypot(position.x, position.y)
  const angleDegrees = (Math.atan2(position.y, position.x) * 180 / Math.PI + 360) % 360
  const range = ULTRASONIC_PING_MODEL.target
  const tolerance = 1e-10
  const inRange = radiusGraphicalUnits >= range.rangeMinimumGraphicalUnits - tolerance
    && radiusGraphicalUnits <= range.rangeMaximumGraphicalUnits + tolerance
    && angleDegrees >= range.viewAngleMinimumDegrees - tolerance
    && angleDegrees <= range.viewAngleMaximumDegrees + tolerance
  const normalizedDistance = inRange
    ? (radiusGraphicalUnits - range.rangeMinimumGraphicalUnits) / (range.rangeMaximumGraphicalUnits - range.rangeMinimumGraphicalUnits)
    : -1
  const distanceCm = inRange
    ? range.distanceMinimumCm + (range.distanceMaximumCm - range.distanceMinimumCm) * normalizedDistance
    : undefined
  return Object.freeze({ targetPosition: Object.freeze({ ...position }), radiusGraphicalUnits, angleDegrees, normalizedDistance, inRange, distanceCm })
}

export function ultrasonicPowerValid(voltageV: number): boolean {
  return Number.isFinite(voltageV)
    && voltageV >= ULTRASONIC_PING_MODEL.electrical.minimumPowerVoltageV
    && voltageV <= ULTRASONIC_PING_MODEL.electrical.maximumPowerVoltageV
}

export function ultrasonicTriggerHigh(triggerVoltageV: number): boolean {
  return Number.isFinite(triggerVoltageV) && triggerVoltageV > ULTRASONIC_PING_MODEL.electrical.triggerThresholdV
}

export function ultrasonicEchoPulseWidthSeconds(normalizedDistance: number): number {
  return normalizedDistance < 0
    ? ULTRASONIC_PING_MODEL.timing.echoOutOfRangeSeconds
    : ULTRASONIC_PING_MODEL.timing.echoBasePulseSeconds + ULTRASONIC_PING_MODEL.timing.echoSecondsPerNormalizedDistance * Math.max(0, Math.min(1, normalizedDistance))
}

export function initialUltrasonicPingState(): UltrasonicPingRuntimeState {
  return Object.freeze({ phase: 'idle', triggerLevelHigh: false, acceptedPings: 0, rejectedShortPulses: 0 })
}

/**
 * Sample the input once at an accepted solver substep. The `transmit` phase
 * ignores trigger edges, which prevents a 3-pin SIG echo from retriggering itself.
 */
export function advanceUltrasonicPingState(
  state: UltrasonicPingRuntimeState,
  triggerVoltageV: number,
  timeSeconds: number,
  normalizedDistance: number,
): UltrasonicPingRuntimeState {
  const now = finiteTime(timeSeconds)
  const levelHigh = ultrasonicTriggerHigh(triggerVoltageV)
  const endedDuringThisSample = state.phase === 'transmit'
    && state.echoEndsAtSeconds !== undefined
    && now >= state.echoEndsAtSeconds
  const phaseAtInputSample = endedDuringThisSample ? 'transmit' : state.phase
  let phase = endedDuringThisSample ? 'idle' : state.phase
  let triggerStartedAtSeconds = endedDuringThisSample ? undefined : state.triggerStartedAtSeconds
  let echoStartsAtSeconds = endedDuringThisSample ? undefined : state.echoStartsAtSeconds
  let echoEndsAtSeconds = endedDuringThisSample ? undefined : state.echoEndsAtSeconds
  let lastTriggerPulseSeconds = state.lastTriggerPulseSeconds
  let acceptedPings = state.acceptedPings
  let rejectedShortPulses = state.rejectedShortPulses

  const rising = !state.triggerLevelHigh && levelHigh
  const falling = state.triggerLevelHigh && !levelHigh
  if (phaseAtInputSample !== 'transmit') {
    if (phase === 'idle' && rising) {
      phase = 'trigger'
      triggerStartedAtSeconds = now
    } else if (phase === 'trigger' && falling) {
      const pulse = Math.max(0, now - (triggerStartedAtSeconds ?? now))
      lastTriggerPulseSeconds = pulse
      triggerStartedAtSeconds = undefined
      if (pulse >= ULTRASONIC_PING_MODEL.timing.minimumTriggerPulseSeconds) {
        phase = 'transmit'
        echoStartsAtSeconds = now + ULTRASONIC_PING_MODEL.timing.echoHoldoffSeconds
        echoEndsAtSeconds = echoStartsAtSeconds + ultrasonicEchoPulseWidthSeconds(normalizedDistance)
        acceptedPings++
      } else {
        phase = 'idle'
        rejectedShortPulses++
      }
    }
  }

  return Object.freeze({
    phase,
    triggerLevelHigh: levelHigh,
    triggerStartedAtSeconds,
    echoStartsAtSeconds,
    echoEndsAtSeconds,
    lastTriggerPulseSeconds,
    acceptedPings,
    rejectedShortPulses,
  })
}

/** Echo state applies to the interval beginning at this timestamp (left-closed). */
export function ultrasonicEchoActiveAt(state: UltrasonicPingRuntimeState, intervalStartSeconds: number): boolean {
  return state.phase === 'transmit'
    && state.echoStartsAtSeconds !== undefined
    && state.echoEndsAtSeconds !== undefined
    && intervalStartSeconds >= state.echoStartsAtSeconds
    && intervalStartSeconds < state.echoEndsAtSeconds
}

export function nextUltrasonicDeadline(state: UltrasonicPingRuntimeState, afterSeconds: number, beforeSeconds: number): number | undefined {
  const candidates = [state.echoStartsAtSeconds, state.echoEndsAtSeconds]
    .filter((value): value is number => value !== undefined && value > afterSeconds + 1e-15 && value < beforeSeconds - 1e-15)
  return candidates.length ? Math.min(...candidates) : undefined
}

export function ultrasonicEchoResistanceOhms(powerVoltageV: number, echoActive: boolean): number {
  return ultrasonicPowerValid(powerVoltageV) && echoActive
    ? ULTRASONIC_PING_MODEL.electrical.echoActivePullupOhms
    : ULTRASONIC_PING_MODEL.electrical.echoInactivePullupOhms
}

/** Equivalent resistor branches; trigger pullup exists only for a separated 4-pin interface. */
export function ultrasonicBranches(powerVoltageV: number, echoActive: boolean, hasSeparateTrigger: boolean) {
  return Object.freeze({
    powerResistanceOhms: ULTRASONIC_PING_MODEL.electrical.powerResistanceOhms,
    echoPullupOhms: ultrasonicEchoResistanceOhms(powerVoltageV, echoActive),
    echoGroundResistanceOhms: ULTRASONIC_PING_MODEL.electrical.echoGroundResistanceOhms,
    triggerPullupOhms: hasSeparateTrigger ? ULTRASONIC_PING_MODEL.electrical.triggerPullupOhms : undefined,
  })
}

export function resetUltrasonicRuntime<T extends { ultrasonicStates?: Record<string, UltrasonicPingRuntimeState> }>(runtime: T): T {
  return { ...runtime, ultrasonicStates: {} }
}
