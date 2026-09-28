import { describe, expect, it } from 'vitest'
import { advanceServoState, initialServoRuntimeState, servoSignalIsHigh } from './servoModel'

describe('modelo posicional SG90', () => {
  it('usa o limite lógico extraído e move até 3 graus por pulso', () => {
    expect(servoSignalIsHigh(2.5, 0)).toBe(false)
    expect(servoSignalIsHigh(2.501, 0)).toBe(true)
    let state = advanceServoState(initialServoRuntimeState(), true, true, 0)
    state = advanceServoState(state, false, true, 0.0015)
    expect(state.positionDegrees).toBeCloseTo(3)
    expect(state.acceptedPulses).toBe(1)
    state = advanceServoState(state, true, true, 0.02)
    state = advanceServoState(state, false, true, 0.022)
    expect(state.positionDegrees).toBeCloseTo(6)
  })

  it('mapeia os limites de pulso a 0° e 180° e ignora movimento sem alimentação', () => {
    let state = advanceServoState(initialServoRuntimeState(), true, true, 0)
    state = advanceServoState(state, false, true, 0.0001)
    expect(state.positionDegrees).toBe(0)
    for (let pulse = 0; pulse < 60; pulse++) {
      const start = 0.02 + pulse * 0.02
      state = advanceServoState(state, true, true, start)
      state = advanceServoState(state, false, true, start + 0.003)
    }
    expect(state.positionDegrees).toBe(180)
    const unpowered = advanceServoState(state, true, false, 2)
    expect(advanceServoState(unpowered, false, false, 2.002).positionDegrees).toBe(180)
  })
})
