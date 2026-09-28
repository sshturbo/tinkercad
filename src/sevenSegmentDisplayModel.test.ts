import { describe, expect, it } from 'vitest'
import {
  createSevenSegmentTopology,
  evaluateSevenSegmentDisplay,
  resolveSevenSegmentCommonType,
  resolveSevenSegmentTerminal,
  sevenSegmentDiodeCurrentFromVoltage,
  SEVEN_SEGMENT_MODEL,
  sevenSegmentDisplayBrightness,
} from './sevenSegmentDisplayModel'

describe('contrato extraído do display de 7 segmentos', () => {
  it('registra os aliases físicos e schematic e une os dois terminais Common', () => {
    expect(SEVEN_SEGMENT_MODEL).toMatchObject({
      id: 'seven_segment_digit_5011bh',
      moduleSource: 'tinkercad-engine-complete-extracted/models/seven_segment_digit_5011bh--module-28034.js',
      segments: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'],
      breadboardPinOrder: ['G', 'F', 'Common', 'A', 'B', 'E', 'D', 'Common', 'C', 'DP'],
      common: {
        breadboardPins: ['Common', 'Common'],
        schematicTerminals: ['com1', 'com2'],
        internalNode: 'seven_segment_common',
        merged: true,
      },
      control: { property: 'common', defaultCommonType: 'anode', commonTypes: ['anode', 'cathode'] },
    })

    expect(resolveSevenSegmentTerminal('G')).toBe('g')
    expect(resolveSevenSegmentTerminal('a')).toBe('a')
    expect(resolveSevenSegmentTerminal('DP')).toBe('dp')
    expect(resolveSevenSegmentTerminal('com1')).toBe('common')
    expect(resolveSevenSegmentTerminal('COM2')).toBe('common')
    expect(resolveSevenSegmentTerminal(' Common ')).toBe('common')
    expect(resolveSevenSegmentTerminal('unknown')).toBeUndefined()
  })

  it('declara oito díodos e quatro resistores controlados por segmento', () => {
    const topology = createSevenSegmentTopology()
    expect(topology.commonType).toBe('anode')
    expect(topology.commonNode).toBe('seven_segment_common')
    expect(topology.mergedCommonTerminals).toEqual(['com1', 'com2'])
    expect(topology.channels.map(channel => channel.segment)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'])
    expect(topology.channels).toHaveLength(8)

    const a = topology.channels[0]
    expect(a.diode).toEqual({
      anode: 'anode_net_a',
      cathode: 'cathode_net_a',
      saturationCurrentA: 1e-18,
      idealityFactor: 1.8,
    })
    expect(SEVEN_SEGMENT_MODEL.diode.thermalVoltageReferenceAt25CV * a.diode.idealityFactor).toBeCloseTo(0.04644)
    expect(a.resistors).toEqual([
      { name: 'segmentToAnode', from: 'a', to: 'anode_net_a', resistanceOhms: 1e10 },
      { name: 'segmentToCathode', from: 'a', to: 'cathode_net_a', resistanceOhms: 1e-6 },
      { name: 'commonToAnode', from: 'seven_segment_common', to: 'anode_net_a', resistanceOhms: 1e-6 },
      { name: 'commonToCathode', from: 'seven_segment_common', to: 'cathode_net_a', resistanceOhms: 1e10 },
    ])
    expect(a.resistors).toHaveLength(SEVEN_SEGMENT_MODEL.resistor.resistorsPerSegment)
  })

  it('inverte os caminhos ativos para common cathode', () => {
    const topology = createSevenSegmentTopology('cathode')
    expect(topology.commonType).toBe('cathode')
    expect(topology.channels[0].resistors).toEqual([
      { name: 'segmentToAnode', from: 'a', to: 'anode_net_a', resistanceOhms: 1e-6 },
      { name: 'segmentToCathode', from: 'a', to: 'cathode_net_a', resistanceOhms: 1e10 },
      { name: 'commonToAnode', from: 'seven_segment_common', to: 'anode_net_a', resistanceOhms: 1e10 },
      { name: 'commonToCathode', from: 'seven_segment_common', to: 'cathode_net_a', resistanceOhms: 1e-6 },
    ])
    expect(resolveSevenSegmentCommonType('invalid')).toBe('anode')
    expect(resolveSevenSegmentCommonType()).toBe('anode')
  })

  it('calcula corrente e breakdown separadamente para cada segmento, com limite estrito e assinado', () => {
    const evaluation = evaluateSevenSegmentDisplay({
      a: 0.02,
      b: 0.020001,
      c: 0.01,
      d: 0,
      e: 0,
      f: 0,
      g: 0,
      dp: -0.02,
    })
    expect(evaluation.channels.a).toMatchObject({ currentA: 0.02, brightnessFraction: 1, breakdown: false })
    expect(evaluation.channels.b).toMatchObject({ currentA: 0.020001, brightnessFraction: 1.00005, breakdown: true })
    expect(evaluation.channels.c).toMatchObject({ currentA: 0.01, brightnessFraction: 0.5, breakdown: false })
    expect(evaluation.channels.dp).toMatchObject({ currentA: -0.02, brightnessFraction: -1, breakdown: false })
    expect(evaluation.brightness).toEqual([1, 1.00005, 0.5, 0, 0, 0, 0, -1])
    expect(evaluation.displayBrightness[0]).toBe(1)
    expect(evaluation.displayBrightness[1]).toBe(1)
    expect(evaluation.displayBrightness[2]).toBeCloseTo(Math.pow(0.5, 1 / 3))
    expect(evaluation.displayBrightness[7]).toBe(0)
    expect(evaluation.breakdown).toBe(true)

    const atLimit = evaluateSevenSegmentDisplay({ a: 0.02, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, dp: 0 })
    expect(atLimit.breakdown).toBe(false)
  })

  it('usa Shockley com Is=1e-18 A e Vt de referência multiplicado por n=1.8', () => {
    expect(sevenSegmentDiodeCurrentFromVoltage(0)).toBe(0)
    expect(sevenSegmentDiodeCurrentFromVoltage(0.1)).toBeGreaterThan(0)
    expect(sevenSegmentDiodeCurrentFromVoltage(0.5)).toBeGreaterThan(sevenSegmentDiodeCurrentFromVoltage(0.1))
    const clampVoltage = 40 * 0.0258 * 1.8
    expect(sevenSegmentDiodeCurrentFromVoltage(clampVoltage + 1)).toBeGreaterThan(sevenSegmentDiodeCurrentFromVoltage(clampVoltage))
  })

  it('aplica o limiar visual e o clamp sem alterar a leitura elétrica bruta', () => {
    expect(sevenSegmentDisplayBrightness(0.000999)).toBe(0)
    expect(sevenSegmentDisplayBrightness(0.001)).toBeCloseTo(0.1)
    expect(sevenSegmentDisplayBrightness(0.5)).toBeCloseTo(Math.pow(0.5, 1 / 3))
    expect(sevenSegmentDisplayBrightness(2)).toBe(1)
    expect(sevenSegmentDisplayBrightness(-0.5)).toBe(0)
  })
})
