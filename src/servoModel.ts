/** Behavioral subset of the extracted SG90 servo model. */
export const SERVO_SG90_MODEL = {
  power: { minimumVoltageV: 2.8, maximumVoltageV: 6, offStateResistanceOhms: 1470 },
  signal: { inputResistanceOhms: 1e6, highThresholdV: 2.5, minimumPulseSeconds: 0.0005, maximumPulseSeconds: 0.0025, fullTravelSeconds: 0.002 },
  movement: { maximumDegreesPerPulse: 3 },
} as const

export type ServoRuntimeState = { signalHigh: boolean; pulseStartedAtSeconds?: number; positionDegrees: number; acceptedPulses: number; powered: boolean }

export function initialServoRuntimeState(): ServoRuntimeState {
  return { signalHigh: false, positionDegrees: 0, acceptedPulses: 0, powered: false }
}

export function servoSignalIsHigh(signalVoltage: number, groundVoltage: number): boolean {
  return signalVoltage - groundVoltage > SERVO_SG90_MODEL.signal.highThresholdV
}

/** Captures edges at solver samples. Pulses shorter than the sampling interval can be missed. */
export function advanceServoState(
  previous: ServoRuntimeState,
  signalHigh: boolean,
  powered: boolean,
  timeSeconds: number,
): ServoRuntimeState {
  let next: ServoRuntimeState = { ...previous, signalHigh, powered }
  if (signalHigh && !previous.signalHigh) return { ...next, pulseStartedAtSeconds: timeSeconds }
  if (!signalHigh && previous.signalHigh) {
    const startedAt = previous.pulseStartedAtSeconds
    if (startedAt === undefined || !powered) return { ...next, pulseStartedAtSeconds: undefined }
    const pulse = Math.max(SERVO_SG90_MODEL.signal.minimumPulseSeconds,
      Math.min(SERVO_SG90_MODEL.signal.maximumPulseSeconds, timeSeconds - startedAt))
    const requested = (pulse - SERVO_SG90_MODEL.signal.minimumPulseSeconds) / SERVO_SG90_MODEL.signal.fullTravelSeconds * 180
    const difference = requested - previous.positionDegrees
    const movement = Math.sign(difference) * Math.min(Math.abs(difference), SERVO_SG90_MODEL.movement.maximumDegreesPerPulse)
    return { ...next, pulseStartedAtSeconds: undefined, positionDegrees: Math.max(0, Math.min(180, previous.positionDegrees + movement)), acceptedPulses: previous.acceptedPulses + 1 }
  }
  return next
}
