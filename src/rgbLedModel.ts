/**
 * Electrical and visual contract transcribed from extracted module 37833
 * (ledRGB). Each of the four physical terminals has a diode and a controlled
 * shunt to the internal common node; the MNA solver can stamp these elements.
 */
export const RGB_LED_MODEL = Object.freeze({
  id: 'ledRGB',
  moduleSource: 'tinkercad-engine-complete-extracted/models/ledRGB--module-37833.js',
  terminals: Object.freeze({
    red: Object.freeze({ breadboard: 'Red', schematic: 'terminal-red' }),
    cathode: Object.freeze({ breadboard: 'Cathode', schematic: 'terminal-cathode' }),
    blue: Object.freeze({ breadboard: 'Blue', schematic: 'terminal-blue' }),
    green: Object.freeze({ breadboard: 'Green', schematic: 'terminal-green' }),
  }),
  internalCommonNode: 'rgb_led_common',
  defaultPinout: 'rcbg',
  /** Maps each named terminal to its logical die/cathode role. */
  pinouts: Object.freeze({
    rcbg: Object.freeze({ red: 'red', cathode: 'cathode', blue: 'blue', green: 'green' }),
    rcgb: Object.freeze({ red: 'red', cathode: 'cathode', blue: 'green', green: 'blue' }),
    brcg: Object.freeze({ red: 'blue', cathode: 'red', blue: 'cathode', green: 'green' }),
  }),
  diode: Object.freeze({
    anode: 'terminal',
    cathode: 'internal common',
    saturationCurrentA: 1e-18,
    idealityFactor: 1.8,
    thermalVoltageV: 0.0258 * 1.8,
  }),
  shuntResistor: Object.freeze({
    from: 'terminal',
    to: 'internal common',
    /** ProcessedSignal: signal true gives the high-resistance/open state. */
    trueSignalResistanceOhms: 1e10,
    falseSignalResistanceOhms: 1e-6,
  }),
  defaultPinDirection: true,
  maximumCurrentA: 0.02,
})

export type RgbLedTerminal = keyof typeof RGB_LED_MODEL.terminals
export type RgbLedColor = 'red' | 'green' | 'blue'
export type RgbLedPinoutName = keyof typeof RGB_LED_MODEL.pinouts
export type RgbLedPinout = Readonly<Record<RgbLedTerminal, RgbLedColor | 'cathode'>>
export type RgbLedCurrents = Readonly<Record<RgbLedTerminal, number>>

export type RgbLedChannelEvaluation = Readonly<{
  terminal: RgbLedTerminal
  currentA: number
  /** Raw extracted brightness fraction: signed current / 20 mA, not clamped. */
  brightnessFraction: number
  /** The extracted overcurrent check is signed and strict (`I > 20 mA`). */
  breakdown: boolean
}>

export type RgbLedEvaluation = Readonly<{
  pinout: RgbLedPinoutName
  channels: Readonly<Record<RgbLedColor, RgbLedChannelEvaluation>>
  /** Raw [red, green, blue] values stored by the extracted simulation model. */
  brightness: readonly [number, number, number]
  /** RGB values after the extracted view threshold, clamp, gamma and rounding. */
  displayBrightness: readonly [number, number, number]
  breakdown: boolean
}>

/** Resolve the component property, whose extracted default is `rcbg`. */
export function resolveRgbLedPinout(pinout?: unknown): RgbLedPinoutName {
  return typeof pinout === 'string' && pinout in RGB_LED_MODEL.pinouts
    ? pinout as RgbLedPinoutName
    : RGB_LED_MODEL.defaultPinout
}

/** The extracted model initializes every pin direction to true, then sets its cathode false. */
export function initialRgbLedPinDirections(pinout?: unknown): Readonly<Record<RgbLedTerminal, boolean>> {
  const mapping = RGB_LED_MODEL.pinouts[resolveRgbLedPinout(pinout)]
  return Object.freeze({
    red: true,
    cathode: mapping.cathode !== 'cathode',
    blue: mapping.blue !== 'cathode',
    green: true,
  })
}

/** Exact ProcessedSignal branch: true is 10 GΩ; false is a 1 μΩ shunt. */
export function rgbLedShuntResistanceOhms(signal: boolean): number {
  return signal
    ? RGB_LED_MODEL.shuntResistor.trueSignalResistanceOhms
    : RGB_LED_MODEL.shuntResistor.falseSignalResistanceOhms
}

/**
 * Solver branch current for the extracted Shockley diode. It uses the same
 * voltage limiting and tangent continuation as the local MNA stamp, so the
 * displayed current matches the unconstrained circuit solution above 40·Vt.
 */
export function rgbLedDiodeCurrentFromVoltage(voltageV: number): number {
  const thermalVoltage = RGB_LED_MODEL.diode.thermalVoltageV
  const limitedVoltage = Math.max(-50 * thermalVoltage, Math.min(40 * thermalVoltage, voltageV))
  const exponential = Math.exp(limitedVoltage / thermalVoltage)
  const diodeCurrent = RGB_LED_MODEL.diode.saturationCurrentA * (exponential - 1)
  const conductance = Math.max(RGB_LED_MODEL.diode.saturationCurrentA * exponential / thermalVoltage, 1e-12)
  return diodeCurrent + conductance * (voltageV - limitedVoltage)
}

/** Exact visual mapping in module 37833's View. */
export function rgbLedDisplayBrightness(brightnessFraction: number): number {
  const clipped = brightnessFraction < 0.001 ? 0 : brightnessFraction > 1 ? 1 : brightnessFraction
  return Math.round(100 * Math.pow(clipped, 1 / 3)) / 100
}

/**
 * Map measured diode currents (keyed by physical terminal) to color brightness
 * and breakdown. The extracted callback does not absolute-value or clamp the
 * current/brightness; only the view applies its separate visual transformation.
 */
export function evaluateRgbLed(currentsByTerminal: RgbLedCurrents, pinout?: unknown): RgbLedEvaluation {
  const pinoutName = resolveRgbLedPinout(pinout)
  const mapping = RGB_LED_MODEL.pinouts[pinoutName]
  const channels = {} as Record<RgbLedColor, RgbLedChannelEvaluation>
  for (const terminal of Object.keys(RGB_LED_MODEL.terminals) as RgbLedTerminal[]) {
    const color = mapping[terminal]
    if (color === 'cathode') continue
    const currentA = currentsByTerminal[terminal]
    channels[color] = Object.freeze({
      terminal,
      currentA,
      brightnessFraction: currentA / RGB_LED_MODEL.maximumCurrentA,
      breakdown: currentA > RGB_LED_MODEL.maximumCurrentA,
    })
  }
  const brightness = [channels.red.brightnessFraction, channels.green.brightnessFraction, channels.blue.brightnessFraction] as const
  const displayBrightness = brightness.map(rgbLedDisplayBrightness) as unknown as readonly [number, number, number]
  return Object.freeze({
    pinout: pinoutName,
    channels: Object.freeze(channels),
    brightness: Object.freeze(brightness),
    displayBrightness: Object.freeze(displayBrightness),
    breakdown: Object.values(channels).some(channel => channel.breakdown),
  })
}
