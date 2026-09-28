/** Extracted contract for the USB-A port: USBstandard--module-70394.js. */
export const USB_STANDARD_MODEL = Object.freeze({
  id: 'USBstandard',
  source: 'tinkercad-engine-complete-extracted/models/USBstandard--module-70394.js',
  terminals: Object.freeze({
    power: Object.freeze({ engine: '5V', breadboard: '5V', schematic: '5V', footprintPad: '5V' }),
    ground: Object.freeze({ engine: 'GND', breadboard: 'Ground', schematic: 'GND', footprintPad: 'GND' }),
    dataPlus: Object.freeze({ engine: 'D+', breadboard: 'Data +', schematic: 'D+', footprintPad: 'USB_P', electricallyModeled: false }),
    dataMinus: Object.freeze({ engine: 'D-', breadboard: 'Data -', schematic: 'D-', footprintPad: 'USB_M', electricallyModeled: false }),
    shields: Object.freeze({ schematic: Object.freeze(['Shield1', 'Shield2'] as const), electricallyModeled: false }),
  }),
  outputVoltageV: 5,
  internalResistanceOhms: 0.001,
  maximumAbsoluteOutputCurrentA: 0.5,
  /** The extracted model reports breakdown but does not clamp the source current. */
  clampsOutputCurrent: false,
})

export type USBStandardDescriptor = typeof USB_STANDARD_MODEL

export type USBStandardCurrentStatus = Readonly<{
  currentMagnitudeA: number
  breakdown: boolean
}>

/** Evaluate the extracted strict overcurrent check on the magnitude of source current. */
export function evaluateUSBStandardCurrent(currentA: number): USBStandardCurrentStatus {
  const currentMagnitudeA = Number.isNaN(currentA) ? 0 : Math.abs(currentA)
  return Object.freeze({
    currentMagnitudeA,
    breakdown: currentMagnitudeA > USB_STANDARD_MODEL.maximumAbsoluteOutputCurrentA,
  })
}
