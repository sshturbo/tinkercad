/**
 * Electrical network and target geometry transcribed from extracted module
 * 61384 (`sensor_pir`). The optical/PIR detector is represented as the
 * extracted range state and drive transition; this does not model infrared
 * radiation or physical motion.
 */
export const PIR_SENSOR_MODEL = Object.freeze({
  id: 'sensor_pir',
  moduleSource: 'tinkercad-engine-complete-extracted/models/sensor_pir--module-61384.js',
  terminals: Object.freeze({
    vcc: Object.freeze({ engine: 'vcc', breadboard: 'Power', schematic: 'vcc' }),
    ground: Object.freeze({ engine: 'gnd', breadboard: 'Ground', schematic: 'gnd' }),
    output: Object.freeze({ engine: 'out', breadboard: 'Signal', schematic: 'out' }),
  }),
  power: Object.freeze({
    resistorOhms: 5 / 0.023,
    minimumVoltageV: 3,
    maximumVoltageV: 6,
  }),
  output: Object.freeze({
    activePullupOhms: 100,
    inactivePullupOhms: 1e10,
    groundShuntOhms: 20_000,
    triggerVoltageV: 2,
  }),
  target: Object.freeze({
    defaultPosition: Object.freeze({ x: 0, y: -200 }),
    rangeMinimumGraphicalUnits: 100,
    rangeMaximumGraphicalUnits: 400,
    viewAngleMinimumDegrees: 240,
    viewAngleMaximumDegrees: 300,
    normalizedDistanceFormula: '(radius - 100) / (400 - 100)',
  }),
  drivePulse: Object.freeze({
    activeValue: 1,
    inactiveValue: 0,
    transitionFrom: 0,
    transitionTo: 1,
    durationEngineTicks: 1,
  }),
})

export type PIRSensorPoint = Readonly<{ x: number; y: number }>

/** Clear edge history and pending pulses when simulation stops, keeping target positions. */
export function resetPIRSensorRuntimeEdges<T extends { pirInRange?: Record<string, boolean | null>; pirDrivePulses?: Record<string, number> }>(runtime: T): T {
  return { ...runtime, pirInRange: {}, pirDrivePulses: {} }
}
export type PIRSensorTargetState = Readonly<{
  targetPosition: PIRSensorPoint
  radiusGraphicalUnits: number
  angleDegrees: number
  normalizedDistance: number
  inRange: boolean
}>

export type PIRSensorBranchName = 'powerShunt' | 'pullup' | 'outputShunt'
export type PIRSensorBranch = Readonly<{
  name: PIRSensorBranchName
  from: 'vcc' | 'out'
  to: 'gnd' | 'out'
  resistanceOhms: number
}>
export type PIRSensorTopology = Readonly<{
  powered: boolean
  drive: boolean
  outputDriven: boolean
  pullupResistanceOhms: number
  branches: readonly PIRSensorBranch[]
}>

function numericProperty(properties: Record<string, unknown> | undefined, name: string): number | undefined {
  const candidates = [properties?.[name], properties?.[`libraryProperty:${name}`]]
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null || candidate === '') continue
    const value = typeof candidate === 'number' ? candidate : Number(candidate)
    if (Number.isFinite(value)) return value
  }
  return undefined
}

/** Use saved hidden target coordinates when both exist, otherwise the extracted default. */
export function resolvePIRSensorTargetPosition(properties?: Record<string, unknown>): PIRSensorPoint {
  const x = numericProperty(properties, 'Target X')
  const y = numericProperty(properties, 'Target Y')
  return x === undefined || y === undefined
    ? PIR_SENSOR_MODEL.target.defaultPosition
    : Object.freeze({ x, y })
}

/** Map a polar target in sensor-local coordinates to the extracted local x/y plane. */
export function pirSensorTargetFromPolar(radiusGraphicalUnits: number, angleDegrees: number): PIRSensorPoint {
  if (!Number.isFinite(radiusGraphicalUnits) || !Number.isFinite(angleDegrees)) return PIR_SENSOR_MODEL.target.defaultPosition
  const radians = angleDegrees * Math.PI / 180
  const radius = Math.max(0, radiusGraphicalUnits)
  return Object.freeze({ x: radius * Math.cos(radians), y: radius * Math.sin(radians) })
}

/**
 * Extracted `calculateDistance`: target is relative to sensor origin; it must
 * be within the inclusive 100–400 unit radius and 240°–300° view window.
 */
export function evaluatePIRSensorTarget(position: PIRSensorPoint = PIR_SENSOR_MODEL.target.defaultPosition): PIRSensorTargetState {
  if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
    return Object.freeze({ targetPosition: PIR_SENSOR_MODEL.target.defaultPosition, radiusGraphicalUnits: Number.NaN, angleDegrees: Number.NaN, normalizedDistance: -1, inRange: false })
  }
  const radiusGraphicalUnits = Math.hypot(position.x, position.y)
  const angleDegrees = (Math.atan2(position.y, position.x) * 180 / Math.PI + 360) % 360
  const { rangeMinimumGraphicalUnits, rangeMaximumGraphicalUnits, viewAngleMinimumDegrees, viewAngleMaximumDegrees } = PIR_SENSOR_MODEL.target
  const boundaryTolerance = 1e-10
  const inRange = radiusGraphicalUnits >= rangeMinimumGraphicalUnits - boundaryTolerance
    && radiusGraphicalUnits <= rangeMaximumGraphicalUnits + boundaryTolerance
    && angleDegrees >= viewAngleMinimumDegrees - boundaryTolerance
    && angleDegrees <= viewAngleMaximumDegrees + boundaryTolerance
  const normalizedDistance = inRange
    ? (radiusGraphicalUnits - rangeMinimumGraphicalUnits) / (rangeMaximumGraphicalUnits - rangeMinimumGraphicalUnits)
    : -1
  return Object.freeze({ targetPosition: Object.freeze({ x: position.x, y: position.y }), radiusGraphicalUnits, angleDegrees, normalizedDistance, inRange })
}

/** Trigger accepts inclusive 3–6 V across Vcc and Ground. */
export function pirSensorPowerValid(voltageV: number): boolean {
  return Number.isFinite(voltageV)
    && voltageV >= PIR_SENSOR_MODEL.power.minimumVoltageV
    && voltageV <= PIR_SENSOR_MODEL.power.maximumVoltageV
}

/** The source emits a one-engine-tick pulse whenever inRange changes to or from true. */
export function pirSensorDrivePulseOnTransition(previous: boolean | null | undefined, current: boolean): boolean {
  return previous !== current && (previous === true || current === true)
}

/** Three extracted resistors, with the pullup enabled only for a powered drive pulse. */
export function createPIRSensorTopology(powerVoltageV: number, drive: boolean): PIRSensorTopology {
  const powered = pirSensorPowerValid(powerVoltageV)
  const outputDriven = powered && drive
  const pullupResistanceOhms = outputDriven ? PIR_SENSOR_MODEL.output.activePullupOhms : PIR_SENSOR_MODEL.output.inactivePullupOhms
  return Object.freeze({
    powered,
    drive,
    outputDriven,
    pullupResistanceOhms,
    branches: Object.freeze([
      Object.freeze({ name: 'powerShunt' as const, from: 'vcc' as const, to: 'gnd' as const, resistanceOhms: PIR_SENSOR_MODEL.power.resistorOhms }),
      Object.freeze({ name: 'pullup' as const, from: 'vcc' as const, to: 'out' as const, resistanceOhms: pullupResistanceOhms }),
      Object.freeze({ name: 'outputShunt' as const, from: 'out' as const, to: 'gnd' as const, resistanceOhms: PIR_SENSOR_MODEL.output.groundShuntOhms }),
    ]),
  })
}
