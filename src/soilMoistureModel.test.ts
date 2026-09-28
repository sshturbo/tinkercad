import { describe, expect, it } from 'vitest'
import {
  evaluateSoilMoisture,
  soilMoistureProbeResistanceOhms,
  SOIL_MOISTURE_MODEL,
} from './soilMoistureModel'

describe('modelo extraído do sensor de umidade do solo', () => {
  it('registra aliases, pares unidos, topologia e controle do módulo 12798', () => {
    expect(SOIL_MOISTURE_MODEL).toMatchObject({
      id: 'sensorSoilMoisture',
      moduleSource: 'tinkercad-engine-complete-extracted/models/sensorSoilMoisture--module-12798.js',
      terminals: {
        power: { external: 'Power', schematic: ['vcc1', 'vcc2'] },
        ground: { external: 'Ground', schematic: ['gnd1', 'gnd2'] },
        signal: { external: 'Signal', schematic: ['sig1', 'sig2'] },
      },
      mergedTerminalPairs: [['vcc1', 'vcc2'], ['gnd1', 'gnd2'], ['sig1', 'sig2']],
      control: { property: 'position', defaultPosition: 0 },
      topology: {
        npn: { base: 'probe1', emitter: 'sig1', collector: 'vcc1' },
        fixedResistors: [
          { a: 'sig1', b: 'gnd1', resistanceOhms: 10_000 },
          { a: 'vcc1', b: 'probe2', resistanceOhms: 100 },
        ],
        probe: { a: 'probe1', b: 'probe2' },
      },
    })
  })

  it('reproduz a resistência de prova exata: aproximadamente 5,754 GΩ seco e 75,858 kΩ molhado', () => {
    const dry = evaluateSoilMoisture(0)
    const wet = evaluateSoilMoisture(1)

    expect(dry.position).toBe(0)
    expect(dry.probeResistanceOhms).toBeCloseTo(5.754e9, -6)
    expect(wet.position).toBe(1)
    expect(wet.probeResistanceOhms).toBeCloseTo(75.858e3, 0)
    expect(soilMoistureProbeResistanceOhms(0)).toBe(Math.pow(10, 9.76))
    expect(soilMoistureProbeResistanceOhms(1)).toBe(Math.pow(10, 4.88))
  })

  it('usa a posição sem clamp ou quantização', () => {
    expect(evaluateSoilMoisture(0.333)).toEqual({
      position: 0.333,
      probeResistanceOhms: Math.pow(10, 9.76 / 1.333),
    })
    expect(evaluateSoilMoisture(1.25).probeResistanceOhms).toBe(Math.pow(10, 9.76 / 2.25))
  })
})
