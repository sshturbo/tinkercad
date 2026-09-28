import type { Kind } from './model'
import { extractedModelNames } from './extracted-models'

export const LIBRARY_BASE_URL = '/circuit-library'

export type LibraryCatalogItem = {
  kind?: string
  id: string | number
  device_id?: string | number
  name: string
  path?: string
  record_json?: string
  thumbnail: string
  simulation_model?: string | null
  svg_count?: number
  pin_record_count?: number
  property_record_count?: number
  basic?: boolean
  description?: string
  tags?: string[]
  category?: string
}

export type LibraryExtent = { top: number; left: number; width: number; height: number }

export type LibraryTerminal = {
  id?: number | string
  name?: string | null
  label?: string | null
  terminal_type?: string
  x: number
  y: number
  dir?: number
}

export type LibraryProperty = {
  name: string
  default?: unknown
  unit?: string | null
  default_prefix?: string | null
  sim_read_only?: boolean
}

export type LibraryRecord = {
  schema_version?: string
  record_kind?: string
  id: string | number
  device_id: string | number
  name: string
  description?: string | null
  tags?: string[]
  categories?: string[]
  thumbnail?: string
  simulation_model?: string | null
  footprint?: { name?: string | null; id?: string | number }
  extents?: LibraryExtent
  svgs?: { type?: string; file: string }[]
  pins_and_terminals?: LibraryTerminal[]
  properties?: LibraryProperty[]
  datasheets_or_references?: { path?: string; url?: string | null }[]
}

export type LibraryRecords = Record<string, LibraryRecord>

export function libraryReferenceLabels(record?: LibraryRecord): string[] {
  const names = new Set<string>()
  for (const reference of record?.datasheets_or_references ?? []) {
    if (!/datasheet|reference/i.test(reference.path ?? '')) continue
    if (!reference.url) continue
    try {
      const parsed: unknown = JSON.parse(reference.url)
      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          if (entry && typeof entry === 'object' && 'filename' in entry && typeof entry.filename === 'string') {
            names.add(entry.filename)
          }
        }
      }
    } catch {
      if (!/^https?:\/\//i.test(reference.url)) names.add(reference.url.split(/[\\/]/).pop() || reference.url)
    }
  }
  return [...names]
}

const simulatorKindByModel: Record<string, Kind> = {
  resistor: 'resistor',
  led2: 'led',
  button: 'button',
  '74HC73': 'jk74hc73',
  '74HC00': 'nand74hc00',
  '74HC74': 'dff7474',
  powerSupply: 'supply',
  battery9V: 'supply',
  coinCell: 'supply',
  function_generator: 'generator',
}

const modelByNativeKind: Partial<Record<Kind, string>> = {
  resistor: 'resistor', led: 'led2', button: 'button',
  jk74hc73: '74HC73', nand74hc00: '74HC00', dff7474: '74HC74',
  and: '74HC08', or: '74HC32', not: '74HC04', nand: '74HC00', nor: '74HC02', xor: '74HC86',
  supply: 'powerSupply', vcc: 'powerSupply', gnd: 'powerSupply',
  generator: 'function_generator', clock: 'function_generator',
}

const libraryPinAliases: Partial<Record<Kind, Record<string, string>>> = {
  resistor: { A: 'Terminal 2', B: 'Terminal 1' },
  led: { A: 'Anode', K: 'Cathode' },
  button: { A1: 'Terminal 1b', A2: 'Terminal 1a', B1: 'Terminal 2b', B2: 'Terminal 2a' },
  supply: { PLUS: 'Positive', MINUS: 'Negative' },
  generator: { OUT: 'Positive', GND: 'Negative' },
  vcc: { OUT: 'Positive' },
  gnd: { OUT: 'Negative' },
  clock: { OUT: 'Positive' },
  jk74hc73: {
    'J 1': 'J 1', 'Saída invertida 1': 'Inverted Output 1', 'Saída 1': 'Output 1', Solo: 'Ground',
    'K 2': 'K 2', 'Saída 2': 'Output 2', 'Saída invertida 2': 'Inverted Output 2',
    'Relógio 1': 'Clock 1', 'Redefinir 1': 'Reset 1', 'K 1': 'K 1', Potência: 'Power',
    'Relógio 2': 'Clock 2', 'Redefinir 2': 'Reset 2', 'J 2': 'J 2',
  },
  nand74hc00: {
    Potência: 'Power', 'Entrada 4B': 'Input 4B', 'Entrada 4A': 'Input 4A', 'Saída 4': 'Output 4',
    'Entrada 3B': 'Input 3B', 'Entrada 3A': 'Input 3A', 'Saída 3': 'Output 3',
    'Entrada 1A': 'Input 1A', 'Entrada 1B': 'Input 1B', 'Saída 1': 'Output 1',
    'Entrada 2A': 'Input 2A', 'Entrada 2B': 'Input 2B', 'Saída 2': 'Output 2', Solo: 'Ground',
  },
  dff7474: {
    D1: 'Input 1', CLK1: 'Clock 1', PRE1: 'Set 1', CLR1: 'Reset 1', Q1: 'Output 1', NQ1: 'Inverted Output 1',
    D2: 'Input 2', CLK2: 'Clock 2', PRE2: 'Set 2', CLR2: 'Reset 2', Q2: 'Output 2', NQ2: 'Inverted Output 2',
    VCC: 'Power', GND: 'Ground',
  },
  and: { A: 'Input 1A', B: 'Input 1B', Y: 'Output 1' },
  or: { A: 'Input 1A', B: 'Input 1B', Y: 'Output 1' },
  nand: { A: 'Input 1A', B: 'Input 1B', Y: 'Output 1' },
  nor: { A: 'Input 1A', B: 'Input 1B', Y: 'Output 1' },
  xor: { A: 'Input 1A', B: 'Input 1B', Y: 'Output 1' },
  not: { A: 'Input 1', Y: 'Output 1' },
}

export function libraryAssetUrl(path: string): string {
  const safePath = path.split('/').map(encodeURIComponent).join('/')
  return `${LIBRARY_BASE_URL}/${safePath}`
}

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(libraryAssetUrl(path))
  if (!response.ok) throw new Error(`Não foi possível carregar ${path} (${response.status})`)
  return response.json() as Promise<T>
}

export type CatalogMenuKey =
  | 'components-basic'
  | 'components-all'
  | 'starters-basic'
  | 'starters-arduino'
  | 'starters-microbit'
  | 'starters-circuit-assemblies'
  | 'starters-all'

export const CATALOG_MENU_SOURCES: Record<CatalogMenuKey, string> = {
  'components-basic': 'catalog/components-basic.json',
  'components-all': 'catalog/components-all.json',
  'starters-basic': 'catalog/starters-basic.json',
  'starters-arduino': 'catalog/starters-arduino.json',
  'starters-microbit': 'catalog/starters-microbit.json',
  'starters-circuit-assemblies': 'catalog/starters-circuit-assemblies.json',
  'starters-all': 'catalog/starters-all.json',
}

export type CategoryItem = {
  key: CatalogMenuKey
  label: string
  source: string
}

export type CategoryGroup = {
  id: 'components' | 'starters'
  label: string
  items: CategoryItem[]
}

export const CATALOG_GROUPS: CategoryGroup[] = [
  {
    id: 'components',
    label: 'Componentes',
    items: [
      { key: 'components-basic', label: 'Básico', source: 'catalog/components-basic.json' },
      { key: 'components-all', label: 'Todos', source: 'catalog/components-all.json' },
    ],
  },
  {
    id: 'starters',
    label: 'Disparadores',
    items: [
      { key: 'starters-basic', label: 'Básico', source: 'catalog/starters-basic.json' },
      { key: 'starters-arduino', label: 'Arduino', source: 'catalog/starters-arduino.json' },
      { key: 'starters-microbit', label: 'Micro:Bit', source: 'catalog/starters-microbit.json' },
      { key: 'starters-circuit-assemblies', label: 'Montagens de Circuito', source: 'catalog/starters-circuit-assemblies.json' },
      { key: 'starters-all', label: 'Todos', source: 'catalog/starters-all.json' },
    ],
  },
]

export const COMPONENT_DISPLAY_NAMES: Record<string, string> = {
  '1.5V Battery': 'Bateria 1,5V',
  '9V Battery': 'Bateria 9V',
  'Coin Cell 3V Battery': 'Bateria 3V do tipo moeda',
  'Breadboard': 'Placa de ensaio',
  'Breadboard Small': 'Placa de ensaio pequena',
  'Breadboard Mini': 'Placa de ensaio mini',
  'Pushbutton': 'Botão',
  'Slideswitch': 'Interruptor deslizante',
  'Potentiometer': 'Potenciômetro',
  'Capacitor': 'Capacitor',
  'Polarized Capacitor': 'Capacitor polarizado',
  'Resistor': 'Resistor',
  'LED': 'LED',
  'LED RGB': 'LED RGB',
  'Diode': 'Diodo',
  'Zener Diode': 'Diodo Zener',
  'Inductor': 'Indutor',
  'NPN Transistor (BJT)': 'Transistor NPN',
  'PNP Transistor (BJT)': 'Transistor PNP',
  'Vibration Motor': 'Motor de vibração',
  'DC Motor': 'Motor CC',
  'DC Motor with encoder': 'Motor CC com codificador',
  'Micro Servo': 'Micro servo',
  'Hobby Gearmotor': 'Motor de engrenagem',
  'Photoresistor': 'Fotorresistor',
  'Photodiode': 'Fotodiodo',
  'Ambient Light Sensor': 'Sensor de luz ambiente',
  'Flex Sensor': 'Sensor flexível',
  'Force Sensor': 'Sensor de força',
  'Ultrasonic Distance Sensor': 'Sensor de distância ultrassônico',
  'PIR Sensor': 'Sensor PIR',
  'Gas Sensor': 'Sensor de gás',
  'Temperature Sensor [TMP36]': 'Sensor de temperatura',
  'Tilt Sensor': 'Sensor de inclinação',
  'Arduino Uno R3': 'Arduino Uno R3',
  'micro:bit': 'micro:bit',
  'micro:bit with Breakout': 'micro:bit com Breakout',
  'Neopixel Ring 12': 'Anel NeoPixel 12',
  'Neopixel Ring 16': 'Anel NeoPixel 16',
  'Neopixel Ring 24': 'Anel NeoPixel 24',
  'Neopixel Strip 4': 'Fita NeoPixel 4',
  'Neopixel Strip 8': 'Fita NeoPixel 8',
  'Neopixel Strip 16': 'Fita NeoPixel 16',
  '7 Segment Display': 'Visor 7 segmentos',
  'LCD 16 x 2': 'LCD 16×2',
  'LCD 16 x 2 (I2C)': 'LCD 16×2 I2C',
  'Multimeter': 'Multímetro',
  'Power Supply': 'Fonte de energia',
  'Function Generator': 'Gerador de função',
  'Oscilloscope': 'Osciloscópio',
  '74HC73': 'CI 74HC73',
  '74HC00': 'CI 74HC00',
  '74HC74': 'CI 7474',
  '74HC08': 'Porta AND (74HC08)',
  '74HC32': 'Porta OR (74HC32)',
  '74HC04': 'Inversor (74HC04)',
  '74HC02': 'Porta NOR (74HC02)',
  '74HC86': 'Porta XOR (74HC86)',
}

export function getComponentDisplayName(name: string): string {
  return COMPONENT_DISPLAY_NAMES[name] || name
}

export function loadCatalogItems(key: CatalogMenuKey = 'components-basic'): Promise<LibraryCatalogItem[]> {
  const source = CATALOG_MENU_SOURCES[key] || CATALOG_MENU_SOURCES['components-basic']
  return readJson(source)
}

export function loadLibraryItems(): Promise<LibraryCatalogItem[]> {
  return readJson('catalog/components-all.json')
}

export function loadLibraryRecord(item: LibraryCatalogItem): Promise<LibraryRecord> {
  if (!item.record_json) {
    return Promise.resolve({
      id: item.id,
      device_id: item.device_id ?? item.id,
      name: item.name,
      description: item.description,
      tags: item.tags,
      thumbnail: item.thumbnail,
      simulation_model: item.simulation_model ?? null,
      extents: { left: -50, top: -50, width: 100, height: 100 },
      svgs: [],
      pins_and_terminals: [],
    })
  }
  return readJson(item.record_json)
}

export function libraryIdFromPart(part: { properties?: Record<string, string | number | boolean> }): string {
  return String(part.properties?.libraryId ?? '')
}

export function libraryKindForItem(item: LibraryCatalogItem): Kind {
  if (!item.simulation_model && item.name.toLowerCase() === 'breadboard small') return 'breadboard'
  return simulatorKindByModel[item.simulation_model ?? ''] ?? 'library'
}

export function libraryItemForKind(items: LibraryCatalogItem[], kind: Kind): LibraryCatalogItem | undefined {
  if (kind === 'breadboard') return items.find(item => item.name === 'Breadboard Small') ?? items.find(item => item.name === 'Breadboard')
  const model = modelByNativeKind[kind]
  return model ? items.find(item => item.simulation_model === model) : undefined
}

export function libraryItemSupportsSimulation(item: LibraryCatalogItem): boolean {
  // Breadboards are passive, but their rails and terminal strips conduct in the simulator.
  if (item.name.toLowerCase().startsWith('breadboard') || [
    'diode', 'ledRGB', 'lightBulb', 'vibration_motor', 'sensor_tilt_sw200d', 'USBstandard', 'sensorSoilMoisture', 'IRsensor', 'sensor_gas', 'sensor_pir', 'piezoSound', 'Timer555', 'timer556', 'sensor_ultrasonic_ping', 'capacitor', 'capacitor_polarized', 'inductor', 'AABattery', 'battery9V', 'coinCell',
    'batteryLemon', 'batteryPotato', 'slide_switch', 'slide_switch_v2', 'potentiometer', 'potentiometer_v2',
    'dip_switch_spdt', 'dip_switch_4', 'dip_switch_6', 'seven_segment_digit_5011bh', 'keypad_4x4', 'zenerDiode', 'npn', 'pnp', 'nmos', 'power_nmos', 'pmos', 'power_pmos', 'tip120', 'voltageRegulator5V', 'voltageRegulator3p3V', 'opAmp_UA741', 'lm393', 'lm339', 'photodiode_v2', 'phototransistor', 'relay_spdt', 'relay_dpdt', 'ldr_v2', 'sensorForce', 'sensorFlex', 'TMP36', 'solarCell',
  ].includes(item.simulation_model ?? '')) return true
  return libraryKindForItem(item) !== 'library' || extractedModelNames.has(item.simulation_model ?? '')
}

export function libraryPinNameForKind(kind: Kind, pin: string): string | undefined {
  return libraryPinAliases[kind]?.[pin]
}

function rawBreadboardTerminals(record?: LibraryRecord): LibraryTerminal[] {
  return (record?.pins_and_terminals ?? []).filter(terminal =>
    terminal.terminal_type?.startsWith('breadboard') && Number.isFinite(terminal.x) && Number.isFinite(terminal.y),
  )
}

const namedTerminalCache = new WeakMap<LibraryRecord, { key: string; terminal: LibraryTerminal }[]>()
const terminalByKeyCache = new WeakMap<LibraryRecord, Map<string, LibraryTerminal>>()

function namedTerminals(record?: LibraryRecord): { key: string; terminal: LibraryTerminal }[] {
  if (!record) return []
  const cached = namedTerminalCache.get(record)
  if (cached) return cached
  const seen = new Map<string, number>()
  const pins = rawBreadboardTerminals(record).map((terminal, index) => {
    const name = String(terminal.name || terminal.label || `Pino ${index + 1}`)
    const count = (seen.get(name) ?? 0) + 1
    seen.set(name, count)
    return { key: count === 1 ? name : `${name} (${count})`, terminal }
  })
  namedTerminalCache.set(record, pins)
  terminalByKeyCache.set(record, new Map(pins.map(pin => [pin.key, pin.terminal])))
  return pins
}

// The largest downloaded breadboard has 840 holes.
const MAX_INTERACTIVE_LIBRARY_PINS = 1024

export function libraryPinNames(record?: LibraryRecord): string[] {
  if (!libraryFrame(record)) return []
  const pins = namedTerminals(record)
  return pins.length > MAX_INTERACTIVE_LIBRARY_PINS ? [] : pins.map(pin => pin.key)
}

export function libraryBoardConnections(record?: LibraryRecord): [string, string][] {
  if (!record || !['Breadboard', 'Breadboard Mini'].includes(record.name)) return []
  const strips = new Map<string, { key: string; terminal: LibraryTerminal }[]>()
  const rails = new Map<number, { key: string; terminal: LibraryTerminal }[]>()
  for (const pin of namedTerminals(record)) {
    const { x, y } = pin.terminal
    if (Math.abs(y) >= 15 && Math.abs(y) <= 55) {
      const key = `${x}:${Math.sign(y)}`
      strips.set(key, [...(strips.get(key) ?? []), pin])
    } else if (Math.abs(y) >= 85) {
      rails.set(y, [...(rails.get(y) ?? []), pin])
    }
  }
  const connections: [string, string][] = []
  for (const pins of strips.values()) {
    pins.sort((a, b) => a.terminal.y - b.terminal.y)
    for (let index = 1; index < pins.length; index++) connections.push([pins[index - 1].key, pins[index].key])
  }
  for (const pins of rails.values()) {
    pins.sort((a, b) => a.terminal.x - b.terminal.x)
    for (let index = 1; index < pins.length; index++) {
      if (pins[index].terminal.x - pins[index - 1].terminal.x <= 10.1) {
        connections.push([pins[index - 1].key, pins[index].key])
      }
    }
  }
  return connections
}

export function libraryPinOffset(record: LibraryRecord | undefined, pinName: string, kind?: Kind) {
  if (!record) return undefined
  const pins = namedTerminals(record)
  if (pins.length > MAX_INTERACTIVE_LIBRARY_PINS) return undefined
  const pin = terminalByKeyCache.get(record)?.get(pinName)
  const frame = libraryFrame(record, kind)
  const extents = record?.extents
  if (!pin || !frame || !extents) return undefined
  const x = frame.x + ((pin.x - extents.left) / extents.width) * frame.width
  const y = frame.y + ((pin.y - extents.top) / extents.height) * frame.height
  return { x, y }
}

export function libraryFrame(record?: LibraryRecord, kind?: Kind) {
  const extents = record?.extents
  if (!extents || ![extents.left, extents.top, extents.width, extents.height].every(Number.isFinite)) return undefined
  if (extents.width <= 0 || extents.height <= 0) return undefined
  const visualKind = kind === 'vcc' || kind === 'gnd' ? 'supply' : kind === 'clock' ? 'generator' : kind
  let scaleX = Math.min(1.15, 110 / extents.width, 72 / extents.height)
  let scaleY = scaleX
  const physicalPins = namedTerminals(record).length
  const breadboardMount = physicalPins >= 2 && extents.width <= 100 && extents.height <= 80
  if (record.name.startsWith('Breadboard') || (breadboardMount && visualKind !== 'supply' && visualKind !== 'generator')) {
    scaleX = 760 / 330
    scaleY = 408 / 212
  } else if (visualKind === 'supply' && (record?.simulation_model === 'powerSupply' || record?.name === 'Power Supply')) {
    return { scaleX: 2, scaleY: 2, x: -110, y: -76, width: 220, height: 172 }
  } else if (visualKind === 'generator') {
    return { scaleX: 1.95, scaleY: 1.62, x: -198, y: -84, width: 396, height: 196 }
  }
  return {
    scaleX,
    scaleY,
    x: extents.left * scaleX,
    y: extents.top * scaleY,
    width: extents.width * scaleX,
    height: extents.height * scaleY,
  }
}

export function librarySvgPath(item: LibraryCatalogItem, record: LibraryRecord): string | undefined {
  const svg = record.svgs?.find(candidate => candidate.type === 'breadboard') ?? record.svgs?.[0]
  return svg ? `${item.path}/${svg.file}` : undefined
}
