import { describe, expect, it } from 'vitest'
import {
  evaluateRgbLed,
  initialRgbLedPinDirections,
  resolveRgbLedPinout,
  rgbLedDisplayBrightness,
  rgbLedDiodeCurrentFromVoltage,
  rgbLedShuntResistanceOhms,
  RGB_LED_MODEL,
} from './rgbLedModel'

describe('contrato extraído do LED RGB', () => {
  it('registra os quatro terminais, pinouts e os elementos de cada perna', () => {
    expect(RGB_LED_MODEL).toMatchObject({
      id: 'ledRGB',
      moduleSource: 'tinkercad-engine-complete-extracted/models/ledRGB--module-37833.js',
      terminals: {
        red: { breadboard: 'Red', schematic: 'terminal-red' },
        cathode: { breadboard: 'Cathode', schematic: 'terminal-cathode' },
        blue: { breadboard: 'Blue', schematic: 'terminal-blue' },
        green: { breadboard: 'Green', schematic: 'terminal-green' },
      },
      internalCommonNode: 'rgb_led_common',
      defaultPinout: 'rcbg',
      pinouts: {
        rcbg: { red: 'red', cathode: 'cathode', blue: 'blue', green: 'green' },
        rcgb: { red: 'red', cathode: 'cathode', blue: 'green', green: 'blue' },
        brcg: { red: 'blue', cathode: 'red', blue: 'cathode', green: 'green' },
      },
      diode: { saturationCurrentA: 1e-18, idealityFactor: 1.8, thermalVoltageV: 0.0258 * 1.8 },
      shuntResistor: { trueSignalResistanceOhms: 1e10, falseSignalResistanceOhms: 1e-6 },
      maximumCurrentA: 0.02,
    })
    expect(resolveRgbLedPinout()).toBe('rcbg')
    expect(resolveRgbLedPinout('invalid')).toBe('rcbg')
  })

  it('inicializa o terminal de cátodo como false e alterna shunts entre 1 μΩ e 10 GΩ', () => {
    expect(initialRgbLedPinDirections('rcbg')).toEqual({ red: true, cathode: false, blue: true, green: true })
    expect(initialRgbLedPinDirections('brcg')).toEqual({ red: true, cathode: true, blue: false, green: true })
    expect(rgbLedShuntResistanceOhms(false)).toBe(1e-6)
    expect(rgbLedShuntResistanceOhms(true)).toBe(1e10)
  })

  it('mapeia correntes por terminal para os canais de cor conforme o pinout', () => {
    const currents = { red: 0.006, cathode: 0.018, blue: 0.010, green: 0.014 }
    const defaultPinout = evaluateRgbLed(currents)
    expect(defaultPinout.channels.red).toMatchObject({ terminal: 'red', currentA: 0.006, brightnessFraction: 0.3, breakdown: false })
    expect(defaultPinout.channels.green).toMatchObject({ terminal: 'green', currentA: 0.014, brightnessFraction: 0.7, breakdown: false })
    expect(defaultPinout.channels.blue).toMatchObject({ terminal: 'blue', currentA: 0.010, brightnessFraction: 0.5, breakdown: false })
    expect(defaultPinout.brightness).toEqual([0.3, 0.7, 0.5])

    const swapped = evaluateRgbLed(currents, 'rcgb')
    expect(swapped.channels.green).toMatchObject({ terminal: 'blue', currentA: 0.010 })
    expect(swapped.channels.blue).toMatchObject({ terminal: 'green', currentA: 0.014 })
    const brcg = evaluateRgbLed(currents, 'brcg')
    expect(brcg.channels.red).toMatchObject({ terminal: 'cathode', currentA: 0.018 })
    expect(brcg.channels.blue).toMatchObject({ terminal: 'red', currentA: 0.006 })
    expect(brcg.channels.green).toMatchObject({ terminal: 'green', currentA: 0.014 })
  })

  it('calcula corrente de diodo assinada e mantém a continuação linear do solver sem limitar o circuito', () => {
    expect(rgbLedDiodeCurrentFromVoltage(0)).toBe(0)
    expect(rgbLedDiodeCurrentFromVoltage(-5)).toBeLessThan(0)
    expect(rgbLedDiodeCurrentFromVoltage(1.6)).toBeGreaterThan(0)
    expect(rgbLedDiodeCurrentFromVoltage(2)).toBeGreaterThan(rgbLedDiodeCurrentFromVoltage(40 * RGB_LED_MODEL.diode.thermalVoltageV))
  })

  it('usa I/20 mA, limiar estrito e corrente assinada para brightness e breakdown', () => {
    const atLimit = evaluateRgbLed({ red: 0.02, cathode: 0, blue: 0, green: 0 })
    expect(atLimit.channels.red.brightnessFraction).toBe(1)
    expect(atLimit.channels.red.breakdown).toBe(false)
    expect(atLimit.breakdown).toBe(false)

    const over = evaluateRgbLed({ red: 0.020001, cathode: 0, blue: 0, green: 0 })
    expect(over.channels.red.brightnessFraction).toBeCloseTo(1.00005, 10)
    expect(over.channels.red.breakdown).toBe(true)
    expect(over.displayBrightness[0]).toBe(1)
    expect(over.breakdown).toBe(true)

    const reverse = evaluateRgbLed({ red: -0.02, cathode: 0, blue: 0, green: 0 })
    expect(reverse.channels.red.brightnessFraction).toBe(-1)
    expect(reverse.channels.red.breakdown).toBe(false)
    expect(reverse.displayBrightness[0]).toBe(0)
  })

  it('aplica o threshold de 0,001, clamp de 0–1, raiz cúbica e arredondamento visual', () => {
    expect(rgbLedDisplayBrightness(0.000999)).toBe(0)
    expect(rgbLedDisplayBrightness(0.001)).toBe(0.1)
    expect(rgbLedDisplayBrightness(0.5)).toBe(0.79)
    expect(rgbLedDisplayBrightness(2)).toBe(1)
  })
})
