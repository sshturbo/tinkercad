import type { Level, Runtime } from './model'

// CircuitLab Studio digital logic models for 74HC series ICs.
// Digital truth tables, clock edges, and pin functional definitions for local simulation.
type Gate = { count: number; inputs: string; operation: 'and' | 'or' | 'xor' | 'not'; inverted?: boolean }

const gates: Record<string, Gate> = {
  '74HC00': { count: 4, inputs: 'AB', operation: 'and', inverted: true },
  '74HC02': { count: 4, inputs: 'AB', operation: 'or', inverted: true },
  '74HC04': { count: 6, inputs: 'A', operation: 'not' },
  '74HC08': { count: 4, inputs: 'AB', operation: 'and' },
  '74HC10': { count: 3, inputs: 'ABC', operation: 'and', inverted: true },
  '74HC11': { count: 3, inputs: 'ABC', operation: 'and' },
  '74HC14': { count: 6, inputs: 'A', operation: 'not' },
  '74HC20': { count: 2, inputs: 'ABCD', operation: 'and', inverted: true },
  '74HC21': { count: 2, inputs: 'ABCD', operation: 'and' },
  '74HC27': { count: 3, inputs: 'ABC', operation: 'or', inverted: true },
  '74HC32': { count: 4, inputs: 'AB', operation: 'or' },
  '74HC86': { count: 4, inputs: 'AB', operation: 'xor' },
  // The Schmitt trigger thresholds are analog; digital levels retain its NAND table.
  '74HC132': { count: 4, inputs: 'AB', operation: 'and', inverted: true },
}

export const extractedModelNames = new Set([
  ...Object.keys(gates), 'CD4511', '74HC73', '74HC74', '74HC75', '74HC93', '74HC283', '74HC4017', '74HC595',
])

export function extractedModelPins(model: string): string[] {
  if (model === 'CD4511') return ['Power', 'Ground', 'AIN', 'BIN', 'CIN', 'DIN', 'LT', 'BI', 'LE', 'A', 'B', 'C', 'D', 'E', 'F', 'G']
  const gate = gates[model]
  if (gate) {
    const pins = ['Power', 'Ground']
    for (let n = 1; n <= gate.count; n++) {
      for (const input of gate.inputs) pins.push(gate.operation === 'not' ? `Input ${n}` : `Input ${n}${input}`)
      pins.push(`Output ${n}`)
    }
    return pins
  }
  if (model === '74HC283') return [
    'Power', 'Ground', 'Carry In', 'Carry Out',
    ...[0, 1, 2, 3].flatMap(n => [`Input ${n}A`, `Input ${n}B`, `Output Bit ${n}`]),
  ]
  if (model === '74HC75') return [
    'Power', 'Ground', 'Enable 1 & 2', 'Enable 3 & 4',
    ...[1, 2, 3, 4].flatMap(n => [`Input ${n}`, `Output ${n}`, `Inverted Output ${n}`]),
  ]
  if (model === '74HC73') return [
    'Power', 'Ground',
    ...[1, 2].flatMap(n => [`J ${n}`, `K ${n}`, `Clock ${n}`, `Reset ${n}`, `Output ${n}`, `Inverted Output ${n}`]),
  ]
  if (model === '74HC74') return [
    'Power', 'Ground',
    ...[1, 2].flatMap(n => [`Input ${n}`, `Clock ${n}`, `Set ${n}`, `Reset ${n}`, `Output ${n}`, `Inverted Output ${n}`]),
  ]
  if (model === '74HC93') return [
    'Power', 'Ground', 'Clock 0', 'Clock 1', 'Reset 1', 'Reset 2',
    ...[0, 1, 2, 3].map(n => `Output Bit ${n}`),
  ]
  if (model === '74HC4017') return [
    'Power', 'Ground', 'Clock', 'Clock Enable', 'Reset', 'Inverted Output 10',
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `Output ${n}`),
  ]
  if (model === '74HC595') return [
    'Power', 'Ground', 'Input', 'Shift Register Clear', 'Shift Register Clock',
    'Output Register Clock', 'Output Enable', 'Inverted Output 8',
    ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => `Output ${n}`),
  ]
  return []
}

const invert = (value: Level): Level => value === '0' ? '1' : value === '1' ? '0' : 'X'
const and = (a: Level, b: Level): Level => a === '0' || b === '0' ? '0' : a === '1' && b === '1' ? '1' : 'X'
const or = (a: Level, b: Level): Level => a === '1' || b === '1' ? '1' : a === '0' && b === '0' ? '0' : 'X'
const xor = (a: Level, b: Level): Level => a === 'X' || b === 'X' ? 'X' : a === b ? '0' : '1'

export function driveExtractedCombinational(
  model: string,
  read: (pin: string) => Level,
  drive: (pin: string, value: Level) => void,
): boolean {
  const gate = gates[model]
  if (gate) {
    for (let n = 1; n <= gate.count; n++) {
      const inputs = [...gate.inputs].map(input => read(gate.operation === 'not' ? `Input ${n}` : `Input ${n}${input}`))
      let output = gate.operation === 'not' ? invert(inputs[0])
        : inputs.slice(1).reduce((value, input) => gate.operation === 'and' ? and(value, input) : gate.operation === 'or' ? or(value, input) : xor(value, input), inputs[0])
      if (gate.inverted) output = invert(output)
      drive(`Output ${n}`, output)
    }
    return true
  }
  if (model === 'CD4511') return false // BCD latch and lamp-test controls are handled as a sequential model.
  if (model === '74HC283') {
    const inputs = [read('Carry In'), ...[0, 1, 2, 3].flatMap(n => [read(`Input ${n}A`), read(`Input ${n}B`)])]
    if (inputs.includes('X')) {
      for (let n = 0; n < 4; n++) drive(`Output Bit ${n}`, 'X')
      drive('Carry Out', 'X')
      return true
    }
    let total = read('Carry In') === '1' ? 1 : 0
    for (let n = 0; n < 4; n++) total += (read(`Input ${n}A`) === '1' ? 1 : 0) * 2 ** n + (read(`Input ${n}B`) === '1' ? 1 : 0) * 2 ** n
    for (let n = 0; n < 4; n++) drive(`Output Bit ${n}`, total & (1 << n) ? '1' : '0')
    drive('Carry Out', total & 16 ? '1' : '0')
    return true
  }
  return false
}

export function driveExtractedSequential(model: string, partId: string, runtime: Runtime, drive: (pin: string, value: Level) => void): boolean {
  const state = (name: string, fallback: Level = '0') => runtime.q[`${partId}:${name}`] ?? fallback
  if (model === 'CD4511') {
    const bits = [0, 1, 2, 3].map(index => state(`CD4511:B${index}`))
    const bcd = bits.some(value => value === 'X') ? -1 : bits.reduce((value, bit, index) => value | (bit === '1' ? 1 << index : 0), 0)
    const segments = [
      [1, 1, 1, 1, 1, 1, 0], [0, 1, 1, 0, 0, 0, 0], [1, 1, 0, 1, 1, 0, 1], [1, 1, 1, 1, 0, 0, 1],
      [0, 1, 1, 0, 0, 1, 1], [1, 0, 1, 1, 0, 1, 1], [1, 0, 1, 1, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 0, 1, 1],
    ][bcd]
    for (const [index, pin] of ['A', 'B', 'C', 'D', 'E', 'F', 'G'].entries()) {
      const lampTest = state('CD4511:LT'), blanking = state('CD4511:BI')
      const value = lampTest === '0' ? '1' : blanking === '0' ? '0'
        : lampTest === 'X' || blanking === 'X' || bcd < 0 ? 'X'
          : segments?.[index] ? '1' : '0'
      drive(pin, value)
    }
  } else if (model === '74HC73' || model === '74HC74') {
    for (let n = 1; n <= 2; n++) {
      const q = state(`Q${n}`, model === '74HC73' ? '0' : 'X')
      drive(`Output ${n}`, q)
      drive(`Inverted Output ${n}`, invert(q))
    }
  } else if (model === '74HC75') {
    for (let n = 1; n <= 4; n++) {
      const q = state(`Q${n}`)
      drive(`Output ${n}`, q)
      drive(`Inverted Output ${n}`, invert(q))
    }
  } else if (model === '74HC93') {
    for (let n = 0; n < 4; n++) drive(`Output Bit ${n}`, state(`Q${n}`))
  } else if (model === '74HC4017') {
    const count = Array.from({ length: 10 }, (_, index) => index).find(index => state(`Q${index}`, index === 0 ? '1' : '0') === '1') ?? 0
    for (let n = 0; n < 10; n++) drive(`Output ${n + 1}`, count === n ? '1' : '0')
    drive('Inverted Output 10', count < 5 ? '1' : '0')
  } else if (model === '74HC595') {
    for (let n = 0; n < 8; n++) drive(`Output ${n + 1}`, state(`store${n}`))
    drive('Inverted Output 8', state('shift7'))
  } else return false
  return true
}

export function updateExtractedSequential(model: string, partId: string, runtime: Runtime, read: (pin: string) => Level): boolean {
  const key = (name: string) => `${partId}:${name}`
  const state = (name: string, fallback: Level = '0') => runtime.q[key(name)] ?? fallback
  let changed = false
  const set = (name: string, value: Level) => {
    if (state(name) !== value) { runtime.q[key(name)] = value; changed = true }
  }
  const edge = (pin: string, direction: 'rising' | 'falling') => {
    const previous = runtime.prev_clock[key(pin)] ?? 'X'
    const current = read(pin)
    runtime.prev_clock[key(pin)] = current
    return direction === 'rising' ? previous === '0' && current === '1' : previous === '1' && current === '0'
  }
  if (model === 'CD4511') {
    let changed = false
    for (const control of ['LT', 'BI'] as const) {
      const name = `CD4511:${control}`
      const value = read(control)
      if (state(name) !== value) { runtime.q[key(name)] = value; changed = true }
    }
    if (read('LE') === '0') {
      for (let index = 0; index < 4; index++) {
        const pin = ['AIN', 'BIN', 'CIN', 'DIN'][index]
        const name = `CD4511:B${index}`
        const value = read(pin)
        if (state(name) !== value) { runtime.q[key(name)] = value; changed = true }
      }
    }
    return changed
  }
  if (model === '74HC73' || model === '74HC74') {
    for (let n = 1; n <= 2; n++) {
      const clock = edge(`Clock ${n}`, model === '74HC73' ? 'falling' : 'rising')
      const reset = read(`Reset ${n}`)
      const preset = model === '74HC74' ? read(`Set ${n}`) : '1'
      const current = state(`Q${n}`, model === '74HC73' ? '0' : 'X')
      let next = current
      if (reset === '0' && preset === '0') next = 'X'
      else if (reset === '0') {
        next = '0'
        runtime.prev_clock[key(`Clock ${n}`)] = read(`Clock ${n}`)
      } else if (preset === '0') {
        next = '1'
        runtime.prev_clock[key(`Clock ${n}`)] = read(`Clock ${n}`)
      } else if (reset === '1' && preset === '1' && clock) {
        if (model === '74HC74') next = read(`Input ${n}`)
        else {
          const j = read(`J ${n}`), k = read(`K ${n}`)
          if (j === '0' && k === '1') next = '0'
          else if (j === '1' && k === '0') next = '1'
          else if (j === '1' && k === '1') next = invert(current)
          else if (j !== '0' || k !== '0') next = 'X'
        }
      }
      set(`Q${n}`, next)
    }
  } else if (model === '74HC75') {
    for (let n = 1; n <= 4; n++) {
      const enable = read(n <= 2 ? 'Enable 1 & 2' : 'Enable 3 & 4')
      if (enable === '1') set(`Q${n}`, read(`Input ${n}`))
    }
  } else if (model === '74HC93') {
    const clock0 = edge('Clock 0', 'falling')
    const clock1 = edge('Clock 1', 'falling')
    if (read('Reset 1') === '1' && read('Reset 2') === '1') {
      for (let n = 0; n < 4; n++) set(`Q${n}`, '0')
      runtime.prev_clock[key('Clock 0')] = read('Clock 0')
      runtime.prev_clock[key('Clock 1')] = read('Clock 1')
    } else {
      if (clock0) set('Q0', invert(state('Q0')))
      if (clock1) {
        const current = [1, 2, 3].reduce((sum, n) => sum + (state(`Q${n}`) === '1' ? 2 ** (n - 1) : 0), 0)
        const next = (current + 1) % 8
        for (let n = 1; n < 4; n++) set(`Q${n}`, next & (1 << (n - 1)) ? '1' : '0')
      }
    }
  } else if (model === '74HC4017') {
    const clock = edge('Clock', 'rising')
    const enable = edge('Clock Enable', 'falling')
    const count = Array.from({ length: 10 }, (_, index) => index).find(index => state(`Q${index}`, index === 0 ? '1' : '0') === '1') ?? 0
    const next = read('Reset') === '1' ? 0
      : (clock && read('Clock Enable') === '0') || (enable && read('Clock') === '1') ? (count + 1) % 10 : count
    for (let n = 0; n < 10; n++) set(`Q${n}`, next === n ? '1' : '0')
  } else if (model === '74HC595') {
    const shiftClock = edge('Shift Register Clock', 'rising')
    const storeClock = edge('Output Register Clock', 'rising')
    if (read('Shift Register Clear') === '0') for (let n = 0; n < 8; n++) set(`shift${n}`, '0')
    if (storeClock) for (let n = 0; n < 8; n++) set(`store${n}`, state(`shift${n}`))
    if (read('Shift Register Clear') === '1' && shiftClock) {
      for (let n = 7; n >= 1; n--) set(`shift${n}`, state(`shift${n - 1}`))
      set('shift0', read('Input'))
    }
  }
  return changed
}
