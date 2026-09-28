export type MnaResidualResult = Readonly<{
  converged: boolean
  maximumKclResidualA: number
  maximumKclLimitA: number
  maximumVoltageConstraintResidualV: number
  maximumVoltageConstraintLimitV: number
}>

const KCL_ABSOLUTE_TOLERANCE_A = 1e-9
const KCL_RELATIVE_TOLERANCE = 1e-6
const VOLTAGE_ABSOLUTE_TOLERANCE_V = 1e-9
const VOLTAGE_RELATIVE_TOLERANCE = 1e-8

/** Check the physical residual of a candidate MNA solution. Node rows are KCL (A); source rows are voltage constraints (V). */
export function evaluateMnaResidual(
  matrix: readonly (readonly number[])[],
  rhs: readonly number[],
  values: readonly number[],
  nodeCount: number,
  nonlinearCurrentCorrections: readonly number[] = [],
): MnaResidualResult {
  let maximumKclResidualA = 0
  let maximumKclLimitA = 0
  let maximumVoltageConstraintResidualV = 0
  let maximumVoltageConstraintLimitV = 0

  for (let row = 0; row < rhs.length; row++) {
    let linearValue = 0
    let rowScale = Math.abs(rhs[row] ?? 0)
    for (let column = 0; column < values.length; column++) {
      const term = (matrix[row]?.[column] ?? 0) * values[column]
      linearValue += term
      rowScale += Math.abs(term)
    }
    const correction = nonlinearCurrentCorrections[row] ?? 0
    const residual = linearValue - rhs[row] + correction

    if (row < nodeCount) {
      rowScale += Math.abs(correction)
      const limit = KCL_ABSOLUTE_TOLERANCE_A + KCL_RELATIVE_TOLERANCE * rowScale
      maximumKclResidualA = Math.max(maximumKclResidualA, Math.abs(residual))
      maximumKclLimitA = Math.max(maximumKclLimitA, limit)
      if (Math.abs(residual) > limit) {
        return Object.freeze({ converged: false, maximumKclResidualA, maximumKclLimitA, maximumVoltageConstraintResidualV, maximumVoltageConstraintLimitV })
      }
    } else {
      const limit = VOLTAGE_ABSOLUTE_TOLERANCE_V + VOLTAGE_RELATIVE_TOLERANCE * rowScale
      maximumVoltageConstraintResidualV = Math.max(maximumVoltageConstraintResidualV, Math.abs(residual))
      maximumVoltageConstraintLimitV = Math.max(maximumVoltageConstraintLimitV, limit)
      if (Math.abs(residual) > limit) {
        return Object.freeze({ converged: false, maximumKclResidualA, maximumKclLimitA, maximumVoltageConstraintResidualV, maximumVoltageConstraintLimitV })
      }
    }
  }

  return Object.freeze({ converged: true, maximumKclResidualA, maximumKclLimitA, maximumVoltageConstraintResidualV, maximumVoltageConstraintLimitV })
}
