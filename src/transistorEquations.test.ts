import { describe, expect, it } from 'vitest'
import { evaluateBipolarTransistor, evaluateMOSFET } from './transistorEquations'

function finiteDifference(model: (values: [number, number, number]) => { currents: [number, number, number] } | undefined, values: [number, number, number], row: number, column: number) {
  const epsilon = 1e-6
  const plus = [...values] as [number, number, number]
  const minus = [...values] as [number, number, number]
  plus[column] += epsilon
  minus[column] -= epsilon
  return ((model(plus)?.currents[row] ?? 0) - (model(minus)?.currents[row] ?? 0)) / (2 * epsilon)
}

describe('equações de transistores extraídas', () => {
  it('mantém a soma das correntes e o jacobiano de NPN/PNP', () => {
    for (const [model, voltages] of [
      ['npn', [0.72, 0, 2.5]],
      ['pnp', [4.28, 5, 2.5]],
    ] as const) {
      const result = evaluateBipolarTransistor(model, voltages as [number, number, number])!
      expect(result.currents.reduce((sum, current) => sum + current, 0)).toBeCloseTo(0, 12)
      for (let row = 0; row < 3; row++) for (let column = 0; column < 3; column++) {
        expect(result.jacobian[row][column]).toBeCloseTo(finiteDifference(v => evaluateBipolarTransistor(model, v), [...voltages] as [number, number, number], row, column), 5)
      }
    }
  })

  it('avalia junção direta e bloqueio de BJT com as polaridades certas', () => {
    const npnOn = evaluateBipolarTransistor('npn', [0.72, 0, 5])!
    const npnOff = evaluateBipolarTransistor('npn', [0, 0, 5])!
    const pnpOn = evaluateBipolarTransistor('pnp', [4.28, 5, 0])!
    expect(npnOn.currents[2]).toBeGreaterThan(0)
    expect(npnOff.currents[2]).toBeCloseTo(2.71e-14, 15)
    expect(pnpOn.currents[2]).toBeLessThan(0)
  })

  it('mantém derivadas do canal nMOS e pMOS nas regiões de tríodo e saturação', () => {
    const operatingPoints: [string, [number, number, number]][] = [
      ['nmos', [3, 0, 1]], ['nmos', [3, 0, 4]],
      ['pmos', [2, 5, 4]], ['pmos', [2, 5, 0]],
    ]
    for (const [model, voltages] of operatingPoints) {
      const result = evaluateMOSFET(model, voltages)!
      for (let row = 0; row < 3; row++) for (let column = 0; column < 3; column++) {
        const numerical = finiteDifference(v => evaluateMOSFET(model, v), voltages, row, column)
        expect(result.jacobian[row][column]).toBeCloseTo(numerical, 7)
      }
    }
  })

  it('usa o diodo de corpo e a fuga da porta nos quatro modelos MOSFET', () => {
    for (const model of ['nmos', 'power_nmos', 'pmos', 'power_pmos']) {
      const result = evaluateMOSFET(model, [1, 0, 0])!
      expect(result.currents.every(Number.isFinite)).toBe(true)
      expect(result.currents.reduce((sum, current) => sum + current, 0)).toBeCloseTo(0, 12)
    }
    expect(evaluateMOSFET('nmos', [0, 5, 0])!.currents[0]).toBeCloseTo(-5e-12, 20)
    expect(evaluateMOSFET('unknown', [0, 0, 0])).toBeUndefined()
  })
})
