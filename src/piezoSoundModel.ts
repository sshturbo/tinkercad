/**
 * Electrical network transcribed from extracted engine/core/module-97250.js.
 * Audio.play implementation is absent from the extracted local runtime, so
 * this helper reports electrical values and a visual voltage indicator only.
 */
export const PIEZO_SOUND_MODEL = Object.freeze({
  id: 'piezoSound',
  moduleSource: 'tinkercad-engine-complete-extracted/engine/core/module-97250.js',
  terminals: Object.freeze({
    positive: Object.freeze({ engine: '+', breadboard: 'Positive', schematic: '+' }),
    negative: Object.freeze({ engine: '-', breadboard: 'Negative', schematic: '-' }),
  }),
  resistanceOhms: 600,
  breakdownVoltageSampleFloorV: 0.001,
  breakdownVoltageV: 25,
  visualIndicatorReferenceVoltageV: 25,
})

export type PiezoSoundElectricalState = Readonly<{
  voltageV: number
  voltageForBreakdownCheckV: number
  currentA: number
  dissipatedPowerW: number
  voltageIndicatorFraction: number
  breakdown: boolean
}>

/** The extracted model reads the signed +/− resistor voltage and its current. */
export function evaluatePiezoSound(voltageV: number): PiezoSoundElectricalState {
  const voltage = Number.isFinite(voltageV) ? voltageV : 0
  // Extracted module: if voltage < 1 mV, replace the local breakdown-check
  // sample with zero. This does not alter the electrical resistor branch.
  const voltageForBreakdownCheckV = voltage < PIEZO_SOUND_MODEL.breakdownVoltageSampleFloorV ? 0 : voltage
  const voltageIndicatorFraction = Math.max(0, Math.min(1,
    Math.abs(voltage) / PIEZO_SOUND_MODEL.visualIndicatorReferenceVoltageV,
  ))
  const currentA = voltage / PIEZO_SOUND_MODEL.resistanceOhms
  return Object.freeze({
    voltageV: voltage,
    voltageForBreakdownCheckV,
    currentA,
    dissipatedPowerW: voltage * currentA,
    voltageIndicatorFraction,
    breakdown: voltageForBreakdownCheckV > PIEZO_SOUND_MODEL.breakdownVoltageV,
  })
}
