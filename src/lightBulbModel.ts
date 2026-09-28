/**
 * Extracted contract from tinkercad-engine-complete-extracted/models/lightBulb--module-9482.js.
 * The electrical element is a fixed 48 ohm resistor; the model does not change its
 * resistance or limit current when the displayed breakdown threshold is exceeded.
 */
export const LIGHT_BULB_MODEL = Object.freeze({
  id: 'lightBulb',
  source: 'tinkercad-engine-complete-extracted/models/lightBulb--module-9482.js',
  terminals: Object.freeze(['1', '2'] as const),
  resistanceOhms: 48,
  maximumBrightnessCurrentA: 0.25,
  breakdownCurrentA: 0.25,
})

export type LightBulbEvaluation = Readonly<{
  /** Current magnitude used by the extracted UI process. */
  currentMagnitudeA: number
  /** Linear brightness up to 0.25 A, saturated at 1 above that value. */
  brightness: number
  /** The extracted limit is strict: exactly 0.25 A is not a breakdown. */
  breakdown: boolean
}>

/** Map measured branch current to extracted brightness and overcurrent state. */
export function evaluateLightBulb(currentA: number): LightBulbEvaluation {
  const currentMagnitudeA = Number.isNaN(currentA) ? 0 : Math.abs(currentA)
  const brightness = Math.min(1, currentMagnitudeA / LIGHT_BULB_MODEL.maximumBrightnessCurrentA)
  return Object.freeze({
    currentMagnitudeA,
    brightness,
    breakdown: currentMagnitudeA > LIGHT_BULB_MODEL.breakdownCurrentA,
  })
}
