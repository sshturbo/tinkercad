import { describe, expect, it } from 'vitest'
import {
  evaluateVibrationMotor,
  VIBRATION_MOTOR_MODEL,
  vibrationMotorCurrentFromVoltage,
} from './vibrationMotorModel'

describe('modelo extraído do motor vibratório', () => {
  it('registra a topologia e os limites do módulo 45616', () => {
    expect(VIBRATION_MOTOR_MODEL).toMatchObject({
      id: 'vibration_motor',
      moduleSource: 'tinkercad-engine-complete-extracted/models/vibration_motor--module-45616.js',
      terminals: { positive: 'pos', negative: 'neg' },
      resistanceOhms: 50,
      animationThresholdCurrentA: 0.04,
      maximumCurrentA: 0.1,
    })
    expect(vibrationMotorCurrentFromVoltage(5)).toBe(0.1)
    expect(vibrationMotorCurrentFromVoltage(-2)).toBe(-0.04)
  })

  it('mantém o motor desligado até ultrapassar estritamente 40 mA', () => {
    expect(evaluateVibrationMotor(0.04)).toMatchObject({
      animationEnabled: false,
      amplitude: 0,
      breakdown: false,
    })
    expect(evaluateVibrationMotor(0.040001)).toMatchObject({
      animationEnabled: true,
      breakdown: false,
    })
    expect(evaluateVibrationMotor(0.040001).amplitude).toBeCloseTo(0.000001 / 0.06, 10)
  })

  it('escala linearmente até amplitude 1 inclusive em 100 mA', () => {
    const midpoint = evaluateVibrationMotor(0.07)
    expect(midpoint.animationEnabled).toBe(true)
    expect(midpoint.amplitude).toBeCloseTo(0.5, 12)
    expect(midpoint.breakdown).toBe(false)
    expect(evaluateVibrationMotor(0.1)).toMatchObject({
      animationEnabled: true,
      amplitude: 1,
      breakdown: false,
    })
  })

  it('desliga a animação e indica breakdown somente acima de 100 mA', () => {
    expect(evaluateVibrationMotor(0.100001)).toMatchObject({
      animationEnabled: false,
      amplitude: 0,
      breakdown: true,
    })
  })

  it('preserva a direção de corrente da fonte extraída e valores não finitos não acionam o motor', () => {
    expect(evaluateVibrationMotor(-0.2)).toMatchObject({
      currentA: -0.2,
      animationEnabled: false,
      amplitude: 0,
      breakdown: false,
    })
    expect(evaluateVibrationMotor(Number.NaN)).toMatchObject({
      currentA: 0,
      animationEnabled: false,
      amplitude: 0,
      breakdown: false,
    })
  })
})
