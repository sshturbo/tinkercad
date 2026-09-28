import { describe, expect, it } from 'vitest'
import { evaluateVoltageRegulator } from './voltageRegulatorEquations'

describe('equações MNA dos reguladores extraídos', () => {
  it('regula para 5 V com resistência de saída e consumo de entrada', () => {
    const result = evaluateVoltageRegulator('voltageRegulator5V', [12, 0, 4.99])!
    expect(result.currents[2]).toBeCloseTo(-10 / 17, 10)
    expect(result.currents[0]).toBeCloseTo(10 / 17 + 0.005, 10)
    expect(result.currents.reduce((sum, current) => sum + current, 0)).toBeCloseTo(0, 12)
  })

  it('preserva a limitação unilateral de corrente de saída', () => {
    const atShort = evaluateVoltageRegulator('voltageRegulator5V', [12, 0, 0])!
    const reverseCurrent = evaluateVoltageRegulator('voltageRegulator5V', [12, 0, 6])!
    expect(atShort.currents[2]).toBe(-1.5)
    expect(atShort.currents[0]).toBe(1.505)
    expect(reverseCurrent.currents[2]).toBeGreaterThan(0)
    expect(evaluateVoltageRegulator('voltageRegulator3p3V', [5, 0, 0])?.currents[2]).toBe(-1.3)
  })

  it('mantém corrente de fuga de entrada com saída ociosa ou desligada', () => {
    expect(evaluateVoltageRegulator('voltageRegulator5V', [12, 0, 5])?.currents[0]).toBeCloseTo(12 / 1e10, 12)
    const disabled = evaluateVoltageRegulator('voltageRegulator5V', [1, 0, 0])!
    expect(disabled.currents[2]).toBeCloseTo(0, 12)
    expect(disabled.currents[0]).toBeCloseTo(1e-10, 20)
  })

  it('tem jacobiano consistente com as inclinações piecewise do modelo', () => {
    for (const [model, values] of [
      ['voltageRegulator5V', [12, 0, 4.99]],
      ['voltageRegulator5V', [12, 0, 0.01]],
      ['voltageRegulator3p3V', [5, 0, 3.29]],
    ] as const) {
      const result = evaluateVoltageRegulator(model, values as [number, number, number])!
      for (let row = 0; row < 3; row++) for (let column = 0; column < 3; column++) {
        const plus = [...values] as [number, number, number]
        const minus = [...values] as [number, number, number]
        plus[column] += 1e-6
        minus[column] -= 1e-6
        const delta = (evaluateVoltageRegulator(model, plus)!.currents[row] - evaluateVoltageRegulator(model, minus)!.currents[row]) / 2e-6
        expect(result.jacobian[row][column]).toBeCloseTo(delta, 5)
      }
    }
  })
})
