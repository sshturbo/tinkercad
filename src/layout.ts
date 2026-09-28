import { pinNames, type Kind, type Part, type Project } from './model'
import { canonicalChipPinName, chipPinInfo } from './pinout'
import { libraryIdFromPart, libraryPinNameForKind, libraryPinOffset, type LibraryRecords } from './library'

export type Point = { x: number; y: number }
export const board = { x: 180, y: 145, width: 760, height: 408, columns: 30 }
export const railY: Record<string, number> = { 'top-plus': 185, 'top-minus': 211, 'bottom-minus': 488, 'bottom-plus': 514 }
export const rowY: Record<string, number[]> = { left: [243, 258, 273, 288, 303], right: [369, 384, 399, 414, 429] }
export const columnX = (column: number) => 214 + column * 24

export function pinOffset(kind: Kind, pin: string): Point {
  const physicalPin = chipPinInfo(kind, pin)
  if (physicalPin) return { x: -72 + physicalPin.index * 24, y: physicalPin.side === 'top' ? -33 : 33 }
  if (kind === 'dff7474') {
    const top = ['PRE1', 'D1', 'CLK1', 'CLR1', 'Q1', 'NQ1', 'VCC']
    const bottom = ['PRE2', 'D2', 'CLK2', 'CLR2', 'Q2', 'NQ2', 'GND']
    const ti = top.indexOf(pin)
    if (ti >= 0) return { x: -72 + ti * 24, y: -28 }
    const bi = bottom.indexOf(pin)
    return { x: -72 + bi * 24, y: 28 }
  }
  if (kind === 'supply') return pin === 'PLUS' ? { x: 0, y: 84 } : { x: 32, y: 84 }
  if (kind === 'generator') return { x: pin === 'OUT' ? -20 : 5, y: 99 }
  if (kind === 'button') return pin === 'OUT' ? { x: 48, y: 0 } : { x: pin.startsWith('A') ? -29 : 29, y: pin.endsWith('1') ? -23 : 23 }
  if (['vcc', 'gnd', 'button', 'clock'].includes(kind)) return { x: 48, y: 0 }
  if (kind === 'resistor') return { x: 0, y: pin === 'A' ? -40.5 : 40.5 }
  if (kind === 'led') return { x: pin === 'A' ? 12 : -12, y: 15 }
  if (kind === 'not') return pin === 'A' ? { x: -45, y: 0 } : { x: 45, y: 0 }
  return pin === 'A' ? { x: -45, y: -13 } : pin === 'B' ? { x: -45, y: 13 } : { x: 45, y: 0 }
}

export function isBreadboardPart(part: Part, libraryRecords: LibraryRecords = {}): boolean {
  if (part.kind === 'breadboard') return true
  const record = libraryRecords[libraryIdFromPart(part)]
  return Boolean(record?.name?.toLowerCase().startsWith('breadboard'))
}

export function boardPoint(project: Project, id: string, libraryRecords: LibraryRecords = {}): Point | undefined {
  const parts = id.split(':')
  if (parts[0] !== 'board') return undefined
  const boardPart = project.parts.find(p => p.id === parts[1] && (p.kind === 'breadboard' || isBreadboardPart(p, libraryRecords)))
  if (!boardPart) return undefined
  const record = libraryRecords[libraryIdFromPart(boardPart)]
  const extents = record?.extents
  const column = Number(parts[3])
  let sourceName: string | undefined
  if (parts[2] === 'row') {
    const side = parts[4]
    const hole = Number(parts[5])
    const letters = side === 'left' ? ['j', 'i', 'h', 'g', 'f'] : side === 'right' ? ['e', 'd', 'c', 'b', 'a'] : []
    if (Number.isInteger(column) && column >= 0 && column < board.columns && Number.isInteger(hole) && hole >= 0 && hole < letters.length) {
      sourceName = `${letters[hole]}${column + 1}`
    }
  } else if (parts[2] in railY && Number.isInteger(column) && column >= 0 && column < board.columns) {
    const sourceRail: Record<string, string> = {
      'top-plus': 'z', 'top-minus': 'y', 'bottom-minus': 'x', 'bottom-plus': 'w',
    }
    sourceName = `${sourceRail[parts[2]]}${column + 1}`
  }
  if (record && extents && sourceName) {
    const terminal = record.pins_and_terminals?.find(pin =>
      pin.terminal_type?.startsWith('breadboard') && pin.name?.toLowerCase() === sourceName,
    )
    if (terminal && extents.width > 0 && extents.height > 0) {
      return {
        x: boardPart.x + ((terminal.x - extents.left) / extents.width) * board.width,
        y: boardPart.y + ((terminal.y - extents.top) / extents.height) * board.height,
      }
    }
  }
  const dx = boardPart.x - board.x, dy = boardPart.y - board.y
  if (parts[2] === 'row') {
    const n = Number(parts[3])
    const side = parts[4]
    const hole = Number(parts[5])
    if (Number.isInteger(n) && n >= 0 && n < board.columns && (side === 'left' || side === 'right') && Number.isInteger(hole) && hole >= 0 && hole < 5)
      return { x: columnX(n) + dx, y: rowY[side][hole] + dy }
  } else {
    const n = Number(parts[3])
    if (parts[2] in railY && Number.isInteger(n) && n >= 0 && n < board.columns) return { x: columnX(n) + dx, y: railY[parts[2]] + dy }
  }
  return undefined
}

export function terminalPosition(project: Project, id: string, libraryRecords: LibraryRecords = {}): Point | undefined {
  const hole = boardPoint(project, id, libraryRecords)
  if (hole) return hole
  const separator = id.indexOf(':')
  if (separator < 0) return undefined
  const partId = id.slice(0, separator)
  const pin = id.slice(separator + 1)
  const part = project.parts.find(p => p.id === partId)
  if (!part) return undefined
  let offset: Point | undefined
  const record = libraryRecords[libraryIdFromPart(part)]
  if (part.kind === 'library') {
    offset = libraryPinOffset(record, pin)
    if (!offset && record?.pins_and_terminals) {
      const match = record.pins_and_terminals.find(t =>
        t.name?.toLowerCase() === pin.toLowerCase() || t.label?.toLowerCase() === pin.toLowerCase()
      )
      if (match) offset = libraryPinOffset(record, String(match.name || match.label || ''))
    }
  } else {
    const canonical = canonicalChipPinName(part.kind, pin)
    const validPin = pinNames[part.kind]?.includes(pin) || pinNames[part.kind]?.includes(canonical)
    if (!validPin) return undefined
    const libraryPin = libraryPinNameForKind(part.kind, canonical) ?? libraryPinNameForKind(part.kind, pin)
    const libraryOffset = libraryPin && record ? libraryPinOffset(record, libraryPin, part.kind) : undefined
    if (libraryOffset) offset = libraryOffset
    else if (record && part.kind === 'vcc' && pin === 'OUT') offset = { x: 0, y: 84 }
    else if (record && part.kind === 'gnd' && pin === 'OUT') offset = { x: 32, y: 84 }
    else if (record && part.kind === 'clock' && pin === 'OUT') offset = { x: -20, y: 99 }
    else if (record && part.kind === 'clock' && pin === 'GND') offset = { x: 5, y: 99 }
    else offset = pinOffset(part.kind, canonical)
  }
  if (!offset) return undefined
  const angle = (part.rotation * Math.PI) / 180
  return {
    x: part.x + offset.x * Math.cos(angle) - offset.y * Math.sin(angle),
    y: part.y + offset.x * Math.sin(angle) + offset.y * Math.cos(angle),
  }
}

export function boardGroup(id: string): string {
  const parts = id.split(':')
  if (parts[0] !== 'board') return id
  return parts[2] === 'row' ? parts.slice(0, 5).join(':') : parts.slice(0, 3).join(':')
}
