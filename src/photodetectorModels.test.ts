import { describe, expect, it } from 'vitest'
import {
  PHOTODETECTOR_MODELS,
  getPhotodetectorControls,
  getPhotodetectorModel,
  isPhotodetectorModel,
} from './photodetectorModels'

describe('extracted photodetector descriptors', () => {
  it('recognizes only photodiode_v2 and phototransistor and exposes their light control', () => {
    expect(PHOTODETECTOR_MODELS).toEqual(['photodiode_v2', 'phototransistor'])
    expect(isPhotodetectorModel('photodiode_v2')).toBe(true)
    expect(isPhotodetectorModel(' phototransistor ')).toBe(true)
    expect(isPhotodetectorModel('photodiode')).toBe(false)
    expect(getPhotodetectorModel('not-a-model')).toBeUndefined()
    for (const model of PHOTODETECTOR_MODELS) {
      expect(getPhotodetectorControls(model)).toMatchObject({
        property: 'position', min: 0, max: 1, step: 0.02, default: 0,
      })
    }
  })

  it('captures the photodiode terminals, photocurrent, diode, and shunt resistor', () => {
    expect(getPhotodetectorModel('photodiode_v2')).toEqual({
      model: 'photodiode_v2',
      kind: 'photodiode',
      terminals: { anode: 'anode', cathode: 'cathode' },
      illuminationPosition: 0,
      currentSource: { from: 'anode', to: 'cathode', currentA: 0 },
      elements: [
        {
          type: 'diode', anode: 'anode', cathode: 'cathode',
          saturationCurrentA: 1e-11, idealityFactor: 1,
        },
        { type: 'resistor', a: 'anode', b: 'cathode', resistanceOhms: 1e6 },
      ],
    })
    expect(getPhotodetectorModel('photodiode_v2', { position: 1 })?.currentSource.currentA).toBeCloseTo(1e-4)
  })

  it('quantizes and clamps illumination to the extracted 0.02 slider increments', () => {
    expect(getPhotodetectorModel('photodiode_v2', { position: 0.509 })?.illuminationPosition).toBe(0.5)
    expect(getPhotodetectorModel('photodiode_v2', { position: 0.511 })?.illuminationPosition).toBe(0.52)
    expect(getPhotodetectorModel('photodiode_v2', { position: -1 })?.illuminationPosition).toBe(0)
    expect(getPhotodetectorModel('phototransistor', { position: 2 })?.illuminationPosition).toBe(1)
  })

  it('injects the phototransistor photocurrent into the base of its extracted NPN network', () => {
    expect(getPhotodetectorModel('phototransistor', { position: 1 })).toEqual({
      model: 'phototransistor',
      kind: 'phototransistor',
      terminals: { emitter: 'emitter', collector: 'collector' },
      internalNodes: { base: 'base' },
      illuminationPosition: 1,
      currentSource: { from: 'base', to: 'emitter', currentA: 7.85e-6 },
      elements: [{ type: 'npn', base: 'base', emitter: 'emitter', collector: 'collector' }],
    })
    expect(getPhotodetectorModel('phototransistor', { position: 0.4 })?.currentSource.currentA)
      .toBeCloseTo(7.85e-10 * 0.4 * 1e4, 15)
  })

  it('defaults malformed light properties to darkness', () => {
    expect(getPhotodetectorModel('photodiode_v2', { position: Number.NaN })?.illuminationPosition).toBe(0)
    expect(getPhotodetectorModel('phototransistor', { position: 'invalid' })?.currentSource.currentA).toBe(0)
  })
})
