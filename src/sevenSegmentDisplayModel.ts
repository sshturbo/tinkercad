/**
 * Solver-agnostic contract transcribed from extracted module 28034
 * (seven_segment_digit_5011bh).
 */
export const SEVEN_SEGMENT_MODEL = Object.freeze({
  id: 'seven_segment_digit_5011bh',
  moduleSource: 'tinkercad-engine-complete-extracted/models/seven_segment_digit_5011bh--module-28034.js',
  /** Order used by the extracted model's current/brightness array. */
  segments: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'] as const,
  breadboardPinOrder: ['G', 'F', 'Common', 'A', 'B', 'E', 'D', 'Common', 'C', 'DP'] as const,
  pinAliases: Object.freeze({
    g: 'g',
    f: 'f',
    a: 'a',
    b: 'b',
    c: 'c',
    d: 'd',
    e: 'e',
    dp: 'dp',
    common: 'common',
    com1: 'common',
    com2: 'common',
  } as const),
  common: Object.freeze({
    breadboardPins: ['Common', 'Common'] as const,
    schematicTerminals: ['com1', 'com2'] as const,
    internalNode: 'seven_segment_common',
    merged: true,
  }),
  control: Object.freeze({
    property: 'common',
    defaultCommonType: 'anode' as const,
    commonTypes: ['anode', 'cathode'] as const,
  }),
  diode: Object.freeze({
    /** `addDiode`'s third argument is Is; the fourth is ideality factor n. */
    saturationCurrentA: 1e-18,
    idealityFactor: 1.8,
    thermalVoltageReferenceAt25CV: 0.0258,
  }),
  resistor: Object.freeze({
    activeOhms: 1e-6,
    inactiveOhms: 1e10,
    resistorsPerSegment: 4,
  }),
  maximumCurrentA: 0.02,
  display: Object.freeze({
    zeroBelowFraction: 0.001,
    maximumFraction: 1,
    gammaExponent: 1 / 3,
  }),
})

export type SevenSegmentName = typeof SEVEN_SEGMENT_MODEL.segments[number]
export type SevenSegmentCommonType = typeof SEVEN_SEGMENT_MODEL.control.commonTypes[number]
export type SevenSegmentBranchName = 'segmentToAnode' | 'segmentToCathode' | 'commonToAnode' | 'commonToCathode'
export type SevenSegmentCurrents = Readonly<Record<SevenSegmentName, number>>

export type SevenSegmentResistorBranch = Readonly<{
  name: SevenSegmentBranchName
  from: string
  to: string
  resistanceOhms: number
}>

export type SevenSegmentChannelTopology = Readonly<{
  segment: SevenSegmentName
  diode: Readonly<{
    anode: string
    cathode: string
    saturationCurrentA: number
    idealityFactor: number
  }>
  resistors: readonly SevenSegmentResistorBranch[]
}>

export type SevenSegmentTopology = Readonly<{
  commonType: SevenSegmentCommonType
  commonNode: string
  mergedCommonTerminals: typeof SEVEN_SEGMENT_MODEL.common.schematicTerminals
  channels: readonly SevenSegmentChannelTopology[]
}>

export type SevenSegmentChannelEvaluation = Readonly<{
  segment: SevenSegmentName
  currentA: number
  /** Raw extracted brightness: signed current divided by 20 mA. */
  brightnessFraction: number
  /** The extracted comparison is signed and strict (`I > 20 mA`). */
  breakdown: boolean
}>

export type SevenSegmentEvaluation = Readonly<{
  channels: Readonly<Record<SevenSegmentName, SevenSegmentChannelEvaluation>>
  /** Raw per-segment values, in extracted order a,b,c,d,e,f,g,dp. */
  brightness: readonly [number, number, number, number, number, number, number, number]
  /** Values after the extracted visual threshold and gamma transform. */
  displayBrightness: readonly [number, number, number, number, number, number, number, number]
  breakdown: boolean
}>

/** Resolve breadboard and schematic aliases to their electrical terminal. */
export function resolveSevenSegmentTerminal(terminal: unknown): SevenSegmentName | 'common' | undefined {
  if (typeof terminal !== 'string') return undefined
  const normalized = terminal.trim().toLowerCase()
  if (normalized in SEVEN_SEGMENT_MODEL.pinAliases) {
    return SEVEN_SEGMENT_MODEL.pinAliases[normalized as keyof typeof SEVEN_SEGMENT_MODEL.pinAliases]
  }
  return undefined
}

/** Resolve `common`, falling back to the extracted property default `anode`. */
export function resolveSevenSegmentCommonType(commonType?: unknown): SevenSegmentCommonType {
  return commonType === 'cathode' ? 'cathode' : SEVEN_SEGMENT_MODEL.control.defaultCommonType
}

/**
 * Produce the eight independent diode channels and their four controlled
 * resistors each. The diode itself always points anode_net -> cathode_net;
 * the selected low-ohm paths wire that diode for the configured common type.
 */
export function createSevenSegmentTopology(commonType?: unknown): SevenSegmentTopology {
  const resolvedCommonType = resolveSevenSegmentCommonType(commonType)
  const anodeMode = resolvedCommonType === 'anode'
  const active = SEVEN_SEGMENT_MODEL.resistor.activeOhms
  const inactive = SEVEN_SEGMENT_MODEL.resistor.inactiveOhms

  const channels = SEVEN_SEGMENT_MODEL.segments.map((segment): SevenSegmentChannelTopology => {
    const anode = `anode_net_${segment}`
    const cathode = `cathode_net_${segment}`
    const resistors: SevenSegmentResistorBranch[] = [
      { name: 'segmentToAnode', from: segment, to: anode, resistanceOhms: anodeMode ? inactive : active },
      { name: 'segmentToCathode', from: segment, to: cathode, resistanceOhms: anodeMode ? active : inactive },
      { name: 'commonToAnode', from: SEVEN_SEGMENT_MODEL.common.internalNode, to: anode, resistanceOhms: anodeMode ? active : inactive },
      { name: 'commonToCathode', from: SEVEN_SEGMENT_MODEL.common.internalNode, to: cathode, resistanceOhms: anodeMode ? inactive : active },
    ]
    return Object.freeze({
      segment,
      diode: Object.freeze({
        anode,
        cathode,
        saturationCurrentA: SEVEN_SEGMENT_MODEL.diode.saturationCurrentA,
        idealityFactor: SEVEN_SEGMENT_MODEL.diode.idealityFactor,
      }),
      resistors: Object.freeze(resistors.map(branch => Object.freeze(branch))),
    })
  })

  return Object.freeze({
    commonType: resolvedCommonType,
    commonNode: SEVEN_SEGMENT_MODEL.common.internalNode,
    mergedCommonTerminals: SEVEN_SEGMENT_MODEL.common.schematicTerminals,
    channels: Object.freeze(channels),
  })
}

/**
 * Current of the extracted Shockley branch using the solver's diode voltage
 * limiting and tangent continuation. The extracted addDiode argument 1.8 is
 * the ideality factor n, so Vt at 25 °C is 25.8 mV × n.
 */
export function sevenSegmentDiodeCurrentFromVoltage(voltageV: number): number {
  const thermalVoltage = SEVEN_SEGMENT_MODEL.diode.thermalVoltageReferenceAt25CV * SEVEN_SEGMENT_MODEL.diode.idealityFactor
  const limitedVoltage = Math.max(-50 * thermalVoltage, Math.min(40 * thermalVoltage, voltageV))
  const exponential = Math.exp(limitedVoltage / thermalVoltage)
  const diodeCurrent = SEVEN_SEGMENT_MODEL.diode.saturationCurrentA * (exponential - 1)
  const conductance = Math.max(SEVEN_SEGMENT_MODEL.diode.saturationCurrentA * exponential / thermalVoltage, 1e-12)
  return diodeCurrent + conductance * (voltageV - limitedVoltage)
}

/** Exact View transform: threshold to zero, clamp to 1, then cube root. */
export function sevenSegmentDisplayBrightness(brightnessFraction: number): number {
  const clipped = brightnessFraction < SEVEN_SEGMENT_MODEL.display.zeroBelowFraction
    ? 0
    : brightnessFraction > SEVEN_SEGMENT_MODEL.display.maximumFraction
      ? SEVEN_SEGMENT_MODEL.display.maximumFraction
      : brightnessFraction
  return Math.pow(clipped, SEVEN_SEGMENT_MODEL.display.gammaExponent)
}

/** Evaluate signed diode currents independently for the eight segments. */
export function evaluateSevenSegmentDisplay(currents: SevenSegmentCurrents): SevenSegmentEvaluation {
  const channels = {} as Record<SevenSegmentName, SevenSegmentChannelEvaluation>
  for (const segment of SEVEN_SEGMENT_MODEL.segments) {
    const currentA = currents[segment]
    channels[segment] = Object.freeze({
      segment,
      currentA,
      brightnessFraction: currentA / SEVEN_SEGMENT_MODEL.maximumCurrentA,
      breakdown: currentA > SEVEN_SEGMENT_MODEL.maximumCurrentA,
    })
  }
  const brightness = SEVEN_SEGMENT_MODEL.segments.map(segment => channels[segment].brightnessFraction) as unknown as SevenSegmentEvaluation['brightness']
  const displayBrightness = brightness.map(sevenSegmentDisplayBrightness) as unknown as SevenSegmentEvaluation['displayBrightness']
  return Object.freeze({
    channels: Object.freeze(channels),
    brightness: Object.freeze(brightness),
    displayBrightness: Object.freeze(displayBrightness),
    breakdown: Object.values(channels).some(channel => channel.breakdown),
  })
}
