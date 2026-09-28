/**
 * Analytic contracts transcribed from the extracted Tinkercad models:
 * `capacitor--module-5737.js`, `capacitor_polarized--module-20243.js`, and
 * `inductor--module-91271.js`.
 *
 * All returned electrical values use SI units (F, H, Ω, V). The extracted
 * capacitor models put an ideal capacitor in series with a 0.01 Ω resistor;
 * the extracted inductor has no explicit series resistance. The extracted
 * model code supplies 0 when capacitance/inductance is missing. It does not
 * declare a default voltage rating for the polarized capacitor, so this
 * module leaves that limit undefined unless the component property exists.
 *
 * Backward compatibility: older editor records used the unprefixed displayed
 * number in `libraryProperty:capacitance` / `libraryProperty:inductance`.
 * Those legacy numbers are interpreted as nF for the ordinary capacitor,
 * µF for the polarized capacitor, and µH for the inductor. Canonical
 * `capacitanceF` / `capacitance` and `inductanceH` / `inductance` are SI.
 */

export const PASSIVE_COMPONENT_MODELS = ['capacitor', 'capacitor_polarized', 'inductor'] as const
export type PassiveComponentModel = typeof PASSIVE_COMPONENT_MODELS[number]
export type PassiveComponentProperties = Readonly<Record<string, unknown>>

export interface CapacitorDescriptor {
  model: 'capacitor'
  kind: 'capacitor'
  terminals: readonly ['1', '2']
  capacitanceF: number
  seriesResistanceOhms: 0.01
}

export interface PolarizedCapacitorDescriptor {
  model: 'capacitor_polarized'
  kind: 'polarized-capacitor'
  terminals: { positive: '+'; negative: '-' }
  capacitanceF: number
  seriesResistanceOhms: 0.01
  /** Nominal voltage in volts, only when the source record supplies it. */
  voltageRatingV?: number
}

export interface InductorDescriptor {
  model: 'inductor'
  kind: 'inductor'
  terminals: readonly ['1', '2']
  inductanceH: number
  /** The extracted model connects an ideal inductor directly between pins. */
  ideal: true
  seriesResistanceOhms: 0
}

export type PassiveComponentDescriptor = CapacitorDescriptor | PolarizedCapacitorDescriptor | InductorDescriptor

const modelSet: ReadonlySet<string> = new Set(PASSIVE_COMPONENT_MODELS)

/** Returns true only for passive models whose extracted implementation was verified. */
export function isPassiveComponentModel(model: unknown): model is PassiveComponentModel {
  return typeof model === 'string' && modelSet.has(model.trim())
}

function normalized(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function finiteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string' && value.trim() !== '') {
    const result = Number(value)
    return Number.isFinite(result) ? result : undefined
  }
  return undefined
}

function directProperty(properties: PassiveComponentProperties, aliases: readonly string[]): number | undefined {
  const names = new Set(aliases.map(normalized))
  for (const [key, raw] of Object.entries(properties)) {
    if (key.toLowerCase().startsWith('libraryproperty:')) continue
    if (!names.has(normalized(key))) continue
    const value = finiteNumber(raw)
    if (value !== undefined) return value
  }
  return undefined
}

function libraryProperty(properties: PassiveComponentProperties, aliases: readonly string[]): number | undefined {
  const names = new Set(aliases.map(normalized))
  for (const [key, raw] of Object.entries(properties)) {
    if (!key.toLowerCase().startsWith('libraryproperty:')) continue
    const propertyName = key.slice(key.indexOf(':') + 1)
    if (!names.has(normalized(propertyName))) continue
    const value = finiteNumber(raw)
    if (value !== undefined) return value
  }
  return undefined
}

function capacitanceF(model: 'capacitor' | 'capacitor_polarized', properties: PassiveComponentProperties): number {
  const canonical = directProperty(properties, ['capacitanceF', 'capacitance_f', 'capacitance'])
  if (canonical !== undefined) return canonical

  const legacy = libraryProperty(properties, ['capacitanceF', 'capacitance_f', 'capacitance'])
  if (legacy === undefined) return 0
  return legacy * (model === 'capacitor' ? 1e-9 : 1e-6)
}

function inductanceH(properties: PassiveComponentProperties): number {
  const canonical = directProperty(properties, ['inductanceH', 'inductance_h', 'inductance'])
  if (canonical !== undefined) return canonical

  const legacy = libraryProperty(properties, ['inductanceH', 'inductance_h', 'inductance'])
  return legacy === undefined ? 0 : legacy * 1e-6
}

function voltageRatingV(properties: PassiveComponentProperties): number | undefined {
  return directProperty(properties, ['voltageRatingV', 'voltage_rating_v', 'voltageRating', 'voltage rating'])
    ?? libraryProperty(properties, ['voltageRatingV', 'voltage_rating_v', 'voltageRating', 'voltage rating'])
}

/**
 * Build the extracted topology/value descriptor. Canonical capacitance and
 * inductance fields use SI; prefixed legacy catalog keys use their displayed
 * units as documented above. Returns undefined for unrecognized models.
 */
export function getPassiveComponentModel(
  model: unknown,
  properties: PassiveComponentProperties = {},
): PassiveComponentDescriptor | undefined {
  if (!isPassiveComponentModel(model)) return undefined
  const canonicalModel = model.trim() as PassiveComponentModel

  if (canonicalModel === 'capacitor') {
    return {
      model: canonicalModel,
      kind: 'capacitor',
      terminals: ['1', '2'],
      capacitanceF: capacitanceF(canonicalModel, properties),
      seriesResistanceOhms: 0.01,
    }
  }

  if (canonicalModel === 'capacitor_polarized') {
    const rating = voltageRatingV(properties)
    return {
      model: canonicalModel,
      kind: 'polarized-capacitor',
      terminals: { positive: '+', negative: '-' },
      capacitanceF: capacitanceF(canonicalModel, properties),
      seriesResistanceOhms: 0.01,
      ...(rating === undefined ? {} : { voltageRatingV: rating }),
    }
  }

  return {
    model: canonicalModel,
    kind: 'inductor',
    terminals: ['1', '2'],
    inductanceH: inductanceH(properties),
    ideal: true,
    seriesResistanceOhms: 0,
  }
}

export interface PolarizedCapacitorVoltageCheck {
  /** Negative voltage is reversed polarity for the extracted + to − orientation. */
  reversePolarity: boolean
  /** Undefined means no nominal voltage rating was supplied by the record. */
  overVoltage: boolean | undefined
  /** The extracted model breaks down on reverse polarity or above a known rating. */
  breakdown: boolean
  voltageRatingV?: number
}

/**
 * Compare voltage from the positive pin to the negative pin. Voltage-rating
 * breakdown uses the extracted strict `voltage > rating` condition. When no
 * rating property is present there is no invented cutoff; reverse polarity is
 * still detectable from the terminal orientation.
 */
export function checkPolarizedCapacitorVoltage(
  properties: PassiveComponentProperties,
  terminalVoltageV: number,
): PolarizedCapacitorVoltageCheck | undefined {
  if (!Number.isFinite(terminalVoltageV)) return undefined
  const rating = voltageRatingV(properties)
  const reversePolarity = terminalVoltageV < 0
  const overVoltage = rating === undefined ? undefined : terminalVoltageV > rating
  return {
    reversePolarity,
    overVoltage,
    breakdown: reversePolarity || overVoltage === true,
    ...(rating === undefined ? {} : { voltageRatingV: rating }),
  }
}
