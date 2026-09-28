/**
 * Resistor-network contract transcribed from extracted module 76617
 * (`IRsensor--module-76617.js`).
 *
 * `irDetected` is a local boolean abstraction for the extracted
 * `ether.IR38kHz` signal. It selects the detected/dark output resistance; it
 * does not simulate a 38 kHz carrier, optical path, or demodulation.
 */
export const IR_SENSOR_MODEL = Object.freeze({
  id: 'IRsensor',
  moduleSource: 'tinkercad-engine-complete-extracted/models/IRsensor--module-76617.js',
  terminals: Object.freeze({
    vcc: Object.freeze({ engine: 'Vcc', breadboard: 'Power', schematic: 'Vcc' }),
    ground: Object.freeze({ engine: 'Gnd', breadboard: 'GND', schematic: 'Gnd' }),
    output: Object.freeze({ engine: 'Out', breadboard: 'Out', schematic: 'Out' }),
  }),
  control: Object.freeze({
    property: 'irDetected',
    defaultDetected: false,
    extractedSignal: 'ether.IR38kHz',
    simulatesCarrierOrDemodulation: false,
  }),
  resistors: Object.freeze({
    supplyShuntOhms: 3300,
    pullupOhms: 25000,
    outputToGroundDetectedOhms: 250,
    outputToGroundDarkOhms: 1e8,
  }),
  operatingLimits: Object.freeze({
    minimumSupplyVoltageV: -0.3,
    maximumSupplyVoltageV: 6,
  }),
})

export type IRSensorTerminal = keyof typeof IR_SENSOR_MODEL.terminals
export type IRSensorBranchName = 'vccToGround' | 'vccToOutput' | 'outputToGround'

export type IRSensorResistorBranch = Readonly<{
  name: IRSensorBranchName
  from: IRSensorTerminal
  to: IRSensorTerminal
  resistanceOhms: number
}>

export type IRSensorTopology = Readonly<{
  irDetected: boolean
  branches: readonly IRSensorResistorBranch[]
}>

export type IRSensorSupplyStatus = Readonly<{
  voltageV: number
  breakdown: boolean
}>

/** Resolve physical breadboard and schematic names to the three electrical terminals. */
export function resolveIRSensorTerminal(terminal: unknown): IRSensorTerminal | undefined {
  if (typeof terminal !== 'string') return undefined
  const normalized = terminal.trim().toLowerCase()
  if (normalized === 'power' || normalized === 'vcc') return 'vcc'
  if (normalized === 'gnd' || normalized === 'ground') return 'ground'
  if (normalized === 'out' || normalized === 'output') return 'output'
  return undefined
}

/** Interpret a saved/local control value; absence preserves the extracted dark default. */
export function resolveIRSensorDetection(value?: unknown): boolean {
  return value === true || value === 1 || ['true', '1', 'yes', 'on'].includes(String(value ?? '').trim().toLowerCase())
}

/** Return the exact three resistor branches in the extracted TSOP41 model. */
export function createIRSensorTopology(irDetected: boolean = IR_SENSOR_MODEL.control.defaultDetected): IRSensorTopology {
  const { resistors } = IR_SENSOR_MODEL
  return Object.freeze({
    irDetected,
    branches: Object.freeze([
      Object.freeze({ name: 'vccToGround' as const, from: 'vcc' as const, to: 'ground' as const, resistanceOhms: resistors.supplyShuntOhms }),
      Object.freeze({ name: 'vccToOutput' as const, from: 'vcc' as const, to: 'output' as const, resistanceOhms: resistors.pullupOhms }),
      Object.freeze({
        name: 'outputToGround' as const,
        from: 'output' as const,
        to: 'ground' as const,
        resistanceOhms: irDetected ? resistors.outputToGroundDetectedOhms : resistors.outputToGroundDarkOhms,
      }),
    ]),
  })
}

/** Extracted check is strict: breakdown only below −0.3 V or above 6 V. */
export function evaluateIRSensorSupplyVoltage(voltageV: number): IRSensorSupplyStatus {
  return Object.freeze({
    voltageV,
    breakdown: Number.isFinite(voltageV)
      && (voltageV < IR_SENSOR_MODEL.operatingLimits.minimumSupplyVoltageV
        || voltageV > IR_SENSOR_MODEL.operatingLimits.maximumSupplyVoltageV),
  })
}

/**
 * Unloaded output divider only. In a real circuit, external loads must be
 * included in the MNA solution instead of using this convenience calculation.
 */
export function irSensorOpenCircuitOutputVoltage(supplyVoltageV: number, irDetected: boolean = false): number {
  const { pullupOhms, outputToGroundDetectedOhms, outputToGroundDarkOhms } = IR_SENSOR_MODEL.resistors
  const outputResistance = irDetected ? outputToGroundDetectedOhms : outputToGroundDarkOhms
  return supplyVoltageV * outputResistance / (pullupOhms + outputResistance)
}

/** Supply current into the extracted resistor network with its output unloaded. */
export function irSensorOpenCircuitSupplyCurrent(supplyVoltageV: number, irDetected: boolean = false): number {
  const topology = createIRSensorTopology(irDetected)
  const shunt = topology.branches[0].resistanceOhms
  const outputPath = topology.branches[1].resistanceOhms + topology.branches[2].resistanceOhms
  return supplyVoltageV / shunt + supplyVoltageV / outputPath
}
