import { describe, expect, it } from 'vitest'
import { canonicalTimer556Pin, TIMER556_MODEL } from './timer556Model'
import { TIMER555_MODEL } from './timer555Model'

describe('modelo extraído do Timer556', () => {
  it('descreve os dois canais 555 e os rails compartilhados', () => {
    expect(TIMER556_MODEL.sharedCore).toBe(TIMER555_MODEL)
    expect(TIMER556_MODEL.sharedPins).toMatchObject({
      ground: { engine: 'gnd', aliases: ['Ground', 'GND', '7', 'gnd'] },
      vcc: { engine: 'vcc', aliases: ['Power', 'Vcc', 'VCC', '14', 'vcc'] },
    })
    expect(Object.keys(TIMER556_MODEL.channels)).toEqual(['A', 'B'])
    expect(Object.values(TIMER556_MODEL.channels.A.pins).map(pin => pin.engine)).toEqual([
      'discharge_a', 'threshold_a', 'control_a', 'reset_a', 'output_a', 'trigger_a',
    ])
    expect(Object.values(TIMER556_MODEL.channels.B.pins).map(pin => pin.engine)).toEqual([
      'trigger_b', 'output_b', 'reset_b', 'control_b', 'threshold_b', 'discharge_b',
    ])
  })

  it('canonicaliza cada número DIP, nome físico e alias esquemático', () => {
    const aliases = [
      ['1', 'discharge_a'], ['Discharge A', 'discharge_a'], ['discharge_a', 'discharge_a'],
      ['2', 'threshold_a'], ['Threshold A', 'threshold_a'], ['threshold_a', 'threshold_a'],
      ['3', 'control_a'], ['Control A', 'control_a'], ['control_a', 'control_a'],
      ['4', 'reset_a'], ['Reset A', 'reset_a'], ['reset_a', 'reset_a'],
      ['5', 'output_a'], ['Output A', 'output_a'], ['output_a', 'output_a'],
      ['6', 'trigger_a'], ['Trigger A', 'trigger_a'], ['trigger_a', 'trigger_a'],
      ['7', 'gnd'], ['Ground', 'gnd'], ['gnd', 'gnd'],
      ['8', 'trigger_b'], ['Trigger B', 'trigger_b'], ['trigger_b', 'trigger_b'],
      ['9', 'output_b'], ['Output B', 'output_b'], ['output_b', 'output_b'],
      ['10', 'reset_b'], ['Reset B', 'reset_b'], ['reset_b', 'reset_b'],
      ['11', 'control_b'], ['Control B', 'control_b'], ['control_b', 'control_b'],
      ['12', 'threshold_b'], ['Threshold B', 'threshold_b'], ['threshold_b', 'threshold_b'],
      ['13', 'discharge_b'], ['Discharge B', 'discharge_b'], ['discharge_b', 'discharge_b'],
      ['14', 'vcc'], ['Power', 'vcc'], ['vcc', 'vcc'],
    ] as const
    for (const [alias, engine] of aliases) expect(canonicalTimer556Pin(alias)).toBe(engine)
    expect(canonicalTimer556Pin('unknown')).toBeUndefined()
  })
})
