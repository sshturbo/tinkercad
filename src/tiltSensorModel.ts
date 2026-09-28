/**
 * Electrical behavior transcribed from extracted module 59844
 * (sensor_tilt_sw200d). The solver integration is intentionally separate.
 */
export const TILT_SENSOR_MODEL = Object.freeze({
  id: 'sensor_tilt_sw200d',
  moduleSource: 'tinkercad-engine-complete-extracted/models/sensor_tilt_sw200d--module-59844.js',
  terminals: {
    first: '1',
    second: '2',
  },
  control: {
    property: 'position',
    defaultPosition: 0,
    closeWhenPositionGreaterThan: 0.75,
  },
  closedResistanceOhms: 10,
  openResistanceOhms: 1e10,
})

export type TiltSensorOperatingPoint = Readonly<{
  position: number
  closed: boolean
  resistanceOhms: number
}>

/** The extracted callback uses a strict threshold and does not quantize or clamp position. */
export function evaluateTiltSensor(position: number): TiltSensorOperatingPoint {
  const closed = position > TILT_SENSOR_MODEL.control.closeWhenPositionGreaterThan
  return {
    position,
    closed,
    resistanceOhms: closed
      ? TILT_SENSOR_MODEL.closedResistanceOhms
      : TILT_SENSOR_MODEL.openResistanceOhms,
  }
}

/** Current through the extracted contact resistance for V(1) - V(2). */
export function tiltSensorCurrentFromVoltage(voltageV: number, position: number): number {
  return voltageV / evaluateTiltSensor(position).resistanceOhms
}
