/**
 * Electrical topology transcribed from extracted module 12798
 * (sensorSoilMoisture). This descriptor is solver-agnostic: integration can
 * canonicalize the external aliases and stamp the listed internal elements.
 */
export const SOIL_MOISTURE_MODEL = Object.freeze({
  id: 'sensorSoilMoisture',
  moduleSource: 'tinkercad-engine-complete-extracted/models/sensorSoilMoisture--module-12798.js',
  terminals: {
    power: { external: 'Power', schematic: ['vcc1', 'vcc2'] },
    ground: { external: 'Ground', schematic: ['gnd1', 'gnd2'] },
    signal: { external: 'Signal', schematic: ['sig1', 'sig2'] },
  },
  mergedTerminalPairs: [
    ['vcc1', 'vcc2'],
    ['gnd1', 'gnd2'],
    ['sig1', 'sig2'],
  ],
  control: {
    property: 'position',
    defaultPosition: 0,
  },
  topology: {
    npn: { base: 'probe1', emitter: 'sig1', collector: 'vcc1' },
    fixedResistors: [
      { a: 'sig1', b: 'gnd1', resistanceOhms: 10_000 },
      { a: 'vcc1', b: 'probe2', resistanceOhms: 100 },
    ],
    probe: { a: 'probe1', b: 'probe2' },
  },
})

export type SoilMoistureOperatingPoint = Readonly<{
  position: number
  probeResistanceOhms: number
}>

/** Exact extracted formula; position is neither clamped nor quantized. */
export function soilMoistureProbeResistanceOhms(position: number): number {
  return Math.pow(10, 9.76 / (position + 1))
}

/** Resolve the variable probe branch for the supplied moisture position. */
export function evaluateSoilMoisture(position: number): SoilMoistureOperatingPoint {
  return {
    position,
    probeResistanceOhms: soilMoistureProbeResistanceOhms(position),
  }
}
