import { TIMER555_MODEL } from './timer555Model'

/** Dual timer transcribed from the extracted module 73430; each channel is one 555 core. */
export const TIMER556_MODEL = Object.freeze({
  id: 'timer556',
  moduleSource: 'tinkercad-engine-complete-extracted/models/timer556--module-73430.js',
  sharedPins: Object.freeze({
    ground: Object.freeze({ engine: 'gnd', aliases: ['Ground', 'GND', '7', 'gnd'] as const }),
    vcc: Object.freeze({ engine: 'vcc', aliases: ['Power', 'Vcc', 'VCC', '14', 'vcc'] as const }),
  }),
  channels: Object.freeze({
    A: Object.freeze({ pins: Object.freeze({
      discharge: Object.freeze({ engine: 'discharge_a', aliases: ['Discharge A', 'discharge_a', '1'] as const }),
      threshold: Object.freeze({ engine: 'threshold_a', aliases: ['Threshold A', 'threshold_a', '2'] as const }),
      control: Object.freeze({ engine: 'control_a', aliases: ['Control A', 'control_a', '3'] as const }),
      reset: Object.freeze({ engine: 'reset_a', aliases: ['Reset A', 'reset_a', '4'] as const }),
      output: Object.freeze({ engine: 'output_a', aliases: ['Output A', 'output_a', '5'] as const }),
      trigger: Object.freeze({ engine: 'trigger_a', aliases: ['Trigger A', 'trigger_a', '6'] as const }),
    }) }),
    B: Object.freeze({ pins: Object.freeze({
      trigger: Object.freeze({ engine: 'trigger_b', aliases: ['Trigger B', 'trigger_b', '8'] as const }),
      output: Object.freeze({ engine: 'output_b', aliases: ['Output B', 'output_b', '9'] as const }),
      reset: Object.freeze({ engine: 'reset_b', aliases: ['Reset B', 'reset_b', '10'] as const }),
      control: Object.freeze({ engine: 'control_b', aliases: ['Control B', 'control_b', '11'] as const }),
      threshold: Object.freeze({ engine: 'threshold_b', aliases: ['Threshold B', 'threshold_b', '12'] as const }),
      discharge: Object.freeze({ engine: 'discharge_b', aliases: ['Discharge B', 'discharge_b', '13'] as const }),
    }) }),
  }),
  sharedCore: TIMER555_MODEL,
})

export type Timer556ChannelName = keyof typeof TIMER556_MODEL.channels

const normalizePin = (pin: string) => pin.trim().toLowerCase().replace(/[\s-]+/g, '_')

/** Resolve breadboard names, schematic aliases and DIP numbers to engine pin IDs. */
export function canonicalTimer556Pin(pin: string): string | undefined {
  const normalized = normalizePin(pin)
  for (const terminal of Object.values(TIMER556_MODEL.sharedPins)) {
    if (terminal.aliases.some((alias: string) => normalizePin(alias) === normalized)) return terminal.engine
  }
  for (const channel of Object.values(TIMER556_MODEL.channels)) {
    for (const terminal of Object.values(channel.pins)) {
      if (terminal.aliases.some((alias: string) => normalizePin(alias) === normalized)) return terminal.engine
    }
  }
  return undefined
}
