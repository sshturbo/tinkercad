export type LcdHd44780State = {
  display: [string[], string[]]
  address: number
  displayOn: boolean
  cursorOn: boolean
  blinkOn: boolean
  incrementAddress: boolean
  displayShift: number
  fourBitMode: boolean
  highNibble?: number
  pendingData?: boolean
  pendingRs?: boolean
  acceptedBytes: number
}

export function initialLcdHd44780State(): LcdHd44780State {
  return {
    display: [Array(16).fill(' '), Array(16).fill(' ')], address: 0,
    displayOn: false, cursorOn: false, blinkOn: false, incrementAddress: true,
    displayShift: 0, fourBitMode: false, acceptedBytes: 0,
  }
}

function clear(state: LcdHd44780State): LcdHd44780State {
  return { ...state, display: [Array(16).fill(' '), Array(16).fill(' ')], address: 0, displayShift: 0 }
}

function addressToCell(address: number): [number, number] | undefined {
  if (address >= 0x00 && address <= 0x0f) return [0, address]
  if (address >= 0x40 && address <= 0x4f) return [1, address - 0x40]
  return undefined
}

function advanceAddress(state: LcdHd44780State): LcdHd44780State {
  const direction = state.incrementAddress ? 1 : -1
  return { ...state, address: Math.max(0, Math.min(0x7f, state.address + direction)) }
}

function writeByte(state: LcdHd44780State, value: number, data: boolean): LcdHd44780State {
  if (data) {
    const cell = addressToCell(state.address)
    const next = { ...state, display: [state.display[0].slice(), state.display[1].slice()] as [string[], string[]], acceptedBytes: state.acceptedBytes + 1 }
    if (cell) next.display[cell[0]][cell[1]] = value >= 0x20 && value <= 0x7e ? String.fromCharCode(value) : ' '
    return advanceAddress(next)
  }
  let next = { ...state, acceptedBytes: state.acceptedBytes + 1 }
  if (value === 0x01) return clear(next)
  if (value === 0x02) return { ...next, address: 0, displayShift: 0 }
  if ((value & 0xfc) === 0x04) return { ...next, incrementAddress: Boolean(value & 0x02), displayShift: 0 }
  if ((value & 0xf8) === 0x08) return { ...next, displayOn: Boolean(value & 0x04), cursorOn: Boolean(value & 0x02), blinkOn: Boolean(value & 0x01) }
  if ((value & 0xf0) === 0x10) return { ...next, displayShift: next.displayShift + (value & 0x04 ? (value & 0x08 ? -1 : 1) : 0), address: value & 0x04 ? next.address : Math.max(0, Math.min(0x7f, next.address + (value & 0x08 ? -1 : 1))) }
  if ((value & 0xe0) === 0x20) return { ...next, fourBitMode: !(value & 0x10), highNibble: undefined, pendingData: undefined, pendingRs: undefined }
  if (value & 0x80) return { ...next, address: value & 0x7f }
  return next
}

/** Apply a write on E's falling edge. RW-high reads are intentionally ignored. */
export function clockLcdHd44780Write(
  previous: LcdHd44780State,
  input: { enableHigh: boolean; registerSelect: boolean; readWrite: boolean; data: number },
): LcdHd44780State {
  if (input.enableHigh || previous.pendingData === false || input.readWrite) {
    return { ...previous, pendingData: input.enableHigh, pendingRs: input.registerSelect }
  }
  // A falling edge is represented by the previous sample having E high.
  if (previous.pendingData !== true) return { ...previous, pendingData: false, pendingRs: input.registerSelect }
  const rs = previous.pendingRs ?? input.registerSelect
  const data = input.data & 0xff
  if (!previous.fourBitMode) return { ...writeByte(previous, data, rs), pendingData: false, pendingRs: input.registerSelect }
  if (previous.highNibble === undefined) return { ...previous, highNibble: data & 0xf0, pendingData: false, pendingRs: rs }
  const byte = previous.highNibble | ((data >> 4) & 0x0f)
  const combined = { ...previous, highNibble: undefined, pendingData: false, pendingRs: rs }
  return writeByte(combined, byte, previous.pendingRs ?? rs)
}

export function lcdText(state: LcdHd44780State): [string, string] {
  if (!state.displayOn) return [' '.repeat(16), ' '.repeat(16)]
  const shift = ((state.displayShift % 16) + 16) % 16
  return state.display.map(row => Array.from({ length: 16 }, (_, index) => row[(index + shift) % 16]).join('')) as [string, string]
}
