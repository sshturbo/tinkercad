import { describe, expect, it } from 'vitest'
import { evaluateMnaResidual } from './mnaResidual'

describe('resíduo físico do MNA', () => {
  it('rejeita 9 mA de erro de KCL apesar de a tensão estar dentro do antigo delta de 1e-8', () => {
    const result = evaluateMnaResidual([[1e6]], [0], [9e-9], 1)

    expect(result.converged).toBe(false)
    expect(result.maximumKclResidualA).toBeCloseTo(9e-3, 12)
    expect(result.maximumKclLimitA).toBeLessThan(1e-6)
  })

  it('separa erro de corrente nos nós de erro de restrição das fontes', () => {
    expect(evaluateMnaResidual([[1]], [1], [1 + 1e-10], 1).converged).toBe(true)
    expect(evaluateMnaResidual([[1, 1]], [5], [0, 4.999], 0).converged).toBe(false)
  })

  it('inclui o erro de corrente não linear além do resíduo da matriz linearizada', () => {
    const result = evaluateMnaResidual([[0]], [0], [0], 1, [2e-6])

    expect(result.converged).toBe(false)
    expect(result.maximumKclResidualA).toBe(2e-6)
  })
})
