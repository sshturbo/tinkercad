import { pinId, type Part, type Project, type Runtime, type Simulation } from './model'
import { isVariableSensorModel, variableSensorResistance } from './variableSensorModels'
import { getSensorSourceModel, isSensorSourceModel } from './sensorSourceModels'
import { functionGeneratorOutputResistanceOhms, functionGeneratorVoltageAtTime } from './functionGeneratorModel'
import { checkPolarizedCapacitorVoltage, getPassiveComponentModel } from './passiveComponentModels'
import { getZenerDiodeModel } from './zenerDiodeModel'
import { getBipolarTransistorModel } from './bipolarTransistorModels'
import { getMOSFETModel } from './mosfetModels'
import { evaluateBipolarTransistor, evaluateMOSFET } from './transistorEquations'
import { getVoltageRegulatorModel, voltageRegulatorBreakdown } from './voltageRegulatorModels'
import { evaluateVoltageRegulator } from './voltageRegulatorEquations'
import { evaluateUA741 } from './opAmpEquations'
import { evaluateComparatorTrigger, getComparatorModel, getComparatorOutputBasePullupResistanceOhms } from './opAmpAndComparatorModels'
import { getPhotodetectorModel, type PhotodetectorDescriptor } from './photodetectorModels'
import { RELAY_MODELS, getRelayContactResistanceOhms, getRelayStateAfterCoilSample, type RelayContact, type RelayModel, type RelayState } from './relayModels'
import { evaluateLightBulb, LIGHT_BULB_MODEL } from './lightBulbModel'
import { evaluateVibrationMotor, VIBRATION_MOTOR_MODEL, vibrationMotorCurrentFromVoltage } from './vibrationMotorModel'
import { evaluatePiezoSound, PIEZO_SOUND_MODEL } from './piezoSoundModel'
import { advanceTimer555Latch, canonicalTimer555Pin, requestedTimer555Latch, TIMER555_MODEL } from './timer555Model'
import { canonicalTimer556Pin, TIMER556_MODEL, type Timer556ChannelName } from './timer556Model'
import { advanceUltrasonicPingState, canonicalUltrasonicPingPin, evaluateUltrasonicTarget, initialUltrasonicPingState, nextUltrasonicDeadline, resolveUltrasonicTargetPosition, ultrasonicEchoActiveAt, ultrasonicEchoResistanceOhms, ultrasonicPowerValid, ULTRASONIC_PING_MODEL } from './ultrasonicPingModel'
import { evaluateTiltSensor, TILT_SENSOR_MODEL, tiltSensorCurrentFromVoltage } from './tiltSensorModel'
import { evaluateSoilMoisture, SOIL_MOISTURE_MODEL } from './soilMoistureModel'
import { evaluateUSBStandardCurrent, USB_STANDARD_MODEL } from './usbStandardModel'
import { evaluateRgbLed, initialRgbLedPinDirections, rgbLedDiodeCurrentFromVoltage, rgbLedShuntResistanceOhms, RGB_LED_MODEL, type RgbLedTerminal } from './rgbLedModel'
import { evaluateTwoPinLed, getTwoPinDiodeDescriptor, shockleyDiodeCurrentWithContinuationA } from './twoPinDiodeModel'
import { getKeypadModel, canonicalKeypadTerminal, normalizeKeypadPushed, KEYPAD_4X4_MODEL, type KeypadPushedInput } from './keypadModel'
import { createSevenSegmentTopology, evaluateSevenSegmentDisplay, resolveSevenSegmentTerminal, resolveSevenSegmentCommonType, SEVEN_SEGMENT_MODEL, sevenSegmentDiodeCurrentFromVoltage, type SevenSegmentName } from './sevenSegmentDisplayModel'
import { createIRSensorTopology, evaluateIRSensorSupplyVoltage, IR_SENSOR_MODEL, resolveIRSensorDetection, resolveIRSensorTerminal } from './irSensorModel'
import { evaluateGasSensor, GAS_SENSOR_MODEL } from './gasSensorModel'
import { createPIRSensorTopology, evaluatePIRSensorTarget, pirSensorDrivePulseOnTransition, PIR_SENSOR_MODEL, resolvePIRSensorTargetPosition } from './pirSensorModel'
import { evaluateMnaResidual } from './mnaResidual'

const ledLeakageConductance = 1e-12
const solverTolerance = 1e-8
const maxIterations = 40

type ElectricalFamily = 'breadboard' | 'vcc' | 'gnd' | 'resistor' | 'variableResistor' | 'led' | 'diode' | 'button' | 'switch' | 'supply' | 'capacitor' | 'polarizedCapacitor' | 'inductor' | 'potentiometer' | 'dipSwitch' | 'tempSensor' | 'solarCell' | 'generator' | 'zenerDiode' | 'npn' | 'pnp' | 'mosfet' | 'tip120' | 'regulator' | 'opAmp' | 'comparator' | 'photodiode' | 'phototransistor' | 'relay' | 'lightBulb' | 'vibrationMotor' | 'tiltSensor' | 'usbSource' | 'soilMoisture' | 'rgbLed' | 'sevenSegment' | 'keypad' | 'irSensor' | 'gasSensor' | 'pirSensor' | 'piezo' | 'timer555' | 'timer556' | 'ultrasonicPing'
type Branch = { part: Part; a: string; b: string; family: 'resistor' | 'switch' | 'solarDiode'; resistance?: number; saturationCurrent?: number; thermalVoltage?: number; maximumExponent?: number; minimumConductance?: number; photovoltaicStartup?: boolean; linearContinuation?: { voltage: number; conductance: number; intercept: number } }
type VoltageSource = { part: Part; a: string; b: string; voltage: number; enabledAboveVoltage?: { positive: string; negative: string; minimum: number } }
type CurrentSource = { part: Part; a: string; b: string; current: number }
type Capacitor = { part: Part; a: string; capacitorA: string; b: string; farads: number; seriesResistanceOhms: number }
type Inductor = { part: Part; a: string; b: string; henries: number }
type ThreeTerminalDevice = { part: Part; model: string; terminals: [string, string, string]; family: 'bipolar' | 'mosfet' | 'regulator' }
type OpAmpDevice = { part: Part; terminals: [string, string, string, string, string] }
type ComparatorChannelNodes = { channel: string; positive: string; negative: string; output: string; base: string; collector: string }
type ComparatorDevice = { part: Part; model: string; supplyPositive: string; supplyNegative: string; channels: ComparatorChannelNodes[] }
type RelayContactNodes = { pole: string; model: RelayContact; common: string; throw: string }
type Timer555Nodes = { vcc: string; ground: string; trigger: string; output: string; reset: string; control: string; threshold: string; discharge: string; reference: string }
type Timer556Nodes = Record<Timer556ChannelName, Timer555Nodes>
type UltrasonicPingNodes = { positive: string; negative: string; signal: string; trigger: string; echo: string; separateTrigger: boolean; separateEcho: boolean; separateSignal: boolean }
type RelayDevice = { part: Part; model: RelayModel; coil1: string; coil2: string; contacts: RelayContactNodes[] }

class DisjointSet {
  private parent = new Map<string, string>()
  add(value: string) { if (!this.parent.has(value)) this.parent.set(value, value) }
  find(value: string): string {
    this.add(value)
    const parent = this.parent.get(value)!
    if (parent === value) return value
    const root = this.find(parent)
    this.parent.set(value, root)
    return root
  }
  join(a: string, b: string) {
    const rootA = this.find(a), rootB = this.find(b)
    if (rootA !== rootB) this.parent.set(rootB, rootA)
  }
}

function family(part: Part): ElectricalFamily | undefined {
  if (part.kind !== 'library') return ['breadboard', 'vcc', 'gnd', 'resistor', 'led', 'diode', 'button', 'supply', 'generator'].includes(part.kind) ? part.kind as ElectricalFamily : undefined
  const model = String(part.properties?.simulationModel ?? '')
  if (model === 'resistor') return 'resistor'
  if (model === 'lightBulb') return 'lightBulb'
  if (model === PIEZO_SOUND_MODEL.id) return 'piezo'
  if (model === TIMER555_MODEL.id) return 'timer555'
  if (model === TIMER556_MODEL.id) return 'timer556'
  if (model === ULTRASONIC_PING_MODEL.id) return 'ultrasonicPing'
  if (model === 'vibration_motor') return 'vibrationMotor'
  if (model === 'sensor_tilt_sw200d') return 'tiltSensor'
  if (model === SOIL_MOISTURE_MODEL.id) return 'soilMoisture'
  if (model === USB_STANDARD_MODEL.id) return 'usbSource'
  if (model === 'function_generator') return 'generator'
  if (isVariableSensorModel(model)) return 'variableResistor'
  if (isSensorSourceModel(model)) return model.trim() === 'TMP36' ? 'tempSensor' : 'solarCell'
  if (model === 'inductor') return 'inductor'
  if (model === 'led2') return 'led'
  if (model === RGB_LED_MODEL.id) return 'rgbLed'
  if (model === SEVEN_SEGMENT_MODEL.id) return 'sevenSegment'
  if (model === KEYPAD_4X4_MODEL.id) return 'keypad'
  if (model === IR_SENSOR_MODEL.id) return 'irSensor'
  if (model === GAS_SENSOR_MODEL.id) return 'gasSensor'
  if (model === PIR_SENSOR_MODEL.id) return 'pirSensor'
  if (model === 'diode') return 'diode'
  if (model === 'zenerDiode') return 'zenerDiode'
  if (getBipolarTransistorModel(model)) return model as 'npn' | 'pnp'
  if (getMOSFETModel(model)) return 'mosfet'
  if (model === 'tip120') return 'tip120'
  if (getVoltageRegulatorModel(model)) return 'regulator'
  if (model === 'opAmp_UA741') return 'opAmp'
  if (getComparatorModel(model)) return 'comparator'
  if (model === 'photodiode_v2') return 'photodiode'
  if (model === 'phototransistor') return 'phototransistor'
  if (model === 'relay_spdt' || model === 'relay_dpdt') return 'relay'
  if (model === 'button') return 'button'
  if (model === 'capacitor') return 'capacitor'
  if (model === 'capacitor_polarized') return 'polarizedCapacitor'
  if (['powerSupply', 'battery9V', 'coinCell', 'AABattery', 'batteryLemon', 'batteryPotato'].includes(model)) return 'supply'
  if (['slide_switch', 'slide_switch_v2'].includes(model)) return 'switch'
  if (['potentiometer', 'potentiometer_v2'].includes(model)) return 'potentiometer'
  if (['dip_switch_spdt', 'dip_switch_4', 'dip_switch_6'].includes(model)) return 'dipSwitch'
  if (!model && part.label.toLowerCase().startsWith('breadboard')) return 'breadboard'
  return undefined
}

function projectReferencesPin(project: Project, part: Part, canonical: string): boolean {
  return project.wires.some(wire => [wire.from, wire.to].some(endpoint => {
    const separator = endpoint.indexOf(':')
    if (separator < 0 || endpoint.slice(0, separator) !== part.id) return false
    return canonicalPin(part, endpoint.slice(separator + 1)) === canonical
  }))
}

/** True only when the whole project consists of devices this first DC engine models. */
export function supportsDcSimulation(project: Project): boolean {
  if (!project.parts.length || !project.parts.every(part => family(part) !== undefined)) return false
  // OUT is a legacy digital-only helper on the virtual button, not a physical contact.
  return !project.parts.some(part => family(part) === 'button' && project.wires.some(wire =>
    wire.from === `${part.id}:OUT` || wire.to === `${part.id}:OUT`,
  ))
}

function canonicalPin(part: Part, pin: string): string {
  switch (family(part)) {
    case 'resistor':
    case 'variableResistor':
      if (['A', 'Terminal 2', '2'].includes(pin) || pin.toLowerCase() === 'terminal-2') return 'A'
      if (['B', 'Terminal 1', '1'].includes(pin) || pin.toLowerCase() === 'terminal-1') return 'B'
      break
    case 'lightBulb': {
      const name = pin.trim().toLowerCase()
      if (name === '1' || name === 'terminal 1') return '1'
      if (name === '2' || name === 'terminal 2') return '2'
      break
    }
    case 'timer555': {
      return canonicalTimer555Pin(pin) ?? pin
    }
    case 'timer556': {
      return canonicalTimer556Pin(pin) ?? pin
    }
    case 'ultrasonicPing': {
      return canonicalUltrasonicPingPin(pin) ?? pin
    }
    case 'piezo': {
      const name = pin.trim().toLowerCase()
      if (['+', 'positive', 'pos'].includes(name)) return PIEZO_SOUND_MODEL.terminals.positive.engine
      if (['-', 'negative', 'neg'].includes(name)) return PIEZO_SOUND_MODEL.terminals.negative.engine
      break
    }
    case 'vibrationMotor': {
      const name = pin.trim().toLowerCase()
      if (['positive', 'pos', '+'].includes(name)) return VIBRATION_MOTOR_MODEL.terminals.positive
      if (['negative', 'neg', '-'].includes(name)) return VIBRATION_MOTOR_MODEL.terminals.negative
      break
    }
    case 'tiltSensor': {
      const name = pin.trim().toLowerCase()
      if (name === '1' || name === 'terminal 1') return TILT_SENSOR_MODEL.terminals.first
      if (name === '2' || name === 'terminal 2') return TILT_SENSOR_MODEL.terminals.second
      break
    }
    case 'soilMoisture': {
      const name = pin.trim().toLowerCase()
      const { power, ground, signal } = SOIL_MOISTURE_MODEL.terminals
      if ([power.external.toLowerCase(), ...power.schematic].includes(name)) return power.external
      if ([ground.external.toLowerCase(), ...ground.schematic].includes(name)) return ground.external
      if ([signal.external.toLowerCase(), ...signal.schematic].includes(name)) return signal.external
      break
    }
    case 'gasSensor': {
      const name = pin.trim().toUpperCase()
      if (['A1', 'A2', 'B1', 'B2', 'H1', 'H2'].includes(name)) return name
      break
    }
    case 'pirSensor': {
      const name = pin.trim().toLowerCase().replace(/\s+/g, ' ')
      if (['vcc', 'power'].includes(name)) return PIR_SENSOR_MODEL.terminals.vcc.engine
      if (['gnd', 'ground'].includes(name)) return PIR_SENSOR_MODEL.terminals.ground.engine
      if (['out', 'output', 'signal'].includes(name)) return PIR_SENSOR_MODEL.terminals.output.engine
      break
    }
    case 'irSensor': {
      const terminal = resolveIRSensorTerminal(pin)
      if (terminal) return IR_SENSOR_MODEL.terminals[terminal].engine
      break
    }
    case 'usbSource': {
      const name = pin.trim().toLowerCase().replace(/\s+/g, ' ')
      if (name === '5v') return '5V'
      if (name === 'gnd' || name === 'ground') return 'GND'
      if (name === 'd+' || name === 'data +' || name === 'data+' || name === 'usb_p') return 'D+'
      if (name === 'd-' || name === 'data -' || name === 'data-' || name === 'usb_m') return 'D-'
      if (name === 'shield1' || name === 'shield2') return name === 'shield1' ? 'Shield1' : 'Shield2'
      break
    }
    case 'sevenSegment': {
      const terminal = resolveSevenSegmentTerminal(pin)
      if (terminal) return terminal
      break
    }
    case 'keypad': {
      const terminal = canonicalKeypadTerminal(pin)
      if (terminal) return terminal
      break
    }
    case 'rgbLed': {
      const name = pin.trim().toLowerCase()
      for (const aliases of Object.values(RGB_LED_MODEL.terminals)) {
        if ([aliases.breadboard, aliases.schematic].some(alias => alias.toLowerCase() === name)) {
          return aliases.breadboard
        }
      }
      break
    }
    case 'led':
      if (['A', 'Anode', 'anode', '+'].includes(pin)) return 'A'
      if (['K', 'Cathode', 'cathode', '-'].includes(pin)) return 'K'
      break
    case 'diode':
      if (['A', 'Anode', 'anode', '+'].includes(pin)) return 'ANODE'
      if (['K', 'Cathode', 'cathode', '-'].includes(pin)) return 'CATHODE'
      break
    case 'zenerDiode':
      if (['A', 'Anode', 'anode', '+'].includes(pin)) return 'A'
      if (['C', 'Cathode', 'cathode', '-'].includes(pin)) return 'C'
      break
    case 'npn': case 'pnp': case 'tip120': {
      const name = pin.toLowerCase()
      if (['b', 'base'].includes(name)) return 'B'
      if (['e', 'emitter'].includes(name)) return 'E'
      if (['c', 'collector'].includes(name)) return 'C'
      break
    }
    case 'mosfet': {
      const name = pin.toLowerCase()
      if (['g', 'gate'].includes(name)) return 'GATE'
      if (['s', 'source'].includes(name)) return 'SOURCE'
      if (['d', 'drain'].includes(name)) return 'DRAIN'
      break
    }
    case 'regulator': {
      const name = pin.toLowerCase()
      if (['in', 'input'].includes(name)) return 'IN'
      if (['gnd', 'ground'].includes(name)) return 'GND'
      if (['out', 'output'].includes(name)) return 'OUT'
      break
    }
    case 'opAmp': {
      const name = pin.toLowerCase()
      if (['v+', 'in+', 'non-inverting input'].includes(name)) return 'IN_PLUS'
      if (['v-', 'in-', 'inverting input'].includes(name)) return 'IN_MINUS'
      if (['vcc', 'power+'].includes(name)) return 'VCC'
      if (['gnd', 'power-'].includes(name)) return 'GND'
      if (['out'].includes(name)) return 'OUT'
      break
    }
    case 'relay': {
      const model = String(part.properties?.simulationModel ?? '')
      const name = pin.trim().toLowerCase().replace(/\s+/g, ' ')
      const numeric = name.match(/^(?:terminal )?(\d+)$/)?.[1]
      if (model === 'relay_spdt') {
        if (['coil1', 'coil2', 'r1', 'r2'].includes(name)) return name.toUpperCase()
        if (['com', 'com1', 'com2', '1', '12'].includes(name) || ['1', '12'].includes(numeric ?? '')) return 'COM'
        if (['8'].includes(numeric ?? '')) return 'COIL1'
        if (['5'].includes(numeric ?? '')) return 'COIL2'
        if (['6'].includes(numeric ?? '')) return 'R1'
        if (['7'].includes(numeric ?? '')) return 'R2'
      } else {
        if (['coila', 'coilb'].includes(name)) return name.toUpperCase()
        if (['coil1', 'coil2', 'coma', 'comb', 'a1', 'a2', 'b1', 'b2'].includes(name)) return name.toUpperCase()
        const packagePins: Record<string, string> = { '16': 'COIL1', '1': 'COIL2', '13': 'COMA', '11': 'A1', '9': 'A2', '4': 'COMB', '6': 'B1', '8': 'B2' }
        if (numeric && packagePins[numeric]) return packagePins[numeric]
      }
      break
    }
    case 'photodiode':
      if (['a', 'anode'].includes(pin.toLowerCase())) return 'ANODE'
      if (['k', 'cathode'].includes(pin.toLowerCase())) return 'CATHODE'
      break
    case 'phototransistor': {
      const name = pin.trim().toLowerCase()
      if (['c', 'collector'].includes(name)) return 'C'
      if (['e', 'emitter'].includes(name)) return 'E'
      break
    }
    case 'comparator': {
      const name = pin.trim().toLowerCase().replace(/\s+/g, ' ');
      if (['vcc', 'power'].includes(name)) return 'VCC'
      if (['gnd', 'ground'].includes(name)) return 'GND'
      const input = name.match(/^(?:in|input) ?([1-4]) ?([+-])$/)
        ?? name.match(/^input([1-4])_(pos|neg)$/)
      if (input) return `INPUT${input[1]}_${input[2] === '+' || input[2] === 'pos' ? 'POS' : 'NEG'}`
      const output = name.match(/^(?:out|output) ?([1-4])$/)
        ?? name.match(/^output([1-4])$/)
      if (output) return `OUTPUT${output[1]}`
      break
    }
    case 'inductor':
      if (['A', '1', 'Terminal 1'].includes(pin)) return 'A'
      if (['B', '2', 'Terminal 2'].includes(pin)) return 'B'
      break
    case 'capacitor':
      if (['A', '1', 'Terminal 1'].includes(pin)) return 'A'
      if (['B', '2', 'Terminal 2'].includes(pin)) return 'B'
      break
    case 'polarizedCapacitor':
      if (['A', 'Positive', 'positive', '+'].includes(pin)) return 'A'
      if (['B', 'Negative', 'negative', '-'].includes(pin)) return 'B'
      break
    case 'button':
      if (['A1', 'A2', 'Terminal 1a', 'Terminal 1b'].includes(pin)) return 'A1'
      if (['B1', 'B2', 'Terminal 2a', 'Terminal 2b'].includes(pin)) return 'B1'
      break
    case 'tempSensor': {
      const name = pin.toLowerCase()
      if (['vcc', 'power', 'positive', '+'].includes(name)) return 'VCC'
      if (['gnd', 'ground', 'negative', '-'].includes(name)) return 'GND'
      if (['vout', 'output'].includes(name)) return 'VOUT'
      break
    }
    case 'solarCell': {
      const name = pin.toLowerCase()
      if (['positive', '+'].includes(name)) return 'POSITIVE'
      if (['negative', '-'].includes(name)) return 'NEGATIVE'
      break
    }
    case 'generator': {
      const name = pin.toLowerCase()
      if (['out', 'positive', 'pos', '+'].includes(name)) return 'OUT'
      if (['gnd', 'negative', 'neg', '-'].includes(name)) return 'GND'
      break
    }
    case 'supply':
      if (['PLUS', 'Positive', 'positive', '+'].includes(pin)) return 'PLUS'
      if (['MINUS', 'Negative', 'negative', '-'].includes(pin)) return 'MINUS'
      break
    case 'switch':
      if (['1', 'Terminal 1'].includes(pin)) return '1'
      if (['2', 'Terminal 2'].includes(pin)) return '2'
      if (['3', 'Common'].includes(pin)) return '3'
      break
    case 'potentiometer':
      if (['terminal 1', 'term0', '1'].includes(pin.toLowerCase())) return 'TERMINAL1'
      if (['terminal 2', 'term1', '2'].includes(pin.toLowerCase())) return 'TERMINAL2'
      if (['wiper', '3'].includes(pin.toLowerCase())) return 'WIPER'
      break
    case 'dipSwitch': {
      const match = pin.match(/^([1-6])([ab])$/i)
      if (match) return `${match[1]}${match[2].toUpperCase()}`
      break
    }
    case 'vcc': case 'gnd':
      if (pin === 'OUT') return 'OUT'
      break
  }
  return pin
}

function canonicalEndpoint(id: string, parts: Map<string, Part>): string {
  if (id.startsWith('board:')) {
    const segments = id.split(':')
    return segments[2] === 'row' ? segments.slice(0, 5).join(':') : segments.slice(0, 3).join(':')
  }
  const divider = id.indexOf(':')
  if (divider < 0) return id
  const partId = id.slice(0, divider), pin = id.slice(divider + 1), part = parts.get(partId)
  return part ? `${partId}:${canonicalPin(part, pin)}` : id
}

function propertyNumber(part: Part, key: string, fallback: number): number {
  const raw = part.properties?.[key]
  const value = raw === undefined ? fallback : Number(raw)
  return Number.isFinite(value) ? value : fallback
}

function resistorOhms(part: Part): number { return propertyNumber(part, 'ohms', 220) }
function inductanceHenries(part: Part): number {
  const saved = part.properties?.inductance
  if (saved !== undefined) {
    const value = Number(saved)
    if (Number.isFinite(value)) return value
  }
  const legacy = part.properties?.['libraryProperty:inductance']
  if (legacy !== undefined) {
    const value = Number(legacy)
    if (Number.isFinite(value)) return value * 1e-6
  }
  return 10e-6
}
function capacitanceFarads(part: Part): number {
  const model = String(part.properties?.simulationModel ?? '')
  const fallback = model === 'capacitor_polarized' ? 1e-6 : 100e-9
  const saved = part.properties?.capacitance
  if (saved !== undefined) {
    const value = Number(saved)
    if (Number.isFinite(value)) return value
  }
  // Older editor versions stored the displayed number (e.g. 100) without its n/u prefix.
  const legacy = part.properties?.['libraryProperty:capacitance']
  if (legacy !== undefined) {
    const value = Number(legacy)
    const scale = model === 'capacitor_polarized' ? 1e-6 : 1e-9
    if (Number.isFinite(value)) return value * scale
  }
  return fallback
}
function sourceVolts(part: Part): number {
  if (family(part) === 'vcc') return propertyNumber(part, 'voltage', 5)
  const model = String(part.properties?.simulationModel ?? '')
  const count = Math.max(1, Math.trunc(propertyNumber(part, 'count', propertyNumber(part, 'libraryProperty:count', 1))))
  const defaultVoltage = model === 'battery9V' ? 9 : model === 'coinCell' ? 3
    : model === 'AABattery' ? 1.5 * count : model === 'batteryLemon' ? 0.52
      : model === 'batteryPotato' ? 0.67 : 5
  return propertyNumber(part, 'voltage', propertyNumber(part, 'libraryProperty:voltage', defaultVoltage))
}
function sourceResistance(part: Part): number {
  const model = String(part.properties?.simulationModel ?? '')
  const count = Math.max(1, Math.trunc(propertyNumber(part, 'count', propertyNumber(part, 'libraryProperty:count', 1))))
  const fallback = model === 'battery9V' ? 1.5 : model === 'coinCell' ? 10
    : model === 'AABattery' ? 0.5 * count : model === 'batteryLemon' ? 5900
      : model === 'batteryPotato' ? 5650 : 0
  const legacyResistance = propertyNumber(part, 'libraryProperty:resistance', fallback / 1000) * 1000
  return propertyNumber(part, 'internalResistance', legacyResistance)
}
function truthyProperty(value: unknown): boolean {
  return value === true || value === 1 || ['true', '1', 'yes', 'on'].includes(String(value ?? '').toLowerCase())
}
function potentiometerOhms(part: Part): number {
  const saved = part.properties?.resistance
  if (saved !== undefined) {
    const value = Number(saved)
    if (Number.isFinite(value)) return value
  }
  const legacy = part.properties?.['libraryProperty:resistance']
  if (legacy !== undefined) {
    const value = Number(legacy)
    if (Number.isFinite(value)) return value * 1000
  }
  return 250000
}
function potentiometerPosition(part: Part): number {
  const raw = part.properties?.position ?? part.properties?.['libraryProperty:Position'] ?? part.properties?.Position
  const value = raw === undefined ? 0 : Number(raw)
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
}
function modelSwitchOn(part: Part, key: string): boolean {
  return truthyProperty(part.properties?.[key] ?? part.properties?.[`libraryProperty:${key}`])
}
function batteryOutputDisabled(part: Part): boolean {
  return part.properties?.simulationModel === 'AABattery'
    && String(part.properties?.['libraryProperty:built-in switch'] ?? 'no').toLowerCase() === 'yes'
    && part.properties?.switchOn !== undefined && !truthyProperty(part.properties.switchOn)
}
function hasBatteryParasiticCapacitor(part: Part): boolean {
  return ['batteryLemon', 'batteryPotato'].includes(String(part.properties?.simulationModel ?? ''))
}
function solveLinearSystem(input: number[][], rhsInput: number[]): number[] | undefined {
  const size = rhsInput.length
  if (!size) return []
  const matrix = input.map((row, index) => [...row, rhsInput[index]])
  for (let column = 0; column < size; column++) {
    let pivot = column
    for (let row = column + 1; row < size; row++) {
      if (Math.abs(matrix[row][column]) > Math.abs(matrix[pivot][column])) pivot = row
    }
    if (Math.abs(matrix[pivot][column]) < 1e-14) return undefined
    ;[matrix[column], matrix[pivot]] = [matrix[pivot], matrix[column]]
    const divisor = matrix[column][column]
    for (let col = column; col <= size; col++) matrix[column][col] /= divisor
    for (let row = column + 1; row < size; row++) {
      const factor = matrix[row][column]
      if (!factor) continue
      for (let col = column; col <= size; col++) matrix[row][col] -= factor * matrix[column][col]
    }
  }
  const result = Array(size).fill(0) as number[]
  for (let row = size - 1; row >= 0; row--) {
    let value = matrix[row][size]
    for (let col = row + 1; col < size; col++) value -= matrix[row][col] * result[col]
    result[row] = value
  }
  return result.every(Number.isFinite) ? result : undefined
}


/** MNA for DC and backward-Euler transient analysis with physical KCL and ideal-source residual checks. */
function solveElectricalAttempt(project: Project, state: Runtime, timeStepSeconds = 0, simulationTimeSeconds = 0, gasSensorResistanceOverrides: Readonly<Record<string, number>> = {}, pirSensorPullupOverrides: Readonly<Record<string, number>> = {}, ultrasonicEchoPullupOverrides: Readonly<Record<string, number>> = {}): { simulation: Simulation; runtime: Runtime } {
  const dt = Number.isFinite(timeStepSeconds) && timeStepSeconds > 0 ? timeStepSeconds : 0
  const runtime = { ...state, buttons: { ...state.buttons }, capacitorVoltages: { ...(state.capacitorVoltages ?? {}) }, capacitorCurrents: { ...(state.capacitorCurrents ?? {}) }, inductorCurrents: { ...(state.inductorCurrents ?? {}) }, inductorVoltages: { ...(state.inductorVoltages ?? {}) }, relayStates: { ...(state.relayStates ?? {}) }, relayActuationSeconds: { ...(state.relayActuationSeconds ?? {}) }, timer556Latch: Object.fromEntries(Object.entries(state.timer556Latch ?? {}).map(([id, channels]) => [id, { ...channels }])), timer556PendingLatch: Object.fromEntries(Object.entries(state.timer556PendingLatch ?? {}).map(([id, channels]) => [id, { ...channels }])), timer556DelayRemainingSeconds: Object.fromEntries(Object.entries(state.timer556DelayRemainingSeconds ?? {}).map(([id, channels]) => [id, { ...channels }])), ultrasonicTargetPositions: { ...(state.ultrasonicTargetPositions ?? {}) }, ultrasonicStates: { ...(state.ultrasonicStates ?? {}) }, timer555Latch: { ...(state.timer555Latch ?? {}) }, timer555PendingLatch: { ...(state.timer555PendingLatch ?? {}) }, timer555DelayRemainingSeconds: { ...(state.timer555DelayRemainingSeconds ?? {}) }, keypadPushed: { ...(state.keypadPushed ?? {}) }, irDetected: { ...(state.irDetected ?? {}) }, gasSensorLevel: { ...(state.gasSensorLevel ?? {}) }, pirTargetPositions: { ...(state.pirTargetPositions ?? {}) }, pirInRange: { ...(state.pirInRange ?? {}) }, pirDrivePulses: { ...(state.pirDrivePulses ?? {}) }, q: { ...state.q }, prev_clock: { ...state.prev_clock } }
  const diagnostics: string[] = []
  const parts = new Map(project.parts.map(part => [part.id, part]))
  const sets = new DisjointSet()
  const ground = '0'
  sets.add(ground)

  for (const wire of project.wires) sets.join(canonicalEndpoint(wire.from, parts), canonicalEndpoint(wire.to, parts))
  for (const part of project.parts) {
    const kind = family(part)
    if (kind === 'gnd') sets.join(`${part.id}:OUT`, ground)
    if (kind === 'button') {
      sets.join(`${part.id}:A1`, `${part.id}:A2`)
      sets.join(`${part.id}:B1`, `${part.id}:B2`)
      if (runtime.buttons[part.id]) sets.join(`${part.id}:A1`, `${part.id}:B1`)
    }
    if (kind === 'gasSensor') {
      for (const [from, to] of GAS_SENSOR_MODEL.mergedTerminalPairs) sets.join(pinId(part, from), pinId(part, to))
    }
    if (kind === 'sevenSegment') {
      const topology = createSevenSegmentTopology(part.properties?.[SEVEN_SEGMENT_MODEL.control.property])
      const common = canonicalEndpoint(pinId(part, 'common'), parts)
      for (const channel of topology.channels) {
        const segment = canonicalEndpoint(pinId(part, channel.segment), parts)
        const anode = `__mna_seven_segment_anode:${part.id}:${channel.segment}`
        const cathode = `__mna_seven_segment_cathode:${part.id}:${channel.segment}`
        const active = channel.resistors.filter(resistor => resistor.resistanceOhms === SEVEN_SEGMENT_MODEL.resistor.activeOhms)
        for (const resistor of active) {
          const endpoint = (node: string) => node === topology.commonNode ? common
            : node === channel.segment ? segment
              : node === channel.diode.anode ? anode : node === channel.diode.cathode ? cathode : node
          sets.join(endpoint(resistor.from), endpoint(resistor.to))
        }
      }
    }
  }

  const branches: Branch[] = []
  const variableResistances = new Map<string, number>()
  const sources: VoltageSource[] = []
  const currentSources: CurrentSource[] = []
  const solarOutputs = new Map<string, { internal: string; positive: string; resistance: number }>()
  const generatorOutputs = new Map<string, { internal: string; positive: string; resistance: number }>()
  const capacitors: Capacitor[] = []
  const inductors: Inductor[] = []
  const threeTerminalDevices: ThreeTerminalDevice[] = []
  const opAmps: OpAmpDevice[] = []
  const comparators: ComparatorDevice[] = []
  const relays: RelayDevice[] = []
  const photodetectors = new Map<string, PhotodetectorDescriptor>()
  const photodiodeNodes = new Map<string, { anode: string; cathode: string }>()
  const phototransistorNodes = new Map<string, { base: string; emitter: string; collector: string }>()
  const soilMoistureResistances = new Map<string, number>()
  const irSensorTopologies = new Map<string, ReturnType<typeof createIRSensorTopology>>()
  const gasSensorLevels = new Map<string, number>()
  const gasSensorResistances = new Map<string, number>()
  const pirSensorNodes = new Map<string, { vcc: string; ground: string; output: string }>()
  const pirSensorPullupResistances = new Map<string, number>()
  const timer555Nodes = new Map<string, Timer555Nodes>()
  const timer556Nodes = new Map<string, Timer556Nodes>()
  const ultrasonicPingNodes = new Map<string, UltrasonicPingNodes>()
  const ultrasonicEchoPullupResistances = new Map<string, number>()
  const nodes = new Set<string>([ground])
  const includeNode = (id: string) => { const node = sets.find(canonicalEndpoint(id, parts)); nodes.add(node); return node }
  for (const wire of project.wires) { includeNode(wire.from); includeNode(wire.to) }

  for (const part of project.parts) {
    const kind = family(part)
    if (kind === 'gasSensor') {
      const level = evaluateGasSensor({ sensorLevel: runtime.gasSensorLevel?.[part.id] }).sensorLevel
      const initialResistance = evaluateGasSensor({ heaterVoltageV: 0, sensorLevel: level }).signalResistanceOhms
      const signalResistance = gasSensorResistanceOverrides[part.id] ?? initialResistance
      const nodeA = includeNode(pinId(part, GAS_SENSOR_MODEL.terminals.sensorA[0]))
      const nodeB = includeNode(pinId(part, GAS_SENSOR_MODEL.terminals.sensorB[0]))
      const heaterA = includeNode(pinId(part, GAS_SENSOR_MODEL.terminals.heater[0]))
      const heaterB = includeNode(pinId(part, GAS_SENSOR_MODEL.terminals.heater[1]))
      branches.push({ part, a: nodeA, b: nodeB, family: 'resistor', resistance: signalResistance })
      branches.push({ part, a: heaterA, b: heaterB, family: 'resistor', resistance: GAS_SENSOR_MODEL.heaterResistanceOhms })
      gasSensorLevels.set(part.id, level)
      gasSensorResistances.set(part.id, signalResistance)
    } else if (kind === 'pirSensor') {
      const { terminals } = PIR_SENSOR_MODEL
      const vcc = includeNode(pinId(part, terminals.vcc.engine))
      const groundNode = includeNode(pinId(part, terminals.ground.engine))
      const output = includeNode(pinId(part, terminals.output.engine))
      const targetPosition = runtime.pirTargetPositions?.[part.id] ?? resolvePIRSensorTargetPosition(part.properties)
      const target = evaluatePIRSensorTarget(targetPosition)
      const pullup = pirSensorPullupOverrides[part.id] ?? PIR_SENSOR_MODEL.output.inactivePullupOhms
      branches.push({ part, a: vcc, b: groundNode, family: 'resistor', resistance: PIR_SENSOR_MODEL.power.resistorOhms })
      branches.push({ part, a: vcc, b: output, family: 'resistor', resistance: pullup })
      branches.push({ part, a: output, b: groundNode, family: 'resistor', resistance: PIR_SENSOR_MODEL.output.groundShuntOhms })
      pirSensorNodes.set(part.id, { vcc, ground: groundNode, output })
      pirSensorPullupResistances.set(part.id, pullup)
      runtime.pirTargetPositions![part.id] = target.targetPosition
      runtime.pirInRange![part.id] = target.inRange
    } else if (kind === 'irSensor') {
      const { terminals } = IR_SENSOR_MODEL
      const topology = createIRSensorTopology(resolveIRSensorDetection(runtime.irDetected?.[part.id]))
      const terminalNodes = {
        vcc: includeNode(pinId(part, terminals.vcc.engine)),
        ground: includeNode(pinId(part, terminals.ground.engine)),
        output: includeNode(pinId(part, terminals.output.engine)),
      }
      for (const branch of topology.branches) branches.push({
        part, a: terminalNodes[branch.from], b: terminalNodes[branch.to], family: 'resistor', resistance: branch.resistanceOhms,
      })
      irSensorTopologies.set(part.id, topology)
    } else if (kind === 'soilMoisture') {
      const { terminals, topology, control } = SOIL_MOISTURE_MODEL
      const position = propertyNumber(part, control.property, control.defaultPosition)
      const probeResistance = evaluateSoilMoisture(position).probeResistanceOhms
      const power = includeNode(pinId(part, terminals.power.external))
      const groundNode = includeNode(pinId(part, terminals.ground.external))
      const signal = includeNode(pinId(part, terminals.signal.external))
      const probe1 = includeNode(pinId(part, '__soil_probe1'))
      const probe2 = includeNode(pinId(part, '__soil_probe2'))
      const fixed = topology.fixedResistors
      nodes.add(probe1); nodes.add(probe2)
      branches.push({ part, a: signal, b: groundNode, family: 'resistor', resistance: fixed[0].resistanceOhms })
      branches.push({ part, a: power, b: probe2, family: 'resistor', resistance: fixed[1].resistanceOhms })
      branches.push({ part, a: probe1, b: probe2, family: 'resistor', resistance: probeResistance })
      // The extracted call is addNPN(probe1, sig1, vcc1): base, emitter, collector.
      threeTerminalDevices.push({ part, model: 'npn', terminals: [probe1, signal, power], family: 'bipolar' })
      soilMoistureResistances.set(part.id, probeResistance)
    } else if (kind === 'tiltSensor') {
      const position = propertyNumber(part, TILT_SENSOR_MODEL.control.property, TILT_SENSOR_MODEL.control.defaultPosition)
      const resistance = evaluateTiltSensor(position).resistanceOhms
      const terminal1 = includeNode(pinId(part, TILT_SENSOR_MODEL.terminals.first))
      const terminal2 = includeNode(pinId(part, TILT_SENSOR_MODEL.terminals.second))
      branches.push({ part, a: terminal1, b: terminal2, family: 'resistor', resistance })
    } else if (kind === 'vibrationMotor') {
      const positive = includeNode(pinId(part, VIBRATION_MOTOR_MODEL.terminals.positive))
      const negative = includeNode(pinId(part, VIBRATION_MOTOR_MODEL.terminals.negative))
      branches.push({ part, a: positive, b: negative, family: 'resistor', resistance: VIBRATION_MOTOR_MODEL.resistanceOhms })
    } else if (kind === 'lightBulb') {
      const terminal1 = includeNode(pinId(part, '1'))
      const terminal2 = includeNode(pinId(part, '2'))
      branches.push({ part, a: terminal1, b: terminal2, family: 'resistor', resistance: LIGHT_BULB_MODEL.resistanceOhms })
    } else if (kind === 'piezo') {
      const positive = includeNode(pinId(part, PIEZO_SOUND_MODEL.terminals.positive.engine))
      const negative = includeNode(pinId(part, PIEZO_SOUND_MODEL.terminals.negative.engine))
      branches.push({ part, a: positive, b: negative, family: 'resistor', resistance: PIEZO_SOUND_MODEL.resistanceOhms })
    } else if (kind === 'ultrasonicPing') {
      const terminals = ULTRASONIC_PING_MODEL.terminals
      const positive = includeNode(pinId(part, terminals.positive.engine))
      const negative = includeNode(pinId(part, terminals.negative.engine))
      const signal = includeNode(pinId(part, terminals.signal.engine))
      const hasSeparateTriggerWire = projectReferencesPin(project, part, terminals.trigger.engine)
      const hasSeparateEchoWire = projectReferencesPin(project, part, terminals.echo.engine)
      const separateTrigger = hasSeparateTriggerWire || hasSeparateEchoWire
      const separateEcho = separateTrigger
      const separateSignal = projectReferencesPin(project, part, terminals.signal.engine)
      const trigger = separateTrigger ? includeNode(pinId(part, terminals.trigger.engine)) : signal
      const echo = separateEcho ? includeNode(pinId(part, terminals.echo.engine)) : signal
      const echoPullup = ultrasonicEchoPullupOverrides[part.id] ?? ULTRASONIC_PING_MODEL.electrical.echoInactivePullupOhms
      branches.push({ part, a: positive, b: negative, family: 'resistor', resistance: ULTRASONIC_PING_MODEL.electrical.powerResistanceOhms })
      branches.push({ part, a: positive, b: echo, family: 'resistor', resistance: echoPullup })
      branches.push({ part, a: echo, b: negative, family: 'resistor', resistance: ULTRASONIC_PING_MODEL.electrical.echoGroundResistanceOhms })
      if (separateTrigger && !separateSignal) branches.push({ part, a: positive, b: trigger, family: 'resistor', resistance: ULTRASONIC_PING_MODEL.electrical.triggerPullupOhms })
      runtime.ultrasonicTargetPositions![part.id] ??= resolveUltrasonicTargetPosition(part.properties)
      runtime.ultrasonicStates![part.id] ??= initialUltrasonicPingState()
      ultrasonicPingNodes.set(part.id, { positive, negative, signal, trigger, echo, separateTrigger, separateEcho, separateSignal })
      ultrasonicEchoPullupResistances.set(part.id, echoPullup)
    } else if (kind === 'timer555') {
      const pins = TIMER555_MODEL.pins
      const vcc = includeNode(pinId(part, pins.vcc.engine))
      const groundNode = includeNode(pinId(part, pins.ground.engine))
      const trigger = includeNode(pinId(part, pins.trigger.engine))
      const output = includeNode(pinId(part, pins.output.engine))
      const reset = includeNode(pinId(part, pins.reset.engine))
      const control = includeNode(pinId(part, pins.control.engine))
      const threshold = includeNode(pinId(part, pins.threshold.engine))
      const discharge = includeNode(pinId(part, pins.discharge.engine))
      const reference = `__mna_timer555_reference:${part.id}`
      const dischargeBase = `__mna_timer555_discharge_base:${part.id}`
      nodes.add(reference); nodes.add(dischargeBase)
      const latchHigh = runtime.timer555Latch![part.id] ?? TIMER555_MODEL.latch.initialHigh
      runtime.timer555Latch![part.id] = latchHigh
      const r = TIMER555_MODEL.ladder.resistorOhms
      branches.push({ part, a: vcc, b: control, family: 'resistor', resistance: r })
      branches.push({ part, a: control, b: reference, family: 'resistor', resistance: r })
      branches.push({ part, a: reference, b: groundNode, family: 'resistor', resistance: r })
      branches.push({ part, a: trigger, b: vcc, family: 'resistor', resistance: TIMER555_MODEL.inputPulls.triggerToVccOhms })
      branches.push({ part, a: threshold, b: groundNode, family: 'resistor', resistance: TIMER555_MODEL.inputPulls.thresholdToGroundOhms })
      branches.push({ part, a: reset, b: vcc, family: 'resistor', resistance: TIMER555_MODEL.inputPulls.resetToVccOhms })
      branches.push({ part, a: vcc, b: output, family: 'resistor', resistance: latchHigh ? TIMER555_MODEL.output.activeResistanceOhms : TIMER555_MODEL.output.inactiveResistanceOhms })
      branches.push({ part, a: output, b: groundNode, family: 'resistor', resistance: latchHigh ? TIMER555_MODEL.output.inactiveResistanceOhms : TIMER555_MODEL.output.activeResistanceOhms })
      branches.push({ part, a: vcc, b: dischargeBase, family: 'resistor', resistance: latchHigh ? TIMER555_MODEL.discharge.pullupOffOhms : TIMER555_MODEL.discharge.pullupOnOhms })
      branches.push({ part, a: dischargeBase, b: groundNode, family: 'resistor', resistance: latchHigh ? TIMER555_MODEL.discharge.baseToGroundOffOhms : TIMER555_MODEL.discharge.baseToGroundOnOhms })
      threeTerminalDevices.push({ part, model: TIMER555_MODEL.transistor.model, terminals: [dischargeBase, groundNode, discharge], family: 'bipolar' })
      timer555Nodes.set(part.id, { vcc, ground: groundNode, trigger, output, reset, control, threshold, discharge, reference })
    } else if (kind === 'timer556') {
      const vcc = includeNode(pinId(part, TIMER556_MODEL.sharedPins.vcc.engine))
      const groundNode = includeNode(pinId(part, TIMER556_MODEL.sharedPins.ground.engine))
      const channelNodes = {} as Timer556Nodes
      for (const channel of ['A', 'B'] as const) {
        const pins = TIMER556_MODEL.channels[channel].pins
        const trigger = includeNode(pinId(part, pins.trigger.engine))
        const output = includeNode(pinId(part, pins.output.engine))
        const reset = includeNode(pinId(part, pins.reset.engine))
        const control = includeNode(pinId(part, pins.control.engine))
        const threshold = includeNode(pinId(part, pins.threshold.engine))
        const discharge = includeNode(pinId(part, pins.discharge.engine))
        const reference = `__mna_timer556_${channel.toLowerCase()}_reference:${part.id}`
        const dischargeBase = `__mna_timer556_${channel.toLowerCase()}_discharge_base:${part.id}`
        nodes.add(reference); nodes.add(dischargeBase)
        const latchHigh = runtime.timer556Latch![part.id]?.[channel] ?? TIMER555_MODEL.latch.initialHigh
        runtime.timer556Latch![part.id] ??= { A: true, B: true }
        const r = TIMER555_MODEL.ladder.resistorOhms
        branches.push({ part, a: vcc, b: control, family: 'resistor', resistance: r })
        branches.push({ part, a: control, b: reference, family: 'resistor', resistance: r })
        branches.push({ part, a: reference, b: groundNode, family: 'resistor', resistance: r })
        branches.push({ part, a: trigger, b: vcc, family: 'resistor', resistance: TIMER555_MODEL.inputPulls.triggerToVccOhms })
        branches.push({ part, a: threshold, b: groundNode, family: 'resistor', resistance: TIMER555_MODEL.inputPulls.thresholdToGroundOhms })
        branches.push({ part, a: reset, b: vcc, family: 'resistor', resistance: TIMER555_MODEL.inputPulls.resetToVccOhms })
        branches.push({ part, a: vcc, b: output, family: 'resistor', resistance: latchHigh ? TIMER555_MODEL.output.activeResistanceOhms : TIMER555_MODEL.output.inactiveResistanceOhms })
        branches.push({ part, a: output, b: groundNode, family: 'resistor', resistance: latchHigh ? TIMER555_MODEL.output.inactiveResistanceOhms : TIMER555_MODEL.output.activeResistanceOhms })
        branches.push({ part, a: vcc, b: dischargeBase, family: 'resistor', resistance: latchHigh ? TIMER555_MODEL.discharge.pullupOffOhms : TIMER555_MODEL.discharge.pullupOnOhms })
        branches.push({ part, a: dischargeBase, b: groundNode, family: 'resistor', resistance: latchHigh ? TIMER555_MODEL.discharge.baseToGroundOffOhms : TIMER555_MODEL.discharge.baseToGroundOnOhms })
        threeTerminalDevices.push({ part, model: TIMER555_MODEL.transistor.model, terminals: [dischargeBase, groundNode, discharge], family: 'bipolar' })
        channelNodes[channel] = { vcc, ground: groundNode, trigger, output, reset, control, threshold, discharge, reference }
      }
      timer556Nodes.set(part.id, channelNodes)
    } else if (kind === 'resistor') {
      const resistance = resistorOhms(part)
      if (!(resistance > 0)) {
        diagnostics.push(`${part.label}: a resistência precisa ser maior que zero.`)
        continue
      }
      const a = includeNode(pinId(part, 'A')), b = includeNode(pinId(part, 'B'))
      branches.push({ part, a, b, family: 'resistor' })
    } else if (kind === 'variableResistor') {
      const resistance = variableSensorResistance(String(part.properties?.simulationModel ?? ''), part.properties ?? {})
      if (resistance === undefined || !(resistance > 0) || !Number.isFinite(resistance)) {
        diagnostics.push(`${part.label}: os controles do sensor produziram uma resistência inválida.`)
        continue
      }
      const a = includeNode(pinId(part, 'A')), b = includeNode(pinId(part, 'B'))
      branches.push({ part, a, b, family: 'resistor', resistance })
      variableResistances.set(part.id, resistance)
    } else if (kind === 'keypad') {
      const hasRuntimePushed = Object.prototype.hasOwnProperty.call(runtime.keypadPushed ?? {}, part.id)
      const pushedValue = hasRuntimePushed ? runtime.keypadPushed?.[part.id] : part.properties?.pushed
      const model = getKeypadModel(pushedValue as KeypadPushedInput)
      for (const terminal of [...KEYPAD_4X4_MODEL.rows, ...KEYPAD_4X4_MODEL.columns]) includeNode(pinId(part, terminal))
      if (!model) {
        diagnostics.push(`${part.label}: o keypad aceita uma única tecla por vez, identificada por linha e coluna.`)
        continue
      }
      const internal = `__mna_keypad_internal:${part.id}`
      nodes.add(internal)
      for (const contact of model.contacts) {
        const terminal = includeNode(pinId(part, contact.terminal))
        branches.push({ part, a: terminal, b: internal, family: 'resistor', resistance: contact.resistanceOhms })
      }
    } else if (kind === 'sevenSegment') {
      const topology = createSevenSegmentTopology(part.properties?.[SEVEN_SEGMENT_MODEL.control.property])
      const commonNode = includeNode(pinId(part, 'common'))
      for (const channel of topology.channels) {
        const external = includeNode(pinId(part, channel.segment))
        const anodeId = `__mna_seven_segment_anode:${part.id}:${channel.segment}`
        const cathodeId = `__mna_seven_segment_cathode:${part.id}:${channel.segment}`
        const anode = includeNode(anodeId)
        const cathode = includeNode(cathodeId)
        branches.push({ part, a: anode, b: cathode, family: 'solarDiode', saturationCurrent: channel.diode.saturationCurrentA, thermalVoltage: SEVEN_SEGMENT_MODEL.diode.thermalVoltageReferenceAt25CV * channel.diode.idealityFactor })
        for (const resistor of channel.resistors) {
          const resolveNode = (name: string) => sets.find(name === topology.commonNode ? commonNode : name === channel.segment ? external : name === channel.diode.anode ? anode : name === channel.diode.cathode ? cathode : name)
          branches.push({ part, a: resolveNode(resistor.from), b: resolveNode(resistor.to), family: 'resistor', resistance: resistor.resistanceOhms })
        }
      }
    } else if (kind === 'rgbLed') {
      const pinout = part.properties?.pinout
      const directions = initialRgbLedPinDirections(pinout)
      const common = `__mna_rgb_led_common:${part.id}`
      nodes.add(common)
      for (const terminal of Object.keys(RGB_LED_MODEL.terminals) as RgbLedTerminal[]) {
        const external = includeNode(pinId(part, RGB_LED_MODEL.terminals[terminal].breadboard))
        branches.push({
          part, a: external, b: common, family: 'solarDiode',
          saturationCurrent: RGB_LED_MODEL.diode.saturationCurrentA,
          thermalVoltage: RGB_LED_MODEL.diode.thermalVoltageV,
        })
        branches.push({
          part, a: external, b: common, family: 'resistor',
          resistance: rgbLedShuntResistanceOhms(directions[terminal]),
        })
      }
    } else if (kind === 'led' || kind === 'diode') {
      const isLed = kind === 'led'
      const descriptor = getTwoPinDiodeDescriptor(isLed ? 'led' : 'diode', part.properties?.color)
      const a = includeNode(pinId(part, descriptor.terminals.anode))
      const cathode = includeNode(pinId(part, descriptor.terminals.cathode))
      let diodeAnode = a
      if (descriptor.seriesResistanceOhms > 0) {
        diodeAnode = `__mna_two_pin_led:${part.id}`
        nodes.add(diodeAnode)
        branches.push({ part, a, b: diodeAnode, family: 'resistor', resistance: descriptor.seriesResistanceOhms })
      }
      branches.push({
        part, a: diodeAnode, b: cathode, family: 'solarDiode',
        saturationCurrent: descriptor.saturationCurrentA,
        thermalVoltage: descriptor.thermalVoltageV,
        maximumExponent: descriptor.maximumExponent,
        minimumConductance: 1e-12,
      })
    } else if (kind === 'button') {
      includeNode(pinId(part, 'A1')); includeNode(pinId(part, 'B1'))
    } else if (kind === 'switch') {
      const terminal1 = includeNode(pinId(part, '1'))
      const terminal2 = includeNode(pinId(part, '2'))
      const common = includeNode(pinId(part, '3'))
      const selected = modelSwitchOn(part, 'Switch') ? terminal2 : terminal1
      const unselected = selected === terminal1 ? terminal2 : terminal1
      branches.push({ part, a: selected, b: common, family: 'switch', resistance: 1e-6 })
      branches.push({ part, a: unselected, b: common, family: 'switch', resistance: 1e10 })
    } else if (kind === 'potentiometer') {
      const resistance = potentiometerOhms(part)
      if (!(resistance > 0)) {
        diagnostics.push(`${part.label}: a resistência do potenciômetro precisa ser maior que zero.`)
        continue
      }
      const position = potentiometerPosition(part)
      const terminal1 = includeNode(pinId(part, 'TERMINAL1'))
      const terminal2 = includeNode(pinId(part, 'TERMINAL2'))
      const wiper = includeNode(pinId(part, 'WIPER'))
      branches.push({ part, a: terminal1, b: wiper, family: 'resistor', resistance: resistance * position + 0.5 })
      branches.push({ part, a: terminal2, b: wiper, family: 'resistor', resistance: resistance * (1 - position) + 0.5 })
    } else if (kind === 'dipSwitch') {
      const model = String(part.properties?.simulationModel ?? '')
      const count = model === 'dip_switch_spdt' ? 2 : model === 'dip_switch_4' ? 4 : 6
      for (let index = 1; index <= count; index++) {
        const on = modelSwitchOn(part, model === 'dip_switch_spdt' ? 'Switch' : `Switch${index}`)
        const a = includeNode(pinId(part, `${index}A`)), b = includeNode(pinId(part, `${index}B`))
        branches.push({ part, a, b, family: 'switch', resistance: on ? 1e-6 : 1e10 })
      }
    } else if (kind === 'capacitor' || kind === 'polarizedCapacitor') {
      const model = String(part.properties?.simulationModel ?? '')
      const descriptor = getPassiveComponentModel(model, part.properties ?? {})
      const farads = descriptor && descriptor.kind !== 'inductor' ? descriptor.capacitanceF : capacitanceFarads(part)
      if (!(farads > 0)) {
        diagnostics.push(`${part.label}: a capacitância precisa ser maior que zero.`)
        continue
      }
      const a = includeNode(pinId(part, 'A'))
      const b = includeNode(pinId(part, 'B'))
      const seriesResistanceOhms = descriptor && descriptor.kind !== 'inductor' ? descriptor.seriesResistanceOhms : 0
      const capacitorA = seriesResistanceOhms > 0 ? `__mna_capacitor:${part.id}` : a
      if (seriesResistanceOhms > 0) {
        nodes.add(capacitorA)
        branches.push({ part, a, b: capacitorA, family: 'resistor', resistance: seriesResistanceOhms })
      }
      capacitors.push({ part, a, capacitorA, b, farads, seriesResistanceOhms })
    } else if (kind === 'inductor') {
      const descriptor = getPassiveComponentModel(String(part.properties?.simulationModel ?? ''), part.properties ?? {})
      const henries = descriptor?.kind === 'inductor' ? descriptor.inductanceH : inductanceHenries(part)
      if (!(henries > 0)) {
        diagnostics.push(`${part.label}: a indutância precisa ser maior que zero.`)
        continue
      }
      const a = includeNode(pinId(part, 'Terminal 1')), b = includeNode(pinId(part, 'Terminal 2'))
      inductors.push({ part, a, b, henries })
      // In DC, an ideal inductor is a zero-volt branch. During transients it uses its companion model.
      if (dt <= 0) sources.push({ part, a, b, voltage: 0 })
    } else if (kind === 'npn' || kind === 'pnp') {
      const model = String(part.properties?.simulationModel ?? '')
      const base = includeNode(pinId(part, 'B'))
      const emitter = includeNode(pinId(part, 'E'))
      const collector = includeNode(pinId(part, 'C'))
      threeTerminalDevices.push({ part, model, terminals: [base, emitter, collector], family: 'bipolar' })
    } else if (kind === 'tip120') {
      const base = includeNode(pinId(part, 'B'))
      const emitter = includeNode(pinId(part, 'E'))
      const collector = includeNode(pinId(part, 'C'))
      const internalBase = `__mna_tip120_base:${part.id}`
      nodes.add(internalBase)
      threeTerminalDevices.push({ part, model: 'npn', terminals: [base, internalBase, collector], family: 'bipolar' })
      threeTerminalDevices.push({ part, model: 'npn', terminals: [internalBase, emitter, collector], family: 'bipolar' })
      branches.push({ part, a: base, b: internalBase, family: 'resistor', resistance: 8000 })
      branches.push({ part, a: internalBase, b: emitter, family: 'resistor', resistance: 120 })
      const diodeThermalVoltage = 0.0258
      const diodeCriticalVoltage = diodeThermalVoltage * Math.log((1e4 + 1e-12) / 1e-12)
      const diodeConductance = 1e4 / diodeThermalVoltage
      branches.push({ part, a: emitter, b: collector, family: 'solarDiode', saturationCurrent: 1e-12, thermalVoltage: diodeThermalVoltage, linearContinuation: { voltage: diodeCriticalVoltage, conductance: diodeConductance, intercept: 1e4 - diodeConductance * diodeCriticalVoltage } })
    } else if (kind === 'regulator') {
      const model = String(part.properties?.simulationModel ?? '')
      const input = includeNode(pinId(part, 'IN'))
      const groundNode = includeNode(pinId(part, 'GND'))
      const output = includeNode(pinId(part, 'OUT'))
      threeTerminalDevices.push({ part, model, terminals: [input, groundNode, output], family: 'regulator' })
    } else if (kind === 'mosfet') {
      const model = String(part.properties?.simulationModel ?? '')
      const gate = includeNode(pinId(part, 'GATE'))
      const source = includeNode(pinId(part, 'SOURCE'))
      const drain = includeNode(pinId(part, 'DRAIN'))
      threeTerminalDevices.push({ part, model, terminals: [gate, source, drain], family: 'mosfet' })
    } else if (kind === 'opAmp') {
      const inputPlus = includeNode(pinId(part, 'IN_PLUS'))
      const inputMinus = includeNode(pinId(part, 'IN_MINUS'))
      const positiveSupply = includeNode(pinId(part, 'VCC'))
      const negativeSupply = includeNode(pinId(part, 'GND'))
      const output = includeNode(pinId(part, 'OUT'))
      opAmps.push({ part, terminals: [inputPlus, inputMinus, positiveSupply, negativeSupply, output] })
    } else if (kind === 'photodiode' || kind === 'phototransistor') {
      const modelId = String(part.properties?.simulationModel ?? '')
      const descriptor = getPhotodetectorModel(modelId, part.properties ?? {})
      if (!descriptor) continue
      photodetectors.set(part.id, descriptor)
      if (descriptor.kind === 'photodiode') {
        const anode = includeNode(pinId(part, descriptor.terminals.anode))
        const cathode = includeNode(pinId(part, descriptor.terminals.cathode))
        photodiodeNodes.set(part.id, { anode, cathode })
        for (const element of descriptor.elements) {
          if (element.type === 'diode') branches.push({ part, a: anode, b: cathode, family: 'solarDiode', saturationCurrent: element.saturationCurrentA, thermalVoltage: 0.0258 * element.idealityFactor })
          else if (element.type === 'resistor') branches.push({ part, a: anode, b: cathode, family: 'resistor', resistance: element.resistanceOhms })
        }
        // The extracted argument order is anode,cathode; its positive source current enters the anode.
        currentSources.push({ part, a: cathode, b: anode, current: descriptor.currentSource.currentA })
      } else {
        const emitter = includeNode(pinId(part, descriptor.terminals.emitter))
        const collector = includeNode(pinId(part, descriptor.terminals.collector))
        const base = `__mna_phototransistor_base:${part.id}`
        nodes.add(base)
        phototransistorNodes.set(part.id, { base, emitter, collector })
        threeTerminalDevices.push({ part, model: 'npn', terminals: [base, emitter, collector], family: 'bipolar' })
        // A tiny internal base-emitter conductance keeps the dark-state base from floating numerically.
        branches.push({ part, a: base, b: emitter, family: 'resistor', resistance: 1e12 })
        // The generated photocurrent injects charge into the NPN base; currentSources use a→b as the conventional current direction.
        currentSources.push({ part, a: emitter, b: base, current: descriptor.currentSource.currentA })
      }
    } else if (kind === 'relay') {
      const modelId = String(part.properties?.simulationModel ?? '') as keyof typeof RELAY_MODELS
      const model = RELAY_MODELS[modelId]
      if (!model) continue
      const coil1 = includeNode(pinId(part, model.coil.terminals[0]))
      const coil2 = includeNode(pinId(part, model.coil.terminals[1]))
      branches.push({ part, a: coil1, b: coil2, family: 'resistor', resistance: model.coil.resistanceOhms })
      const state: RelayState = runtime.relayStates[part.id] ? 'energized' : 'deenergized'
      const contacts: RelayContactNodes[] = []
      for (const pole of model.poles) for (const contact of pole.contacts) {
        const common = includeNode(pinId(part, contact.commonTerminal))
        const throwNode = includeNode(pinId(part, contact.throwTerminal))
        branches.push({ part, a: common, b: throwNode, family: 'switch', resistance: getRelayContactResistanceOhms(contact, state) })
        contacts.push({ pole: pole.name, model: contact, common, throw: throwNode })
      }
      relays.push({ part, model, coil1, coil2, contacts })
    } else if (kind === 'comparator') {
      const modelId = String(part.properties?.simulationModel ?? '')
      const model = getComparatorModel(modelId)
      if (!model) continue
      const supplyPositive = includeNode(pinId(part, model.supplyPositiveTerminal))
      const supplyNegative = includeNode(pinId(part, model.supplyNegativeTerminal))
      branches.push({ part, a: supplyPositive, b: supplyNegative, family: 'resistor', resistance: model.supplyLoadResistanceOhms })
      const channels = model.channelNumbers.map(channel => {
        const positive = includeNode(pinId(part, model.inputPositiveTerminal(channel)))
        const negative = includeNode(pinId(part, model.inputNegativeTerminal(channel)))
        const output = includeNode(pinId(part, model.outputTerminal(channel)))
        const base = `__mna_comparator_base:${part.id}:${channel}`
        const collector = `__mna_comparator_collector:${part.id}:${channel}`
        nodes.add(base); nodes.add(collector)
        branches.push({ part, a: positive, b: supplyPositive, family: 'resistor', resistance: model.inputLeakResistanceOhms })
        branches.push({ part, a: negative, b: supplyPositive, family: 'resistor', resistance: model.inputLeakResistanceOhms })
        branches.push({ part, a: base, b: supplyNegative, family: 'resistor', resistance: model.outputArchitecture.baseToGroundResistanceOhms })
        branches.push({ part, a: output, b: collector, family: 'resistor', resistance: model.outputArchitecture.outputSeriesResistanceOhms })
        threeTerminalDevices.push({ part, model: 'npn', terminals: [base, supplyNegative, collector], family: 'bipolar' })
        return { channel, positive, negative, output, base, collector }
      })
      comparators.push({ part, model: modelId, supplyPositive, supplyNegative, channels })
    } else if (kind === 'zenerDiode') {
      const model = getZenerDiodeModel(part.properties ?? {})
      const anode = includeNode(pinId(part, 'A'))
      const cathode = includeNode(pinId(part, 'C'))
      const reverseNode = `__mna_zener_reverse:${part.id}`
      const sourceNode = `__mna_zener_source:${part.id}`
      nodes.add(reverseNode)
      nodes.add(sourceNode)
      const thermalVoltage = 0.0258 * model.forwardDiode.idealityFactor
      branches.push({ part, a: anode, b: cathode, family: 'solarDiode', saturationCurrent: model.forwardDiode.saturationCurrentA, thermalVoltage })
      branches.push({ part, a: cathode, b: sourceNode, family: 'resistor', resistance: model.reverseBranch.source.resistanceOhms })
      sources.push({ part, a: sourceNode, b: reverseNode, voltage: model.reverseBranch.source.voltageV })
      branches.push({ part, a: reverseNode, b: anode, family: 'solarDiode', saturationCurrent: model.reverseBranch.diode.saturationCurrentA, thermalVoltage })
    } else if (kind === 'generator') {
      const output = includeNode(pinId(part, 'OUT'))
      const groundNode = includeNode(pinId(part, 'GND'))
      const internal = `__mna_function_generator:${part.id}`
      const resistance = functionGeneratorOutputResistanceOhms()
      nodes.add(internal)
      branches.push({ part, a: internal, b: output, family: 'resistor', resistance })
      sources.push({ part, a: internal, b: groundNode, voltage: functionGeneratorVoltageAtTime(part.properties ?? {}, simulationTimeSeconds) })
      generatorOutputs.set(part.id, { internal, positive: output, resistance })
    } else if (kind === 'tempSensor') {
      const model = getSensorSourceModel('TMP36', part.properties ?? {})
      if (!model || model.kind !== 'thevenin') continue
      const output = includeNode(pinId(part, 'Vout'))
      const groundNode = includeNode(pinId(part, 'Gnd'))
      const power = includeNode(pinId(part, 'Vcc'))
      const internal = `__mna_tmp36_source:${part.id}`
      nodes.add(internal)
      branches.push({ part, a: output, b: internal, family: 'resistor', resistance: model.internalResistance })
      branches.push({ part, a: power, b: groundNode, family: 'resistor', resistance: model.supplyResistance })
      sources.push({
        part, a: internal, b: groundNode, voltage: model.voltage,
        enabledAboveVoltage: { positive: power, negative: groundNode, minimum: model.minimumSupplyVoltage },
      })
    } else if (kind === 'solarCell') {
      const model = getSensorSourceModel('solarCell', part.properties ?? {})
      if (!model || model.kind !== 'norton') continue
      const positive = includeNode(pinId(part, model.terminals.positive))
      const negative = includeNode(pinId(part, model.terminals.negative))
      const internal = `__mna_solar_internal:${part.id}`
      nodes.add(internal)
      for (const element of model.elements) {
        if (element.type === 'resistor') {
          const a = element.a === 'internal' ? internal : element.a === 'Positive' ? positive : negative
          const b = element.b === 'internal' ? internal : element.b === 'Positive' ? positive : negative
          branches.push({ part, a, b, family: 'resistor', resistance: element.resistanceOhms })
        } else {
          const a = element.anode === 'internal' ? internal : negative
          const b = element.cathode === 'internal' ? internal : negative
          branches.push({ part, a, b, family: 'solarDiode', saturationCurrent: element.saturationCurrentA, thermalVoltage: element.thermalVoltageV, photovoltaicStartup: true })
          branches.push({ part, a, b, family: 'resistor', resistance: element.parallelLeakageResistanceOhms })
        }
      }
      const sourceFrom = model.currentSource.from === 'Negative' ? negative : positive
      const sourceTo = model.currentSource.to === 'internal' ? internal : positive
      currentSources.push({ part, a: sourceFrom, b: sourceTo, current: model.currentSource.currentA })
      solarOutputs.set(part.id, { internal, positive, resistance: 4 })
    } else if (kind === 'usbSource') {
      const positive = includeNode(pinId(part, USB_STANDARD_MODEL.terminals.power.engine))
      const negative = includeNode(pinId(part, USB_STANDARD_MODEL.terminals.ground.engine))
      const internal = `__mna_usb_source:${part.id}`
      nodes.add(internal)
      branches.push({ part, a: internal, b: positive, family: 'resistor', resistance: USB_STANDARD_MODEL.internalResistanceOhms })
      sources.push({ part, a: internal, b: negative, voltage: USB_STANDARD_MODEL.outputVoltageV })
    } else if (kind === 'supply') {
      const a = includeNode(pinId(part, 'PLUS')), b = includeNode(pinId(part, 'MINUS'))
      if (!batteryOutputDisabled(part)) {
        const resistance = sourceResistance(part)
        if (resistance < 0) {
          diagnostics.push(`${part.label}: a resistência interna da fonte não pode ser negativa.`)
          continue
        }
        let sourcePositive = a
        if (resistance > 0) {
          sourcePositive = `__mna_source_positive:${part.id}`
          nodes.add(sourcePositive)
          branches.push({ part, a, b: sourcePositive, family: 'resistor', resistance })
        }
        sources.push({ part, a: sourcePositive, b, voltage: sourceVolts(part) })
      }
      if (hasBatteryParasiticCapacitor(part)) capacitors.push({ part, a, capacitorA: a, b, farads: 25e-6, seriesResistanceOhms: 0 })
    } else if (kind === 'vcc') {
      const a = includeNode(pinId(part, 'OUT')), b = sets.find(ground)
      nodes.add(b)
      sources.push({ part, a, b, voltage: sourceVolts(part) })
    }
  }

  // Give each isolated floating subcircuit a harmless zero reference. Prefer a supply's negative terminal.
  const adjacency = new Map<string, Set<string>>()
  const connectGraph = (a: string, b: string) => {
    adjacency.set(a, adjacency.get(a) ?? new Set())
    adjacency.set(b, adjacency.get(b) ?? new Set())
    adjacency.get(a)!.add(b); adjacency.get(b)!.add(a)
  }
  for (const branch of branches) connectGraph(branch.a, branch.b)
  for (const source of sources) connectGraph(source.a, source.b)
  for (const source of currentSources) connectGraph(source.a, source.b)
  for (const device of threeTerminalDevices) {
    connectGraph(device.terminals[0], device.terminals[1])
    connectGraph(device.terminals[1], device.terminals[2])
  }
  for (const device of opAmps) for (let index = 1; index < device.terminals.length; index++) connectGraph(device.terminals[0], device.terminals[index])
  for (const comparator of comparators) {
    connectGraph(comparator.supplyPositive, comparator.supplyNegative)
    for (const channel of comparator.channels) {
      connectGraph(channel.positive, comparator.supplyPositive)
      connectGraph(channel.negative, comparator.supplyPositive)
      connectGraph(channel.output, channel.collector)
      connectGraph(channel.base, comparator.supplyNegative)
    }
  }
  if (dt > 0) {
    for (const capacitor of capacitors) connectGraph(capacitor.capacitorA, capacitor.b)
    for (const inductor of inductors) connectGraph(inductor.a, inductor.b)
  }
  for (const node of nodes) adjacency.set(node, adjacency.get(node) ?? new Set())
  const anchors = new Set<string>([sets.find(ground)])
  const visited = new Set<string>()
  for (const start of adjacency.keys()) {
    if (visited.has(start)) continue
    const component: string[] = [], pending = [start]
    visited.add(start)
    while (pending.length) {
      const node = pending.pop()!
      component.push(node)
      for (const adjacent of adjacency.get(node) ?? []) if (!visited.has(adjacent)) { visited.add(adjacent); pending.push(adjacent) }
    }
    if (component.some(node => anchors.has(node))) continue
    const preferred = sources.find(source => component.includes(source.b))?.b
      ?? currentSources.find(source => component.includes(source.a))?.a
    anchors.add(preferred ?? component[0])
  }

  const allNodes = [...adjacency.keys()].filter(node => !anchors.has(node)).sort()
  const nodeIndex = new Map(allNodes.map((node, index) => [node, index]))
  const sourceIndex = new Map(sources.map((source, index) => [source.part.id, allNodes.length + index]))
  const matrixSize = allNodes.length + sources.length
  let previous = Array(matrixSize).fill(0) as number[]
  let comparatorStampedStates = new Map<string, boolean>()
  let converged = diagnostics.length === 0
  let solution = previous

  const indexOf = (node: string) => nodeIndex.get(sets.find(node))
  const stampConductance = (matrix: number[][], a: string, b: string, conductance: number) => {
    const ai = indexOf(a), bi = indexOf(b)
    if (ai !== undefined) matrix[ai][ai] += conductance
    if (bi !== undefined) matrix[bi][bi] += conductance
    if (ai !== undefined && bi !== undefined) { matrix[ai][bi] -= conductance; matrix[bi][ai] -= conductance }
  }
  const voltage = (values: number[], node: string) => { const index = indexOf(node); return index === undefined ? 0 : values[index] }
  const solarDiodeCurrentAt = (branch: Branch, branchVoltage: number) => {
    const saturationCurrent = Math.max(branch.saturationCurrent ?? 1e-12, Number.MIN_VALUE)
    const thermalVoltage = Math.max(branch.thermalVoltage ?? 0.0258, Number.MIN_VALUE)
    const continuation = branch.linearContinuation
    if (continuation && branchVoltage >= continuation.voltage) return continuation.conductance * branchVoltage + continuation.intercept
    const minimumVoltage = -50 * thermalVoltage
    const maximumVoltage = (branch.maximumExponent ?? 40) * thermalVoltage
    const boundedVoltage = Math.max(minimumVoltage, Math.min(maximumVoltage, branchVoltage))
    const exponential = Math.exp(boundedVoltage / thermalVoltage)
    const current = saturationCurrent * (exponential - 1)
    if (branchVoltage === boundedVoltage) return current
    const conductance = Math.max(saturationCurrent * exponential / thermalVoltage, branch.minimumConductance ?? ledLeakageConductance)
    return current + conductance * (branchVoltage - boundedVoltage)
  }
  const addNonlinearDeviceCorrection = (
    corrections: number[], nodesForDevice: readonly string[], previousValues: readonly number[], nextValues: readonly number[],
    previousCurrents: readonly number[], previousJacobian: readonly (readonly number[])[], nextCurrents: readonly number[],
  ) => {
    const indices = nodesForDevice.map(indexOf)
    for (let row = 0; row < indices.length; row++) {
      const rowIndex = indices[row]
      if (rowIndex === undefined) continue
      let tangentCurrent = previousCurrents[row]
      for (let column = 0; column < indices.length; column++) tangentCurrent += previousJacobian[row][column] * (nextValues[column] - previousValues[column])
      corrections[rowIndex] += nextCurrents[row] - tangentCurrent
    }
  }
  // Seed the eight extracted LED dies near their expected operating point.
  // Unconnected segment pins only see the 10 GΩ leakage paths (~0.5 nA at 5 V),
  // whose forward drop is about 0.93 V; starting all diode nodes at 0 V makes
  // the first Newton step place those floating pins across a multi-volt jump.
  for (const source of sources) {
    const ai = indexOf(source.a)
    if (ai !== undefined) previous[ai] = voltage(previous, source.b) + source.voltage
  }
  for (const display of project.parts.filter(part => family(part) === 'sevenSegment')) {
    const commonNode = sets.find(canonicalEndpoint(pinId(display, 'common'), parts))
    let commonVoltage = voltage(previous, commonNode)
    for (const sourcePart of project.parts) {
      const sourceKind = family(sourcePart)
      const positivePin = sourceKind === 'vcc' ? 'OUT' : sourceKind === 'supply' ? 'PLUS' : undefined
      const negativePin = sourceKind === 'supply' ? 'MINUS' : sourceKind === 'gnd' ? 'OUT' : undefined
      if (positivePin && sets.find(canonicalEndpoint(pinId(sourcePart, positivePin), parts)) === commonNode) commonVoltage = sourceVolts(sourcePart)
      if (negativePin && sets.find(canonicalEndpoint(pinId(sourcePart, negativePin), parts)) === commonNode) commonVoltage = 0
    }
    const anodeMode = resolveSevenSegmentCommonType(display.properties?.[SEVEN_SEGMENT_MODEL.control.property]) === 'anode'
    const seededCanonicalNodes = new Set<number>()
    const commonIndex = indexOf(commonNode)
    if (commonIndex !== undefined) {
      previous[commonIndex] = commonVoltage
      seededCanonicalNodes.add(commonIndex)
    }
    for (const segment of SEVEN_SEGMENT_MODEL.segments) {
      const external = sets.find(canonicalEndpoint(pinId(display, segment), parts))
      const externalIndex = indexOf(external)
      if (externalIndex === undefined || seededCanonicalNodes.has(externalIndex)) continue
      const connected = project.wires.some(wire =>
        sets.find(canonicalEndpoint(wire.from, parts)) === external || sets.find(canonicalEndpoint(wire.to, parts)) === external,
      )
      const thermalVoltage = SEVEN_SEGMENT_MODEL.diode.thermalVoltageReferenceAt25CV * SEVEN_SEGMENT_MODEL.diode.idealityFactor
      const initialDiodeVoltage = thermalVoltage * Math.log1p((connected ? 0.005 : 0.5e-9) / SEVEN_SEGMENT_MODEL.diode.saturationCurrentA)
      // The 1µΩ active branches have already joined these diode pins to their
      // canonical common/segment nodes. Seed each canonical node once so a
      // later channel cannot overwrite a guess made through another alias.
      previous[externalIndex] = commonVoltage + (anodeMode ? -initialDiodeVoltage : initialDiodeVoltage)
      seededCanonicalNodes.add(externalIndex)
    }
  }
  // Start a photovoltaic diode near the expected open-circuit voltage. Starting
  // its exponential model at 0 V makes the first Newton step unrealistically large.
  for (const branch of branches) {
    if (branch.family !== 'solarDiode' || !branch.photovoltaicStartup) continue
    const ai = indexOf(branch.a), bi = indexOf(branch.b)
    if (ai === undefined) continue
    const injected = currentSources.filter(source => sets.find(source.b) === sets.find(branch.a)).reduce((sum, source) => sum + source.current, 0)
    const saturation = Math.max(branch.saturationCurrent ?? 1e-12, Number.MIN_VALUE)
    const thermal = Math.max(branch.thermalVoltage ?? 0.0258, Number.MIN_VALUE)
    previous[ai] = (bi === undefined ? 0 : previous[bi]) + thermal * Math.log1p(Math.max(0, injected) / saturation)
  }

  if (converged) {
    converged = false
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const matrix = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(0) as number[])
      const rhs = Array(matrixSize).fill(0) as number[]
      for (const branch of branches) {
        if (branch.family === 'resistor' || branch.family === 'switch') stampConductance(matrix, branch.a, branch.b, 1 / (branch.resistance ?? resistorOhms(branch.part)))
        else if (branch.family === 'solarDiode') {
          const saturationCurrent = Math.max(branch.saturationCurrent ?? 1e-12, Number.MIN_VALUE)
          const thermalVoltage = Math.max(branch.thermalVoltage ?? 0.0258, Number.MIN_VALUE)
          const rawVoltage = voltage(previous, branch.a) - voltage(previous, branch.b)
          const continuation = branch.linearContinuation
          const continued = continuation && rawVoltage >= continuation.voltage
          const maximumExponent = branch.maximumExponent ?? 40
          const limitedVoltage = Math.max(-50 * thermalVoltage, Math.min(maximumExponent * thermalVoltage, rawVoltage))
          const exponential = Math.exp(limitedVoltage / thermalVoltage)
          const diodeCurrent = continued
            ? continuation.conductance * rawVoltage + continuation.intercept
            : saturationCurrent * (exponential - 1)
          const conductance = continued
            ? continuation.conductance
            : Math.max(saturationCurrent * exponential / thermalVoltage, branch.minimumConductance ?? ledLeakageConductance)
          const equivalentVoltage = continued ? rawVoltage : limitedVoltage
          const equivalentCurrent = diodeCurrent - conductance * equivalentVoltage
          stampConductance(matrix, branch.a, branch.b, conductance)
          const ai = indexOf(branch.a), bi = indexOf(branch.b)
          if (ai !== undefined) rhs[ai] -= equivalentCurrent
          if (bi !== undefined) rhs[bi] += equivalentCurrent
        }
      }
      for (const device of threeTerminalDevices) {
        const values = device.terminals.map(node => voltage(previous, node)) as [number, number, number]
        const evaluated = device.family === 'bipolar'
          ? evaluateBipolarTransistor(device.model, values)
          : device.family === 'mosfet'
            ? evaluateMOSFET(device.model, values)
            : evaluateVoltageRegulator(device.model, values)
        if (!evaluated) continue
        const indices = device.terminals.map(indexOf)
        for (let row = 0; row < 3; row++) {
          const rowIndex = indices[row]
          if (rowIndex === undefined) continue
          let equivalentCurrent = -evaluated.currents[row]
          for (let column = 0; column < 3; column++) {
            const conductance = evaluated.jacobian[row][column]
            if (conductance === 0) continue
            const columnIndex = indices[column]
            if (columnIndex !== undefined) {
              matrix[rowIndex][columnIndex] += conductance
              equivalentCurrent += conductance * values[column]
            }
          }
          rhs[rowIndex] += equivalentCurrent
        }
      }
      comparatorStampedStates = new Map()
      for (const comparator of comparators) {
        const supplyPositive = voltage(previous, comparator.supplyPositive)
        const supplyNegative = voltage(previous, comparator.supplyNegative)
        for (const channel of comparator.channels) {
          const triggerHigh = evaluateComparatorTrigger(voltage(previous, channel.positive), voltage(previous, channel.negative), supplyPositive, supplyNegative)
          const resistance = getComparatorOutputBasePullupResistanceOhms(comparator.model, triggerHigh)!
          stampConductance(matrix, comparator.supplyPositive, channel.base, 1 / resistance)
          comparatorStampedStates.set(`${comparator.part.id}:${channel.channel}`, triggerHigh)
        }
      }
      for (const device of opAmps) {
        const values = device.terminals.map(node => voltage(previous, node)) as [number, number, number, number, number]
        const evaluated = evaluateUA741(values)
        const indices = device.terminals.map(indexOf)
        for (let row = 0; row < 5; row++) {
          const rowIndex = indices[row]
          if (rowIndex === undefined) continue
          let equivalentCurrent = -evaluated.currents[row]
          for (let column = 0; column < 5; column++) {
            const conductance = evaluated.jacobian[row][column]
            if (!conductance) continue
            const columnIndex = indices[column]
            if (columnIndex !== undefined) {
              matrix[rowIndex][columnIndex] += conductance
              equivalentCurrent += conductance * values[column]
            }
          }
          rhs[rowIndex] += equivalentCurrent
        }
      }
      for (const capacitor of capacitors) {
        if (dt <= 0) continue // In a DC operating point, an ideal capacitor is an open circuit.
        const previousCurrent = runtime.capacitorCurrents[capacitor.part.id]
        const hasHistory = previousCurrent !== undefined
        const conductance = (hasHistory ? 2 : 1) * capacitor.farads / dt
        const historyVoltage = runtime.capacitorVoltages[capacitor.part.id] ?? propertyNumber(capacitor.part, 'initialVoltage', 0)
        const historyCurrent = hasHistory ? previousCurrent : 0
        stampConductance(matrix, capacitor.capacitorA, capacitor.b, conductance)
        const ai = indexOf(capacitor.capacitorA), bi = indexOf(capacitor.b)
        if (ai !== undefined) rhs[ai] += conductance * historyVoltage + historyCurrent
        if (bi !== undefined) rhs[bi] -= conductance * historyVoltage + historyCurrent
      }
      for (const inductor of inductors) {
        if (dt <= 0) continue
        const previousVoltage = runtime.inductorVoltages[inductor.part.id]
        const hasHistory = previousVoltage !== undefined
        const conductance = (hasHistory ? 0.5 : 1) * dt / inductor.henries
        const historyCurrent = runtime.inductorCurrents[inductor.part.id] ?? propertyNumber(inductor.part, 'initialCurrent', 0)
        const companionHistoryCurrent = historyCurrent + (hasHistory ? conductance * previousVoltage : 0)
        stampConductance(matrix, inductor.a, inductor.b, conductance)
        const ai = indexOf(inductor.a), bi = indexOf(inductor.b)
        if (ai !== undefined) rhs[ai] -= companionHistoryCurrent
        if (bi !== undefined) rhs[bi] += companionHistoryCurrent
      }
      for (const source of sources) {
        const row = sourceIndex.get(source.part.id)!
        const ai = indexOf(source.a), bi = indexOf(source.b)
        if (ai !== undefined) { matrix[ai][row] += 1; matrix[row][ai] += 1 }
        if (bi !== undefined) { matrix[bi][row] -= 1; matrix[row][bi] -= 1 }
        const enabled = !source.enabledAboveVoltage || voltage(previous, source.enabledAboveVoltage.positive) - voltage(previous, source.enabledAboveVoltage.negative) > source.enabledAboveVoltage.minimum
        rhs[row] = enabled ? source.voltage : 0
      }
      for (const source of currentSources) {
        const ai = indexOf(source.a), bi = indexOf(source.b)
        if (ai !== undefined) rhs[ai] -= source.current
        if (bi !== undefined) rhs[bi] += source.current
      }
      const next = solveLinearSystem(matrix, rhs)
      if (!next) {
        diagnostics.push('Não foi possível resolver o ponto DC. Verifique fontes em curto ou conexões incompatíveis.')
        break
      }
      let delta = 0
      for (let index = 0; index < next.length; index++) {
        const change = Math.abs(next[index] - previous[index])
        if (change > delta) delta = change
      }
      const nonlinearCurrentCorrections = Array(matrixSize).fill(0) as number[]
      for (const branch of branches) {
        if (branch.family !== 'solarDiode') continue
        const previousBranchVoltage = voltage(previous, branch.a) - voltage(previous, branch.b)
        const nextBranchVoltage = voltage(next, branch.a) - voltage(next, branch.b)
        const continuation = branch.linearContinuation
        const continued = continuation && previousBranchVoltage >= continuation.voltage
        const saturationCurrent = Math.max(branch.saturationCurrent ?? 1e-12, Number.MIN_VALUE)
        const thermalVoltage = Math.max(branch.thermalVoltage ?? 0.0258, Number.MIN_VALUE)
        const maximumExponent = branch.maximumExponent ?? 40
        const limitedVoltage = Math.max(-50 * thermalVoltage, Math.min(maximumExponent * thermalVoltage, previousBranchVoltage))
        const exponential = Math.exp(limitedVoltage / thermalVoltage)
        const diodeCurrent = continued
          ? continuation.conductance * previousBranchVoltage + continuation.intercept
          : saturationCurrent * (exponential - 1)
        const conductance = continued
          ? continuation.conductance
          : Math.max(saturationCurrent * exponential / thermalVoltage, branch.minimumConductance ?? ledLeakageConductance)
        const equivalentVoltage = continued ? previousBranchVoltage : limitedVoltage
        const tangentCurrent = diodeCurrent + conductance * (nextBranchVoltage - equivalentVoltage)
        const currentCorrection = solarDiodeCurrentAt(branch, nextBranchVoltage) - tangentCurrent
        const ai = indexOf(branch.a), bi = indexOf(branch.b)
        if (ai !== undefined) nonlinearCurrentCorrections[ai] += currentCorrection
        if (bi !== undefined) nonlinearCurrentCorrections[bi] -= currentCorrection
      }
      for (const device of threeTerminalDevices) {
        const previousValues = device.terminals.map(node => voltage(previous, node))
        const nextValues = device.terminals.map(node => voltage(next, node))
        const previousEvaluation = device.family === 'bipolar'
          ? evaluateBipolarTransistor(device.model, previousValues as [number, number, number])
          : device.family === 'mosfet'
            ? evaluateMOSFET(device.model, previousValues as [number, number, number])
            : evaluateVoltageRegulator(device.model, previousValues as [number, number, number])
        const nextEvaluation = device.family === 'bipolar'
          ? evaluateBipolarTransistor(device.model, nextValues as [number, number, number])
          : device.family === 'mosfet'
            ? evaluateMOSFET(device.model, nextValues as [number, number, number])
            : evaluateVoltageRegulator(device.model, nextValues as [number, number, number])
        if (previousEvaluation && nextEvaluation) addNonlinearDeviceCorrection(
          nonlinearCurrentCorrections, device.terminals, previousValues, nextValues,
          previousEvaluation.currents, previousEvaluation.jacobian, nextEvaluation.currents,
        )
      }
      for (const device of opAmps) {
        const previousValues = device.terminals.map(node => voltage(previous, node))
        const nextValues = device.terminals.map(node => voltage(next, node))
        const previousEvaluation = evaluateUA741(previousValues as [number, number, number, number, number])
        const nextEvaluation = evaluateUA741(nextValues as [number, number, number, number, number])
        addNonlinearDeviceCorrection(
          nonlinearCurrentCorrections, device.terminals, previousValues, nextValues,
          previousEvaluation.currents, previousEvaluation.jacobian, nextEvaluation.currents,
        )
      }
      const physicalResidual = evaluateMnaResidual(matrix, rhs, next, allNodes.length, nonlinearCurrentCorrections)
      const comparatorStable = comparators.every(comparator => {
        const supplyPositive = voltage(next, comparator.supplyPositive)
        const supplyNegative = voltage(next, comparator.supplyNegative)
        return comparator.channels.every(channel => evaluateComparatorTrigger(
          voltage(next, channel.positive), voltage(next, channel.negative), supplyPositive, supplyNegative,
        ) === comparatorStampedStates.get(`${comparator.part.id}:${channel.channel}`))
      })
      solution = next
      if (delta < solverTolerance && comparatorStable && physicalResidual.converged) { converged = true; break }
      previous = next
    }
    if (!converged && diagnostics.length === 0) diagnostics.push('O ponto DC não convergiu. Confira os valores e as ligações do circuito.')
  }

  const voltages: Record<string, number> = {}
  const levels: Simulation['levels'] = {}
  const voltageAt = (node: string) => voltage(solution, node)
  const partNode = (part: Part, pin: string) => sets.find(canonicalEndpoint(pinId(part, pin), parts))
  const recordPin = (part: Part, pin: string) => {
    const id = pinId(part, pin), node = sets.find(canonicalEndpoint(id, parts)), value = voltageAt(node)
    voltages[id] = value
    levels[id] = value >= 2.5 ? '1' : value <= 0.8 ? '0' : 'X'
  }
  const leds: Simulation['leds'] = {}
  const ledBrightness: NonNullable<Simulation['ledBrightness']> = {}
  const ledWarning: NonNullable<Simulation['ledWarning']> = {}
  const ledBreakdown: NonNullable<Simulation['ledBreakdown']> = {}
  const currents: Record<string, number> = {}
  const powers: Record<string, number> = {}
  const energies: Record<string, number> = {}
  const lightBulbBrightness: Record<string, number> = {}
  const piezoVoltageIndicator: NonNullable<Simulation['piezoVoltageIndicator']> = {}
  const piezoBreakdown: NonNullable<Simulation['piezoBreakdown']> = {}
  const timer555LatchHigh: NonNullable<Simulation['timer555LatchHigh']> = {}
  const timer555LatchPending: NonNullable<Simulation['timer555LatchPending']> = {}
  const timer555OutputVoltage: NonNullable<Simulation['timer555OutputVoltage']> = {}
  const timer555OutputCurrent: NonNullable<Simulation['timer555OutputCurrent']> = {}
  const timer555DischargeVoltage: NonNullable<Simulation['timer555DischargeVoltage']> = {}
  const timer555ReferenceVoltage: NonNullable<Simulation['timer555ReferenceVoltage']> = {}
  const timer556Channels: NonNullable<Simulation['timer556Channels']> = {}
  const ultrasonicPing: NonNullable<Simulation['ultrasonicPing']> = {}
  const vibrationMotorAmplitude: Record<string, number> = {}
  const tiltSensorClosed: Record<string, boolean> = {}
  const tiltSensorResistance: Record<string, number> = {}
  const soilMoistureProbeResistance: Record<string, number> = {}
  const usbBreakdown: Record<string, boolean> = {}
  const irSensorDetected: NonNullable<Simulation['irSensorDetected']> = {}
  const irSensorOutputResistance: NonNullable<Simulation['irSensorOutputResistance']> = {}
  const irSensorSupplyVoltage: NonNullable<Simulation['irSensorSupplyVoltage']> = {}
  const irSensorBreakdown: NonNullable<Simulation['irSensorBreakdown']> = {}
  const gasSensorLevel: NonNullable<Simulation['gasSensorLevel']> = {}
  const gasSensorHeaterVoltage: NonNullable<Simulation['gasSensorHeaterVoltage']> = {}
  const gasSensorSignalResistance: NonNullable<Simulation['gasSensorSignalResistance']> = {}
  const gasSensorSignalCurrent: NonNullable<Simulation['gasSensorSignalCurrent']> = {}
  const gasSensorHeaterCurrent: NonNullable<Simulation['gasSensorHeaterCurrent']> = {}
  const gasSensorBreakdown: NonNullable<Simulation['gasSensorBreakdown']> = {}
  const pirSensorPowered: NonNullable<Simulation['pirSensorPowered']> = {}
  const pirSensorInRange: NonNullable<Simulation['pirSensorInRange']> = {}
  const pirSensorNormalizedDistance: NonNullable<Simulation['pirSensorNormalizedDistance']> = {}
  const pirSensorDriveActive: NonNullable<Simulation['pirSensorDriveActive']> = {}
  const pirSensorOutputDriven: NonNullable<Simulation['pirSensorOutputDriven']> = {}
  const pirSensorOutputTriggered: NonNullable<Simulation['pirSensorOutputTriggered']> = {}
  const pirSensorSupplyVoltage: NonNullable<Simulation['pirSensorSupplyVoltage']> = {}
  const pirSensorOutputVoltage: NonNullable<Simulation['pirSensorOutputVoltage']> = {}
  const pirSensorPullupResistance: NonNullable<Simulation['pirSensorPullupResistance']> = {}
  const pirSensorOutputCurrent: NonNullable<Simulation['pirSensorOutputCurrent']> = {}
  const rgbLedBrightness: NonNullable<Simulation['rgbLedBrightness']> = {}
  const rgbLedDisplayBrightness: NonNullable<Simulation['rgbLedDisplayBrightness']> = {}
  const rgbLedCurrents: NonNullable<Simulation['rgbLedCurrents']> = {}
  const rgbLedBreakdown: NonNullable<Simulation['rgbLedBreakdown']> = {}
  const sevenSegmentBrightness: NonNullable<Simulation['sevenSegmentBrightness']> = {}
  const sevenSegmentDisplayBrightness: NonNullable<Simulation['sevenSegmentDisplayBrightness']> = {}
  const sevenSegmentCurrents: NonNullable<Simulation['sevenSegmentCurrents']> = {}
  const sevenSegmentBreakdown: NonNullable<Simulation['sevenSegmentBreakdown']> = {}
  const sevenSegmentCommonType: NonNullable<Simulation['sevenSegmentCommonType']> = {}
  const keypadPushed: NonNullable<Simulation['keypadPushed']> = {}
  const warnings: string[] = []
  for (const relay of relays) {
    const coilVoltage = voltageAt(relay.coil1) - voltageAt(relay.coil2)
    const previousState: RelayState = runtime.relayStates[relay.part.id] ? 'energized' : 'deenergized'
    const requestedState = getRelayStateAfterCoilSample(relay.model, previousState, coilVoltage)
    if (dt > 0 && requestedState !== previousState) {
      const elapsed = (runtime.relayActuationSeconds[relay.part.id] ?? 0) + dt
      if (elapsed >= relay.model.contactSwitchDelaySeconds) {
        runtime.relayStates[relay.part.id] = requestedState === 'energized'
        runtime.relayActuationSeconds[relay.part.id] = 0
      } else runtime.relayActuationSeconds[relay.part.id] = elapsed
    } else runtime.relayActuationSeconds[relay.part.id] = 0
    const magnitude = Math.abs(coilVoltage)
    if (magnitude > relay.model.coil.maximumVoltageVolts) warnings.push(`${relay.part.label}: tensão da bobina acima do limite de 24 V extraído.`)
    const contactLimit = relay.model.primitiveBreakdownContactLimitVolts
    if (relay.contacts.some(contact => Math.abs(voltageAt(contact.common) - voltageAt(contact.throw)) > contactLimit)) warnings.push(`${relay.part.label}: tensão nos contatos acima do limite de breakdown de ${contactLimit} V da engine extraída.`)
  }
  for (const part of project.parts) {
    const kind = family(part)
    if (kind === 'gasSensor') {
      for (const pin of ['A1', 'A2', 'B1', 'B2', 'H1', 'H2']) recordPin(part, pin)
      const voltageA = voltageAt(partNode(part, 'A1'))
      const voltageB = voltageAt(partNode(part, 'B1'))
      const heaterVoltage = voltageAt(partNode(part, 'H1')) - voltageAt(partNode(part, 'H2'))
      const level = gasSensorLevels.get(part.id) ?? evaluateGasSensor({ sensorLevel: runtime.gasSensorLevel?.[part.id] }).sensorLevel
      const resistance = gasSensorResistances.get(part.id) ?? evaluateGasSensor({ heaterVoltageV: 0, sensorLevel: level }).signalResistanceOhms
      const evaluation = evaluateGasSensor({ heaterVoltageV: heaterVoltage, sensorLevel: level })
      const signalCurrent = (voltageA - voltageB) / resistance
      const heaterCurrent = heaterVoltage / GAS_SENSOR_MODEL.heaterResistanceOhms
      gasSensorLevel[part.id] = level
      gasSensorHeaterVoltage[part.id] = heaterVoltage
      gasSensorSignalResistance[part.id] = resistance
      gasSensorSignalCurrent[part.id] = signalCurrent
      gasSensorHeaterCurrent[part.id] = heaterCurrent
      gasSensorBreakdown[part.id] = evaluation.breakdown
      currents[part.id] = signalCurrent
      currents[part.id + ':heater'] = heaterCurrent
      powers[part.id] = (voltageA - voltageB) * signalCurrent + heaterVoltage * heaterCurrent
      if (converged && evaluation.breakdown) warnings.push(part.label + ': tensão de aquecimento de ' + evaluation.heaterVoltageMagnitudeV.toFixed(4) + ' V acima do limite estrito extraído de 5,1 V.')
    } else if (kind === 'pirSensor') {
      const { terminals } = PIR_SENSOR_MODEL
      for (const pin of ['Power', 'vcc', 'Vcc', 'VCC', 'Ground', 'gnd', 'GND', 'Signal', 'out', 'Out', 'Output']) recordPin(part, pin)
      const nodes = pirSensorNodes.get(part.id)
      const vcc = nodes ? voltageAt(nodes.vcc) : voltageAt(partNode(part, terminals.vcc.engine))
      const groundNode = nodes ? voltageAt(nodes.ground) : voltageAt(partNode(part, terminals.ground.engine))
      const output = nodes ? voltageAt(nodes.output) : voltageAt(partNode(part, terminals.output.engine))
      const supplyVoltage = vcc - groundNode
      const outputVoltage = output - groundNode
      const drive = (runtime.pirDrivePulses?.[part.id] ?? 0) > 0
      const target = evaluatePIRSensorTarget(runtime.pirTargetPositions?.[part.id] ?? resolvePIRSensorTargetPosition(part.properties))
      const topology = createPIRSensorTopology(supplyVoltage, drive)
      const pullup = pirSensorPullupResistances.get(part.id) ?? topology.pullupResistanceOhms
      const outputCurrent = (vcc - output) / pullup
      const supplyCurrent = supplyVoltage / PIR_SENSOR_MODEL.power.resistorOhms + outputCurrent
      const power = supplyVoltage ** 2 / PIR_SENSOR_MODEL.power.resistorOhms
        + (vcc - output) ** 2 / pullup
        + outputVoltage ** 2 / PIR_SENSOR_MODEL.output.groundShuntOhms
      pirSensorPowered[part.id] = topology.powered
      pirSensorInRange[part.id] = target.inRange
      pirSensorNormalizedDistance[part.id] = target.normalizedDistance
      pirSensorDriveActive[part.id] = drive
      pirSensorOutputDriven[part.id] = topology.outputDriven
      pirSensorOutputTriggered[part.id] = outputVoltage > PIR_SENSOR_MODEL.output.triggerVoltageV
      pirSensorSupplyVoltage[part.id] = supplyVoltage
      pirSensorOutputVoltage[part.id] = outputVoltage
      pirSensorPullupResistance[part.id] = pullup
      pirSensorOutputCurrent[part.id] = outputCurrent
      currents[part.id] = supplyCurrent
      currents[`${part.id}:out`] = outputCurrent
      powers[part.id] = power
    } else if (kind === 'irSensor') {
      const { terminals } = IR_SENSOR_MODEL
      for (const pin of ['Power', 'Vcc', 'VCC', 'GND', 'Gnd', 'Ground', 'Out', 'Output']) recordPin(part, pin)
      const vcc = voltageAt(partNode(part, terminals.vcc.engine))
      const groundNode = voltageAt(partNode(part, terminals.ground.engine))
      const output = voltageAt(partNode(part, terminals.output.engine))
      const supplyVoltage = vcc - groundNode
      const topology = irSensorTopologies.get(part.id) ?? createIRSensorTopology(resolveIRSensorDetection(runtime.irDetected?.[part.id]))
      const outputResistance = topology.branches.find(branch => branch.name === 'outputToGround')!.resistanceOhms
      const detected = topology.irDetected
      const status = evaluateIRSensorSupplyVoltage(supplyVoltage)
      const supplyCurrent = supplyVoltage / IR_SENSOR_MODEL.resistors.supplyShuntOhms + (vcc - output) / IR_SENSOR_MODEL.resistors.pullupOhms
      const outputCurrent = (output - groundNode) / outputResistance
      const devicePower = supplyVoltage * (supplyVoltage / IR_SENSOR_MODEL.resistors.supplyShuntOhms)
        + (vcc - output) * ((vcc - output) / IR_SENSOR_MODEL.resistors.pullupOhms)
        + (output - groundNode) * outputCurrent
      irSensorDetected[part.id] = detected
      irSensorOutputResistance[part.id] = outputResistance
      irSensorSupplyVoltage[part.id] = supplyVoltage
      irSensorBreakdown[part.id] = status.breakdown
      currents[part.id] = supplyCurrent
      powers[part.id] = devicePower
      if (converged && status.breakdown) warnings.push(`${part.label}: tensão de alimentação de ${supplyVoltage.toFixed(3)} V fora da faixa extraída de −0,3 a 6 V.`)
    } else if (kind === 'soilMoisture') {
      const { terminals, control } = SOIL_MOISTURE_MODEL
      for (const pin of [terminals.power.external, ...terminals.power.schematic, terminals.ground.external, ...terminals.ground.schematic, terminals.signal.external, ...terminals.signal.schematic]) recordPin(part, pin)
      soilMoistureProbeResistance[part.id] = soilMoistureResistances.get(part.id)
        ?? evaluateSoilMoisture(propertyNumber(part, control.property, control.defaultPosition)).probeResistanceOhms
    } else if (kind === 'tiltSensor') {
      const first = TILT_SENSOR_MODEL.terminals.first
      const second = TILT_SENSOR_MODEL.terminals.second
      for (const pin of [first, second, 'Terminal 1', 'Terminal 2']) recordPin(part, pin)
      const voltage = voltageAt(partNode(part, first)) - voltageAt(partNode(part, second))
      const position = propertyNumber(part, TILT_SENSOR_MODEL.control.property, TILT_SENSOR_MODEL.control.defaultPosition)
      const behavior = evaluateTiltSensor(position)
      const current = tiltSensorCurrentFromVoltage(voltage, position)
      currents[part.id] = current
      powers[part.id] = voltage * current
      tiltSensorClosed[part.id] = behavior.closed
      tiltSensorResistance[part.id] = behavior.resistanceOhms
    } else if (kind === 'vibrationMotor') {
      const positive = VIBRATION_MOTOR_MODEL.terminals.positive
      const negative = VIBRATION_MOTOR_MODEL.terminals.negative
      for (const pin of [positive, negative, 'Positive', 'Negative']) recordPin(part, pin)
      const voltage = voltageAt(partNode(part, positive)) - voltageAt(partNode(part, negative))
      const current = vibrationMotorCurrentFromVoltage(voltage)
      const behavior = evaluateVibrationMotor(current)
      currents[part.id] = current
      powers[part.id] = voltage * current
      vibrationMotorAmplitude[part.id] = converged ? behavior.amplitude : 0
      if (converged && behavior.breakdown) {
        warnings.push(`${part.label}: corrente de ${behavior.currentA.toFixed(3)} A acima do limite extraído de ${VIBRATION_MOTOR_MODEL.maximumCurrentA.toFixed(2)} A.`)
      }
    } else if (kind === 'lightBulb') {
      recordPin(part, '1'); recordPin(part, '2')
      if (part.kind === 'library') { recordPin(part, 'Terminal 1'); recordPin(part, 'Terminal 2') }
      const voltage = voltageAt(partNode(part, '1')) - voltageAt(partNode(part, '2'))
      const current = voltage / LIGHT_BULB_MODEL.resistanceOhms
      currents[part.id] = current
      powers[part.id] = voltage * current
      const evaluation = evaluateLightBulb(current)
      lightBulbBrightness[part.id] = evaluation.brightness
      if (converged && evaluation.breakdown) warnings.push(`${part.label}: corrente de ${evaluation.currentMagnitudeA.toFixed(3)} A acima do limite extraído de 0,25 A.`)
    } else if (kind === 'ultrasonicPing') {
      for (const terminal of Object.values(ULTRASONIC_PING_MODEL.terminals)) for (const pin of terminal.aliases) recordPin(part, pin)
      const sensor = ultrasonicPingNodes.get(part.id)
      if (sensor) {
        const state = runtime.ultrasonicStates?.[part.id] ?? initialUltrasonicPingState()
        const position = runtime.ultrasonicTargetPositions?.[part.id] ?? resolveUltrasonicTargetPosition(part.properties)
        const target = evaluateUltrasonicTarget(position)
        const supplyVoltage = voltageAt(sensor.positive) - voltageAt(sensor.negative)
        const echoVoltage = voltageAt(sensor.echo) - voltageAt(sensor.negative)
        const intervalStart = timeStepSeconds > 0 ? simulationTimeSeconds - timeStepSeconds : simulationTimeSeconds
        const echoActive = ultrasonicEchoActiveAt(state, intervalStart)
        const echoPullup = ultrasonicEchoPullupResistances.get(part.id) ?? ULTRASONIC_PING_MODEL.electrical.echoInactivePullupOhms
        const echoCurrent = (voltageAt(sensor.positive) - voltageAt(sensor.echo)) / echoPullup
        const supplyCurrent = supplyVoltage / ULTRASONIC_PING_MODEL.electrical.powerResistanceOhms
          + echoCurrent
          + (sensor.separateTrigger && !sensor.separateSignal ? (voltageAt(sensor.positive) - voltageAt(sensor.trigger)) / ULTRASONIC_PING_MODEL.electrical.triggerPullupOhms : 0)
        ultrasonicPing[part.id] = {
          powered: ultrasonicPowerValid(supplyVoltage), supplyVoltage, targetPosition: position,
          inRange: target.inRange, normalizedDistance: target.normalizedDistance, distanceCm: target.distanceCm,
          phase: state.phase, triggerHigh: state.triggerLevelHigh, lastTriggerPulseSeconds: state.lastTriggerPulseSeconds,
          echoActive, echoStartsAtSeconds: state.echoStartsAtSeconds, echoEndsAtSeconds: state.echoEndsAtSeconds,
          acceptedPings: state.acceptedPings, rejectedShortPulses: state.rejectedShortPulses,
          echoVoltage, echoCurrent,
        }
        currents[part.id] = supplyCurrent
        powers[part.id] = supplyVoltage * supplyCurrent
      }
    } else if (kind === 'timer555') {
      const pins = TIMER555_MODEL.pins
      for (const terminal of Object.values(pins)) for (const pin of terminal.aliases) recordPin(part, pin)
      const timer = timer555Nodes.get(part.id)
      if (timer) {
        const latchHigh = runtime.timer555Latch?.[part.id] ?? TIMER555_MODEL.latch.initialHigh
        const outputVoltage = voltageAt(timer.output) - voltageAt(timer.ground)
        const highPull = latchHigh ? TIMER555_MODEL.output.activeResistanceOhms : TIMER555_MODEL.output.inactiveResistanceOhms
        const lowPull = latchHigh ? TIMER555_MODEL.output.inactiveResistanceOhms : TIMER555_MODEL.output.activeResistanceOhms
        const outputCurrent = (voltageAt(timer.vcc) - voltageAt(timer.output)) / highPull - (voltageAt(timer.output) - voltageAt(timer.ground)) / lowPull
        timer555LatchHigh[part.id] = latchHigh
        timer555LatchPending[part.id] = runtime.timer555PendingLatch?.[part.id] !== undefined
        timer555OutputVoltage[part.id] = outputVoltage
        timer555OutputCurrent[part.id] = outputCurrent
        timer555DischargeVoltage[part.id] = voltageAt(timer.discharge) - voltageAt(timer.ground)
        timer555ReferenceVoltage[part.id] = voltageAt(timer.reference)
        currents[part.id] = outputCurrent
        powers[part.id] = outputVoltage * outputCurrent
      }
    } else if (kind === 'timer556') {
      for (const terminal of Object.values(TIMER556_MODEL.sharedPins)) for (const pin of terminal.aliases) recordPin(part, pin)
      const channels = timer556Nodes.get(part.id)
      if (channels) {
        const readings = {} as NonNullable<Simulation['timer556Channels']>[string]
        let totalCurrent = 0
        let totalPower = 0
        for (const channel of ['A', 'B'] as const) {
          const pins = TIMER556_MODEL.channels[channel].pins
          for (const terminal of Object.values(pins)) for (const pin of terminal.aliases) recordPin(part, pin)
          const timer = channels[channel]
          const latchHigh = runtime.timer556Latch?.[part.id]?.[channel] ?? TIMER555_MODEL.latch.initialHigh
          const outputVoltage = voltageAt(timer.output) - voltageAt(timer.ground)
          const highPull = latchHigh ? TIMER555_MODEL.output.activeResistanceOhms : TIMER555_MODEL.output.inactiveResistanceOhms
          const lowPull = latchHigh ? TIMER555_MODEL.output.inactiveResistanceOhms : TIMER555_MODEL.output.activeResistanceOhms
          const outputCurrent = (voltageAt(timer.vcc) - voltageAt(timer.output)) / highPull - (voltageAt(timer.output) - voltageAt(timer.ground)) / lowPull
          readings[channel] = {
            latchHigh,
            pending: runtime.timer556PendingLatch?.[part.id]?.[channel] !== undefined,
            outputVoltage,
            outputCurrent,
            dischargeVoltage: voltageAt(timer.discharge) - voltageAt(timer.ground),
            referenceVoltage: voltageAt(timer.reference),
          }
          totalCurrent += outputCurrent
          totalPower += outputVoltage * outputCurrent
        }
        timer556Channels[part.id] = readings
        currents[part.id] = totalCurrent
        powers[part.id] = totalPower
      }
    } else if (kind === 'piezo') {
      const positive = PIEZO_SOUND_MODEL.terminals.positive.engine
      const negative = PIEZO_SOUND_MODEL.terminals.negative.engine
      for (const pin of [positive, negative, 'Positive', 'Negative', 'pos', 'neg']) recordPin(part, pin)
      const voltage = voltageAt(partNode(part, positive)) - voltageAt(partNode(part, negative))
      const evaluation = evaluatePiezoSound(voltage)
      currents[part.id] = evaluation.currentA
      powers[part.id] = evaluation.dissipatedPowerW
      piezoVoltageIndicator[part.id] = evaluation.voltageIndicatorFraction
      piezoBreakdown[part.id] = evaluation.breakdown
      if (converged && evaluation.breakdown) warnings.push(`${part.label}: tensão direta de ${voltage.toFixed(3)} V acima do limite estrito extraído de 25 V.`)
    } else if (kind === 'resistor' || kind === 'variableResistor') {
      recordPin(part, 'A'); recordPin(part, 'B')
      // Keep library terminal aliases and sensor pin labels available to the inspector.
      if (part.kind === 'library') {
        recordPin(part, 'Terminal 2'); recordPin(part, 'Terminal 1')
        if (kind === 'variableResistor') { recordPin(part, '1'); recordPin(part, '2'); recordPin(part, 'terminal-1'); recordPin(part, 'terminal-2') }
      }
      const resistance = variableResistances.get(part.id) ?? resistorOhms(part)
      currents[part.id] = (voltageAt(sets.find(`${part.id}:A`)) - voltageAt(sets.find(`${part.id}:B`))) / Math.max(resistance, Number.MIN_VALUE)
      powers[part.id] = (voltageAt(sets.find(`${part.id}:A`)) - voltageAt(sets.find(`${part.id}:B`))) * currents[part.id]
    } else if (kind === 'keypad') {
      const hasRuntimePushed = Object.prototype.hasOwnProperty.call(runtime.keypadPushed ?? {}, part.id)
      const pushedValue = hasRuntimePushed ? runtime.keypadPushed?.[part.id] : part.properties?.pushed
      const normalized = normalizeKeypadPushed(pushedValue as KeypadPushedInput)
      for (const terminal of KEYPAD_4X4_MODEL.rows) {
        const number = terminal.slice(-1)
        recordPin(part, terminal)
        recordPin(part, `Row ${number}`)
      }
      for (const terminal of KEYPAD_4X4_MODEL.columns) {
        const number = terminal.slice(-1)
        recordPin(part, terminal)
        recordPin(part, `Column ${number}`)
      }
      keypadPushed[part.id] = normalized === undefined ? null : normalized?.join('') ?? null
    } else if (kind === 'sevenSegment') {
      const aliases = ['G', 'F', 'Common', 'A', 'B', 'E', 'D', 'C', 'DP', 'g', 'f', 'a', 'b', 'c', 'd', 'e', 'dp', 'com1', 'com2']
      for (const pin of aliases) recordPin(part, pin)
      const topology = createSevenSegmentTopology(part.properties?.[SEVEN_SEGMENT_MODEL.control.property])
      const rawCurrents = {} as Record<SevenSegmentName, number>
      let devicePower = 0
      for (const channel of topology.channels) {
        const anode = `__mna_seven_segment_anode:${part.id}:${channel.segment}`
        const cathode = `__mna_seven_segment_cathode:${part.id}:${channel.segment}`
        const diodeVoltage = voltageAt(anode) - voltageAt(cathode)
        const current = sevenSegmentDiodeCurrentFromVoltage(diodeVoltage)
        rawCurrents[channel.segment] = current
        currents[`${part.id}:${channel.segment}`] = current
        devicePower += diodeVoltage * current
      }
      const evaluation = evaluateSevenSegmentDisplay(rawCurrents)
      sevenSegmentBrightness[part.id] = Object.fromEntries(SEVEN_SEGMENT_MODEL.segments.map(segment => [segment, evaluation.channels[segment].brightnessFraction])) as NonNullable<Simulation['sevenSegmentBrightness']>[string]
      sevenSegmentDisplayBrightness[part.id] = Object.fromEntries(SEVEN_SEGMENT_MODEL.segments.map(segment => [segment, evaluation.displayBrightness[SEVEN_SEGMENT_MODEL.segments.indexOf(segment)]])) as NonNullable<Simulation['sevenSegmentDisplayBrightness']>[string]
      sevenSegmentCurrents[part.id] = rawCurrents
      sevenSegmentBreakdown[part.id] = Object.fromEntries(SEVEN_SEGMENT_MODEL.segments.map(segment => [segment, evaluation.channels[segment].breakdown])) as NonNullable<Simulation['sevenSegmentBreakdown']>[string]
      sevenSegmentCommonType[part.id] = resolveSevenSegmentCommonType(part.properties?.[SEVEN_SEGMENT_MODEL.control.property])
      currents[part.id] = Object.values(rawCurrents).reduce((total, current) => total + current, 0)
      powers[part.id] = devicePower
      for (const segment of SEVEN_SEGMENT_MODEL.segments) {
        const channel = evaluation.channels[segment]
        if (converged && channel.breakdown) warnings.push(`${part.label}: corrente do segmento ${segment} de ${channel.currentA.toFixed(3)} A acima do limite extraído de 0,020 A.`)
      }
    } else if (kind === 'rgbLed') {
      const terminals = Object.keys(RGB_LED_MODEL.terminals) as RgbLedTerminal[]
      const commonNode = sets.find(`__mna_rgb_led_common:${part.id}`)
      const rawCurrents = {} as Record<RgbLedTerminal, number>
      for (const terminal of terminals) {
        const names = RGB_LED_MODEL.terminals[terminal]
        for (const pin of [names.breadboard, names.schematic]) recordPin(part, pin)
        const terminalNode = partNode(part, names.breadboard)
        const diodeVoltage = voltageAt(terminalNode) - voltageAt(commonNode)
        rawCurrents[terminal] = rgbLedDiodeCurrentFromVoltage(diodeVoltage)
        currents[`${part.id}:${terminal}`] = rawCurrents[terminal]
      }
      const evaluation = evaluateRgbLed(rawCurrents, part.properties?.pinout)
      const channels = evaluation.channels
      rgbLedBrightness[part.id] = { red: evaluation.brightness[0], green: evaluation.brightness[1], blue: evaluation.brightness[2] }
      rgbLedDisplayBrightness[part.id] = { red: evaluation.displayBrightness[0], green: evaluation.displayBrightness[1], blue: evaluation.displayBrightness[2] }
      rgbLedCurrents[part.id] = { red: channels.red.currentA, green: channels.green.currentA, blue: channels.blue.currentA }
      rgbLedBreakdown[part.id] = { red: channels.red.breakdown, green: channels.green.breakdown, blue: channels.blue.breakdown }
      currents[part.id] = channels.red.currentA + channels.green.currentA + channels.blue.currentA
      powers[part.id] = (Object.values(channels).reduce((sum, channel) => {
        const pin = RGB_LED_MODEL.terminals[channel.terminal].breadboard
        return sum + channel.currentA * (voltageAt(partNode(part, pin)) - voltageAt(commonNode))
      }, 0))
      for (const color of ['red', 'green', 'blue'] as const) {
        const channel = channels[color]
        if (converged && channel.breakdown) warnings.push(`${part.label}: corrente do canal ${color} de ${channel.currentA.toFixed(3)} A acima do limite extraído de ${RGB_LED_MODEL.maximumCurrentA.toFixed(3)} A.`)
      }
    } else if (kind === 'led' || kind === 'diode') {
      const isLed = kind === 'led'
      const descriptor = getTwoPinDiodeDescriptor(isLed ? 'led' : 'diode', part.properties?.color)
      const anode = descriptor.terminals.anode, cathode = descriptor.terminals.cathode
      recordPin(part, anode); recordPin(part, cathode)
      if (part.kind === 'library') { recordPin(part, 'Anode'); recordPin(part, 'Cathode') }
      const diodeAnode = isLed ? `__mna_two_pin_led:${part.id}` : sets.find(`${part.id}:${anode}`)
      const junctionVoltage = voltageAt(diodeAnode) - voltageAt(sets.find(`${part.id}:${cathode}`))
      const current = shockleyDiodeCurrentWithContinuationA(junctionVoltage, descriptor, { maximumExponent: descriptor.maximumExponent, minimumConductanceSiemens: 1e-12 })
      const terminalVoltage = voltageAt(sets.find(`${part.id}:${anode}`)) - voltageAt(sets.find(`${part.id}:${cathode}`))
      currents[part.id] = current
      powers[part.id] = terminalVoltage * current
      if (isLed) {
        const evaluation = evaluateTwoPinLed(current)
        ledBrightness[part.id] = evaluation.brightness
        ledWarning[part.id] = evaluation.warning
        ledBreakdown[part.id] = evaluation.breakdown
        leds[part.id] = !converged ? 'X' : current >= 0.001 ? '1' : '0'
        if (converged && evaluation.warning) warnings.push(`${part.label}: corrente através do LED excede o máximo recomendado de 20 mA.`)
        if (converged && evaluation.breakdown) warnings.push(`${part.label}: corrente através do LED atingiu o limite absoluto de 120 mA.`)
      }
    } else if (kind === 'npn' || kind === 'pnp') {
      for (const pin of ['B', 'E', 'C', 'Base', 'Emitter', 'Collector', 'base', 'emitter', 'collector']) recordPin(part, pin)
      const values = [voltageAt(partNode(part, 'B')), voltageAt(partNode(part, 'E')), voltageAt(partNode(part, 'C'))] as [number, number, number]
      const evaluated = evaluateBipolarTransistor(String(part.properties?.simulationModel ?? ''), values)
      if (evaluated) {
        currents[part.id] = evaluated.currents[2]
        currents[`${part.id}:B`] = evaluated.currents[0]
        currents[`${part.id}:E`] = evaluated.currents[1]
        currents[`${part.id}:C`] = evaluated.currents[2]
        powers[part.id] = evaluated.currents.reduce((power, current, index) => power + current * values[index], 0)
      }
    } else if (kind === 'tip120') {
      for (const pin of ['B', 'E', 'C', 'Base', 'Emitter', 'Collector', 'base', 'emitter', 'collector']) recordPin(part, pin)
      const base = voltageAt(partNode(part, 'B'))
      const emitter = voltageAt(partNode(part, 'E'))
      const collector = voltageAt(partNode(part, 'C'))
      const internalBase = voltageAt(`__mna_tip120_base:${part.id}`)
      const evaluations = threeTerminalDevices.filter(device => device.part.id === part.id).map(device =>
        evaluateBipolarTransistor('npn', device.terminals.map(voltageAt) as [number, number, number]),
      ).filter((item): item is NonNullable<typeof item> => item !== undefined)
      const externalBaseCurrent = (base - internalBase) / 8000
      const diodeThermalVoltage = 0.0258
      const diodeCriticalVoltage = diodeThermalVoltage * Math.log((1e4 + 1e-12) / 1e-12)
      const diodeVoltage = emitter - collector
      const diodeSlope = 1e4 / diodeThermalVoltage
      const diodeIntercept = 1e4 - diodeSlope * diodeCriticalVoltage
      const diodeCurrent = diodeVoltage < diodeCriticalVoltage
        ? 1e-12 * Math.expm1(Math.max(-700, diodeVoltage / diodeThermalVoltage))
        : diodeSlope * diodeVoltage + diodeIntercept
      const collectorCurrent = (evaluations[0]?.currents[2] ?? 0) + (evaluations[1]?.currents[2] ?? 0) - diodeCurrent
      currents[part.id] = collectorCurrent
      currents[`${part.id}:B`] = externalBaseCurrent
      currents[`${part.id}:E`] = (evaluations[1]?.currents[1] ?? 0) + (emitter - internalBase) / 120 + diodeCurrent
      currents[`${part.id}:C`] = collectorCurrent
      powers[part.id] = evaluations.reduce((sum, item, index) => {
        const values = threeTerminalDevices.filter(device => device.part.id === part.id)[index].terminals.map(voltageAt)
        return sum + item.currents.reduce((power, current, terminal) => power + current * values[terminal], 0)
      }, 0) + (base - internalBase) ** 2 / 8000 + (internalBase - emitter) ** 2 / 120 + diodeVoltage * diodeCurrent
      if (collector - base > 60) warnings.push(`${part.label}: tensão coletor–base acima do limite de 60 V do modelo extraído.`)
      if (collector - emitter > 60) warnings.push(`${part.label}: tensão coletor–emissor acima do limite de 60 V do modelo extraído.`)
      if (base - emitter > 5) warnings.push(`${part.label}: tensão base–emissor acima do limite de 5 V do modelo extraído.`)
    } else if (kind === 'regulator') {
      for (const pin of ['IN', 'GND', 'OUT', 'In', 'Ground', 'Out', 'in', 'gnd', 'out']) recordPin(part, pin)
      const values = [voltageAt(partNode(part, 'IN')), voltageAt(partNode(part, 'GND')), voltageAt(partNode(part, 'OUT'))] as [number, number, number]
      const model = String(part.properties?.simulationModel ?? '')
      const evaluated = evaluateVoltageRegulator(model, values)
      const descriptor = getVoltageRegulatorModel(model)
      if (evaluated) {
        const outputCurrent = -evaluated.currents[2]
        currents[part.id] = outputCurrent
        currents[`${part.id}:IN`] = evaluated.currents[0]
        currents[`${part.id}:GND`] = evaluated.currents[1]
        currents[`${part.id}:OUT`] = -evaluated.currents[2]
        powers[part.id] = evaluated.currents.reduce((power, current, index) => power + current * values[index], 0)
        const breakdown = descriptor ? voltageRegulatorBreakdown(descriptor.model, values[0] - values[1], outputCurrent) : undefined
        if (breakdown?.inputOutOfRange) warnings.push(`${part.label}: tensão de entrada fora dos limites do modelo extraído.`)
        if (breakdown?.outputOvercurrent) warnings.push(`${part.label}: corrente de saída acima do limite do modelo extraído.`)
      }
    } else if (kind === 'mosfet') {
      for (const pin of ['GATE', 'SOURCE', 'DRAIN', 'Gate', 'Source', 'Drain', 'gate', 'source', 'drain']) recordPin(part, pin)
      const values = [voltageAt(partNode(part, 'GATE')), voltageAt(partNode(part, 'SOURCE')), voltageAt(partNode(part, 'DRAIN'))] as [number, number, number]
      const evaluated = evaluateMOSFET(String(part.properties?.simulationModel ?? ''), values)
      if (evaluated) {
        currents[part.id] = evaluated.currents[2]
        currents[`${part.id}:GATE`] = evaluated.currents[0]
        currents[`${part.id}:SOURCE`] = evaluated.currents[1]
        currents[`${part.id}:DRAIN`] = evaluated.currents[2]
        powers[part.id] = evaluated.currents.reduce((power, current, index) => power + current * values[index], 0)
      }
    } else if (kind === 'opAmp') {
      for (const pin of ['IN_PLUS', 'IN_MINUS', 'VCC', 'GND', 'OUT', 'In+', 'In-', 'Power+', 'Power-', 'V+', 'V-', 'Vcc', 'Gnd', 'Out']) recordPin(part, pin)
      const values = [voltageAt(partNode(part, 'IN_PLUS')), voltageAt(partNode(part, 'IN_MINUS')), voltageAt(partNode(part, 'VCC')), voltageAt(partNode(part, 'GND')), voltageAt(partNode(part, 'OUT'))] as [number, number, number, number, number]
      const evaluated = evaluateUA741(values)
      currents[part.id] = -evaluated.currents[4]
      for (const [index, pin] of ['IN_PLUS', 'IN_MINUS', 'VCC', 'GND', 'OUT'].entries()) currents[`${part.id}:${pin}`] = evaluated.currents[index]
      powers[part.id] = evaluated.currents.reduce((power, current, index) => power + current * values[index], 0)
    } else if (kind === 'photodiode' || kind === 'phototransistor') {
      const descriptor = photodetectors.get(part.id)
      if (descriptor?.kind === 'photodiode') {
        const nodes = photodiodeNodes.get(part.id)!
        for (const pin of ['ANODE', 'CATHODE', 'Anode', 'Cathode', 'A', 'K', 'anode', 'cathode']) recordPin(part, pin)
        const voltage = voltageAt(nodes.anode) - voltageAt(nodes.cathode)
        const exponent = Math.max(-50, Math.min(40, voltage / 0.0258))
        const diodeCurrent = 1e-11 * (Math.exp(exponent) - 1)
        const shuntCurrent = voltage / 1e6
        currents[part.id] = -descriptor.currentSource.currentA + diodeCurrent + shuntCurrent
        powers[part.id] = voltage * currents[part.id]
      } else if (descriptor?.kind === 'phototransistor') {
        const nodes = phototransistorNodes.get(part.id)!
        for (const pin of ['C', 'E', 'Collector', 'Emitter', 'collector', 'emitter']) recordPin(part, pin)
        const values = [voltageAt(nodes.base), voltageAt(nodes.emitter), voltageAt(nodes.collector)] as [number, number, number]
        const transistor = evaluateBipolarTransistor('npn', values)
        if (transistor) {
          currents[part.id] = transistor.currents[2]
          currents[`${part.id}:B`] = transistor.currents[0]
          currents[`${part.id}:E`] = transistor.currents[1]
          currents[`${part.id}:C`] = transistor.currents[2]
          powers[part.id] = transistor.currents.reduce((power, current, index) => power + current * values[index], 0)
            + descriptor.currentSource.currentA * (values[1] - values[0])
        }
      }
    } else if (kind === 'relay') {
      const relay = relays.find(candidate => candidate.part.id === part.id)
      if (relay) {
        recordPin(part, relay.model.coil.terminals[0]); recordPin(part, relay.model.coil.terminals[1])
        for (const terminal of relay.model.terminals) recordPin(part, terminal.name)
        const coilVoltage = voltageAt(relay.coil1) - voltageAt(relay.coil2)
        currents[part.id] = coilVoltage / relay.model.coil.resistanceOhms
        powers[part.id] = coilVoltage * currents[part.id]
      }
    } else if (kind === 'comparator') {
      const modelId = String(part.properties?.simulationModel ?? '')
      const model = getComparatorModel(modelId)
      const comparator = comparators.find(candidate => candidate.part.id === part.id)
      if (model && comparator) {
        for (const pin of ['vcc', 'VCC', 'Power', 'gnd', 'GND', 'Ground']) recordPin(part, pin)
        const supplyPositive = voltageAt(comparator.supplyPositive)
        const supplyNegative = voltageAt(comparator.supplyNegative)
        let supplyCurrent = (supplyPositive - supplyNegative) / model.supplyLoadResistanceOhms
        let devicePower = (supplyPositive - supplyNegative) ** 2 / model.supplyLoadResistanceOhms
        for (const channel of comparator.channels) {
          const inputPositive = voltageAt(channel.positive)
          const inputNegative = voltageAt(channel.negative)
          const output = voltageAt(channel.output)
          const base = voltageAt(channel.base)
          const collector = voltageAt(channel.collector)
          const triggerHigh = evaluateComparatorTrigger(inputPositive, inputNegative, supplyPositive, supplyNegative)
          const basePullup = getComparatorOutputBasePullupResistanceOhms(modelId, triggerHigh)!
          const inputPositiveName = model.inputPositiveTerminal(channel.channel)
          const inputNegativeName = model.inputNegativeTerminal(channel.channel)
          const outputName = model.outputTerminal(channel.channel)
          const inputPositiveDisplay = `In ${channel.channel} +`
          const inputNegativeDisplay = `In ${channel.channel} -`
          const outputDisplay = `Out ${channel.channel}`
          for (const pin of [inputPositiveName, inputPositiveDisplay]) recordPin(part, pin)
          for (const pin of [inputNegativeName, inputNegativeDisplay]) recordPin(part, pin)
          for (const pin of [outputName, outputDisplay]) recordPin(part, pin)
          const transistor = evaluateBipolarTransistor('npn', [base, supplyNegative, collector])
          const outputCurrent = (output - collector) / model.outputArchitecture.outputSeriesResistanceOhms
          currents[`${part.id}:OUT${channel.channel}`] = outputCurrent
          supplyCurrent += (supplyPositive - inputPositive) / model.inputLeakResistanceOhms
            + (supplyPositive - inputNegative) / model.inputLeakResistanceOhms
            + (supplyPositive - base) / basePullup
          devicePower += ((supplyPositive - inputPositive) ** 2 + (supplyPositive - inputNegative) ** 2) / model.inputLeakResistanceOhms
            + (supplyPositive - base) ** 2 / basePullup
            + (base - supplyNegative) ** 2 / model.outputArchitecture.baseToGroundResistanceOhms
            + (output - collector) * outputCurrent
            + (transistor?.currents.reduce((sum, current, index) => sum + current * [base, supplyNegative, collector][index], 0) ?? 0)
          if (Math.abs(outputCurrent) > model.limits.maximumAbsoluteOutputCurrentA) warnings.push(`${part.label}: corrente da saída ${channel.channel} acima de 20 mA no modelo extraído.`)
        }
        currents[part.id] = supplyCurrent
        powers[part.id] = devicePower
        if (supplyPositive - supplyNegative > model.limits.maximumSupplyVoltageV) warnings.push(`${part.label}: alimentação acima do limite extraído de 36 V.`)
      }
    } else if (kind === 'zenerDiode') {
      recordPin(part, 'A'); recordPin(part, 'C')
      for (const pin of ['Anode', 'Cathode']) recordPin(part, pin)
      const model = getZenerDiodeModel(part.properties ?? {})
      const thermalVoltage = 0.0258 * model.forwardDiode.idealityFactor
      const forwardVoltage = voltageAt(sets.find(`${part.id}:A`)) - voltageAt(sets.find(`${part.id}:C`))
      const forwardExponent = Math.max(-50, Math.min(40, forwardVoltage / thermalVoltage))
      const forwardCurrent = model.forwardDiode.saturationCurrentA * (Math.exp(forwardExponent) - 1)
      const sourceRow = sourceIndex.get(part.id)
      const reverseSourceCurrent = sourceRow === undefined ? 0 : solution[sourceRow]
      const current = forwardCurrent - reverseSourceCurrent
      currents[part.id] = current
      powers[part.id] = forwardVoltage * current
    } else if (kind === 'button') {
      for (const pin of ['A1', 'A2', 'B1', 'B2']) recordPin(part, pin)
      if (part.kind === 'library') for (const pin of ['Terminal 1a', 'Terminal 1b', 'Terminal 2a', 'Terminal 2b']) recordPin(part, pin)
    } else if (kind === 'potentiometer') {
      for (const pin of ['Terminal 1', 'Wiper', 'Terminal 2']) recordPin(part, pin)
      if (part.kind === 'library') for (const pin of ['term0', 'term1', 'wiper']) recordPin(part, pin)
    } else if (kind === 'dipSwitch') {
      const count = String(part.properties?.simulationModel) === 'dip_switch_spdt' ? 2 : String(part.properties?.simulationModel) === 'dip_switch_4' ? 4 : 6
      for (let index = 1; index <= count; index++) { recordPin(part, `${index}A`); recordPin(part, `${index}B`) }
    } else if (kind === 'switch') {
      recordPin(part, '1'); recordPin(part, '2'); recordPin(part, '3')
      if (part.kind === 'library') for (const pin of ['Terminal 1', 'Terminal 2', 'Common']) recordPin(part, pin)
    } else if (kind === 'capacitor' || kind === 'polarizedCapacitor') {
      const pinA = kind === 'capacitor' ? 'Terminal 1' : 'Positive'
      const pinB = kind === 'capacitor' ? 'Terminal 2' : 'Negative'
      recordPin(part, pinA); recordPin(part, pinB)
      const capacitor = capacitors.find(candidate => candidate.part.id === part.id)
      const farads = capacitor?.farads ?? capacitanceFarads(part)
      const capacitorA = capacitor?.capacitorA ?? sets.find(`${part.id}:A`)
      const idealVoltage = voltageAt(capacitorA) - voltageAt(sets.find(`${part.id}:B`))
      const terminalVoltage = voltageAt(sets.find(`${part.id}:A`)) - voltageAt(sets.find(`${part.id}:B`))
      const previousVoltage = runtime.capacitorVoltages[part.id] ?? propertyNumber(part, 'initialVoltage', 0)
      const previousCurrent = runtime.capacitorCurrents[part.id]
      const current = dt > 0 && converged
        ? (farads / dt) * (idealVoltage - previousVoltage) * (previousCurrent === undefined ? 1 : 2) - (previousCurrent ?? 0)
        : 0
      currents[part.id] = current
      powers[part.id] = terminalVoltage * current
      energies[part.id] = 0.5 * farads * idealVoltage * idealVoltage
      if (dt > 0 && converged) {
        runtime.capacitorVoltages[part.id] = idealVoltage
        runtime.capacitorCurrents[part.id] = current
      }
      if (kind === 'polarizedCapacitor' && converged) {
        const check = checkPolarizedCapacitorVoltage(part.properties ?? {}, idealVoltage)
        if (check?.breakdown) {
          const reason = check.reversePolarity ? 'polaridade invertida' : `tensão acima de ${check.voltageRatingV} V`
          warnings.push(`${part.label}: o capacitor polarizado entrou em breakdown (${reason}).`)
        }
      }
    } else if (kind === 'inductor') {
      recordPin(part, 'Terminal 1'); recordPin(part, 'Terminal 2')
      const inductor = inductors.find(candidate => candidate.part.id === part.id)
      const henries = inductor?.henries ?? inductanceHenries(part)
      const voltage = voltageAt(sets.find(`${part.id}:A`)) - voltageAt(sets.find(`${part.id}:B`))
      const previousCurrent = state.inductorCurrents?.[part.id] ?? propertyNumber(part, 'initialCurrent', 0)
      const previousVoltage = state.inductorVoltages?.[part.id]
      const row = sourceIndex.get(part.id)
      const current = dt > 0
        ? previousCurrent + (dt / henries) * (previousVoltage === undefined ? voltage : 0.5 * (voltage + previousVoltage))
        : row === undefined ? 0 : solution[row]
      currents[part.id] = current
      powers[part.id] = voltage * current
      energies[part.id] = 0.5 * henries * current * current
      if (dt > 0 && converged) {
        runtime.inductorCurrents[part.id] = current
        runtime.inductorVoltages[part.id] = voltage
      }
    } else if (kind === 'generator') {
      recordPin(part, 'OUT'); recordPin(part, 'GND')
      for (const pin of ['Positive', 'Negative']) recordPin(part, pin)
      const output = generatorOutputs.get(part.id)
      const outputCurrent = output ? (voltageAt(output.internal) - voltageAt(output.positive)) / output.resistance : 0
      currents[part.id] = outputCurrent
      powers[part.id] = (voltageAt(partNode(part, 'OUT')) - voltageAt(partNode(part, 'GND'))) * outputCurrent
    } else if (kind === 'tempSensor') { recordPin(part, 'Gnd'); recordPin(part, 'Vout')
      for (const pin of ['Power', 'GND']) recordPin(part, pin)
      const row = sourceIndex.get(part.id)
      currents[part.id] = row === undefined ? 0 : solution[row]
      powers[part.id] = (voltageAt(partNode(part, 'Vout')) - voltageAt(partNode(part, 'Gnd'))) * currents[part.id]
    } else if (kind === 'solarCell') {
      recordPin(part, 'Positive'); recordPin(part, 'Negative')
      const output = solarOutputs.get(part.id)
      const outputCurrent = output ? (voltageAt(output.internal) - voltageAt(output.positive)) / output.resistance : 0
      currents[part.id] = outputCurrent
      const outputVoltage = voltageAt(partNode(part, 'Positive')) - voltageAt(partNode(part, 'Negative'))
      powers[part.id] = outputVoltage * outputCurrent
    } else if (kind === 'usbSource') {
      const positive = USB_STANDARD_MODEL.terminals.power.engine
      const negative = USB_STANDARD_MODEL.terminals.ground.engine
      const dataPlus = USB_STANDARD_MODEL.terminals.dataPlus.engine
      const dataMinus = USB_STANDARD_MODEL.terminals.dataMinus.engine
      for (const pin of [positive, negative, dataPlus, dataMinus, 'Ground', 'Data +', 'Data -', 'Shield1', 'Shield2', 'USB_P', 'USB_M']) recordPin(part, pin)
      const row = sourceIndex.get(part.id)
      const current = row === undefined || solution[row] === 0 ? 0 : -solution[row]
      const voltage = voltageAt(partNode(part, positive)) - voltageAt(partNode(part, negative))
      const status = evaluateUSBStandardCurrent(current)
      currents[part.id] = current
      powers[part.id] = voltage * current
      usbBreakdown[part.id] = status.breakdown
      if (converged && status.breakdown) warnings.push(`${part.label}: corrente de saída de ${status.currentMagnitudeA.toFixed(3)} A acima do limite extraído de 0,5 A.`)
    } else if (kind === 'supply') {
      recordPin(part, 'PLUS'); recordPin(part, 'MINUS')
      if (part.kind === 'library') { recordPin(part, 'Positive'); recordPin(part, 'Negative') }
      const row = sourceIndex.get(part.id)
      currents[part.id] = row === undefined ? 0 : solution[row]
      const batteryCapacitor = capacitors.find(candidate => candidate.part.id === part.id)
      if (batteryCapacitor) {
        const voltage = voltageAt(batteryCapacitor.capacitorA) - voltageAt(batteryCapacitor.b)
        energies[part.id] = 0.5 * batteryCapacitor.farads * voltage * voltage
        if (dt > 0 && converged) {
          const previousVoltage = runtime.capacitorVoltages[part.id] ?? propertyNumber(part, 'initialVoltage', 0)
          const previousCurrent = runtime.capacitorCurrents[part.id]
          const capacitorCurrent = (batteryCapacitor.farads / dt) * (voltage - previousVoltage) * (previousCurrent === undefined ? 1 : 2) - (previousCurrent ?? 0)
          runtime.capacitorVoltages[part.id] = voltage
          runtime.capacitorCurrents[part.id] = capacitorCurrent
        }
      }
    } else if (kind === 'vcc' || kind === 'gnd') recordPin(part, 'OUT')
  }
  for (const wire of project.wires) {
    const node = sets.find(canonicalEndpoint(wire.from, parts))
    voltages[wire.from] = voltageAt(node)
    levels[wire.from] = voltageAt(node) >= 2.5 ? '1' : voltageAt(node) <= 0.8 ? '0' : 'X'
    const other = sets.find(canonicalEndpoint(wire.to, parts))
    voltages[wire.to] = voltageAt(other)
    levels[wire.to] = voltageAt(other) >= 2.5 ? '1' : voltageAt(other) <= 0.8 ? '0' : 'X'
  }

  return {
    runtime,
    simulation: { levels, leds, q: { ...runtime.q }, prev_clock: { ...runtime.prev_clock }, mode: dt > 0 && (capacitors.length > 0 || inductors.length > 0 || project.parts.some(part => ['generator', 'relay', 'timer555', 'timer556', 'ultrasonicPing'].includes(family(part) ?? ''))) ? 'transient' : 'dc', voltages, currents, powers, energies, relayStates: { ...runtime.relayStates }, ledBrightness, ledWarning, ledBreakdown, timer555LatchHigh, timer555LatchPending, timer555OutputVoltage, timer555OutputCurrent, timer555DischargeVoltage, timer555ReferenceVoltage, timer556Channels, ultrasonicPing, lightBulbBrightness, piezoVoltageIndicator, piezoBreakdown, vibrationMotorAmplitude, tiltSensorClosed, tiltSensorResistance, soilMoistureProbeResistance, usbBreakdown, rgbLedBrightness, rgbLedDisplayBrightness, rgbLedCurrents, rgbLedBreakdown, sevenSegmentBrightness, sevenSegmentDisplayBrightness, sevenSegmentCurrents, sevenSegmentBreakdown, sevenSegmentCommonType, keypadPushed, irSensorDetected, irSensorOutputResistance, irSensorSupplyVoltage, irSensorBreakdown, gasSensorLevel, gasSensorHeaterVoltage, gasSensorSignalResistance, gasSensorSignalCurrent, gasSensorHeaterCurrent, gasSensorBreakdown, pirSensorPowered, pirSensorInRange, pirSensorNormalizedDistance, pirSensorDriveActive, pirSensorOutputDriven, pirSensorOutputTriggered, pirSensorSupplyVoltage, pirSensorOutputVoltage, pirSensorPullupResistance, pirSensorOutputCurrent, converged, diagnostics, warnings },
  }
}

/**
 * Prepare the extracted PIR range edge in runtime and jointly solve gas heater
 * resistance and PIR power-gated pullups. Every discarded solve receives this
 * same runtime snapshot, so storage/relay states are advanced only once.
 */
function preparePIRRuntime(project: Project, state: Runtime): Runtime {
  const pirSensors = project.parts.filter(part => family(part) === 'pirSensor')
  if (!pirSensors.length) return state
  const runtime: Runtime = {
    ...state,
    pirTargetPositions: { ...(state.pirTargetPositions ?? {}) },
    pirInRange: { ...(state.pirInRange ?? {}) },
    pirDrivePulses: { ...(state.pirDrivePulses ?? {}) },
  }
  for (const part of pirSensors) {
    const targetPosition = runtime.pirTargetPositions?.[part.id] ?? resolvePIRSensorTargetPosition(part.properties)
    const target = evaluatePIRSensorTarget(targetPosition)
    const wasRecorded = Object.prototype.hasOwnProperty.call(runtime.pirInRange ?? {}, part.id)
    const previous = wasRecorded ? runtime.pirInRange?.[part.id] : null
    const drivePulse = pirSensorDrivePulseOnTransition(previous, target.inRange)
    if (drivePulse) runtime.pirDrivePulses![part.id] = Math.max(1, runtime.pirDrivePulses?.[part.id] ?? 0)
    else runtime.pirDrivePulses![part.id] = Math.max(0, runtime.pirDrivePulses?.[part.id] ?? 0)
    runtime.pirTargetPositions![part.id] = target.targetPosition
    runtime.pirInRange![part.id] = target.inRange
  }
  return runtime
}

function prepareUltrasonicRuntime(project: Project, state: Runtime): Runtime {
  const sensors = project.parts.filter(part => family(part) === 'ultrasonicPing')
  if (!sensors.length) return state
  const runtime: Runtime = {
    ...state,
    ultrasonicTargetPositions: { ...(state.ultrasonicTargetPositions ?? {}) },
    ultrasonicStates: { ...(state.ultrasonicStates ?? {}) },
  }
  for (const part of sensors) {
    runtime.ultrasonicTargetPositions![part.id] ??= resolveUltrasonicTargetPosition(part.properties)
    runtime.ultrasonicStates![part.id] ??= initialUltrasonicPingState()
  }
  return runtime
}

function prepareTimer556Runtime(project: Project, state: Runtime): Runtime {
  const timers = project.parts.filter(part => family(part) === 'timer556')
  if (!timers.length) return state
  const runtime: Runtime = {
    ...state,
    timer556Latch: Object.fromEntries(Object.entries(state.timer556Latch ?? {}).map(([id, channels]) => [id, { ...channels }])),
    timer556PendingLatch: Object.fromEntries(Object.entries(state.timer556PendingLatch ?? {}).map(([id, channels]) => [id, { ...channels }])),
    timer556DelayRemainingSeconds: Object.fromEntries(Object.entries(state.timer556DelayRemainingSeconds ?? {}).map(([id, channels]) => [id, { ...channels }])),
  }
  for (const part of timers) {
    runtime.timer556Latch![part.id] ??= {}
    runtime.timer556Latch![part.id].A ??= TIMER555_MODEL.latch.initialHigh
    runtime.timer556Latch![part.id].B ??= TIMER555_MODEL.latch.initialHigh
  }
  return runtime
}

function prepareTimer555Runtime(project: Project, state: Runtime): Runtime {
  const timers = project.parts.filter(part => family(part) === 'timer555')
  if (!timers.length) return state
  const runtime: Runtime = {
    ...state,
    timer555Latch: { ...(state.timer555Latch ?? {}) },
    timer555PendingLatch: { ...(state.timer555PendingLatch ?? {}) },
    timer555DelayRemainingSeconds: { ...(state.timer555DelayRemainingSeconds ?? {}) },
  }
  for (const part of timers) runtime.timer555Latch![part.id] ??= TIMER555_MODEL.latch.initialHigh
  return runtime
}

/** Commit timer latch transitions only from the final accepted analog solution. */
function commitTimer555Step(
  project: Project,
  baseRuntime: Runtime,
  solved: ReturnType<typeof solveElectricalAttempt>,
  timeStepSeconds: number,
): ReturnType<typeof solveElectricalAttempt> {
  const timers = project.parts.filter(part => family(part) === 'timer555')
  if (!timers.length || !solved.simulation.converged) return solved
  const timer555Latch = { ...(baseRuntime.timer555Latch ?? {}) }
  const timer555PendingLatch = { ...(baseRuntime.timer555PendingLatch ?? {}) }
  const timer555DelayRemainingSeconds = { ...(baseRuntime.timer555DelayRemainingSeconds ?? {}) }
  const timer555LatchPending: NonNullable<Simulation['timer555LatchPending']> = { ...(solved.simulation.timer555LatchPending ?? {}) }

  for (const part of timers) {
    const read = (pin: string) => solved.simulation.voltages?.[`${part.id}:${pin}`] ?? 0
    const requested = requestedTimer555Latch({
      resetV: read('Reset'), groundV: read('GND'), thresholdV: read('THR'), controlV: read('CTRL'),
      referenceV: solved.simulation.timer555ReferenceVoltage?.[part.id] ?? 0, triggerV: read('TRIG'),
    })
    const next = advanceTimer555Latch({
      latchHigh: baseRuntime.timer555Latch?.[part.id] ?? TIMER555_MODEL.latch.initialHigh,
      pendingLatchHigh: baseRuntime.timer555PendingLatch?.[part.id],
      delayRemainingSeconds: baseRuntime.timer555DelayRemainingSeconds?.[part.id],
    }, requested, timeStepSeconds)
    timer555Latch[part.id] = next.latchHigh
    if (next.pendingLatchHigh === undefined) {
      delete timer555PendingLatch[part.id]
      delete timer555DelayRemainingSeconds[part.id]
    } else {
      timer555PendingLatch[part.id] = next.pendingLatchHigh
      timer555DelayRemainingSeconds[part.id] = next.delayRemainingSeconds ?? TIMER555_MODEL.latch.propagationDelaySeconds
    }
    timer555LatchPending[part.id] = next.pendingLatchHigh !== undefined
  }

  return {
    ...solved,
    runtime: { ...solved.runtime, timer555Latch, timer555PendingLatch, timer555DelayRemainingSeconds },
    simulation: { ...solved.simulation, timer555LatchPending },
  }
}

/** Commit both Timer556 channels once from the final accepted MNA solution. */
function commitTimer556Step(
  project: Project,
  baseRuntime: Runtime,
  solved: ReturnType<typeof solveElectricalAttempt>,
  timeStepSeconds: number,
): ReturnType<typeof solveElectricalAttempt> {
  const timers = project.parts.filter(part => family(part) === 'timer556')
  if (!timers.length || !solved.simulation.converged) return solved
  const timer556Latch = Object.fromEntries(Object.entries(baseRuntime.timer556Latch ?? {}).map(([id, channels]) => [id, { ...channels }]))
  const timer556PendingLatch = Object.fromEntries(Object.entries(baseRuntime.timer556PendingLatch ?? {}).map(([id, channels]) => [id, { ...channels }]))
  const timer556DelayRemainingSeconds = Object.fromEntries(Object.entries(baseRuntime.timer556DelayRemainingSeconds ?? {}).map(([id, channels]) => [id, { ...channels }]))
  const timer556Channels: NonNullable<Simulation['timer556Channels']> = { ...(solved.simulation.timer556Channels ?? {}) }

  for (const part of timers) {
    timer556Latch[part.id] ??= {}
    timer556PendingLatch[part.id] ??= {}
    timer556DelayRemainingSeconds[part.id] ??= {}
    const readings = { ...(timer556Channels[part.id] ?? {}) }
    for (const channel of ['A', 'B'] as const) {
      const pins = TIMER556_MODEL.channels[channel].pins
      const read = (pin: string) => solved.simulation.voltages?.[`${part.id}:${pin}`] ?? 0
      const requested = requestedTimer555Latch({
        resetV: read(pins.reset.engine), groundV: read(TIMER556_MODEL.sharedPins.ground.engine),
        thresholdV: read(pins.threshold.engine), controlV: read(pins.control.engine),
        referenceV: readings[channel]?.referenceVoltage ?? 0, triggerV: read(pins.trigger.engine),
      })
      const next = advanceTimer555Latch({
        latchHigh: baseRuntime.timer556Latch?.[part.id]?.[channel] ?? TIMER555_MODEL.latch.initialHigh,
        pendingLatchHigh: baseRuntime.timer556PendingLatch?.[part.id]?.[channel],
        delayRemainingSeconds: baseRuntime.timer556DelayRemainingSeconds?.[part.id]?.[channel],
      }, requested, timeStepSeconds)
      timer556Latch[part.id][channel] = next.latchHigh
      if (next.pendingLatchHigh === undefined) {
        delete timer556PendingLatch[part.id][channel]
        delete timer556DelayRemainingSeconds[part.id][channel]
      } else {
        timer556PendingLatch[part.id][channel] = next.pendingLatchHigh
        timer556DelayRemainingSeconds[part.id][channel] = next.delayRemainingSeconds ?? TIMER555_MODEL.latch.propagationDelaySeconds
      }
      if (readings[channel]) readings[channel] = { ...readings[channel], pending: next.pendingLatchHigh !== undefined }
    }
    timer556Channels[part.id] = readings as NonNullable<Simulation['timer556Channels']>[string]
  }

  return {
    ...solved,
    runtime: { ...solved.runtime, timer556Latch, timer556PendingLatch, timer556DelayRemainingSeconds },
    simulation: { ...solved.simulation, timer556Channels },
  }
}

/** Sample the trigger once, after the accepted analog solve for this interval. */
function commitUltrasonicPingStep(
  project: Project,
  baseRuntime: Runtime,
  solved: ReturnType<typeof solveElectricalAttempt>,
  simulationTimeSeconds: number,
): ReturnType<typeof solveElectricalAttempt> {
  const sensors = project.parts.filter(part => family(part) === 'ultrasonicPing')
  if (!sensors.length || !solved.simulation.converged) return solved
  const ultrasonicStates = { ...(baseRuntime.ultrasonicStates ?? {}) }
  const ultrasonicPing: NonNullable<Simulation['ultrasonicPing']> = { ...(solved.simulation.ultrasonicPing ?? {}) }
  for (const part of sensors) {
    const terminals = ULTRASONIC_PING_MODEL.terminals
    const previous = baseRuntime.ultrasonicStates?.[part.id] ?? initialUltrasonicPingState()
    const targetPosition = baseRuntime.ultrasonicTargetPositions?.[part.id] ?? resolveUltrasonicTargetPosition(part.properties)
    const target = evaluateUltrasonicTarget(targetPosition)
    const hasSeparateInterface = projectReferencesPin(project, part, terminals.trigger.engine) || projectReferencesPin(project, part, terminals.echo.engine)
    const triggerPin = hasSeparateInterface ? terminals.trigger.engine : terminals.signal.engine
    const triggerVoltage = solved.simulation.voltages?.[`${part.id}:${triggerPin}`] ?? 0
    const next = advanceUltrasonicPingState(previous, triggerVoltage, simulationTimeSeconds, target.normalizedDistance)
    ultrasonicStates[part.id] = next
    const reading = ultrasonicPing[part.id]
    if (reading) ultrasonicPing[part.id] = {
      ...reading,
      targetPosition,
      phase: next.phase,
      triggerHigh: next.triggerLevelHigh,
      lastTriggerPulseSeconds: next.lastTriggerPulseSeconds,
      echoStartsAtSeconds: next.echoStartsAtSeconds,
      echoEndsAtSeconds: next.echoEndsAtSeconds,
      acceptedPings: next.acceptedPings,
      rejectedShortPulses: next.rejectedShortPulses,
    }
  }
  return {
    ...solved,
    runtime: { ...solved.runtime, ultrasonicStates },
    simulation: { ...solved.simulation, ultrasonicPing },
  }
}

function simulateElectricalStep(project: Project, state: Runtime, timeStepSeconds = 0, simulationTimeSeconds = 0): { simulation: Simulation; runtime: Runtime } {
  const gasSensors = project.parts.filter(part => family(part) === 'gasSensor')
  const pirSensors = project.parts.filter(part => family(part) === 'pirSensor')
  const timer555s = project.parts.filter(part => family(part) === 'timer555')
  const timer556s = project.parts.filter(part => family(part) === 'timer556')
  const ultrasonicSensors = project.parts.filter(part => family(part) === 'ultrasonicPing')
  if (gasSensors.length === 0 && pirSensors.length === 0 && timer555s.length === 0 && timer556s.length === 0 && ultrasonicSensors.length === 0) return solveElectricalAttempt(project, state, timeStepSeconds, simulationTimeSeconds)
  // All fixed-point retries start from the same snapshot. Timer delay/latch and
  // capacitor state are committed only after the coupled sensor solve succeeds.
  const runtime = prepareTimer556Runtime(project, prepareTimer555Runtime(project, prepareUltrasonicRuntime(project, preparePIRRuntime(project, state))))

  const gasLevels: Record<string, number> = {}
  const gasResistances: Record<string, number> = {}
  for (const part of gasSensors) {
    gasLevels[part.id] = evaluateGasSensor({ sensorLevel: runtime.gasSensorLevel?.[part.id] }).sensorLevel
    gasResistances[part.id] = evaluateGasSensor({ heaterVoltageV: 0, sensorLevel: gasLevels[part.id] }).signalResistanceOhms
  }

  const pirResistances: Record<string, number> = {}
  for (const part of pirSensors) pirResistances[part.id] = PIR_SENSOR_MODEL.output.inactivePullupOhms

  const ultrasonicResistances: Record<string, number> = {}
  for (const part of ultrasonicSensors) ultrasonicResistances[part.id] = ULTRASONIC_PING_MODEL.electrical.echoInactivePullupOhms

  let last: ReturnType<typeof solveElectricalAttempt> | undefined
  const maximumAttempts = 12
  const relativeTolerance = 1e-6
  for (let attemptIndex = 0; attemptIndex < maximumAttempts; attemptIndex++) {
    // Re-run coupled gas and PIR branches from this same runtime snapshot.
    last = solveElectricalAttempt(project, runtime, timeStepSeconds, simulationTimeSeconds, gasResistances, pirResistances, ultrasonicResistances)
    if (!last.simulation.converged) return { ...last, runtime: state }

    let stable = true
    const gasTargets: Record<string, number> = {}
    const pirTargets: Record<string, number> = {}
    const ultrasonicTargets: Record<string, number> = {}
    for (const part of gasSensors) {
      const heaterVoltage = last.simulation.gasSensorHeaterVoltage?.[part.id] ?? 0
      const target = evaluateGasSensor({ heaterVoltageV: heaterVoltage, sensorLevel: gasLevels[part.id] }).signalResistanceOhms
      gasTargets[part.id] = target
      if (Math.abs(target - gasResistances[part.id]) / Math.max(Math.abs(target), 1) > relativeTolerance) stable = false
    }
    for (const part of pirSensors) {
      const supplyVoltage = last.simulation.pirSensorSupplyVoltage?.[part.id] ?? 0
      const drive = (runtime.pirDrivePulses?.[part.id] ?? 0) > 0
      const target = createPIRSensorTopology(supplyVoltage, drive).pullupResistanceOhms
      pirTargets[part.id] = target
      if (target !== pirResistances[part.id]) stable = false
    }
    for (const part of ultrasonicSensors) {
      const supplyVoltage = last.simulation.ultrasonicPing?.[part.id]?.supplyVoltage ?? 0
      const stateAtStart = runtime.ultrasonicStates?.[part.id] ?? initialUltrasonicPingState()
      const intervalStart = timeStepSeconds > 0 ? simulationTimeSeconds - timeStepSeconds : simulationTimeSeconds
      const echoActive = ultrasonicEchoActiveAt(stateAtStart, intervalStart)
      const target = ultrasonicEchoResistanceOhms(supplyVoltage, echoActive)
      ultrasonicTargets[part.id] = target
      if (Math.abs(target - ultrasonicResistances[part.id]) / Math.max(Math.abs(target), 1) > relativeTolerance) stable = false
    }
    if (stable) {
      const timersSolved = commitTimer556Step(project, runtime, commitTimer555Step(project, runtime, last, timeStepSeconds), timeStepSeconds)
      return commitUltrasonicPingStep(project, runtime, timersSolved, simulationTimeSeconds)
    }

    for (const part of gasSensors) {
      const current = gasResistances[part.id]
      const target = gasTargets[part.id]
      gasResistances[part.id] = attemptIndex === 0 ? target : current + 0.5 * (target - current)
    }
    for (const part of pirSensors) pirResistances[part.id] = pirTargets[part.id]
    for (const part of ultrasonicSensors) ultrasonicResistances[part.id] = ultrasonicTargets[part.id]
  }

  const simulation = last!.simulation
  const models = [gasSensors.length ? 'sensor de gás' : '', pirSensors.length ? 'sensor PIR' : '', ultrasonicSensors.length ? 'sensor ultrassônico' : ''].filter(Boolean).join(' e ')
  return {
    runtime: state,
    simulation: {
      ...simulation,
      converged: false,
      diagnostics: [...(simulation.diagnostics ?? []), `O ponto fixo do ${models} não convergiu após 12 tentativas.`],
      warnings: [],
    },
  }
}

/** Integrate transient circuits with bounded backward-Euler substeps. */
export function simulateElectrical(project: Project, state: Runtime, timeStepSeconds = 0, simulationTimeSeconds = 0, maximumSubstepSeconds = 0.01): { simulation: Simulation; runtime: Runtime } {
  const dt = Number.isFinite(timeStepSeconds) && timeStepSeconds > 0 ? timeStepSeconds : 0
  const currentTime = Number.isFinite(simulationTimeSeconds) ? simulationTimeSeconds : 0
  const requestedMaximumStep = Number.isFinite(maximumSubstepSeconds) && maximumSubstepSeconds > 0 ? maximumSubstepSeconds : 0.01
  const hasRelay = project.parts.some(part => family(part) === 'relay')
  const maximumStep = hasRelay ? Math.min(requestedMaximumStep, 0.001) : requestedMaximumStep
  const hasDynamicComponent = project.parts.some(part => ['capacitor', 'polarizedCapacitor', 'inductor', 'relay', 'timer555', 'timer556', 'ultrasonicPing'].includes(family(part) ?? '') || hasBatteryParasiticCapacitor(part))
  if (!dt || !hasDynamicComponent) return simulateElectricalStep(project, state, dt, currentTime)

  const steps = Math.min(500, Math.max(1, Math.ceil(dt / maximumStep)))
  const substep = dt / steps
  let result: ReturnType<typeof simulateElectricalStep> | undefined
  let runtime = state
  const hasUltrasonic = project.parts.some(part => family(part) === 'ultrasonicPing')
  const hasTimers = project.parts.some(part => ['timer555', 'timer556'].includes(family(part) ?? ''))
  const hasScheduledEvents = hasUltrasonic || hasTimers
  const initialTime = currentTime - dt
  for (let index = 0; index < steps; index++) {
    const nominalEnd = initialTime + (index + 1) * substep
    if (!hasScheduledEvents) {
      result = simulateElectricalStep(project, runtime, substep, nominalEnd)
      runtime = result.runtime
      if (!result.simulation.converged) break
      continue
    }
    let cursor = initialTime + index * substep
    let boundarySteps = 0
    while (cursor < nominalEnd - 1e-15) {
      let edge: number | undefined
      for (const part of project.parts) {
        const kind = family(part)
        if (kind === 'ultrasonicPing') {
          const deadline = nextUltrasonicDeadline(runtime.ultrasonicStates?.[part.id] ?? initialUltrasonicPingState(), cursor, nominalEnd)
          if (deadline !== undefined && (edge === undefined || deadline < edge)) edge = deadline
        }
        const timerDelays = kind === 'timer555'
          ? [runtime.timer555DelayRemainingSeconds?.[part.id]]
          : kind === 'timer556'
            ? Object.values(runtime.timer556DelayRemainingSeconds?.[part.id] ?? {})
            : []
        for (const delay of timerDelays) {
          if (delay === undefined || delay <= 0) continue
          const deadline = cursor + delay
          if (deadline < nominalEnd - 1e-15 && (edge === undefined || deadline < edge)) edge = deadline
        }
      }
      const segmentEnd = edge ?? nominalEnd
      result = simulateElectricalStep(project, runtime, segmentEnd - cursor, segmentEnd)
      runtime = result.runtime
      boundarySteps++
      if (!result.simulation.converged) break
      if (boundarySteps > 500) {
        result = {
          runtime: state,
          simulation: {
            ...result.simulation,
            converged: false,
            diagnostics: [...(result.simulation.diagnostics ?? []), 'O escalonador ultrassônico excedeu 500 subpassos nesta etapa.'],
            warnings: [],
          },
        }
        break
      }
      cursor = segmentEnd
    }
    if (result && !result.simulation.converged) break
  }
  return result ?? simulateElectricalStep(project, state, dt, currentTime)
}

/** Backward-compatible steady-state helper. */
export function simulateDc(project: Project, state: Runtime): { simulation: Simulation; runtime: Runtime } {
  return simulateElectrical(project, state, 0)
}
