import { canonicalChipPinName, chipPinInfo, chipPinRows } from './pinout'
import type { UltrasonicPingRuntimeState, UltrasonicTargetPoint } from './ultrasonicPingModel'

export type Level = '0' | '1' | 'X'
export type Kind = 'breadboard' | 'vcc' | 'gnd' | 'button' | 'clock' | 'resistor' | 'led' | 'and' | 'or' | 'not' | 'nand' | 'nor' | 'xor' | 'dff7474' | 'jk74hc73' | 'nand74hc00' | 'generator' | 'supply' | 'library'
export type Part = { id: string; kind: Kind; x: number; y: number; rotation: number; label: string; properties?: Record<string, string | number | boolean> }
export type WirePoint = { x: number; y: number }
export type Wire = { id: string; from: string; to: string; color: string; hidden?: boolean; bends?: WirePoint[] }
export type Project = { version: 1; id: string; name: string; parts: Part[]; wires: Wire[] }
export type Timer556ChannelName = 'A' | 'B'
export type Timer556ChannelReadings = { latchHigh: boolean; pending: boolean; outputVoltage: number; outputCurrent: number; dischargeVoltage: number; referenceVoltage: number }
export type UltrasonicPingReadings = { powered: boolean; supplyVoltage: number; targetPosition: UltrasonicTargetPoint; inRange: boolean; normalizedDistance: number; distanceCm?: number; phase: string; triggerHigh: boolean; lastTriggerPulseSeconds?: number; echoActive: boolean; echoStartsAtSeconds?: number; echoEndsAtSeconds?: number; acceptedPings: number; rejectedShortPulses: number; echoVoltage: number; echoCurrent: number }
export type Runtime = { clock_high: boolean; phase?: number; buttons: Record<string, boolean>; q: Record<string, Level>; prev_clock: Record<string, Level>; capacitorVoltages?: Record<string, number>; capacitorCurrents?: Record<string, number>; inductorCurrents?: Record<string, number>; inductorVoltages?: Record<string, number>; relayStates?: Record<string, boolean>; relayActuationSeconds?: Record<string, number>; keypadPushed?: Record<string, unknown>; irDetected?: Record<string, boolean>; gasSensorLevel?: Record<string, number>; pirTargetPositions?: Record<string, { x: number; y: number }>; pirInRange?: Record<string, boolean | null>; pirDrivePulses?: Record<string, number>; timer555Latch?: Record<string, boolean>; timer555PendingLatch?: Record<string, boolean>; timer555DelayRemainingSeconds?: Record<string, number>; timer556Latch?: Record<string, Partial<Record<Timer556ChannelName, boolean>>>; timer556PendingLatch?: Record<string, Partial<Record<Timer556ChannelName, boolean>>>; timer556DelayRemainingSeconds?: Record<string, Partial<Record<Timer556ChannelName, number>>>; ultrasonicTargetPositions?: Record<string, UltrasonicTargetPoint>; ultrasonicStates?: Record<string, UltrasonicPingRuntimeState> }
export type SevenSegmentName = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'dp'
export type SevenSegmentChannelValues<T> = Record<SevenSegmentName, T>
export type Simulation = { levels: Record<string, Level>; leds: Record<string, Level>; q: Record<string, Level>; prev_clock: Record<string, Level>; mode?: 'dc' | 'transient' | 'digital'; voltages?: Record<string, number>; currents?: Record<string, number>; powers?: Record<string, number>; energies?: Record<string, number>; ledBrightness?: Record<string, number>; ledWarning?: Record<string, boolean>; ledBreakdown?: Record<string, boolean>; relayStates?: Record<string, boolean>; lightBulbBrightness?: Record<string, number>; vibrationMotorAmplitude?: Record<string, number>; tiltSensorClosed?: Record<string, boolean>; tiltSensorResistance?: Record<string, number>; soilMoistureProbeResistance?: Record<string, number>; usbBreakdown?: Record<string, boolean>; irSensorDetected?: Record<string, boolean>; irSensorOutputResistance?: Record<string, number>; irSensorSupplyVoltage?: Record<string, number>; irSensorBreakdown?: Record<string, boolean>; gasSensorLevel?: Record<string, number>; gasSensorHeaterVoltage?: Record<string, number>; gasSensorSignalResistance?: Record<string, number>; gasSensorSignalCurrent?: Record<string, number>; gasSensorHeaterCurrent?: Record<string, number>; gasSensorBreakdown?: Record<string, boolean>; pirSensorPowered?: Record<string, boolean>; pirSensorInRange?: Record<string, boolean>; pirSensorNormalizedDistance?: Record<string, number>; pirSensorDriveActive?: Record<string, boolean>; pirSensorOutputDriven?: Record<string, boolean>; pirSensorOutputTriggered?: Record<string, boolean>; pirSensorSupplyVoltage?: Record<string, number>; pirSensorOutputVoltage?: Record<string, number>; pirSensorPullupResistance?: Record<string, number>; pirSensorOutputCurrent?: Record<string, number>; piezoVoltageIndicator?: Record<string, number>; piezoBreakdown?: Record<string, boolean>; timer555LatchHigh?: Record<string, boolean>; timer555LatchPending?: Record<string, boolean>; timer555OutputVoltage?: Record<string, number>; timer555OutputCurrent?: Record<string, number>; timer555DischargeVoltage?: Record<string, number>; timer555ReferenceVoltage?: Record<string, number>; timer556Channels?: Record<string, Record<Timer556ChannelName, Timer556ChannelReadings>>; ultrasonicPing?: Record<string, UltrasonicPingReadings>; rgbLedBrightness?: Record<string, { red: number; green: number; blue: number }>; rgbLedDisplayBrightness?: Record<string, { red: number; green: number; blue: number }>; rgbLedCurrents?: Record<string, { red: number; green: number; blue: number }>; rgbLedBreakdown?: Record<string, { red: boolean; green: boolean; blue: boolean }>; sevenSegmentBrightness?: Record<string, SevenSegmentChannelValues<number>>; sevenSegmentDisplayBrightness?: Record<string, SevenSegmentChannelValues<number>>; sevenSegmentCurrents?: Record<string, SevenSegmentChannelValues<number>>; sevenSegmentBreakdown?: Record<string, SevenSegmentChannelValues<boolean>>; sevenSegmentCommonType?: Record<string, 'anode' | 'cathode'>; keypadPushed?: Record<string, string | null>; converged?: boolean; diagnostics?: string[]; warnings?: string[] }

export const labels: Record<Kind, string> = {
  breadboard: 'Placa de ensaio pequena',
  vcc: 'Fonte 5 V', gnd: 'Terra', button: 'Botão', clock: 'Clock', resistor: 'Resistor', led: 'LED',
  and: 'Porta AND', or: 'Porta OR', not: 'Porta NOT', nand: 'Porta NAND', nor: 'Porta NOR', xor: 'Porta XOR', dff7474: 'CI 7474 (Flip-Flop D)',
  jk74hc73: 'CI 74HC73 (Flip-Flop JK)', nand74hc00: 'CI 74HC00 (Porta NAND)', generator: 'Gerador de função', supply: 'Fonte de energia', library: 'Componente da biblioteca',
}

export const pinNames: Record<Kind, string[]> = {
  breadboard: [],
  vcc: ['OUT'], gnd: ['OUT'], button: ['A1', 'A2', 'B1', 'B2', 'OUT'], clock: ['OUT'], resistor: ['A', 'B'], led: ['A', 'K'],
  and: ['A', 'B', 'Y'], or: ['A', 'B', 'Y'], not: ['A', 'Y'], nand: ['A', 'B', 'Y'], nor: ['A', 'B', 'Y'], xor: ['A', 'B', 'Y'],
  dff7474: ['D1', 'CLK1', 'PRE1', 'CLR1', 'Q1', 'NQ1', 'D2', 'CLK2', 'PRE2', 'CLR2', 'Q2', 'NQ2', 'VCC', 'GND'],
  jk74hc73: [...chipPinRows.jk74hc73!.top, ...chipPinRows.jk74hc73!.bottom].map(pin => pin.name),
  nand74hc00: [...chipPinRows.nand74hc00!.top, ...chipPinRows.nand74hc00!.bottom].map(pin => pin.name),
  generator: ['OUT', 'GND'], supply: ['PLUS', 'MINUS'], library: [],
}

export const pinId = (part: Part, pin: string) => `${part.id}:${pin}`
export const newId = () => crypto.randomUUID()
export const emptyProject = (): Project => ({ version: 1, id: newId(), name: 'Novo circuito', parts: [], wires: [] })
export const emptyRuntime = (): Runtime => ({ clock_high: false, buttons: {}, q: {}, prev_clock: {}, capacitorVoltages: {}, capacitorCurrents: {}, inductorCurrents: {}, inductorVoltages: {}, keypadPushed: {}, irDetected: {}, gasSensorLevel: {}, pirTargetPositions: {}, pirInRange: {}, pirDrivePulses: {}, timer555Latch: {}, timer555PendingLatch: {}, timer555DelayRemainingSeconds: {}, timer556Latch: {}, timer556PendingLatch: {}, timer556DelayRemainingSeconds: {}, ultrasonicTargetPositions: {}, ultrasonicStates: {} })
export const initialRuntime = (project: Project): Runtime => {
  const runtime = emptyRuntime()
  for (const part of project.parts) {
    if (part.kind === 'jk74hc73') for (const n of [1, 2]) runtime.q[`${part.id}:${n}`] = '0'
    if (part.kind === 'library' && part.properties?.simulationModel === 'Timer555') runtime.timer555Latch![part.id] = true
    if (part.kind === 'library' && part.properties?.simulationModel === 'timer556') runtime.timer556Latch![part.id] = { A: true, B: true }
  }
  return runtime
}

/** Convert legacy semantic chip aliases in saved wires to the visible pin names. */
export function normalizeProjectPinNames(project: Project): Project {
  const kinds = new Map(project.parts.map(part => {
    let effectiveKind = part.kind
    if (part.kind === 'library') {
      const model = String(part.properties?.simulationModel ?? '')
      if (model === 'powerSupply' || model === 'battery9V' || model === 'coinCell') effectiveKind = 'supply'
      else if (model === 'resistor') effectiveKind = 'resistor'
      else if (model === 'led2' || model === 'ledRGB') effectiveKind = 'led'
      else if (model === 'function_generator') effectiveKind = 'generator'
      else if (model === 'button') effectiveKind = 'button'
    }
    return [part.id, effectiveKind]
  }))
  let changed = false
  const wires = project.wires.map(wire => {
    const normalizeEndpoint = (endpoint: string) => {
      const separator = endpoint.indexOf(':')
      if (separator < 0) return endpoint
      const partId = endpoint.slice(0, separator)
      const kind = kinds.get(partId)
      if (!kind) return endpoint
      const pin = endpoint.slice(separator + 1)
      const canonical = canonicalChipPinName(kind, pin)
      if (canonical === pin) return endpoint
      changed = true
      return `${partId}:${canonical}`
    }
    const from = normalizeEndpoint(wire.from)
    const to = normalizeEndpoint(wire.to)
    return from === wire.from && to === wire.to ? wire : { ...wire, from, to }
  })
  return changed ? { ...project, wires } : project
}

/** Sanitize and guarantee all coordinates and required fields are valid before sending to native IPC. */
export function sanitizeProjectForNative(project: Project): Project {
  return {
    version: project.version ?? 1,
    id: String(project.id ?? ''),
    name: String(project.name ?? ''),
    parts: (project.parts ?? []).map(p => ({
      id: String(p.id ?? ''),
      kind: p.kind,
      x: Number.isFinite(p.x) ? p.x : 0,
      y: Number.isFinite(p.y) ? p.y : 0,
      rotation: Number.isFinite(p.rotation) ? p.rotation : 0,
      label: String(p.label ?? ''),
      properties: p.properties && typeof p.properties === 'object' ? p.properties : {},
    })),
    wires: (project.wires ?? []).map(w => ({
      id: String(w.id ?? ''),
      from: String(w.from ?? ''),
      to: String(w.to ?? ''),
      color: String(w.color ?? '#0284c7'),
      hidden: Boolean(w.hidden),
      bends: Array.isArray(w.bends) && w.bends.length > 0
        ? w.bends
            .filter(b => b && typeof b === 'object')
            .map(b => ({
              x: Number.isFinite(b.x) ? b.x : 0,
              y: Number.isFinite(b.y) ? b.y : 0,
            }))
        : undefined,
    })),
  }
}

export function demoProject(): Project {
  const p = (id: string, kind: Kind, x: number, y: number, label: string, properties?: Part['properties']): Part => ({ id, kind, x, y, rotation: 0, label, properties })
  const w = (id: string, from: string, to: string, color: string): Wire => ({ id, from, to, color })
  const wires: Wire[] = []
  const wire = (from: string, to: string, color = '#0284c7') => wires.push(w(`w${wires.length + 1}`, from, to, color))
  wire('p1:PLUS', 'board:b1:top-plus:1', '#e53935')
  wire('p1:MINUS', 'board:b1:top-minus:1', '#212121')
  wire('board:b1:top-plus:29', 'board:b2:top-plus:0', '#e53935')
  wire('board:b1:top-minus:29', 'board:b2:top-minus:0', '#212121')
  for (const boardId of ['b1', 'b2']) {
    wire(`board:${boardId}:top-plus:0`, `board:${boardId}:bottom-plus:0`, '#e53935')
    wire(`board:${boardId}:top-minus:1`, `board:${boardId}:bottom-minus:1`, '#212121')
  }
  wire('func1:OUT', 'u1:Relógio 1', '#e53935')
  wire('func1:GND', 'board:b1:bottom-minus:2', '#212121')
  wire('u1:Saída 1', 'u1:Relógio 2', '#0284c7')
  wire('u1:Saída 2', 'u2:Relógio 1', '#eab308')
  wire('u2:Saída 1', 'u2:Relógio 2', '#22c55e')
  const ledWireColors = ['#8d5b4c', '#eab308', '#22c55e', '#0284c7']
  for (const [i, output] of ['u1:Saída 1', 'u1:Saída 2', 'u2:Saída 1', 'u2:Saída 2'].entries()) {
    const cathodeColumn = 22 + i * 2
    const anodeColumn = cathodeColumn + 1
    wire(output, `r${i + 1}:B`, ledWireColors[i])
    wire(`board:b1:top-minus:${cathodeColumn}`, `board:b1:row:${cathodeColumn}:left:0`, '#212121')
    wires.push({ id: `snap-r${i + 1}-A`, from: `r${i + 1}:A`, to: `board:b1:row:${anodeColumn}:left:3`, color: '#888', hidden: true })
    wires.push({ id: `snap-r${i + 1}-B`, from: `r${i + 1}:B`, to: `board:b1:row:${anodeColumn}:right:0`, color: '#888', hidden: true })
    wires.push({ id: `snap-led${i + 1}-K`, from: `led${i + 1}:K`, to: `board:b1:row:${cathodeColumn}:left:2`, color: '#888', hidden: true })
    wires.push({ id: `snap-led${i + 1}-A`, from: `led${i + 1}:A`, to: `board:b1:row:${anodeColumn}:left:2`, color: '#888', hidden: true })
  }
  wire('u1:Saída 1', 'u3:Entrada 1A', '#22c55e')
  wire('u1:Saída 2', 'u3:Entrada 1B', '#eab308')
  for (const [chip, boardId, firstColumn, kind] of [
    ['u1', 'b1', 7, 'jk74hc73'],
    ['u2', 'b1', 15, 'jk74hc73'],
    ['u3', 'b2', 5, 'nand74hc00'],
  ] as const) {
    const rows = chipPinRows[kind]!
    for (const [side, pins] of [['top', rows.top], ['bottom', rows.bottom]] as const) {
      for (const [index, pin] of pins.entries()) {
        const boardSide = side === 'top' ? 'left' : 'right'
        const boardHole = side === 'top' ? 4 : 0
        wires.push({ id: `snap-${chip}-${pin.number}`, from: `${chip}:${pin.name}`, to: `board:${boardId}:row:${firstColumn + index}:${boardSide}:${boardHole}`, color: '#888', hidden: true })
      }
    }

    const connectToRail = (name: string, rail: 'top-plus' | 'top-minus' | 'bottom-plus' | 'bottom-minus') => {
      const pin = chipPinInfo(kind, name)!
      const side = pin.side === 'top' ? 'left' : 'right'
      const hole = pin.side === 'top' ? 0 : 4
      const column = firstColumn + pin.index
      wire(`board:${boardId}:${rail}:${column}`, `board:${boardId}:row:${column}:${side}:${hole}`, rail.endsWith('plus') ? '#e53935' : '#212121')
    }

    if (kind === 'jk74hc73') {
      connectToRail('Potência', 'bottom-plus')
      connectToRail('Solo', 'top-minus')
      for (const name of ['Redefinir 1', 'K 1', 'Redefinir 2', 'J 2']) connectToRail(name, 'bottom-plus')
      for (const name of ['J 1', 'K 2']) connectToRail(name, 'top-plus')
    } else if (kind === 'nand74hc00') {
      connectToRail('Potência', 'top-plus')
      connectToRail('Solo', 'bottom-minus')
    }
  }
  return normalizeProjectPinNames({
    version: 1, id: newId(), name: 'Contador 20261987686 Jefferson',
    parts: [
      p('b1', 'breadboard', 180, 145, 'BB1'), p('b2', 'breadboard', 980, 145, 'BB2'),
      p('p1', 'supply', -35, 98, 'P1', { voltage: 5, current: 5 }), p('func1', 'generator', -35, 455, 'FUNC1', { frequency: 1, amplitude: 5, offset: 2.5, waveform: 'square' }),
      p('u1', 'jk74hc73', 454, 336, 'U1'), p('u2', 'jk74hc73', 646, 336, 'U2'), p('u3', 'nand74hc00', 1206, 336, 'U3'),
      p('r1', 'resistor', 766, 328.5, 'R1', { ohms: 220 }), p('r2', 'resistor', 814, 328.5, 'R2', { ohms: 220 }),
      p('r3', 'resistor', 862, 328.5, 'R3', { ohms: 220 }), p('r4', 'resistor', 910, 328.5, 'R4', { ohms: 220 }),
      p('led1', 'led', 754, 258, 'D1', { color: 'orange' }), p('led2', 'led', 802, 258, 'D2', { color: 'green' }),
      p('led3', 'led', 850, 258, 'D3', { color: 'yellow' }), p('led4', 'led', 898, 258, 'D4', { color: 'blue' }),
    ],
    wires,
  })
}

export function validProject(input: unknown): input is Project {
  if (!input || typeof input !== 'object') return false
  const x = input as Partial<Project>
  if (x.version !== 1 || typeof x.id !== 'string' || typeof x.name !== 'string' || !Array.isArray(x.parts) || !Array.isArray(x.wires)) return false
  return x.parts.every(p => p && typeof p.id === 'string' && p.kind in labels && Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.rotation) && typeof p.label === 'string')
    && x.wires.every(w => w && typeof w.id === 'string' && typeof w.from === 'string' && typeof w.to === 'string' && typeof w.color === 'string' && (w.hidden === undefined || typeof w.hidden === 'boolean') && (w.bends === undefined || Array.isArray(w.bends) && w.bends.every(point => point && Number.isFinite(point.x) && Number.isFinite(point.y))))
}
