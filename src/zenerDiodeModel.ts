/**
 * Extracted Zener diode network from
 * tinkercad-engine-complete-extracted/models/zenerDiode--module-1660.js.
 *
 * This descriptor preserves the extracted topology and diode parameters. It does not
 * itself solve the nonlinear diode equations; the analog solver stamps these branches.
 */
export type ZenerDiodeProperties = Readonly<Record<string, unknown>>

export type ZenerDiodeModel = {
  zenerVoltageV: number
  forwardDiode: {
    anode: 'A'
    cathode: 'C'
    saturationCurrentA: 1e-12
    idealityFactor: 1
  }
  reverseBranch: {
    source: {
      positive: 'C'
      negative: 'reverse_inner_net_'
      voltageV: number
      resistanceOhms: 55
    }
    diode: {
      anode: 'reverse_inner_net_'
      cathode: 'A'
      saturationCurrentA: 1e-12
      idealityFactor: 1
    }
  }
}

export const ZENER_DIODE_MODEL = Object.freeze({
  id: 'zenerDiode',
  source: 'tinkercad-engine-complete-extracted/models/zenerDiode--module-1660.js',
  voltageProperty: 'zener voltage',
  defaultZenerVoltageV: 5.1,
  saturationCurrentA: 1e-12 as const,
  idealityFactor: 1 as const,
  reverseOffsetVoltageV: 0.48,
  reverseSeriesResistanceOhms: 55 as const,
})

function zenerVoltageFrom(properties?: ZenerDiodeProperties | null): number {
  const raw = properties?.[ZENER_DIODE_MODEL.voltageProperty] ?? properties?.[`libraryProperty:${ZENER_DIODE_MODEL.voltageProperty}`]
  const value = typeof raw === 'number' ? raw
    : typeof raw === 'string' && raw.trim() !== '' ? Number(raw)
      : Number.NaN
  // The extracted implementation uses `property || 5.1`, so zero also selects the default.
  return Number.isFinite(value) && value !== 0 ? value : ZENER_DIODE_MODEL.defaultZenerVoltageV
}

/** Return the extracted two-branch Zener network for the visible A and C terminals. */
export function getZenerDiodeModel(properties?: ZenerDiodeProperties | null): ZenerDiodeModel {
  const zenerVoltageV = zenerVoltageFrom(properties)
  const diode = {
    saturationCurrentA: ZENER_DIODE_MODEL.saturationCurrentA,
    idealityFactor: ZENER_DIODE_MODEL.idealityFactor,
  } as const
  return {
    zenerVoltageV,
    forwardDiode: { anode: 'A', cathode: 'C', ...diode },
    reverseBranch: {
      source: {
        positive: 'C',
        negative: 'reverse_inner_net_',
        voltageV: zenerVoltageV - ZENER_DIODE_MODEL.reverseOffsetVoltageV,
        resistanceOhms: ZENER_DIODE_MODEL.reverseSeriesResistanceOhms,
      },
      diode: { anode: 'reverse_inner_net_', cathode: 'A', ...diode },
    },
  }
}
