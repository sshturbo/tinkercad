import { describe, expect, it } from 'vitest'
import { evaluateUSBStandardCurrent, USB_STANDARD_MODEL } from './usbStandardModel'

describe('modelo extraído do conector USB padrão A', () => {
  it('registra aliases de alimentação, dados, shields e pads do footprint', () => {
    expect(USB_STANDARD_MODEL.terminals).toEqual({
      power: { engine: '5V', breadboard: '5V', schematic: '5V', footprintPad: '5V' },
      ground: { engine: 'GND', breadboard: 'Ground', schematic: 'GND', footprintPad: 'GND' },
      dataPlus: { engine: 'D+', breadboard: 'Data +', schematic: 'D+', footprintPad: 'USB_P', electricallyModeled: false },
      dataMinus: { engine: 'D-', breadboard: 'Data -', schematic: 'D-', footprintPad: 'USB_M', electricallyModeled: false },
      shields: { schematic: ['Shield1', 'Shield2'], electricallyModeled: false },
    })
  })

  it('descreve a fonte de 5 V em série com 1 mΩ', () => {
    expect(USB_STANDARD_MODEL).toMatchObject({
      id: 'USBstandard', outputVoltageV: 5, internalResistanceOhms: 0.001,
      maximumAbsoluteOutputCurrentA: 0.5, clampsOutputCurrent: false,
      source: 'tinkercad-engine-complete-extracted/models/USBstandard--module-70394.js',
    })
  })

  it('usa limite estrito de 0.5 A sobre o módulo da corrente, sem limitar a saída', () => {
    expect(evaluateUSBStandardCurrent(0.5)).toEqual({ currentMagnitudeA: 0.5, breakdown: false })
    expect(evaluateUSBStandardCurrent(-0.5)).toEqual({ currentMagnitudeA: 0.5, breakdown: false })
    expect(evaluateUSBStandardCurrent(0.500001)).toEqual({ currentMagnitudeA: 0.500001, breakdown: true })
    expect(evaluateUSBStandardCurrent(-0.8)).toEqual({ currentMagnitudeA: 0.8, breakdown: true })
    expect(evaluateUSBStandardCurrent(Number.NaN)).toEqual({ currentMagnitudeA: 0, breakdown: false })
  })
})
