/**
 * Topology descriptors transcribed from extracted modules 43050 and 49109.
 * These describe the source-controlled models only; solver stamping belongs
 * to the electrical simulator.
 */

export const PHOTODETECTOR_MODELS = ['photodiode_v2', 'phototransistor'] as const
export type PhotodetectorModelName = typeof PHOTODETECTOR_MODELS[number]

export interface PhotodetectorLightControl {
  property: 'position'
  label: 'Iluminação'
  unit: 'fração'
  min: 0
  max: 1
  step: 0.02
  default: 0
  description: string
}

export const photodetectorControls: Readonly<Record<PhotodetectorModelName, PhotodetectorLightControl>> = {
  photodiode_v2: {
    property: 'position',
    label: 'Iluminação',
    unit: 'fração',
    min: 0,
    max: 1,
    step: 0.02,
    default: 0,
    description: 'O módulo extraído arredonda position em incrementos de 0,02.',
  },
  phototransistor: {
    property: 'position',
    label: 'Iluminação',
    unit: 'fração',
    min: 0,
    max: 1,
    step: 0.02,
    default: 0,
    description: 'O módulo extraído arredonda position em incrementos de 0,02.',
  },
}

export type PhotodetectorElement =
  | {
      type: 'diode'
      anode: string
      cathode: string
      saturationCurrentA: number
      idealityFactor: number
    }
  | { type: 'resistor'; a: string; b: string; resistanceOhms: number }
  | { type: 'npn'; base: string; emitter: string; collector: string }

// `from` and `to` preserve the two net arguments passed to addCurrentSource.
// The extracted nodal engine injects its positive current into `from` (the
// conventional current arrow therefore points from `to` back to `from`).
export type PhotodetectorDescriptor =
  | {
      model: 'photodiode_v2'
      kind: 'photodiode'
      terminals: { anode: 'anode'; cathode: 'cathode' }
      illuminationPosition: number
      currentSource: { from: 'anode'; to: 'cathode'; currentA: number }
      elements: PhotodetectorElement[]
    }
  | {
      model: 'phototransistor'
      kind: 'phototransistor'
      terminals: { emitter: 'emitter'; collector: 'collector' }
      internalNodes: { base: 'base' }
      illuminationPosition: number
      currentSource: { from: 'base'; to: 'emitter'; currentA: number }
      elements: PhotodetectorElement[]
    }

const modelSet: ReadonlySet<string> = new Set(PHOTODETECTOR_MODELS)

export function isPhotodetectorModel(model: unknown): model is PhotodetectorModelName {
  return typeof model === 'string' && modelSet.has(model.trim())
}

export function getPhotodetectorControls(model: unknown): PhotodetectorLightControl | undefined {
  return isPhotodetectorModel(model)
    ? { ...photodetectorControls[model.trim() as PhotodetectorModelName] }
    : undefined
}

function finitePosition(properties: Readonly<Record<string, unknown>>): number {
  const raw = properties.position ?? properties.illumination ?? properties.light
  if (raw === undefined || raw === null || raw === '') return 0
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function quantizedIllumination(properties: Readonly<Record<string, unknown>>): number {
  const clamped = Math.min(1, Math.max(0, finitePosition(properties)))
  return Math.round(50 * clamped) / 50
}

/** Return the extracted electrical topology and its current light-dependent source. */
export function getPhotodetectorModel(
  model: unknown,
  properties: Readonly<Record<string, unknown>> = {},
): PhotodetectorDescriptor | undefined {
  if (!isPhotodetectorModel(model)) return undefined

  const canonicalModel = model.trim() as PhotodetectorModelName
  const illuminationPosition = quantizedIllumination(properties)

  if (canonicalModel === 'photodiode_v2') {
    return {
      model: canonicalModel,
      kind: 'photodiode',
      terminals: { anode: 'anode', cathode: 'cathode' },
      illuminationPosition,
      // Extracted ProcessedSignal: 1e-7 * lux * 1e3, where lux is position.
      currentSource: {
        from: 'anode',
        to: 'cathode',
        currentA: 1e-7 * illuminationPosition * 1e3,
      },
      elements: [
        {
          type: 'diode',
          anode: 'anode',
          cathode: 'cathode',
          saturationCurrentA: 1e-11,
          idealityFactor: 1,
        },
        { type: 'resistor', a: 'anode', b: 'cathode', resistanceOhms: 1e6 },
      ],
    }
  }

  return {
    model: canonicalModel,
    kind: 'phototransistor',
    terminals: { emitter: 'emitter', collector: 'collector' },
    internalNodes: { base: 'base' },
    illuminationPosition,
    // Extracted ProcessedSignal: 7.85e-10 * lux * 1e4, injected at the NPN base.
    currentSource: {
      from: 'base',
      to: 'emitter',
      currentA: 7.85e-10 * illuminationPosition * 1e4,
    },
    elements: [{ type: 'npn', base: 'base', emitter: 'emitter', collector: 'collector' }],
  }
}
