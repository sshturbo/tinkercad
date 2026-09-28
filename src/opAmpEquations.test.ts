import { describe, expect, it } from 'vitest'
import { evaluateUA741 } from './opAmpEquations'

describe('equações MNA do UA741 extraído', () => {
  it('conserva corrente entre os cinco terminais e respeita a carga de alimentação', () => {
    const result = evaluateUA741([0.00001, 0, 15, 0, 7.5])
    expect(result.currents.reduce((sum, current) => sum + current, 0)).toBeCloseTo(0, 12)
    expect(result.currents[2] + result.currents[4]).toBeCloseTo(15 / (30 / 0.0033), 12)
    expect(result.currents[0]).toBeCloseTo(0.00001 / 2e6, 15)
  })

  it('tem derivadas consistentes antes e depois da saturação pelos trilhos', () => {
    for (const values of [
      [0.00001875, 0, 15, 0, 4] as [number, number, number, number, number],
      [0.001, 0, 15, 0, 14] as [number, number, number, number, number],
    ]) {
      const result = evaluateUA741(values)
      for (let row = 0; row < 5; row++) for (let column = 0; column < 5; column++) {
        const epsilon = column < 2 ? 1e-9 : 1e-6
        const plus = [...values] as typeof values
        const minus = [...values] as typeof values
        plus[column] += epsilon
        minus[column] -= epsilon
        const numerical = (evaluateUA741(plus).currents[row] - evaluateUA741(minus).currents[row]) / (2 * epsilon)
        expect(result.jacobian[row][column]).toBeCloseTo(numerical, 4)
      }
    }
  })

  it('desliga o ganho aberto quando os trilhos não estão na ordem válida', () => {
    const result = evaluateUA741([1, 0, 0, 5, 2])
    expect(result.currents[4]).toBeCloseTo(-3 / 75, 12)
    expect(result.jacobian[4][0]).toBe(0)
    expect(result.currents.reduce((sum, current) => sum + current, 0)).toBeCloseTo(0, 12)
  })
})
