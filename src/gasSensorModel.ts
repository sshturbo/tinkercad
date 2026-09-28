/**
 * Electrical and target-distance model transcribed from extracted module 58766
 * (`sensor_gas`). This describes the heater, sensing resistor, and target-level
 * law; it does not simulate gas chemistry or heater temperature dynamics.
 */
export const GAS_SENSOR_MODEL = Object.freeze({
  id: 'sensor_gas',
  moduleSource: 'tinkercad-engine-complete-extracted/models/sensor_gas--module-58766.js',
  terminals: Object.freeze({
    sensorA: Object.freeze(['A1', 'A2'] as const),
    sensorB: Object.freeze(['B1', 'B2'] as const),
    heater: Object.freeze(['H1', 'H2'] as const),
  }),
  mergedTerminalPairs: Object.freeze([
    Object.freeze(['A1', 'A2'] as const),
    Object.freeze(['B1', 'B2'] as const),
  ]),
  heaterResistanceOhms: 26,
  sensingResistanceOhms: Object.freeze({
    lowHeaterVoltageOhms: 11_000,
    heaterVoltageStartV: 4,
    heaterVoltageCapV: 5.1,
    voltageCoefficientOhmsPerV: 9_350,
  }),
  target: Object.freeze({
    defaultPosition: Object.freeze({ x: 0, y: -200 }),
    origin: Object.freeze({ x: 0, y: 0 }),
    maximumDistanceGraphicalUnits: 250,
  }),
  operatingLimits: Object.freeze({ maximumAbsoluteHeaterVoltageV: 5.1 }),
})

export type GasSensorPoint = Readonly<{ x: number; y: number }>

export type GasSensorInput = Readonly<{
  /** Signed heater voltage; the extracted simulator measures its magnitude. */
  heaterVoltageV?: number
  /** Extracted sensorLevel, normally derived from target position. */
  sensorLevel?: number
  /** Radial target distance from the sensor origin in graphical units. */
  targetDistance?: number
}>

export type GasSensorOperatingPoint = Readonly<{
  /** Sanitized signed input voltage. */
  heaterVoltageV: number
  /** Magnitude measured by the extracted heater monitor. */
  heaterVoltageMagnitudeV: number
  sensorLevel: number
  signalResistanceOhms: number
  breakdown: boolean
}>

/** The extracted default target is (0, -200), measured relative to sensor origin (0, 0). */
export function gasSensorTargetDistance(position: GasSensorPoint): number {
  if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) return Number.NaN
  return Math.hypot(position.x - GAS_SENSOR_MODEL.target.origin.x, position.y - GAS_SENSOR_MODEL.target.origin.y)
}

/** Exact extracted radial law: 1 − distance/250 within the 250-unit range, else 0. */
export function gasSensorLevelFromDistance(distance: number): number {
  if (!Number.isFinite(distance)) return 0
  const radialDistance = Math.max(0, distance)
  return radialDistance <= GAS_SENSOR_MODEL.target.maximumDistanceGraphicalUnits
    ? 1 - radialDistance / GAS_SENSOR_MODEL.target.maximumDistanceGraphicalUnits
    : 0
}

/** Calculate sensorLevel using the extracted target coordinate origin and default point. */
export function gasSensorLevelFromTargetPosition(position: GasSensorPoint = GAS_SENSOR_MODEL.target.defaultPosition): number {
  return gasSensorLevelFromDistance(gasSensorTargetDistance(position))
}

function finiteValue(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback
}

function clampLevel(value: number): number {
  return Math.max(0, Math.min(1, value))
}

/**
 * Extracted signal resistance function. Heater voltage is measured as an
 * absolute value; resistance calculation caps it at 5.1 V even though the
 * separate breakdown flag becomes true strictly above 5.1 V.
 */
export function gasSensorSignalResistanceOhms(heaterVoltageV: number, sensorLevel: number): number {
  const heaterMagnitude = Math.abs(finiteValue(heaterVoltageV, 0))
  const level = clampLevel(finiteValue(sensorLevel, 0))
  const { lowHeaterVoltageOhms, heaterVoltageStartV, heaterVoltageCapV, voltageCoefficientOhmsPerV } = GAS_SENSOR_MODEL.sensingResistanceOhms
  if (heaterMagnitude < heaterVoltageStartV) return lowHeaterVoltageOhms
  const cappedVoltage = Math.min(heaterMagnitude, heaterVoltageCapV)
  return lowHeaterVoltageOhms - voltageCoefficientOhmsPerV * (cappedVoltage - heaterVoltageStartV) * level
}

/** Evaluate signal resistance and strict heater over-voltage breakdown. */
export function evaluateGasSensor(input: GasSensorInput = {}): GasSensorOperatingPoint {
  const heaterVoltageV = finiteValue(input.heaterVoltageV, 0)
  const heaterVoltageMagnitudeV = Math.abs(heaterVoltageV)
  const sensorLevel = clampLevel(finiteValue(
    input.sensorLevel,
    input.targetDistance === undefined
      ? gasSensorLevelFromTargetPosition()
      : gasSensorLevelFromDistance(input.targetDistance),
  ))
  return Object.freeze({
    heaterVoltageV,
    heaterVoltageMagnitudeV,
    sensorLevel,
    signalResistanceOhms: gasSensorSignalResistanceOhms(heaterVoltageV, sensorLevel),
    breakdown: heaterVoltageMagnitudeV > GAS_SENSOR_MODEL.operatingLimits.maximumAbsoluteHeaterVoltageV,
  })
}
