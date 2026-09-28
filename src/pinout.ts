import type { Kind } from './model'

export type ChipPin = { name: string; number: number }
export type ChipPinRows = { top: ChipPin[]; bottom: ChipPin[] }

// Pin order and number follow the 14-pin package, with the notch facing left.
// `name` is both the visible label and the endpoint used by wires.
export const chipPinRows: Partial<Record<Kind, ChipPinRows>> = {
  jk74hc73: {
    top: [
      { name: 'J 1', number: 14 },
      { name: 'Saída invertida 1', number: 13 },
      { name: 'Saída 1', number: 12 },
      { name: 'Solo', number: 11 },
      { name: 'K 2', number: 10 },
      { name: 'Saída 2', number: 9 },
      { name: 'Saída invertida 2', number: 8 },
    ],
    bottom: [
      { name: 'Relógio 1', number: 1 },
      { name: 'Redefinir 1', number: 2 },
      { name: 'K 1', number: 3 },
      { name: 'Potência', number: 4 },
      { name: 'Relógio 2', number: 5 },
      { name: 'Redefinir 2', number: 6 },
      { name: 'J 2', number: 7 },
    ],
  },
  nand74hc00: {
    top: [
      { name: 'Potência', number: 14 },
      { name: 'Entrada 4B', number: 13 },
      { name: 'Entrada 4A', number: 12 },
      { name: 'Saída 4', number: 11 },
      { name: 'Entrada 3B', number: 10 },
      { name: 'Entrada 3A', number: 9 },
      { name: 'Saída 3', number: 8 },
    ],
    bottom: [
      { name: 'Entrada 1A', number: 1 },
      { name: 'Entrada 1B', number: 2 },
      { name: 'Saída 1', number: 3 },
      { name: 'Entrada 2A', number: 4 },
      { name: 'Entrada 2B', number: 5 },
      { name: 'Saída 2', number: 6 },
      { name: 'Solo', number: 7 },
    ],
  },
}

const signalNames: Partial<Record<Kind, Record<string, string>>> = {
  jk74hc73: {
    J1: 'J 1', NQ1: 'Saída invertida 1', Q1: 'Saída 1', GND: 'Solo', K2: 'K 2', Q2: 'Saída 2', NQ2: 'Saída invertida 2',
    CLK1: 'Relógio 1', CLR1: 'Redefinir 1', K1: 'K 1', VCC: 'Potência', CLK2: 'Relógio 2', CLR2: 'Redefinir 2', J2: 'J 2',
  },
  nand74hc00: {
    VCC: 'Potência', B4: 'Entrada 4B', A4: 'Entrada 4A', Y4: 'Saída 4', B3: 'Entrada 3B', A3: 'Entrada 3A', Y3: 'Saída 3',
    A1: 'Entrada 1A', B1: 'Entrada 1B', Y1: 'Saída 1', A2: 'Entrada 2A', B2: 'Entrada 2B', Y2: 'Saída 2', GND: 'Solo',
  },
  resistor: {
    'Terminal 1': 'B', 'Terminal 2': 'A', '1': 'A', '2': 'B', terminal1: 'B', terminal2: 'A',
  },
  led: {
    Anode: 'A', Cathode: 'K', anode: 'A', cathode: 'K', ANODE: 'A', CATHODE: 'K', '+': 'A', '-': 'K',
  },
  supply: {
    Positive: 'PLUS', Negative: 'MINUS', positive: 'PLUS', negative: 'MINUS', '+': 'PLUS', '-': 'MINUS', 'POS': 'PLUS', 'NEG': 'MINUS',
  },
  generator: {
    Positive: 'OUT', Negative: 'GND', positive: 'OUT', negative: 'GND', '+': 'OUT', '-': 'GND',
  },
  button: {
    'Terminal 1a': 'A2', 'Terminal 1b': 'A1', 'Terminal 2a': 'B2', 'Terminal 2b': 'B1',
    terminal1a: 'A2', terminal1b: 'A1', terminal2a: 'B2', terminal2b: 'B1',
  },
}

export function canonicalChipPinName(kind: Kind, signalOrName: string) {
  return signalNames[kind]?.[signalOrName] ?? signalOrName
}

export function friendlyPinLabel(kind: Kind, pin: string, label: string): string {
  if (kind === 'led') {
    if (pin === 'A' || pin === 'Anode' || pin === 'anode' || pin === '+') return `${label}: Ânodo (+)`
    if (pin === 'K' || pin === 'Cathode' || pin === 'cathode' || pin === '-') return `${label}: Cátodo (-)`
  }
  if (kind === 'supply') {
    if (pin === 'PLUS' || pin === 'Positive' || pin === 'positive' || pin === '+') return `${label}: Positivo (+)`
    if (pin === 'MINUS' || pin === 'Negative' || pin === 'negative' || pin === '-') return `${label}: Negativo (-)`
  }
  if (kind === 'resistor') {
    if (pin === 'A' || pin === 'Terminal 2' || pin === '1') return `${label}: Terminal 2`
    if (pin === 'B' || pin === 'Terminal 1' || pin === '2') return `${label}: Terminal 1`
  }
  return `${label}: ${pin}`
}

export function chipPinInfo(kind: Kind, name: string) {
  const rows = chipPinRows[kind]
  if (!rows) return undefined
  for (const side of ['top', 'bottom'] as const) {
    const index = rows[side].findIndex(pin => pin.name === name)
    if (index >= 0) return { ...rows[side][index], side, index }
  }
  return undefined
}
