/** Extracted two-terminal diode/LED model contracts. */
export const TWO_PIN_DIODE_MODEL = Object.freeze({
  diode: Object.freeze({
    id: 'diode',
    moduleSource: 'tinkercad-engine-complete-extracted/models/diode--module-8338.js',
    terminals: Object.freeze({ anode: 'ANODE', cathode: 'CATHODE' }),
    saturationCurrentA: 1e-12,
    idealityFactor: 1,
    seriesResistanceOhms: 0,
  }),
  led: Object.freeze({
    id: 'led2',
    moduleSource: 'tinkercad-engine-complete-extracted/models/led2--module-2292.js',
    terminals: Object.freeze({ anode: 'A', cathode: 'K' }),
    seriesResistanceOhms: 6,
    saturationCurrentA: 1e-20,
    defaultColor: 'red',
    idealityFactors: Object.freeze({ red: 1.8, orange: 1.93, yellow: 1.95, green: 2.2, blue: 3.45, white: 3.1 }),
    maximumCurrentA: 0.02,
    breakdownCurrentA: 0.12,
    maximumExponent: 55,
  }),
  thermalVoltageAt25CVolts: 0.0258,
  numerical: Object.freeze({ minimumConductanceSiemens: 1e-12, minimumExponent: -50, maximumExponent: 55 }),
})

export type TwoPinDiodeColor = keyof typeof TWO_PIN_DIODE_MODEL.led.idealityFactors
export type ShockleyParameters = Readonly<{ saturationCurrentA: number; idealityFactor: number }>
export type TwoPinDiodeDescriptor = Readonly<{
  id: 'diode' | 'led2'
  terminals: Readonly<{ anode: string; cathode: string }>
  saturationCurrentA: number
  idealityFactor: number
  thermalVoltageV: number
  seriesResistanceOhms: number
  maximumExponent: number
}>
export type TwoPinLedEvaluation = Readonly<{ currentA: number; brightness: number; warning: boolean; breakdown: boolean }>

/** Resolve the extracted color ideality factor; unknown colors use the red fallback. */
export function getTwoPinDiodeDescriptor(kind: 'diode' | 'led', color?: unknown): TwoPinDiodeDescriptor {
  if (kind === 'diode') {
    const model = TWO_PIN_DIODE_MODEL.diode
    return Object.freeze({ id: 'diode', terminals: model.terminals, saturationCurrentA: model.saturationCurrentA, idealityFactor: model.idealityFactor, thermalVoltageV: TWO_PIN_DIODE_MODEL.thermalVoltageAt25CVolts * model.idealityFactor, seriesResistanceOhms: model.seriesResistanceOhms, maximumExponent: TWO_PIN_DIODE_MODEL.numerical.maximumExponent })
  }
  const model = TWO_PIN_DIODE_MODEL.led
  const name = typeof color === 'string' && color in model.idealityFactors ? color as TwoPinDiodeColor : model.defaultColor as TwoPinDiodeColor
  const idealityFactor = model.idealityFactors[name]
  return Object.freeze({ id: 'led2', terminals: model.terminals, saturationCurrentA: model.saturationCurrentA, idealityFactor, thermalVoltageV: TWO_PIN_DIODE_MODEL.thermalVoltageAt25CVolts * idealityFactor, seriesResistanceOhms: model.seriesResistanceOhms, maximumExponent: model.maximumExponent })
}

/** Ideal Shockley equation I=Is*(exp(V/(n*Vt))-1), with only numeric exponent bounds. */
export function shockleyDiodeCurrentA(voltageV: number, parameters: ShockleyParameters, maximumExponent = 55): number {
  if (!Number.isFinite(voltageV)) return 0
  const thermalVoltage = Math.max(Number.MIN_VALUE, TWO_PIN_DIODE_MODEL.thermalVoltageAt25CVolts * parameters.idealityFactor)
  const exponent = Math.max(-50, Math.min(maximumExponent, voltageV / thermalVoltage))
  return Math.max(Number.MIN_VALUE, parameters.saturationCurrentA) * Math.expm1(exponent)
}

/**
 * Current used by the MNA stamp and its readback: a bounded Shockley tangent is
 * continued linearly outside the exponent window, with a small conductance floor
 * to keep isolated reverse-biased branches numerically solvable.
 */
export function shockleyDiodeCurrentWithContinuationA(
  voltageV: number,
  parameters: ShockleyParameters,
  options: Readonly<{ maximumExponent?: number; minimumConductanceSiemens?: number }> = {},
): number {
  if (!Number.isFinite(voltageV)) return 0
  const thermalVoltage = Math.max(Number.MIN_VALUE, TWO_PIN_DIODE_MODEL.thermalVoltageAt25CVolts * parameters.idealityFactor)
  const maximumExponent = options.maximumExponent ?? TWO_PIN_DIODE_MODEL.numerical.maximumExponent
  const minimumConductance = options.minimumConductanceSiemens ?? TWO_PIN_DIODE_MODEL.numerical.minimumConductanceSiemens
  const limitedVoltage = Math.max(TWO_PIN_DIODE_MODEL.numerical.minimumExponent * thermalVoltage, Math.min(maximumExponent * thermalVoltage, voltageV))
  const exponential = Math.exp(limitedVoltage / thermalVoltage)
  const diodeCurrent = Math.max(Number.MIN_VALUE, parameters.saturationCurrentA) * (exponential - 1)
  const conductance = Math.max(Math.max(Number.MIN_VALUE, parameters.saturationCurrentA) * exponential / thermalVoltage, minimumConductance)
  return diodeCurrent + conductance * (voltageV - limitedVoltage)
}

/** Exact extracted LED callback thresholds; the breakdown boundary is inclusive at 120 mA. */
export function evaluateTwoPinLed(currentA: number): TwoPinLedEvaluation {
  const maximum = TWO_PIN_DIODE_MODEL.led.maximumCurrentA
  const breakdown = currentA >= TWO_PIN_DIODE_MODEL.led.breakdownCurrentA
  return Object.freeze({
    currentA,
    brightness: currentA <= maximum ? currentA / maximum : 1,
    warning: currentA > maximum && currentA < TWO_PIN_DIODE_MODEL.led.breakdownCurrentA,
    breakdown,
  })
}
