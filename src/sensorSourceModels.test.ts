import { describe, expect, it } from 'vitest'
import {
  SENSOR_SOURCE_MODELS,
  getSensorSourceControls,
  getSensorSourceModel,
  isSensorSourceModel,
} from './sensorSourceModels'

describe('sensor source model registry', () => {
  it('lists and recognizes only the implemented source sensor models', () => {
    expect(SENSOR_SOURCE_MODELS).toEqual(['TMP36', 'solarCell'])
    expect(isSensorSourceModel('TMP36')).toBe(true)
    expect(getSensorSourceModel(' TMP36 ')?.kind).toBe('thevenin')
    expect(isSensorSourceModel('solarCell')).toBe(true)
    expect(isSensorSourceModel('photoresistor')).toBe(false)
    expect(isSensorSourceModel(undefined)).toBe(false)
    expect(getSensorSourceControls('TMP36')?.[0]).toMatchObject({
      property: 'temperatureC', min: -40, max: 125, step: 1, default: 25, unit: '°C',
    })
    expect(getSensorSourceControls('solarCell')?.[0]).toMatchObject({
      property: 'illumination', min: 0, max: 100, step: 2, default: 100, unit: '%',
    })
    expect(getSensorSourceControls('unknown')).toBeUndefined()
  })

  it('models TMP36 default, temperature formula, and output resistance', () => {
    expect(getSensorSourceModel('TMP36')).toMatchObject({
      kind: 'thevenin',
      voltage: 0.75,
      internalResistance: 100_000,
      supplyResistance: 100_000,
      minimumSupplyVoltage: 2.7,
      metadata: { temperatureC: 25 },
    })
    expect(getSensorSourceModel('TMP36', { temperatureC: -40 })).toMatchObject({
      voltage: 0.1,
      metadata: { temperatureC: -40 },
    })
    expect(getSensorSourceModel('TMP36', { temperatureC: 125 })).toMatchObject({
      voltage: 1.75,
      metadata: { temperatureC: 125 },
    })
  })

  it('clamps and rounds TMP36 interactive position and temperature', () => {
    expect(getSensorSourceModel('TMP36', { position: 0 })).toMatchObject({
      voltage: 0.1,
      metadata: { temperatureC: -40 },
    })
    expect(getSensorSourceModel('TMP36', { position: 1 })).toMatchObject({
      voltage: 1.75,
      metadata: { temperatureC: 125 },
    })
    expect(getSensorSourceModel('TMP36', { temperatureC: 125.4 })).toMatchObject({
      voltage: 1.75,
      metadata: { temperatureC: 125 },
    })
    expect(getSensorSourceModel('TMP36', { temperatureC: -100 })).toMatchObject({
      voltage: 0.1,
      metadata: { temperatureC: -40 },
    })
  })

  it('models the extracted solar-cell Norton topology and default operating settings', () => {
    const model = getSensorSourceModel('solarCell')
    expect(model).toMatchObject({
      kind: 'norton',
      terminals: { positive: 'Positive', negative: 'Negative' },
      currentSource: { from: 'Negative', to: 'internal', currentA: 0.1 },
      elements: [
        { type: 'resistor', a: 'internal', b: 'Positive', resistanceOhms: 4 },
        { type: 'resistor', a: 'internal', b: 'Negative', resistanceOhms: 10_000 },
        {
          type: 'diode',
          anode: 'internal',
          cathode: 'Negative',
          saturationCurrentA: 1e-12,
          parallelLeakageResistanceOhms: 1e10,
        },
      ],
      metadata: { illuminationPercent: 100, lightFraction: 1, peakVoltageV: 5, peakCurrentA: 0.1 },
    })
    const diode = model?.kind === 'norton' ? model.elements[2] : undefined
    expect(diode?.type === 'diode' ? diode.thermalVoltageV : undefined)
      .toBeCloseTo(1.3989758 * 0.1 * Math.pow(5, -0.03997227), 12)
  })

  it('scales solar photocurrent by quantized light to the 2.2 power', () => {
    const halfLight = getSensorSourceModel('solarCell', { illumination: 50 })
    expect(halfLight?.kind === 'norton' ? halfLight.currentSource.currentA : undefined)
      .toBeCloseTo(0.1 * Math.pow(0.5, 2.2), 12)
    expect(halfLight?.kind === 'norton' ? halfLight.metadata.illuminationPercent : undefined).toBe(50)

    const dark = getSensorSourceModel('solarCell', { illumination: 0 })
    expect(dark?.kind === 'norton' ? dark.currentSource.currentA : undefined).toBe(0)
    const quantized = getSensorSourceModel('solarCell', { illumination: 51 })
    expect(quantized?.kind === 'norton' ? quantized.metadata.illuminationPercent : undefined).toBe(52)
  })

  it('uses editable SI peak values and converts the legacy catalog current from mA', () => {
    const siValues = getSensorSourceModel('solarCell', {
      peakVoltageV: 6,
      peakCurrentA: 0.2,
      illumination: 100,
    })
    expect(siValues?.kind === 'norton' ? siValues.currentSource.currentA : undefined).toBe(0.2)
    expect(siValues?.kind === 'norton' ? siValues.metadata.peakVoltageV : undefined).toBe(6)

    expect(getSensorSourceModel('solarCell', {
      'libraryProperty:peak current': 250,
      'libraryProperty:peak voltage': 6,
    })).toMatchObject({
      kind: 'norton',
      currentSource: { currentA: 0.25 },
      metadata: { peakVoltageV: 6, peakCurrentA: 0.25 },
    })
  })

  it('returns undefined for unsupported models and handles invalid numeric properties safely', () => {
    expect(getSensorSourceModel('LDR', {})).toBeUndefined()
    expect(getSensorSourceModel('solarCell', {
      illumination: Number.NaN,
      peakVoltageV: Number.NaN,
      peakCurrentA: Number.NaN,
    })).toMatchObject({
      kind: 'norton',
      currentSource: { currentA: 0.1 },
      metadata: { peakVoltageV: 5, peakCurrentA: 0.1 },
    })
  })
})
