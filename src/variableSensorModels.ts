/**
 * Resistive sensor equations transcribed from the extracted Tinkercad models
 * `ldr_v2`, `sensorForce`, and `sensorFlex`.
 *
 * Values exposed here are simulator controls. `variableSensorResistance`
 * always returns ohms, or `undefined` for an unsupported model.
 */

export const VARIABLE_SENSOR_MODELS = ['ldr_v2', 'sensorForce', 'sensorFlex'] as const

export type VariableSensorModel = typeof VARIABLE_SENSOR_MODELS[number]
export type VariableSensorProperties = Readonly<Record<string, unknown>>

export type VariableSensorControl = {
  label: string
  /** Canonical key to store in the component's properties. */
  property: 'lightLevel' | 'force' | 'bend'
  min: number
  max: number
  step: number
  defaultValue: number
  unit: '%' | 'N' | '°'
  /** Current value in the same units/range as min and max. */
  value: number
}

const MODEL_SET: ReadonlySet<string> = new Set(VARIABLE_SENSOR_MODELS)

export function isVariableSensorModel(model: unknown): model is VariableSensorModel {
  return typeof model === 'string' && MODEL_SET.has(model)
}

function finiteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function firstNumber(properties: VariableSensorProperties, keys: readonly string[]): number | undefined {
  for (const key of keys) {
    const value = finiteNumber(properties[key])
    if (value !== undefined) return value
  }
  return undefined
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function snap(value: number, min: number, max: number, step: number): number {
  const clamped = clamp(value, min, max)
  return min + Math.round((clamped - min) / step) * step
}

function ldrPosition(properties: VariableSensorProperties): number {
  const percent = firstNumber(properties, ['lightLevel', 'illuminationPercent'])
  if (percent !== undefined) return clamp(percent / 100, 0, 1)

  // `position` is the normalized drag coordinate used by the extracted model.
  return clamp(firstNumber(properties, ['position']) ?? 0, 0, 1)
}

function forceNewtons(properties: VariableSensorProperties): number {
  const force = firstNumber(properties, ['force', 'forceN'])
  if (force !== undefined) return clamp(force, 0, 10)

  // The extracted interaction maps a 0..1 drag position to 0 N at the floor,
  // then to 0.1 + 9.9 * position² N across the remaining travel.
  const position = clamp(firstNumber(properties, ['position']) ?? 0, 0, 1)
  return position < 0.01 ? 0 : 0.1 + 9.9 * position * position
}

function bendDegrees(properties: VariableSensorProperties): number {
  return snap(firstNumber(properties, ['bend', 'bendAngle']) ?? 0, 0, 180, 1)
}

function flexFlatResistance(properties: VariableSensorProperties): number {
  // The record declares 30 with prefix `k`; the extracted model receives the
  // converted resistance in ohms. Prefer that canonical representation.
  const ohms = firstNumber(properties, ['flatResistance', 'flatResistanceOhms'])
  if (ohms !== undefined) return Math.max(1, ohms)

  // Compatibility with ComponentPopover's legacy key: its input stores the
  // displayed record value (30) under `libraryProperty:flat resistance`.
  const recordValue = firstNumber(properties, [
    'libraryProperty:flat resistance',
    'flat resistance',
  ])
  if (recordValue !== undefined) return Math.max(1, recordValue * 1_000)

  // Record default is 30 kΩ (default=30, default_prefix="k").
  return 30_000
}

/** Returns an editable control descriptor with the value currently in force. */
export function variableSensorControl(
  model: string,
  properties: VariableSensorProperties = {},
): VariableSensorControl | undefined {
  if (model === 'ldr_v2') {
    const percent = firstNumber(properties, ['lightLevel', 'illuminationPercent'])
    const position = percent === undefined
      ? clamp(firstNumber(properties, ['position']) ?? 0, 0, 1)
      : clamp(percent / 100, 0, 1)
    return {
      label: 'Iluminação',
      property: 'lightLevel',
      min: 0,
      max: 100,
      step: 2,
      defaultValue: 0,
      unit: '%',
      value: snap(position * 100, 0, 100, 2),
    }
  }

  if (model === 'sensorForce') {
    const directForce = firstNumber(properties, ['force', 'forceN'])
    const force = directForce === undefined
      ? forceNewtons(properties)
      : snap(directForce, 0, 10, 0.1)
    return {
      label: 'Força aplicada',
      property: 'force',
      min: 0,
      max: 10,
      step: 0.1,
      defaultValue: 0,
      unit: 'N',
      value: force,
    }
  }

  if (model === 'sensorFlex') {
    return {
      label: 'Ângulo de flexão',
      property: 'bend',
      min: 0,
      max: 180,
      step: 1,
      defaultValue: 0,
      unit: '°',
      value: bendDegrees(properties),
    }
  }

  return undefined
}

/**
 * Calculates the sensor's resistance in ohms using the extracted model.
 *
 * Operating ranges follow the extracted user controls: the LDR has 51
 * positions corresponding to roughly 1..1000 lux; force spans 0..10 N; flex
 * bend spans 0..180°. Out-of-range controls are clamped to those ranges.
 */
export function variableSensorResistance(
  model: string,
  properties: VariableSensorProperties = {},
): number | undefined {
  if (model === 'ldr_v2') {
    // Position is quantized to 50 intervals in the extracted model:
    // lux = 999 * round(50 * position) / 50 + 1.
    const position = snap(ldrPosition(properties), 0, 1, 0.02)
    const lux = 999 * position + 1
    // Extracted processed signal: exp(ln(500 kΩ) - 0.85 * (ln(lux)-ln(0.3))).
    return Math.exp(Math.log(500_000) - 0.85 * (Math.log(lux) - Math.log(0.3)))
  }

  if (model === 'sensorForce') {
    const force = forceNewtons(properties)
    // Extracted force sensor curve, with a high-resistance open state below
    // 0.01 N and two fitted regions above it.
    if (force < 0.01) return 1e10
    if (force < 0.5) return 4_245 * Math.pow(force, -1.2)
    return 6_000 * Math.pow(force, -0.7)
  }

  if (model === 'sensorFlex') {
    // Record default is 30 kΩ flat; extracted formula is Rflat * 2.56^(bend/100).
    return flexFlatResistance(properties) * Math.pow(2.56, 0.01 * bendDegrees(properties))
  }

  return undefined
}
