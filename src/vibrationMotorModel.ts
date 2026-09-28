/**
 * Electrical and visual behavior transcribed from the extracted
 * vibration_motor module. This helper is independent from the MNA solver.
 */
export const VIBRATION_MOTOR_MODEL = Object.freeze({
  id: 'vibration_motor',
  moduleSource: 'tinkercad-engine-complete-extracted/models/vibration_motor--module-45616.js',
  terminals: {
    positive: 'pos',
    negative: 'neg',
  },
  resistanceOhms: 50,
  animationThresholdCurrentA: 0.04,
  maximumCurrentA: 0.1,
})

export type VibrationMotorBehavior = Readonly<{
  /** Signed current, with positive direction from `pos` to `neg`. */
  currentA: number
  animationEnabled: boolean
  /** Animation amplitude in the extracted model's 0–1 range. */
  amplitude: number
  breakdown: boolean
}>

/** Current through the extracted 50 Ω resistor for voltage `V(pos) - V(neg)`. */
export function vibrationMotorCurrentFromVoltage(voltageV: number): number {
  return Number.isFinite(voltageV) ? voltageV / VIBRATION_MOTOR_MODEL.resistanceOhms : 0
}

/**
 * Reproduce the thresholds in module 45616. The extracted callback compares
 * signed resistor current directly (it does not take its absolute value):
 * I <= 40 mA is off, 40 mA < I <= 100 mA vibrates, and I > 100 mA breaks down.
 */
export function evaluateVibrationMotor(currentA: number): VibrationMotorBehavior {
  const normalizedCurrent = Number.isFinite(currentA) ? currentA : 0
  const animationEnabled = normalizedCurrent > VIBRATION_MOTOR_MODEL.animationThresholdCurrentA
    && normalizedCurrent <= VIBRATION_MOTOR_MODEL.maximumCurrentA
  const breakdown = normalizedCurrent > VIBRATION_MOTOR_MODEL.maximumCurrentA

  return {
    currentA: normalizedCurrent,
    animationEnabled,
    amplitude: animationEnabled
      ? (normalizedCurrent - VIBRATION_MOTOR_MODEL.animationThresholdCurrentA)
        / (VIBRATION_MOTOR_MODEL.maximumCurrentA - VIBRATION_MOTOR_MODEL.animationThresholdCurrentA)
      : 0,
    breakdown,
  }
}
