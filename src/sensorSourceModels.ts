/**
 * Parametric models for source-like sensors discovered in the extracted Tinkercad
 * engine. These descriptors deliberately describe topology; the DC solver owns
 * stamping and convergence.
 *
 * Units: temperatures are integer degrees Celsius; voltages V, currents A,
 * resistances ohms. Solar illumination is a percentage in [0, 100].
 */

export const SENSOR_SOURCE_MODELS = ['TMP36', 'solarCell'] as const
export type SensorSourceModelName = typeof SENSOR_SOURCE_MODELS[number]

export interface SensorControlDescriptor {
  property: string
  label: string
  unit: string
  min: number
  max: number
  step: number
  default: number
  description: string
}

export const sensorSourceControls: Readonly<Record<SensorSourceModelName, readonly SensorControlDescriptor[]>> = {
  TMP36: [{
    property: 'temperatureC',
    label: 'Temperatura',
    unit: '°C',
    min: -40,
    max: 125,
    step: 1,
    default: 25,
    description: 'O modelo extraído arredonda a temperatura para graus inteiros.',
  }],
  solarCell: [{
    property: 'illumination',
    label: 'Iluminação',
    unit: '%',
    min: 0,
    max: 100,
    step: 2,
    default: 100,
    description: 'A corrente fotogerada varia com a iluminação elevada a 2,2.',
  }],
}

export type SensorSourceElement =
  | { type: 'resistor'; a: string; b: string; resistanceOhms: number }
  | {
      type: 'diode'
      anode: string
      cathode: string
      saturationCurrentA: number
      thermalVoltageV: number
      parallelLeakageResistanceOhms: number
    }

export type SensorSourceDescriptor =
  | {
      model: 'TMP36'
      kind: 'thevenin'
      terminals: { positive: 'Vout'; negative: 'Gnd'; supplyPositive: 'Vcc'; supplyNegative: 'Gnd' }
      voltage: number
      internalResistance: number
      supplyResistance: number
      minimumSupplyVoltage: number
      metadata: { temperatureC: number }
    }
  | {
      model: 'solarCell'
      kind: 'norton'
      terminals: { positive: 'Positive'; negative: 'Negative' }
      internalNode: 'internal'
      currentSource: { from: 'Negative'; to: 'internal'; currentA: number }
      elements: SensorSourceElement[]
      metadata: {
        illuminationPercent: number
        lightFraction: number
        peakVoltageV: number
        peakCurrentA: number
      }
    }

const modelNames = new Set<string>(SENSOR_SOURCE_MODELS)

export function isSensorSourceModel(model: unknown): model is SensorSourceModelName {
  return typeof model === 'string' && modelNames.has(model.trim())
}

export function getSensorSourceControls(model: unknown): readonly SensorControlDescriptor[] | undefined {
  return isSensorSourceModel(model) ? sensorSourceControls[model] : undefined
}

function finiteProperty(properties: Record<string, unknown>, keys: readonly string[], fallback: number): number {
  for (const key of keys) {
    const value = properties[key]
    if (value === undefined || value === null || value === '') continue
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function normalizedFiniteProperty(
  properties: Record<string, unknown>,
  normalizedKeys: readonly string[],
  fallback: number,
): number {
  const wanted = new Set(normalizedKeys)
  for (const [key, raw] of Object.entries(properties)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!wanted.has(normalized) || raw === undefined || raw === null || raw === '') continue
    const value = Number(raw)
    if (Number.isFinite(value)) return value
  }
  return fallback
}

function bounded(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function temperatureCelsius(properties: Record<string, unknown>): number {
  const explicit = finiteProperty(properties, ['temperatureC', 'temperature_c', 'temperature'], Number.NaN)
  if (Number.isFinite(explicit)) return Math.round(bounded(explicit, -40, 125))

  const position = finiteProperty(properties, ['position'], Number.NaN)
  if (Number.isFinite(position)) return Math.round(-40 + 165 * bounded(position, 0, 1))
  return 25
}

function solarIllumination(properties: Record<string, unknown>): { percent: number; fraction: number } {
  const explicitPercent = finiteProperty(properties, ['illumination', 'illuminationPercent', 'lightPercent'], Number.NaN)
  if (Number.isFinite(explicitPercent)) {
    const percent = Math.round(bounded(explicitPercent, 0, 100) / 2) * 2
    return { percent, fraction: percent / 100 }
  }

  const normalizedPosition = finiteProperty(properties, ['position'], 1)
  const fraction = Math.round(bounded(normalizedPosition, 0, 1) * 50) / 50
  return { percent: fraction * 100, fraction }
}

function solarPeakCurrentA(properties: Record<string, unknown>): number {
  const explicitAmps = finiteProperty(
    properties,
    ['peakCurrentA', 'peak_current_a', 'peakCurrent', 'peak_current', 'peak current'],
    Number.NaN,
  )
  if (Number.isFinite(explicitAmps)) return Math.max(0, explicitAmps)

  const legacyMilliAmps = normalizedFiniteProperty(properties, ['librarypropertypeakcurrent'], Number.NaN)
  if (Number.isFinite(legacyMilliAmps)) return Math.max(0, legacyMilliAmps / 1000)

  // The catalog record stores 100 with default_prefix "m" (100 mA).
  return 0.1
}

function solarPeakVoltageV(properties: Record<string, unknown>): number {
  const value = finiteProperty(
    properties,
    ['peakVoltageV', 'peak_voltage_v', 'peakVoltage', 'peak_voltage', 'peak voltage'],
    Number.NaN,
  )
  if (Number.isFinite(value)) return Math.max(0, value)

  const legacy = normalizedFiniteProperty(properties, ['librarypropertypeakvoltage'], Number.NaN)
  return Number.isFinite(legacy) ? Math.max(0, legacy) : 5
}

/**
 * Return a topology descriptor for the source sensor, or undefined for models
 * handled elsewhere. It accepts direct SI-unit properties, plus the catalog's
 * legacy libraryProperty:peak current value in raw mA.
 */
export function getSensorSourceModel(
  model: unknown,
  properties: Record<string, unknown> = {},
): SensorSourceDescriptor | undefined {
  if (!isSensorSourceModel(model)) return undefined

  const canonicalModel = model.trim() as SensorSourceModelName
  if (canonicalModel === 'TMP36') {
    const temperatureC = temperatureCelsius(properties)
    return {
      model: canonicalModel,
      kind: 'thevenin',
      terminals: { positive: 'Vout', negative: 'Gnd', supplyPositive: 'Vcc', supplyNegative: 'Gnd' },
      voltage: Number((0.5 + 0.01 * temperatureC).toFixed(10)),
      internalResistance: 100_000,
      supplyResistance: 100_000,
      minimumSupplyVoltage: 2.7,
      metadata: { temperatureC },
    }
  }

  const illumination = solarIllumination(properties)
  const peakVoltageV = solarPeakVoltageV(properties)
  const peakCurrentA = solarPeakCurrentA(properties)
  const currentA = peakCurrentA * Math.pow(illumination.fraction, 2.2)
  const thermalVoltageV = peakCurrentA > 0 && peakVoltageV > 0
    ? 1.3989758 * peakCurrentA * Math.pow(peakVoltageV, -0.03997227)
    : 0.0258

  return {
    model: canonicalModel,
    kind: 'norton',
    terminals: { positive: 'Positive', negative: 'Negative' },
    internalNode: 'internal',
    // The extracted engine's current-source stamp injects current from Negative into the internal node.
    currentSource: { from: 'Negative', to: 'internal', currentA },
    elements: [
      { type: 'resistor', a: 'internal', b: 'Positive', resistanceOhms: 4 },
      { type: 'resistor', a: 'internal', b: 'Negative', resistanceOhms: 10_000 },
      {
        type: 'diode',
        anode: 'internal',
        cathode: 'Negative',
        saturationCurrentA: 1e-12,
        thermalVoltageV,
        parallelLeakageResistanceOhms: 1e10,
      },
    ],
    metadata: {
      illuminationPercent: illumination.percent,
      lightFraction: illumination.fraction,
      peakVoltageV,
      peakCurrentA,
    },
  }
}
