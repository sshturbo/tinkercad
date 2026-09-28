import { describe, expect, it } from 'vitest'
import {
  getVoltageRegulatorModel,
  isVoltageRegulatorModel,
  voltageRegulatorBreakdown,
  voltageRegulatorInputResistance,
  voltageRegulatorOutputCurrent,
  voltageRegulatorSetpoint,
  VOLTAGE_REGULATOR_MODELS,
} from './voltageRegulatorModels'

describe('descritores dos reguladores de tensão extraídos', () => {
  it('reconhece os dois modelos e mantém os pinmaps físicos distintos', () => {
    expect(VOLTAGE_REGULATOR_MODELS).toEqual(['voltageRegulator5V', 'voltageRegulator3p3V'])
    for (const model of VOLTAGE_REGULATOR_MODELS) expect(isVoltageRegulatorModel(model)).toBe(true)
    expect(isVoltageRegulatorModel('lm7805')).toBe(false)
    expect(isVoltageRegulatorModel(undefined)).toBe(false)
    expect(getVoltageRegulatorModel('unknown')).toBeUndefined()

    expect(getVoltageRegulatorModel('voltageRegulator5V')).toMatchObject({
      partName: 'LM7805',
      packagePins: { '1': 'in', '2': 'gnd', '3': 'out' },
      breadboardPins: { In: 'in', Ground: 'gnd', Out: 'out' },
      terminals: { input: 'in', ground: 'gnd', output: 'out' },
    })
    expect(getVoltageRegulatorModel('voltageRegulator3p3V')).toMatchObject({
      partName: 'LD1117V33',
      packagePins: { '1': 'gnd', '2': 'out', '3': 'in' },
      breadboardPins: { In: 'in', Ground: 'gnd', Out: 'out' },
      terminals: { input: 'in', ground: 'gnd', output: 'out' },
    })
  })

  it('preserva o perfil de subida, faixa regulada e queda em sobretensão do LM7805', () => {
    expect(voltageRegulatorSetpoint('voltageRegulator5V', 1.99)).toBe(0)
    expect(voltageRegulatorSetpoint('voltageRegulator5V', 2)).toBe(0)
    expect(voltageRegulatorSetpoint('voltageRegulator5V', 3.5)).toBeCloseTo(1.5, 12)
    expect(voltageRegulatorSetpoint('voltageRegulator5V', 7)).toBe(5)
    expect(voltageRegulatorSetpoint('voltageRegulator5V', 34.99)).toBe(5)
    expect(voltageRegulatorSetpoint('voltageRegulator5V', 35)).toBe(5)
    expect(voltageRegulatorSetpoint('voltageRegulator5V', 35.5)).toBe(2.5)
    expect(voltageRegulatorSetpoint('voltageRegulator5V', 36)).toBe(0)
    expect(voltageRegulatorSetpoint('voltageRegulator5V', 36.01)).toBe(0)
  })

  it('preserva o perfil de subida, faixa regulada e queda em sobretensão do LD1117V33', () => {
    expect(voltageRegulatorSetpoint('voltageRegulator3p3V', 0.99)).toBe(0)
    expect(voltageRegulatorSetpoint('voltageRegulator3p3V', 1)).toBe(0)
    expect(voltageRegulatorSetpoint('voltageRegulator3p3V', 2.5)).toBeCloseTo(1.5, 12)
    expect(voltageRegulatorSetpoint('voltageRegulator3p3V', 4.3)).toBe(3.3)
    expect(voltageRegulatorSetpoint('voltageRegulator3p3V', 14.99)).toBe(3.3)
    expect(voltageRegulatorSetpoint('voltageRegulator3p3V', 15)).toBe(3.3)
    expect(voltageRegulatorSetpoint('voltageRegulator3p3V', 15.5)).toBeCloseTo(1.65, 12)
    expect(voltageRegulatorSetpoint('voltageRegulator3p3V', 16)).toBe(0)
    expect(voltageRegulatorSetpoint('voltageRegulator3p3V', 16.01)).toBe(0)
  })

  it('reproduz a fonte de saída com resistência série e limitação assimétrica', () => {
    expect(voltageRegulatorOutputCurrent('voltageRegulator5V', 12, 0)).toBe(1.5)
    expect(voltageRegulatorOutputCurrent('voltageRegulator5V', 12, 4.99)).toBeCloseTo((5 - 4.99) / 0.017, 12)
    expect(voltageRegulatorOutputCurrent('voltageRegulator5V', 12, 5.1)).toBeCloseTo(-0.1 / 0.017, 12)
    expect(voltageRegulatorOutputCurrent('voltageRegulator3p3V', 5, 0)).toBe(1.3)
  })

  it('reproduz o consumo de entrada em vazio e dependente da corrente de saída', () => {
    expect(voltageRegulatorInputResistance(12, 0)).toBe(1e10)
    expect(voltageRegulatorInputResistance(12, 0.999e-6)).toBe(1e10)
    expect(voltageRegulatorInputResistance(12, 1e-6)).toBeCloseTo(12 / 0.005001, 12)
    expect(voltageRegulatorInputResistance(12, 0.5)).toBeCloseTo(12 / 0.505, 12)
  })

  it('usa os limites estritos de breakdown originais', () => {
    expect(voltageRegulatorBreakdown('voltageRegulator5V', -0.25, 1.5)).toEqual({
      inputOutOfRange: false,
      outputOvercurrent: false,
      broken: false,
    })
    expect(voltageRegulatorBreakdown('voltageRegulator5V', -0.251, 1.501)).toEqual({
      inputOutOfRange: true,
      outputOvercurrent: true,
      broken: true,
    })
    expect(voltageRegulatorBreakdown('voltageRegulator3p3V', 15, 0).broken).toBe(false)
    expect(voltageRegulatorBreakdown('voltageRegulator3p3V', 15.001, 0).inputOutOfRange).toBe(true)
  })

  it('devolve descritores imutáveis', () => {
    const descriptor = getVoltageRegulatorModel('voltageRegulator5V')
    expect(Object.isFrozen(descriptor)).toBe(true)
    expect(descriptor && Object.isFrozen(descriptor.terminals)).toBe(true)
    expect(descriptor && Object.isFrozen(descriptor.packagePins)).toBe(true)
    expect(descriptor && Object.isFrozen(descriptor.breakdownInputRangeV)).toBe(true)
  })
})
