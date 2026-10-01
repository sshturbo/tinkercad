import { normalizeProjectPinNames, pinId, pinNames, type Level, type Project, type Runtime, type Simulation } from './model'
import { canonicalChipPinName } from './pinout'
import { driveExtractedCombinational, driveExtractedSequential, extractedModelPins, updateExtractedSequential } from './extracted-models'

type Result = { simulation: Simulation; runtime: Runtime }

const invert = (a: Level): Level => a === '0' ? '1' : a === '1' ? '0' : 'X'
const and = (a: Level, b: Level): Level => a === '0' || b === '0' ? '0' : a === '1' && b === '1' ? '1' : 'X'
const or = (a: Level, b: Level): Level => a === '1' || b === '1' ? '1' : a === '0' && b === '0' ? '0' : 'X'
const xor = (a: Level, b: Level): Level => a === 'X' || b === 'X' ? 'X' : a === b ? '0' : '1'

export function generatorLevel(properties: Record<string, string | number | boolean> | undefined, runtime: Runtime): Level {
  const amplitude = Math.max(0, Number(properties?.amplitude ?? 5))
  const offset = Number(properties?.offset ?? 2.5)
  const phase = runtime.phase ?? (runtime.clock_high ? 0.25 : 0.75)
  const waveform = properties?.waveform ?? 'square'
  const shape = waveform === 'sine' ? Math.sin(2 * Math.PI * phase) : waveform === 'triangle' ? 1 - 4 * Math.abs((phase + 0.25) % 1 - 0.5) : phase < 0.5 ? 1 : -1
  return offset + amplitude * shape / 2 >= 2.5 ? '1' : '0'
}

function canonical(id: string): string {
  const bits = id.split(':')
  if (bits[0] !== 'board') return id
  if (bits[2] === 'row') return bits.slice(0, 5).join(':')
  return bits.slice(0, 3).join(':')
}

export function simulate(project: Project, state: Runtime, advanceClock = false): Result {
  project = normalizeProjectPinNames(project)
  const runtime: Runtime = { clock_high: advanceClock ? !state.clock_high : state.clock_high, phase: advanceClock && state.phase !== undefined ? (state.phase + 0.5) % 1 : state.phase, buttons: { ...state.buttons }, q: { ...state.q }, prev_clock: { ...state.prev_clock } }
  const parent = new Map<string, string>()
  const add = (id: string) => { id = canonical(id); if (!parent.has(id)) parent.set(id, id); return id }
  const root = (id: string): string => {
    id = add(id)
    const p = parent.get(id)!
    if (p === id) return id
    const r = root(p)
    parent.set(id, r)
    return r
  }
  const join = (a: string, b: string) => { const ra = root(a); const rb = root(b); if (ra !== rb) parent.set(rb, ra) }
  const isResistor = (part: Project['parts'][number]) =>
    part.kind === 'resistor' || part.properties?.simulationModel === 'resistor'
  const isLed = (part: Project['parts'][number]) =>
    part.kind === 'led' || part.properties?.simulationModel === 'led2' || part.properties?.simulationModel === 'ledRGB'
  const isSupply = (part: Project['parts'][number]) =>
    part.kind === 'supply' || part.properties?.simulationModel === 'powerSupply' || part.properties?.simulationModel === 'battery9V' || part.properties?.simulationModel === 'coinCell'
  const isGenerator = (part: Project['parts'][number]) =>
    part.kind === 'generator' || part.properties?.simulationModel === 'function_generator'
  const isButton = (part: Project['parts'][number]) =>
    part.kind === 'button' || part.properties?.simulationModel === 'button'

  const simulationPins = (part: Project['parts'][number]) => {
    if (isResistor(part)) return ['A', 'B', 'Terminal 1', 'Terminal 2', '1', '2']
    if (isLed(part)) return ['A', 'K', 'Anode', 'Cathode', 'anode', 'cathode']
    if (isSupply(part)) return ['PLUS', 'MINUS', 'Positive', 'Negative', 'positive', 'negative', '+', '-']
    if (isGenerator(part)) return ['OUT', 'GND', 'Positive', 'Negative', 'positive', 'negative']
    if (isButton(part)) return ['A1', 'A2', 'B1', 'B2', 'Terminal 1a', 'Terminal 1b', 'Terminal 2a', 'Terminal 2b', 'OUT']
    return part.kind === 'library'
      ? extractedModelPins(String(part.properties?.simulationModel ?? ''))
      : pinNames[part.kind]
  }
  for (const part of project.parts) for (const pin of simulationPins(part)) add(pinId(part, pin))
  for (const wire of project.wires) join(wire.from, wire.to)
  for (const part of project.parts) {
    if (isResistor(part)) {
      const pinA = [pinId(part, 'A'), pinId(part, 'Terminal 2'), pinId(part, '1')]
      const pinB = [pinId(part, 'B'), pinId(part, 'Terminal 1'), pinId(part, '2')]
      for (let i = 1; i < pinA.length; i++) join(pinA[0], pinA[i])
      for (let i = 1; i < pinB.length; i++) join(pinB[0], pinB[i])
      join(pinA[0], pinB[0])
    }
    if (isLed(part)) {
      const pinA = [pinId(part, 'A'), pinId(part, 'Anode'), pinId(part, 'anode'), pinId(part, '+')]
      const pinK = [pinId(part, 'K'), pinId(part, 'Cathode'), pinId(part, 'cathode'), pinId(part, '-')]
      for (let i = 1; i < pinA.length; i++) join(pinA[0], pinA[i])
      for (let i = 1; i < pinK.length; i++) join(pinK[0], pinK[i])
    }
    if (isSupply(part)) {
      const pinPlus = [pinId(part, 'PLUS'), pinId(part, 'Positive'), pinId(part, 'positive'), pinId(part, '+')]
      const pinMinus = [pinId(part, 'MINUS'), pinId(part, 'Negative'), pinId(part, 'negative'), pinId(part, '-')]
      for (let i = 1; i < pinPlus.length; i++) join(pinPlus[0], pinPlus[i])
      for (let i = 1; i < pinMinus.length; i++) join(pinMinus[0], pinMinus[i])
    }
    if (isGenerator(part)) {
      const pinOut = [pinId(part, 'OUT'), pinId(part, 'Positive'), pinId(part, 'positive'), pinId(part, '+')]
      const pinGnd = [pinId(part, 'GND'), pinId(part, 'Negative'), pinId(part, 'negative'), pinId(part, '-')]
      for (let i = 1; i < pinOut.length; i++) join(pinOut[0], pinOut[i])
      for (let i = 1; i < pinGnd.length; i++) join(pinGnd[0], pinGnd[i])
    }
    if (isButton(part)) {
      const pinA1 = [pinId(part, 'A1'), pinId(part, 'Terminal 1b'), pinId(part, 'terminal1b')]
      const pinA2 = [pinId(part, 'A2'), pinId(part, 'Terminal 1a'), pinId(part, 'terminal1a')]
      const pinB1 = [pinId(part, 'B1'), pinId(part, 'Terminal 2b'), pinId(part, 'terminal2b')]
      const pinB2 = [pinId(part, 'B2'), pinId(part, 'Terminal 2a'), pinId(part, 'terminal2a')]
      for (let i = 1; i < pinA1.length; i++) join(pinA1[0], pinA1[i])
      for (let i = 1; i < pinA2.length; i++) join(pinA2[0], pinA2[i])
      for (let i = 1; i < pinB1.length; i++) join(pinB1[0], pinB1[i])
      for (let i = 1; i < pinB2.length; i++) join(pinB2[0], pinB2[i])
      join(pinId(part, 'A1'), pinId(part, 'A2'))
      join(pinId(part, 'B1'), pinId(part, 'B2'))
      if (runtime.buttons[part.id]) join(pinId(part, 'A1'), pinId(part, 'B1'))
    }
  }

  const resolve = (drivers: Map<string, Level[]>): Map<string, Level> => {
    const result = new Map<string, Level>()
    for (const id of parent.keys()) {
      const values = drivers.get(root(id)) ?? []
      const concrete = values.filter(v => v !== 'X')
      result.set(root(id), concrete.length === 0 ? 'X' : concrete.every(v => v === concrete[0]) ? concrete[0] : 'X')
    }
    return result
  }
  const level = (values: Map<string, Level>, id: string): Level => values.get(root(id)) ?? 'X'
  const settle = (): Map<string, Level> => {
    let values = new Map<string, Level>()
    for (let i = 0; i < 32; i++) {
      const drivers = new Map<string, Level[]>()
      const drive = (id: string, value: Level) => {
        const net = root(id)
        drivers.set(net, [...(drivers.get(net) ?? []), value])
      }
      for (const part of project.parts) {
        const p = (pin: string) => pinId(part, canonicalChipPinName(part.kind, pin))
        const read = (pin: string) => level(values, p(pin))
        if (isSupply(part)) {
          const v = Number(part.properties?.voltage ?? 5)
          const high: Level = v >= 2.5 ? '1' : '0'
          drive(pinId(part, 'PLUS'), high)
          drive(pinId(part, 'MINUS'), '0')
        } else if (isGenerator(part)) {
          drive(pinId(part, 'OUT'), generatorLevel(part.properties, runtime))
          drive(pinId(part, 'GND'), '0')
        } else if (isButton(part)) {
          drive(p('OUT'), runtime.buttons[part.id] ? '1' : '0')
        } else {
          switch (part.kind) {
            case 'vcc': drive(p('OUT'), Number(part.properties?.voltage ?? 5) >= 2.5 ? '1' : '0'); break
            case 'gnd': drive(p('OUT'), '0'); break
            case 'clock': drive(p('OUT'), runtime.clock_high ? '1' : '0'); break
          case 'not': drive(p('Y'), invert(read('A'))); break
          case 'and': drive(p('Y'), and(read('A'), read('B'))); break
          case 'or': drive(p('Y'), or(read('A'), read('B'))); break
          case 'nand': drive(p('Y'), invert(and(read('A'), read('B')))); break
          case 'nor': drive(p('Y'), invert(or(read('A'), read('B')))); break
          case 'xor': drive(p('Y'), xor(read('A'), read('B'))); break
          case 'nand74hc00': {
            const powered = read('VCC') === '1' && read('GND') === '0'
            for (const n of [1, 2, 3, 4]) drive(p(`Y${n}`), powered ? invert(and(read(`A${n}`), read(`B${n}`))) : 'X')
            break
          }
          case 'dff7474':
          case 'jk74hc73': {
            const powered = read('VCC') === '1' && read('GND') === '0'
            for (const n of [1, 2]) {
              const q = powered ? runtime.q[`${part.id}:${n}`] ?? 'X' : 'X'
              drive(p(`Q${n}`), q)
              drive(p(`NQ${n}`), invert(q))
            }
            break
          }
          case 'library': {
            const model = String(part.properties?.simulationModel ?? '')
            if (!extractedModelPins(model).length) break
            const powered = read('Power') === '1' && read('Ground') === '0'
            const output = (pin: string, value: Level) => drive(p(pin), powered && !(model === '74HC595' && pin.startsWith('Output ') && read('Output Enable') !== '0') ? value : 'X')
            if (!driveExtractedCombinational(model, read, output)) driveExtractedSequential(model, part.id, runtime, output)
            break
          }
        }
      }
    }
      const next = resolve(drivers)
      if ([...parent.keys()].every(id => level(values, id) === level(next, id))) return next
      values = next
    }
    return values
  }

  let values = settle()
  // Ripple clocks can trigger several flip-flops during one external edge.
  for (let wave = 0; wave < 16; wave++) {
    let changed = false
    const inOverride = new Set<string>()
    for (const part of project.parts) {
      if (part.kind === 'library') {
        const model = String(part.properties?.simulationModel ?? '')
        const p = (pin: string) => pinId(part, pin)
        const powered = level(values, p('Power')) === '1' && level(values, p('Ground')) === '0'
        const read = (pin: string) => level(values, p(pin))
        if (powered) {
          if (model === '74HC73' || model === '74HC74') {
            for (const n of [1, 2]) {
              const rst = read(`Reset ${n}`), setPin = model === '74HC74' ? read(`Set ${n}`) : '1'
              if (rst === '0' || setPin === '0') inOverride.add(`${part.id}:${n}`)
            }
          } else if (model === '74HC93') {
            if (read('Reset 1') === '1' && read('Reset 2') === '1') inOverride.add(`${part.id}:reset`)
          }
          if (updateExtractedSequential(model, part.id, runtime, read)) changed = true
        }
        continue
      }
      if (part.kind !== 'dff7474' && part.kind !== 'jk74hc73') continue
      const p = (pin: string) => pinId(part, canonicalChipPinName(part.kind, pin))
      const powered = level(values, p('VCC')) === '1' && level(values, p('GND')) === '0'
      for (const n of [1, 2]) {
        const key = `${part.id}:${n}`
        const clk = level(values, p(`CLK${n}`))
        const pre = part.kind === 'jk74hc73' ? '1' : level(values, p(`PRE${n}`))
        const clr = level(values, p(`CLR${n}`))
        if (powered && (pre === '0' || clr === '0')) inOverride.add(key)
        let next = runtime.q[key] ?? 'X'
        if (!powered || (pre === '0' && clr === '0')) next = 'X'
        else if (pre === '0' && clr === '1') next = '1'
        else if (clr === '0' && pre === '1') next = '0'
        else if (pre === '1' && clr === '1') {
          const edge = part.kind === 'jk74hc73' ? runtime.prev_clock[key] === '1' && clk === '0' : runtime.prev_clock[key] === '0' && clk === '1'
          if (edge && part.kind === 'dff7474') next = level(values, p(`D${n}`))
          if (edge && part.kind === 'jk74hc73') {
            const j = level(values, p(`J${n}`)), k = level(values, p(`K${n}`))
            if (j === '0' && k === '1') next = '0'
            else if (j === '1' && k === '0') next = '1'
            else if (j === '1' && k === '1') next = invert(next)
            else if (j !== '0' || k !== '0') next = 'X'
          }
        }
        if (runtime.q[key] !== next) { runtime.q[key] = next; changed = true }
        runtime.prev_clock[key] = clk
      }
    }
    if (!changed) break
    values = settle()
    if (inOverride.size > 0) {
      for (const part of project.parts) {
        if (part.kind === 'library') {
          const model = String(part.properties?.simulationModel ?? '')
          const p = (pin: string) => pinId(part, pin)
          if (model === '74HC73' || model === '74HC74') {
            for (const n of [1, 2]) {
              if (inOverride.has(`${part.id}:${n}`)) {
                runtime.prev_clock[`${part.id}:Clock ${n}`] = level(values, p(`Clock ${n}`))
              }
            }
          } else if (model === '74HC93' && inOverride.has(`${part.id}:reset`)) {
            runtime.prev_clock[`${part.id}:Clock 0`] = level(values, p('Clock 0'))
            runtime.prev_clock[`${part.id}:Clock 1`] = level(values, p('Clock 1'))
          }
        }
        if (part.kind !== 'dff7474' && part.kind !== 'jk74hc73') continue
        const p = (pin: string) => pinId(part, canonicalChipPinName(part.kind, pin))
        for (const n of [1, 2]) {
          const key = `${part.id}:${n}`
          if (inOverride.has(key)) {
            runtime.prev_clock[key] = level(values, p(`CLK${n}`))
          }
        }
      }
    }
  }
  values = settle()
  const levels: Record<string, Level> = {}
  for (const part of project.parts) for (const pin of simulationPins(part)) levels[pinId(part, pin)] = level(values, pinId(part, pin))
  for (const wire of project.wires) { levels[wire.from] = level(values, wire.from); levels[wire.to] = level(values, wire.to) }
  const leds: Record<string, Level> = {}
  for (const part of project.parts) if (isLed(part)) {
    const a = level(values, pinId(part, 'A'))
    const k = level(values, pinId(part, 'K'))
    leds[part.id] = a === '1' && k === '0' ? '1' : '0'
  }
  return { simulation: { levels, leds, q: { ...runtime.q }, prev_clock: { ...runtime.prev_clock }, mode: 'digital' }, runtime }
}
