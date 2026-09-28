import { describe, expect, it } from 'vitest'
import {
  createIRSensorTopology,
  evaluateIRSensorSupplyVoltage,
  irSensorOpenCircuitOutputVoltage,
  irSensorOpenCircuitSupplyCurrent,
  IR_SENSOR_MODEL,
  resolveIRSensorDetection,
  resolveIRSensorTerminal,
} from './irSensorModel'

describe('contrato extraído do sensor IR TSOP41', () => {
  it('registra origem, aliases Power/GND/Out e terminais Vcc/Gnd/Out', () => {
    expect(IR_SENSOR_MODEL).toMatchObject({
      id: 'IRsensor',
      moduleSource: 'tinkercad-engine-complete-extracted/models/IRsensor--module-76617.js',
      terminals: {
        vcc: { engine: 'Vcc', breadboard: 'Power', schematic: 'Vcc' },
        ground: { engine: 'Gnd', breadboard: 'GND', schematic: 'Gnd' },
        output: { engine: 'Out', breadboard: 'Out', schematic: 'Out' },
      },
      control: {
        property: 'irDetected', defaultDetected: false, extractedSignal: 'ether.IR38kHz',
        simulatesCarrierOrDemodulation: false,
      },
      resistors: {
        supplyShuntOhms: 3300, pullupOhms: 25000,
        outputToGroundDetectedOhms: 250, outputToGroundDarkOhms: 1e8,
      },
      operatingLimits: { minimumSupplyVoltageV: -0.3, maximumSupplyVoltageV: 6 },
    })

    expect(resolveIRSensorTerminal('Power')).toBe('vcc')
    expect(resolveIRSensorTerminal('Vcc')).toBe('vcc')
    expect(resolveIRSensorTerminal('GND')).toBe('ground')
    expect(resolveIRSensorTerminal('Gnd')).toBe('ground')
    expect(resolveIRSensorTerminal('Out')).toBe('output')
    expect(resolveIRSensorTerminal(' output ')).toBe('output')
    expect(resolveIRSensorTerminal('unknown')).toBeUndefined()
    expect(resolveIRSensorTerminal(undefined)).toBeUndefined()
  })

  it('usa os três ramos resistivos extraídos no estado escuro e detectado', () => {
    expect(createIRSensorTopology()).toEqual({
      irDetected: false,
      branches: [
        { name: 'vccToGround', from: 'vcc', to: 'ground', resistanceOhms: 3300 },
        { name: 'vccToOutput', from: 'vcc', to: 'output', resistanceOhms: 25000 },
        { name: 'outputToGround', from: 'output', to: 'ground', resistanceOhms: 1e8 },
      ],
    })
    expect(createIRSensorTopology(true)).toEqual({
      irDetected: true,
      branches: [
        { name: 'vccToGround', from: 'vcc', to: 'ground', resistanceOhms: 3300 },
        { name: 'vccToOutput', from: 'vcc', to: 'output', resistanceOhms: 25000 },
        { name: 'outputToGround', from: 'output', to: 'ground', resistanceOhms: 250 },
      ],
    })
    expect(resolveIRSensorDetection(undefined)).toBe(false)
    expect(resolveIRSensorDetection(true)).toBe(true)
    expect(resolveIRSensorDetection('on')).toBe(true)
    expect(resolveIRSensorDetection('false')).toBe(false)
  })

  it('reproduz divisor de saída e corrente de alimentação sem carga externa a 5 V', () => {
    expect(irSensorOpenCircuitOutputVoltage(5, false)).toBeCloseTo(4.9987503124, 9)
    expect(irSensorOpenCircuitOutputVoltage(5, true)).toBeCloseTo(0.0495049505, 9)
    expect(irSensorOpenCircuitSupplyCurrent(5, false)).toBeCloseTo(5 / 3300 + 5 / (25000 + 1e8), 15)
    expect(irSensorOpenCircuitSupplyCurrent(5, true)).toBeCloseTo(5 / 3300 + 5 / (25000 + 250), 15)
  })

  it('usa limites de alimentação estritos de −0,3 V e 6 V', () => {
    expect(evaluateIRSensorSupplyVoltage(-0.3).breakdown).toBe(false)
    expect(evaluateIRSensorSupplyVoltage(6).breakdown).toBe(false)
    expect(evaluateIRSensorSupplyVoltage(-0.300001).breakdown).toBe(true)
    expect(evaluateIRSensorSupplyVoltage(6.000001).breakdown).toBe(true)
    expect(evaluateIRSensorSupplyVoltage(5)).toEqual({ voltageV: 5, breakdown: false })
    expect(evaluateIRSensorSupplyVoltage(Number.NaN).breakdown).toBe(false)
  })
})
