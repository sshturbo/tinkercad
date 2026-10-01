import type { Kind, Part, Project } from './model'
import type { LibraryRecord, LibraryRecords } from './library'
import { canonicalChipPinName } from './pinout'

// EDA Colors conforming to Tinkercad / CircuitLab EDA theme:
export const SCHEMATIC_COLORS = {
  sheetBorder: '#d65b5a', // Coral / Red outline
  sheetInnerBorder: '#d65b5a',
  sheetGridTick: '#d65b5a',
  componentStroke: '#d65b5a',
  componentFill: '#ffffff',
  componentLabel: '#d65b5a',
  valueLabel: '#64748b',
  wireStroke: '#2bb282', // EDA Emerald Green
  junctionDot: '#2bb282',
  busTagBorder: '#94a3b8',
  busTagFill: '#ffffff',
  busTagText: '#475569',
  powerTag: '#d65b5a',
}

export type SchematicSymbolType =
  | 'supply'
  | 'resistor'
  | 'potentiometer'
  | 'photoresistor'
  | 'capacitor'
  | 'polarized_capacitor'
  | 'inductor'
  | 'diode'
  | 'zener_diode'
  | 'led'
  | 'battery'
  | 'vcc'
  | 'gnd'
  | 'generator'
  | 'pushbutton'
  | 'switch_spdt'
  | 'gate_and'
  | 'gate_or'
  | 'gate_not'
  | 'gate_nand'
  | 'gate_nor'
  | 'gate_xor'
  | 'ic_jk74hc73'
  | 'ic_nand74hc00'
  | 'ic_dff7474'
  | 'ic_74hc93'
  | 'transistor_npn'
  | 'transistor_pnp'
  | 'sensor'
  | 'ic_generic'

export type PinDirection = 'left' | 'right' | 'top' | 'bottom'

export interface SchematicTerminal {
  id: string // full pin endpoint, e.g. "r1:A"
  pin: string // pin identifier, e.g. "A"
  label: string // display label, e.g. "A", "1Q", "CLK"
  x: number // absolute position on sheet
  y: number
  dir: PinDirection
  isClock?: boolean
  isInverted?: boolean
}

export interface SchematicComponent {
  id: string
  part: Part
  symbolType: SchematicSymbolType
  designator: string // e.g. "R1", "C1", "D1", "U1"
  valueText: string // e.g. "220 Ω", "10 µF", "VERMELHO"
  subText?: string // e.g. "74HC73", "TMP36"
  x: number // center coordinates
  y: number
  width: number
  height: number
  terminals: SchematicTerminal[]
}

export interface SchematicNetTerminal {
  componentId: string
  pin: string
  x: number
  y: number
  dir: PinDirection
}

export interface SchematicNet {
  id: string
  name: string
  isPower: boolean
  isGround: boolean
  terminals: SchematicNetTerminal[]
  wirePaths: string[] // SVG path `d` strings
  junctions: { x: number; y: number }[]
}

export interface SchematicLayout {
  components: SchematicComponent[]
  nets: SchematicNet[]
  sheetWidth: number
  sheetHeight: number
  totalParts: number
}

// Disjoint Set (Union-Find) for netlist extraction
export class DisjointSet {
  private parent = new Map<string, string>()

  add(value: string) {
    if (!this.parent.has(value)) this.parent.set(value, value)
  }

  find(value: string): string {
    this.add(value)
    const parent = this.parent.get(value)!
    if (parent === value) return value
    const root = this.find(parent)
    this.parent.set(value, root)
    return root
  }

  join(a: string, b: string) {
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA !== rootB) this.parent.set(rootB, rootA)
  }

  connected(a: string, b: string): boolean {
    return this.find(a) === this.find(b)
  }
}

/** Check if a part is a physical breadboard (which is a wiring medium, not an EDA symbol). */
export function isBreadboard(part: Part, records: LibraryRecords = {}): boolean {
  if (part.kind === 'breadboard') return true
  const libId = String(part.properties?.libraryId ?? '')
  const record = records[libId]
  if (record && record.name?.toLowerCase().includes('breadboard')) return true
  if (part.label?.toLowerCase().includes('breadboard') || part.label?.toLowerCase().includes('placa de ensaio')) return true
  return false
}

/** Canonicalize pin names to match between wires and components. */
export function canonicalSchematicPin(kind: Kind, pin: string, model = ''): string {
  const p = pin.trim()
  if (kind === 'resistor' || model === 'resistor') {
    if (['A', 'Terminal 2', '2'].includes(p) || p.toLowerCase() === 'terminal-2') return 'A'
    if (['B', 'Terminal 1', '1'].includes(p) || p.toLowerCase() === 'terminal-1') return 'B'
  }
  if (kind === 'led' || model === 'led2' || model === 'ledRGB') {
    if (['A', 'Anode', 'anode', '+'].includes(p)) return 'A'
    if (['K', 'Cathode', 'cathode', '-'].includes(p)) return 'K'
  }
  if (kind === 'supply' || (kind as string) === 'battery' || ['powerSupply', 'battery9V', 'coinCell', 'AABattery', 'batteryLemon', 'batteryPotato'].includes(model)) {
    if (['PLUS', 'Positive', 'positive', '+', 'POS', 'pos', 'VCC', 'Vcc', 'vcc', 'Power', 'power', 'Potência', 'potência', '1', 'Terminal 1', 'terminal 1', 'out_pos', 'red'].includes(p)) return 'PLUS'
    if (['MINUS', 'Negative', 'negative', '-', 'NEG', 'neg', 'GND', 'gnd', 'Ground', 'ground', 'Solo', 'solo', 'Terra', 'terra', '2', 'Terminal 2', 'terminal 2', 'out_neg', 'black'].includes(p)) return 'MINUS'
  }
  if (kind === 'generator' || model === 'function_generator') {
    if (['OUT', 'Positive', 'positive', '+', 'pos', 'POS'].includes(p)) return 'OUT'
    if (['GND', 'Negative', 'negative', '-', 'neg', 'NEG', 'ground', 'Ground', 'solo', 'Solo'].includes(p)) return 'GND'
  }
  if (kind === 'button' || model === 'button') {
    if (['A1', 'Terminal 1b', '1b'].includes(p)) return 'A1'
    if (['A2', 'Terminal 1a', '1a'].includes(p)) return 'A2'
    if (['B1', 'Terminal 2b', '2b'].includes(p)) return 'B1'
    if (['B2', 'Terminal 2a', '2a'].includes(p)) return 'B2'
  }
  if ((kind as string) === 'switch' || ['slide_switch', 'slide_switch_v2'].includes(model)) {
    if (['1', 'Terminal 1'].includes(p)) return '1'
    if (['2', 'Terminal 2'].includes(p)) return '2'
    if (['3', 'Common'].includes(p)) return '3'
  }
  if ((kind as string) === 'potentiometer' || ['potentiometer', 'potentiometer_v2'].includes(model)) {
    if (['terminal 1', 'term0', '1'].includes(p.toLowerCase())) return 'TERMINAL1'
    if (['terminal 2', 'term1', '2'].includes(p.toLowerCase())) return 'TERMINAL2'
    if (['wiper', '3'].includes(p.toLowerCase())) return 'WIPER'
  }
  if (kind === 'vcc' || kind === 'gnd' || kind === 'clock') {
    if (['OUT', '+', '-'].includes(p)) return 'OUT'
  }
  return canonicalChipPinName(kind, p)
}

/** Canonicalize an endpoint string (e.g., handles breadboard row segments and canonical pins). */
export function canonicalSchematicEndpoint(id: string, parts: Map<string, Part>): string {
  if (id.startsWith('board:')) {
    const segments = id.split(':')
    // board:boardId:row:col:side:hole -> share whole column side on breadboard
    if (segments[2] === 'row') return segments.slice(0, 5).join(':')
    // board:boardId:rail:col -> share whole rail
    return segments.slice(0, 3).join(':')
  }
  const divider = id.indexOf(':')
  if (divider < 0) return id
  const partId = id.slice(0, divider)
  const pin = id.slice(divider + 1)
  const part = parts.get(partId)
  if (!part) return id

  // If part is a library breadboard, normalize columns and rails
  if (isBreadboard(part)) {
    const pLower = pin.toLowerCase()
    const colMatch = pLower.match(/^([a-j])(\d+)$/)
    if (colMatch) {
      const letter = colMatch[1]
      const col = colMatch[2]
      const side = ['f', 'g', 'h', 'i', 'j'].includes(letter) ? 'left' : 'right'
      return `board:${partId}:row:${col}:${side}`
    }
    if (['z', 'w', 'top-plus', 'bottom-plus'].some(r => pLower.includes(r)) || pLower.includes('+')) {
      return `board:${partId}:top-plus`
    }
    if (['y', 'x', 'top-minus', 'bottom-minus'].some(r => pLower.includes(r)) || pLower.includes('-')) {
      return `board:${partId}:top-minus`
    }
  }

  const model = String(part.properties?.simulationModel ?? '')
  return `${partId}:${canonicalSchematicPin(part.kind, pin, model)}`
}

/** Classify part to appropriate schematic symbol. */
export function getSchematicSymbolType(part: Part, record?: LibraryRecord): SchematicSymbolType | null {
  if (part.kind === 'breadboard' || isBreadboard(part)) return null

  switch (part.kind) {
    case 'resistor': return 'resistor'
    case 'led': return 'led'
    case 'vcc': return 'vcc'
    case 'gnd': return 'gnd'
    case 'clock': return 'generator'
    case 'supply': return 'supply'
    case 'generator': return 'generator'
    case 'button': return 'pushbutton'
    case 'and': return 'gate_and'
    case 'or': return 'gate_or'
    case 'not': return 'gate_not'
    case 'nand': return 'gate_nand'
    case 'nor': return 'gate_nor'
    case 'xor': return 'gate_xor'
    case 'jk74hc73': return 'ic_jk74hc73'
    case 'nand74hc00': return 'ic_nand74hc00'
    case 'dff7474': return 'ic_dff7474'
  }

  if (part.kind === 'library') {
    const model = String(part.properties?.simulationModel ?? '')
    const name = (record?.name ?? part.label ?? '').toLowerCase()

    if (model === 'powerSupply' || name.includes('power supply') || name.includes('fonte de energia') || name.includes('fonte')) return 'supply'
    if (['battery9V', 'coinCell', 'AABattery', 'batteryLemon', 'batteryPotato'].includes(model) || name.includes('battery') || name.includes('bateria')) return 'battery'
    if (model === 'resistor' || name.includes('resistor')) return 'resistor'
    if (model === 'led2' || model === 'ledRGB' || name.includes('led')) return 'led'
    if (model === 'diode' || name.includes('diode')) return 'diode'
    if (model === 'zenerDiode' || name.includes('zener')) return 'zener_diode'
    if (model === 'capacitor' || name.includes('capacitor')) {
      if (model === 'capacitor_polarized' || name.includes('polariz')) return 'polarized_capacitor'
      return 'capacitor'
    }
    if (model === 'inductor' || name.includes('inductor')) return 'inductor'
    if (['potentiometer', 'potentiometer_v2'].includes(model) || name.includes('potentiometer')) return 'potentiometer'
    if (['ldr_v2', 'sensorForce', 'sensorFlex'].includes(model) || name.includes('photoresistor')) return 'photoresistor'
    if (model === 'function_generator') return 'generator'
    if (model === 'button' || name.includes('pushbutton')) return 'pushbutton'
    if (['slide_switch', 'slide_switch_v2'].includes(model) || name.includes('switch')) return 'switch_spdt'
    if (model === '74HC73') return 'ic_jk74hc73'
    if (model === '74HC00') return 'ic_nand74hc00'
    if (model === '74HC74') return 'ic_dff7474'
    if (model === '74HC93') return 'ic_74hc93'
    if (model === '74HC08') return 'gate_and'
    if (model === '74HC32') return 'gate_or'
    if (model === '74HC04') return 'gate_not'
    if (model === '74HC02') return 'gate_nor'
    if (model === '74HC86') return 'gate_xor'
    if (model === 'TMP36' || model === 'solarCell' || name.includes('sensor')) return 'sensor'
    if (name.includes('npn')) return 'transistor_npn'
    if (name.includes('pnp')) return 'transistor_pnp'
    return 'ic_generic'
  }

  return 'ic_generic'
}

/** Format property values with proper metric prefixes and units. */
export function formatValueText(type: SchematicSymbolType, part: Part): string {
  const props = part.properties ?? {}
  switch (type) {
    case 'resistor':
    case 'photoresistor': {
      const ohms = Number(props.ohms ?? 220)
      if (ohms >= 1_000_000) return `${(ohms / 1_000_000).toFixed(ohms % 1_000_000 === 0 ? 0 : 1)} MΩ`
      if (ohms >= 1_000) return `${(ohms / 1_000).toFixed(ohms % 1_000 === 0 ? 0 : 1)} kΩ`
      return `${ohms} Ω`
    }
    case 'potentiometer': {
      const ohms = Number(props.resistance ?? 250000)
      if (ohms >= 1_000) return `${Math.round(ohms / 1000)} kΩ`
      return `${ohms} Ω`
    }
    case 'capacitor':
    case 'polarized_capacitor': {
      const farads = Number(props.capacitance ?? (type === 'polarized_capacitor' ? 1e-6 : 100e-9))
      if (farads >= 1e-3) return `${(farads * 1e3).toFixed(1)} mF`
      if (farads >= 1e-6) return `${(farads * 1e6).toFixed(farads * 1e6 % 1 === 0 ? 0 : 1)} µF`
      if (farads >= 1e-9) return `${(farads * 1e9).toFixed(farads * 1e9 % 1 === 0 ? 0 : 1)} nF`
      return `${(farads * 1e12).toFixed(0)} pF`
    }
    case 'inductor': {
      const henries = Number(props.inductance ?? 10e-6)
      if (henries >= 1) return `${henries} H`
      if (henries >= 1e-3) return `${(henries * 1e3).toFixed(1)} mH`
      return `${(henries * 1e6).toFixed(0)} µH`
    }
    case 'led': {
      const color = String(props.color ?? 'red').toUpperCase()
      const colorPt: Record<string, string> = {
        RED: 'VERMELHO', GREEN: 'VERDE', BLUE: 'AZUL', YELLOW: 'AMARELO', ORANGE: 'LARANJA', WHITE: 'BRANCO',
      }
      return colorPt[color] || color
    }
    case 'supply': {
      const volts = Number(props.voltage ?? 5)
      const amps = Number(props.current ?? 5)
      return `${volts.toFixed(1)} V · ${amps.toFixed(1)} A`
    }
    case 'battery': {
      const volts = Number(props.voltage ?? (props.simulationModel === 'battery9V' ? 9 : props.simulationModel === 'coinCell' ? 3 : 1.5))
      return `${volts} V`
    }
    case 'vcc': {
      const volts = Number(props.voltage ?? 5)
      return `${volts} V`
    }
    case 'generator': {
      const freq = Number(props.frequency ?? 1000)
      if (freq >= 1000) return `${(freq / 1000).toFixed(freq % 1000 === 0 ? 0 : 1)} kHz`
      return `${freq} Hz`
    }
    default:
      return ''
  }
}

/** Extract designator prefix for a given symbol type. */
export function getDesignatorPrefix(type: SchematicSymbolType): string {
  switch (type) {
    case 'resistor':
    case 'photoresistor': return 'R'
    case 'potentiometer': return 'POT'
    case 'capacitor':
    case 'polarized_capacitor': return 'C'
    case 'inductor': return 'L'
    case 'diode':
    case 'zener_diode': return 'D'
    case 'led': return 'D'
    case 'supply': return 'P'
    case 'battery': return 'BAT'
    case 'vcc': return 'VCC'
    case 'gnd': return 'GND'
    case 'generator': return 'FUNC'
    case 'pushbutton':
    case 'switch_spdt': return 'SW'
    case 'gate_and':
    case 'gate_or':
    case 'gate_not':
    case 'gate_nand':
    case 'gate_nor':
    case 'gate_xor':
    case 'ic_jk74hc73':
    case 'ic_nand74hc00':
    case 'ic_dff7474':
    case 'ic_74hc93':
    case 'ic_generic': return 'U'
    case 'transistor_npn':
    case 'transistor_pnp': return 'Q'
    case 'sensor': return 'SEN'
  }
}

/** Determine pin specifications and layout dimensions for each symbol type. */
export function getComponentTerminals(
  type: SchematicSymbolType,
  partId: string,
  centerX: number,
  centerY: number,
  record?: LibraryRecord,
): { terminals: SchematicTerminal[]; width: number; height: number; subText?: string } {
  const pin = (pinName: string, label: string, dx: number, dy: number, dir: PinDirection, isClock = false, isInverted = false): SchematicTerminal => ({
    id: `${partId}:${pinName}`,
    pin: pinName,
    label,
    x: Math.round(centerX + dx),
    y: Math.round(centerY + dy),
    dir,
    isClock,
    isInverted,
  })

  switch (type) {
    case 'resistor':
    case 'photoresistor':
      return {
        terminals: [
          pin('A', '1', -25, 0, 'left'),
          pin('B', '2', 25, 0, 'right'),
        ],
        width: 34,
        height: 14,
      }

    case 'potentiometer':
      return {
        terminals: [
          pin('TERMINAL1', '1', -26, 8, 'left'),
          pin('TERMINAL2', '2', 26, 8, 'right'),
          pin('WIPER', 'W', 0, -18, 'top'),
        ],
        width: 36,
        height: 24,
      }

    case 'capacitor':
    case 'polarized_capacitor':
      return {
        terminals: [
          pin('A', '+', -22, 0, 'left'),
          pin('B', '-', 22, 0, 'right'),
        ],
        width: 28,
        height: 20,
      }

    case 'inductor':
      return {
        terminals: [
          pin('A', '1', -26, 0, 'left'),
          pin('B', '2', 26, 0, 'right'),
        ],
        width: 36,
        height: 16,
      }

    case 'diode':
    case 'zener_diode':
      return {
        terminals: [
          pin('A', 'A', -22, 0, 'left'),
          pin('K', 'K', 22, 0, 'right'),
        ],
        width: 26,
        height: 18,
      }

    case 'led':
      return {
        terminals: [
          pin('A', 'A', -22, 0, 'left'),
          pin('K', 'K', 22, 0, 'right'),
        ],
        width: 28,
        height: 22,
      }

    case 'supply':
      return {
        terminals: [
          pin('PLUS', '+', 42, -14, 'right'),
          pin('MINUS', '-', 42, 14, 'right'),
        ],
        width: 80,
        height: 58,
        subText: 'FONTE CC',
      }

    case 'battery':
      return {
        terminals: [
          pin('PLUS', '+', -24, -8, 'left'),
          pin('MINUS', '-', 24, 8, 'right'),
        ],
        width: 38,
        height: 32,
      }

    case 'vcc':
      return {
        terminals: [pin('OUT', 'VCC', 0, 15, 'bottom')],
        width: 20,
        height: 24,
      }

    case 'gnd':
      return {
        terminals: [pin('OUT', 'GND', 0, -15, 'top')],
        width: 24,
        height: 24,
      }

    case 'generator':
      return {
        terminals: [
          pin('OUT', '+', 28, -8, 'right'),
          pin('GND', '-', 28, 8, 'right'),
        ],
        width: 44,
        height: 36,
      }

    case 'pushbutton':
      return {
        terminals: [
          pin('A1', '1a', -22, -8, 'left'),
          pin('A2', '1b', -22, 8, 'left'),
          pin('B1', '2a', 22, -8, 'right'),
          pin('B2', '2b', 22, 8, 'right'),
        ],
        width: 32,
        height: 28,
      }

    case 'switch_spdt':
      return {
        terminals: [
          pin('3', 'COM', -22, 0, 'left'),
          pin('1', '1', 22, -8, 'right'),
          pin('2', '2', 22, 8, 'right'),
        ],
        width: 32,
        height: 26,
      }

    case 'gate_and':
    case 'gate_or':
    case 'gate_nand':
    case 'gate_nor':
    case 'gate_xor':
      return {
        terminals: [
          pin('A', 'A', -26, -7, 'left'),
          pin('B', 'B', -26, 7, 'left'),
          pin('Y', 'Y', 26, 0, 'right', false, type === 'gate_nand' || type === 'gate_nor'),
        ],
        width: 38,
        height: 28,
      }

    case 'gate_not':
      return {
        terminals: [
          pin('A', 'A', -24, 0, 'left'),
          pin('Y', 'Y', 24, 0, 'right', false, true),
        ],
        width: 34,
        height: 24,
      }

    case 'ic_jk74hc73': {
      // Classic EDA symbol for 74HC73 Dual JK with inputs on left, outputs on right
      const width = 56
      const height = 90
      const halfW = width / 2
      const terminals = [
        // Left pins (Section 1 then Section 2)
        pin('J 1', 'J1', -halfW - 6, -34, 'left'),
        pin('Relógio 1', 'CLK1', -halfW - 6, -22, 'left', true),
        pin('K 1', 'K1', -halfW - 6, -10, 'left'),
        pin('Redefinir 1', 'R1', -halfW - 6, 2, 'left', false, true),

        pin('J 2', 'J2', -halfW - 6, 14, 'left'),
        pin('Relógio 2', 'CLK2', -halfW - 6, 24, 'left', true),
        pin('K 2', 'K2', -halfW - 6, 34, 'left'),
        pin('Redefinir 2', 'R2', -halfW - 6, 44, 'left', false, true),

        // Right pins
        pin('Potência', 'VCC', halfW + 6, -34, 'right'),
        pin('Saída 1', '1Q', halfW + 6, -22, 'right'),
        pin('Saída invertida 1', '1Q̅', halfW + 6, -10, 'right', false, true),
        pin('Solo', 'GND', halfW + 6, 2, 'right'),
        pin('Saída 2', '2Q', halfW + 6, 24, 'right'),
        pin('Saída invertida 2', '2Q̅', halfW + 6, 34, 'right', false, true),
      ]
      return { terminals, width, height, subText: '74HC73' }
    }

    case 'ic_nand74hc00': {
      const width = 56
      const height = 90
      const halfW = width / 2
      const terminals = [
        pin('Entrada 1A', '1A', -halfW - 6, -34, 'left'),
        pin('Entrada 1B', '1B', -halfW - 6, -22, 'left'),
        pin('Entrada 2A', '2A', -halfW - 6, -10, 'left'),
        pin('Entrada 2B', '2B', -halfW - 6, 2, 'left'),
        pin('Entrada 3A', '3A', -halfW - 6, 14, 'left'),
        pin('Entrada 3B', '3B', -halfW - 6, 24, 'left'),
        pin('Entrada 4A', '4A', -halfW - 6, 34, 'left'),
        pin('Entrada 4B', '4B', -halfW - 6, 44, 'left'),

        pin('Potência', 'VCC', halfW + 6, -34, 'right'),
        pin('Saída 1', '1Y', halfW + 6, -22, 'right'),
        pin('Saída 2', '2Y', halfW + 6, -10, 'right'),
        pin('Solo', 'GND', halfW + 6, 2, 'right'),
        pin('Saída 3', '3Y', halfW + 6, 24, 'right'),
        pin('Saída 4', '4Y', halfW + 6, 34, 'right'),
      ]
      return { terminals, width, height, subText: '74HC00' }
    }

    case 'ic_dff7474': {
      const width = 56
      const height = 80
      const halfW = width / 2
      const terminals = [
        pin('D1', 'D1', -halfW - 6, -26, 'left'),
        pin('CLK1', 'CLK1', -halfW - 6, -14, 'left', true),
        pin('PRE1', 'PRE1', -halfW - 6, -2, 'left', false, true),
        pin('CLR1', 'CLR1', -halfW - 6, 10, 'left', false, true),
        pin('D2', 'D2', -halfW - 6, 22, 'left'),
        pin('CLK2', 'CLK2', -halfW - 6, 34, 'left', true),

        pin('VCC', 'VCC', halfW + 6, -26, 'right'),
        pin('Q1', '1Q', halfW + 6, -14, 'right'),
        pin('NQ1', '1Q̅', halfW + 6, -2, 'right', false, true),
        pin('GND', 'GND', halfW + 6, 10, 'right'),
        pin('Q2', '2Q', halfW + 6, 22, 'right'),
        pin('NQ2', '2Q̅', halfW + 6, 34, 'right', false, true),
      ]
      return { terminals, width, height, subText: '74HC74' }
    }

    case 'ic_74hc93': {
      const width = 56
      const height = 90
      const halfW = width / 2
      const terminals = [
        pin('Clock 0', 'CP0', -halfW - 6, -30, 'left', true),
        pin('Clock 1', 'CP1', -halfW - 6, -14, 'left', true),
        pin('Reset 1', 'MR1', -halfW - 6, 14, 'left'),
        pin('Reset 2', 'MR2', -halfW - 6, 30, 'left'),

        pin('Power', 'VCC', halfW + 6, -34, 'right'),
        pin('Output Bit 0', 'Q0', halfW + 6, -20, 'right'),
        pin('Output Bit 1', 'Q1', halfW + 6, -6, 'right'),
        pin('Output Bit 2', 'Q2', halfW + 6, 8, 'right'),
        pin('Output Bit 3', 'Q3', halfW + 6, 22, 'right'),
        pin('Ground', 'GND', halfW + 6, 36, 'right'),
      ]
      return { terminals, width, height, subText: '74HC93' }
    }

    case 'transistor_npn':
    case 'transistor_pnp':
      return {
        terminals: [
          pin('B', 'B', -20, 0, 'left'),
          pin('C', 'C', 14, -20, 'top'),
          pin('E', 'E', 14, 20, 'bottom'),
        ],
        width: 32,
        height: 36,
      }

    case 'sensor':
    case 'ic_generic':
    default: {
      // Dynamic terminals from library record or default fallback
      const pinList: { name: string; label: string }[] = []
      if (record?.pins_and_terminals?.length) {
        for (const t of record.pins_and_terminals) {
          if (!t.terminal_type?.startsWith('breadboard') && (t.name || t.label)) {
            pinList.push({ name: String(t.name || t.label), label: String(t.label || t.name) })
          }
        }
      }
      if (!pinList.length) {
        pinList.push({ name: '1', label: '1' }, { name: '2', label: '2' })
      }
      const halfCount = Math.ceil(pinList.length / 2)
      const height = Math.max(40, halfCount * 18 + 14)
      const width = 54
      const halfW = width / 2
      const terminals: SchematicTerminal[] = []
      for (let i = 0; i < pinList.length; i++) {
        const item = pinList[i]
        const isLeft = i < halfCount
        const indexOnSide = isLeft ? i : i - halfCount
        const yOffset = -height / 2 + 18 + indexOnSide * 16
        terminals.push(pin(item.name, item.label.slice(0, 4), isLeft ? -halfW - 6 : halfW + 6, yOffset, isLeft ? 'left' : 'right'))
      }
      return { terminals, width, height, subText: record?.name?.slice(0, 10) }
    }
  }
}

/**
 * Builds the complete dynamic schematic layout from the current project.
 * Uses intelligent grid mapping and Manhattan orthogonal routing for wires.
 */
export function buildSchematicLayout(
  project: Project,
  libraryRecords: LibraryRecords = {},
  customPositions: Record<string, { x: number; y: number }> = {},
): SchematicLayout {
  const partsMap = new Map<string, Part>()
  for (const part of project.parts) partsMap.set(part.id, part)

  // 1. Filter out breadboard parts (EDA schematic shows active electrical components)
  const activeParts = project.parts.filter(p => !isBreadboard(p, libraryRecords))

  if (activeParts.length === 0) {
    return {
      components: [],
      nets: [],
      sheetWidth: 850,
      sheetHeight: 626,
      totalParts: 0,
    }
  }

  // 2. Compute initial schematic placement from canvas positions
  // Canvas coordinate bounds of active components
  let minCanvasX = Infinity, maxCanvasX = -Infinity
  let minCanvasY = Infinity, maxCanvasY = -Infinity

  for (const p of activeParts) {
    minCanvasX = Math.min(minCanvasX, p.x)
    maxCanvasX = Math.max(maxCanvasX, p.x)
    minCanvasY = Math.min(minCanvasY, p.y)
    maxCanvasY = Math.max(maxCanvasY, p.y)
  }

  const canvasWidth = Math.max(60, maxCanvasX - minCanvasX)
  const canvasHeight = Math.max(60, maxCanvasY - minCanvasY)

  // Usable area within schematic sheet (leaving margins for red border & title block)
  const USABLE_X_MIN = 110
  const USABLE_X_MAX = 660
  const USABLE_Y_MIN = 85
  const USABLE_Y_MAX = 480
  const usableWidth = USABLE_X_MAX - USABLE_X_MIN
  const usableHeight = USABLE_Y_MAX - USABLE_Y_MIN

  // Grid step for neat schematic alignment
  const GRID = 20

  const designatorCounts = new Map<string, number>()

  // 3. Instantiate components with dimensions and terminals
  const components: SchematicComponent[] = []
  const compCenterMap = new Map<string, { x: number; y: number }>()

  activeParts.forEach(part => {
    const libId = String(part.properties?.libraryId ?? '')
    const record = libraryRecords[libId]
    const symbolType = getSchematicSymbolType(part, record) || 'ic_generic'

    // Compute placement: use custom drag position if present, or scaled canvas position
    let x: number, y: number
    if (customPositions[part.id]) {
      x = customPositions[part.id].x
      y = customPositions[part.id].y
    } else {
      if (activeParts.length === 1) {
        x = 380
        y = 260
      } else {
        const normX = (part.x - minCanvasX) / canvasWidth
        const normY = (part.y - minCanvasY) / canvasHeight
        x = Math.round((USABLE_X_MIN + normX * usableWidth) / GRID) * GRID
        y = Math.round((USABLE_Y_MIN + normY * usableHeight) / GRID) * GRID
      }
    }

    // Designator assignment (e.g. R1, R2, D1, U1)
    const prefix = getDesignatorPrefix(symbolType)
    const count = (designatorCounts.get(prefix) ?? 0) + 1
    designatorCounts.set(prefix, count)

    // If part.label is already clean like "R1" or "U2", keep it; otherwise synthesize prefix + count
    let designator = part.label
    if (!designator || designator.includes(' ') || designator.length > 7) {
      // Check if part.id is clean like "r1"
      if (/^[a-zA-Z]+\d+$/.test(part.id)) {
        designator = part.id.toUpperCase()
      } else {
        designator = `${prefix}${count}`
      }
    }

    const valueText = formatValueText(symbolType, part)
    const { terminals, width, height, subText } = getComponentTerminals(symbolType, part.id, x, y, record)

    components.push({
      id: part.id,
      part,
      symbolType,
      designator,
      valueText,
      subText,
      x,
      y,
      width,
      height,
      terminals,
    })

    compCenterMap.set(part.id, { x, y })
  })

  // Prevent initial overlap if multiple components fell on identical grid cells
  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const a = components[i], b = components[j]
      const dx = Math.abs(a.x - b.x)
      const dy = Math.abs(a.y - b.y)
      if (dx < 50 && dy < 40) {
        // Shift b horizontally or vertically to clear
        b.x = Math.min(USABLE_X_MAX, b.x + 60)
        // Recompute terminals for shifted component
        const { terminals } = getComponentTerminals(b.symbolType, b.id, b.x, b.y, libraryRecords[String(b.part.properties?.libraryId ?? '')])
        b.terminals = terminals
      }
    }
  }

  // 4. Resolve Netlist using DisjointSet
  const ds = new DisjointSet()
  const componentPinToTerminal = new Map<string, SchematicTerminal>()

  for (const comp of components) {
    for (const term of comp.terminals) {
      componentPinToTerminal.set(term.id, term)
      // Also register canonical version
      const model = String(comp.part.properties?.simulationModel ?? '')
      const canonicalId = `${comp.id}:${canonicalSchematicPin(comp.part.kind, term.pin, model)}`
      componentPinToTerminal.set(canonicalId, term)
    }
  }

  // Connect wires in DisjointSet
  for (const wire of project.wires) {
    const from = canonicalSchematicEndpoint(wire.from, partsMap)
    const to = canonicalSchematicEndpoint(wire.to, partsMap)
    ds.join(from, to)
  }

  // Connect internal contacts (e.g. pushbuttons bridge terminals)
  for (const comp of components) {
    if (comp.symbolType === 'pushbutton') {
      ds.join(`${comp.id}:A1`, `${comp.id}:A2`)
      ds.join(`${comp.id}:B1`, `${comp.id}:B2`)
    }
  }

  // Group terminals by net root
  const netGroups = new Map<string, SchematicNetTerminal[]>()

  for (const comp of components) {
    for (const term of comp.terminals) {
      const model = String(comp.part.properties?.simulationModel ?? '')
      const canonicalId = `${comp.id}:${canonicalSchematicPin(comp.part.kind, term.pin, model)}`
      const root = ds.find(canonicalId)
      if (!netGroups.has(root)) netGroups.set(root, [])
      netGroups.get(root)!.push({
        componentId: comp.id,
        pin: term.pin,
        x: term.x,
        y: term.y,
        dir: term.dir,
      })
    }
  }

  // 5. Build SchematicNets and Route Orthogonal Manhattan Wires
  const nets: SchematicNet[] = []
  let netIndex = 1

  for (const [root, terms] of netGroups.entries()) {
    // Only route nets that connect 2 or more component terminals
    if (terms.length < 2) continue

    // Determine net name & type
    let isPower = false
    let isGround = false
    let netName = ''

    for (const t of terms) {
      const comp = components.find(c => c.id === t.componentId)
      if (!comp) continue
      if (comp.symbolType === 'gnd' || ((comp.symbolType === 'battery' || comp.symbolType === 'supply') && t.pin === 'MINUS')) {
        isGround = true
        netName = 'GND'
      } else if (comp.symbolType === 'vcc' || ((comp.symbolType === 'battery' || comp.symbolType === 'supply') && t.pin === 'PLUS')) {
        isPower = true
        netName = 'VCC'
      }
    }

    if (!netName) {
      // Use recognizable output pin name if present (e.g. U1_1Q, FUNC_OUT)
      for (const t of terms) {
        if (t.pin.includes('Q') || t.pin.includes('Saída') || t.pin === 'OUT' || t.pin === 'Y') {
          const comp = components.find(c => c.id === t.componentId)
          if (comp) {
            netName = `${comp.designator}_${t.pin.replace(/\s+/g, '')}`
            break
          }
        }
      }
    }

    if (!netName) {
      netName = `NET${netIndex++}`
    }

    const { wirePaths, junctions } = routeOrthogonalNet(terms)

    nets.push({
      id: `net-${root}`,
      name: netName,
      isPower,
      isGround,
      terminals: terms,
      wirePaths,
      junctions,
    })
  }

  return {
    components,
    nets,
    sheetWidth: 850,
    sheetHeight: 626,
    totalParts: activeParts.length,
  }
}

/**
 * Routes an electrical net between N terminals using clean Manhattan (orthogonal) lines.
 * Generates junction dots at T-junction points where lines branch.
 */
/**
 * Routes an electrical net between N terminals using clean Manhattan (orthogonal) lines.
 * Generates junction dots at T-junction points where lines branch.
 */
export function routeOrthogonalNet(
  terminals: SchematicNetTerminal[],
): { wirePaths: string[]; junctions: { x: number; y: number }[] } {
  if (terminals.length < 2) return { wirePaths: [], junctions: [] }

  const wirePaths: string[] = []
  const junctions: { x: number; y: number }[] = []

  if (terminals.length === 2) {
    const path = routeTwoTerminals(terminals[0], terminals[1])
    wirePaths.push(path)
    return { wirePaths, junctions }
  }

  // 3+ terminals: Bus-trunk routing
  // Sort terminals horizontally
  const sorted = [...terminals].sort((p1, p2) => p1.x - p2.x)

  const minX = Math.min(...sorted.map(t => t.x))
  const maxX = Math.max(...sorted.map(t => t.x))
  const minY = Math.min(...sorted.map(t => t.y))
  const maxY = Math.max(...sorted.map(t => t.y))
  const spanX = maxX - minX
  const spanY = maxY - minY

  if (spanX >= spanY) {
    // Horizontal trunk line placed outside or between components
    const trunkY = Math.round((maxY + 20) / 10) * 10

    // Compute bounds for the trunk line with stub extensions
    const stubXList = sorted.map(t => t.x + (t.dir === 'right' ? 14 : t.dir === 'left' ? -14 : 0))
    const trunkX1 = Math.min(...stubXList)
    const trunkX2 = Math.max(...stubXList)

    wirePaths.push(`M ${trunkX1} ${trunkY} H ${trunkX2}`)

    for (const t of sorted) {
      const stubX = t.x + (t.dir === 'right' ? 14 : t.dir === 'left' ? -14 : 0)
      if (t.dir === 'right' || t.dir === 'left') {
        wirePaths.push(`M ${t.x} ${t.y} H ${stubX} V ${trunkY}`)
      } else {
        wirePaths.push(`M ${t.x} ${t.y} V ${trunkY}`)
      }
      junctions.push({ x: stubX, y: trunkY })
    }
  } else {
    // Vertical trunk line
    const trunkX = Math.round((maxX + 20) / 10) * 10

    const stubYList = sorted.map(t => t.y + (t.dir === 'bottom' ? 14 : t.dir === 'top' ? -14 : 0))
    const trunkY1 = Math.min(...stubYList)
    const trunkY2 = Math.max(...stubYList)

    wirePaths.push(`M ${trunkX} ${trunkY1} V ${trunkY2}`)

    for (const t of sorted) {
      const stubY = t.y + (t.dir === 'bottom' ? 14 : t.dir === 'top' ? -14 : 0)
      if (t.dir === 'top' || t.dir === 'bottom') {
        wirePaths.push(`M ${t.x} ${t.y} V ${stubY} H ${trunkX}`)
      } else {
        wirePaths.push(`M ${t.x} ${t.y} H ${trunkX}`)
      }
      junctions.push({ x: trunkX, y: stubY })
    }
  }

  return { wirePaths, junctions }
}

/** Route 2 terminals with a clean Manhattan step respecting pin exit directions. */
function routeTwoTerminals(a: SchematicNetTerminal, b: SchematicNetTerminal): string {
  // If perfectly collinear and facing each other directly:
  if (a.y === b.y && ((a.dir === 'right' && b.dir === 'left' && a.x < b.x) || (a.dir === 'left' && b.dir === 'right' && a.x > b.x))) {
    return `M ${a.x} ${a.y} H ${b.x}`
  }
  if (a.x === b.x && ((a.dir === 'bottom' && b.dir === 'top' && a.y < b.y) || (a.dir === 'top' && b.dir === 'bottom' && a.y > b.y))) {
    return `M ${a.x} ${a.y} V ${b.y}`
  }

  // Stub points extending outwards from each pin
  const stubA = {
    x: a.x + (a.dir === 'right' ? 14 : a.dir === 'left' ? -14 : 0),
    y: a.y + (a.dir === 'bottom' ? 14 : a.dir === 'top' ? -14 : 0),
  }
  const stubB = {
    x: b.x + (b.dir === 'right' ? 14 : b.dir === 'left' ? -14 : 0),
    y: b.y + (b.dir === 'bottom' ? 14 : b.dir === 'top' ? -14 : 0),
  }

  // Facing horizontal step (e.g. Right -> Left with a.x < b.x)
  if (a.dir === 'right' && b.dir === 'left' && stubA.x < stubB.x) {
    const midX = Math.round((stubA.x + stubB.x) / 2)
    return `M ${a.x} ${a.y} H ${midX} V ${b.y} H ${b.x}`
  }
  if (a.dir === 'left' && b.dir === 'right' && stubA.x > stubB.x) {
    const midX = Math.round((stubA.x + stubB.x) / 2)
    return `M ${a.x} ${a.y} H ${midX} V ${b.y} H ${b.x}`
  }

  // Both exiting to the right
  if (a.dir === 'right' && b.dir === 'right') {
    const laneX = Math.max(a.x, b.x) + 18
    return `M ${a.x} ${a.y} H ${laneX} V ${b.y} H ${b.x}`
  }

  // Both exiting to the left
  if (a.dir === 'left' && b.dir === 'left') {
    const laneX = Math.min(a.x, b.x) - 18
    return `M ${a.x} ${a.y} H ${laneX} V ${b.y} H ${b.x}`
  }

  // Facing vertical step (Top -> Bottom or Bottom -> Top)
  if (a.dir === 'bottom' && b.dir === 'top' && stubA.y < stubB.y) {
    const midY = Math.round((stubA.y + stubB.y) / 2)
    return `M ${a.x} ${a.y} V ${midY} H ${b.x} V ${b.y}`
  }
  if (a.dir === 'top' && b.dir === 'bottom' && stubA.y > stubB.y) {
    const midY = Math.round((stubA.y + stubB.y) / 2)
    return `M ${a.x} ${a.y} V ${midY} H ${b.x} V ${b.y}`
  }

  // Default: Step via stub points
  if (a.dir === 'left' || a.dir === 'right') {
    return `M ${a.x} ${a.y} H ${stubA.x} V ${b.y} H ${b.x}`
  }

  return `M ${a.x} ${a.y} V ${stubA.y} H ${b.x} V ${b.y}`
}
