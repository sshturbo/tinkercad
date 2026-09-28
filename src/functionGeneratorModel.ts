/**
 * Local temporal approximation of the extracted Tinkercad function generator.
 * Source reference: tinkercad-engine-complete-extracted/models/function_generator--module-85044.js
 *
 * The extracted circuit uses sampled waveforms, filters, a gain stage, and op-amps.
 * This model keeps the editor's current amplitude-as-Vpp and center-offset convention
 * while omitting those analog stage details. It is therefore a useful idealized source,
 * not a transistor/op-amp-level reproduction of the extracted circuit.
 */
export type FunctionGeneratorWaveform = 'square' | 'sine' | 'triangle'

export type FunctionGeneratorProperties = Readonly<Record<string, unknown>>

export type FunctionGeneratorSettings = {
  frequency: number
  /** Peak-to-peak voltage, matching the existing editor convention. */
  amplitude: number
  /** Center voltage of the waveform. */
  offset: number
  waveform: FunctionGeneratorWaveform
}

export const FUNCTION_GENERATOR_MODEL = Object.freeze({
  id: 'function_generator',
  source: 'tinkercad-engine-complete-extracted/models/function_generator--module-85044.js',
  frequencyMinHz: 1,
  frequencyMaxHz: 1_000_000,
  amplitudeMinVpp: 0,
  amplitudeMaxVpp: 10,
  offsetMinV: -5,
  offsetMaxV: 5,
  /** Extracted waveform voltage source series resistance. */
  outputResistanceOhms: 50,
  /** Offline editor defaults retained for existing saved/new circuits. */
  defaults: Object.freeze({ frequency: 1, amplitude: 5, offset: 2.5, waveform: 'square' as const }),
  approximation: 'Ideal periodic waveform with 50 ohm source resistance; extracted filters and op-amp stages are not solved.',
})

function readFiniteNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

/** Sanitize current editor properties and enforce the extracted model's control ranges. */
export function normalizeFunctionGeneratorProperties(
  properties?: FunctionGeneratorProperties | null,
): FunctionGeneratorSettings {
  const defaults = FUNCTION_GENERATOR_MODEL.defaults
  const frequency = clamp(
    readFiniteNumber(properties?.frequency, defaults.frequency),
    FUNCTION_GENERATOR_MODEL.frequencyMinHz,
    FUNCTION_GENERATOR_MODEL.frequencyMaxHz,
  )
  const amplitude = clamp(
    readFiniteNumber(properties?.amplitude, defaults.amplitude),
    FUNCTION_GENERATOR_MODEL.amplitudeMinVpp,
    FUNCTION_GENERATOR_MODEL.amplitudeMaxVpp,
  )
  const offset = clamp(
    readFiniteNumber(properties?.offset, defaults.offset),
    FUNCTION_GENERATOR_MODEL.offsetMinV,
    FUNCTION_GENERATOR_MODEL.offsetMaxV,
  )
  const waveform = properties?.waveform
  return {
    frequency,
    amplitude,
    offset,
    waveform: waveform === 'sine' || waveform === 'triangle' || waveform === 'square'
      ? waveform
      : defaults.waveform,
  }
}

/** Return a normalized cycle phase in [0, 1), including for negative phases. */
export function normalizeFunctionGeneratorPhase(phase: number): number {
  if (!Number.isFinite(phase)) return 0
  return ((phase % 1) + 1) % 1
}

/** Unit-amplitude periodic waveform shape in [-1, 1]. */
export function functionGeneratorShapeAtPhase(waveform: FunctionGeneratorWaveform, phase: number): number {
  const cycle = normalizeFunctionGeneratorPhase(phase)
  if (waveform === 'sine') return Math.sin(2 * Math.PI * cycle)
  if (waveform === 'triangle') return 1 - 4 * Math.abs(normalizeFunctionGeneratorPhase(cycle + 0.25) - 0.5)
  return cycle < 0.5 ? 1 : -1
}

/** Calculate the ideal output voltage at a point in the cycle. */
export function functionGeneratorVoltageAtPhase(
  properties: FunctionGeneratorProperties | null | undefined,
  phase: number,
): number {
  const settings = normalizeFunctionGeneratorProperties(properties)
  const shape = functionGeneratorShapeAtPhase(settings.waveform, phase)
  return settings.offset + settings.amplitude * shape / 2
}

/** Calculate output voltage at elapsed time in seconds; time below zero wraps periodically. */
export function functionGeneratorVoltageAtTime(
  properties: FunctionGeneratorProperties | null | undefined,
  timeSeconds: number,
): number {
  const settings = normalizeFunctionGeneratorProperties(properties)
  const time = Number.isFinite(timeSeconds) ? timeSeconds : 0
  const phase = time * settings.frequency
  return functionGeneratorVoltageAtPhase(settings, phase)
}

/** Extracted waveform source resistance (50 ohms), independent of the control settings. */
export function functionGeneratorOutputResistanceOhms(): number {
  return FUNCTION_GENERATOR_MODEL.outputResistanceOhms
}
