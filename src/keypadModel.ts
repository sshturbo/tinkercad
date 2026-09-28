/**
 * Electrical contact topology extracted from module 58745 (`keypad_4x4`).
 * This module describes the switch matrix only; solver and UI state are separate.
 */

export const KEYPAD_4X4_MODEL = Object.freeze({
  id: 'keypad_4x4',
  moduleSource: 'tinkercad-engine-complete-extracted/models/keypad_4x4--module-58745.js',
  rows: ['row1', 'row2', 'row3', 'row4'] as const,
  columns: ['column1', 'column2', 'column3', 'column4'] as const,
  internalNode: 'internal',
  defaultPushed: false,
  closedResistanceOhms: 1e-3,
  openResistanceOhms: 1e10,
  supportsMultipleKeys: false,
})

export type KeypadIndex = 1 | 2 | 3 | 4
export type KeypadPressedKey = readonly [row: KeypadIndex, column: KeypadIndex]
export type KeypadPushedInput = string | boolean | null | undefined | readonly unknown[]

export type KeypadContact = Readonly<{
  terminal: string
  internalNode: 'internal'
  resistanceOhms: number
  closed: boolean
}>

export type KeypadDescriptor = Readonly<{
  model: 'keypad_4x4'
  /** A physical row/column key pair, or null when idle. */
  pushed: KeypadPressedKey | null
  terminals: Readonly<{
    rows: typeof KEYPAD_4X4_MODEL.rows
    columns: typeof KEYPAD_4X4_MODEL.columns
  }>
  internalNode: 'internal'
  contacts: readonly KeypadContact[]
}>

function index(value: unknown): KeypadIndex | undefined {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN
  return parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4 ? parsed : undefined
}

/**
 * Normalize the extracted subelement code (`"13"`) or an explicit
 * `[row, column]` pair. False/null represent the extracted idle state. More
 * than one key is rejected because module 58745 exposes only one `pushed` key.
 */
export function normalizeKeypadPushed(value: KeypadPushedInput): KeypadPressedKey | null | undefined {
  if (value === false || value === null || value === undefined) return null

  if (typeof value === 'string') {
    const match = value.trim().match(/^([1-4])([1-4])$/)
    return match ? [Number(match[1]) as KeypadIndex, Number(match[2]) as KeypadIndex] : undefined
  }

  if (Array.isArray(value)) {
    if (value.length !== 2) return undefined
    const row = index(value[0])
    const column = index(value[1])
    return row === undefined || column === undefined ? undefined : [row, column]
  }

  return undefined
}

/** Map breadboard labels such as `Row 2` to the extracted terminal names. */
export function canonicalKeypadTerminal(pin: unknown): string | undefined {
  if (typeof pin !== 'string') return undefined
  const normalized = pin.trim().toLowerCase().replace(/\s+/g, ' ')
  const match = normalized.match(/^(row|column) ?([1-4])$/)
  if (!match) return undefined
  return `${match[1]}${match[2]}`
}

/** Return the eight extracted contacts for one key, or undefined for invalid/multi-key input. */
export function getKeypadModel(pushed: KeypadPushedInput = KEYPAD_4X4_MODEL.defaultPushed): KeypadDescriptor | undefined {
  const key = normalizeKeypadPushed(pushed)
  if (key === undefined) return undefined

  const [pressedRow, pressedColumn] = key ?? []
  const contacts: KeypadContact[] = [
    ...KEYPAD_4X4_MODEL.rows.map((terminal, rowIndex) => {
      const closed = pressedRow === rowIndex + 1
      return {
        terminal,
        internalNode: KEYPAD_4X4_MODEL.internalNode,
        resistanceOhms: closed ? KEYPAD_4X4_MODEL.closedResistanceOhms : KEYPAD_4X4_MODEL.openResistanceOhms,
        closed,
      }
    }),
    ...KEYPAD_4X4_MODEL.columns.map((terminal, columnIndex) => {
      const closed = pressedColumn === columnIndex + 1
      return {
        terminal,
        internalNode: KEYPAD_4X4_MODEL.internalNode,
        resistanceOhms: closed ? KEYPAD_4X4_MODEL.closedResistanceOhms : KEYPAD_4X4_MODEL.openResistanceOhms,
        closed,
      }
    }),
  ]

  return {
    model: KEYPAD_4X4_MODEL.id,
    pushed: key,
    terminals: { rows: KEYPAD_4X4_MODEL.rows, columns: KEYPAD_4X4_MODEL.columns },
    internalNode: KEYPAD_4X4_MODEL.internalNode,
    contacts,
  }
}
