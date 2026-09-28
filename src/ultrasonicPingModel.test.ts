import { describe, expect, it } from 'vitest'
import {
  advanceUltrasonicPingState, canonicalUltrasonicPingPin, evaluateUltrasonicTarget,
  initialUltrasonicPingState, nextUltrasonicDeadline, ultrasonicEchoActiveAt,
  ultrasonicEchoPulseWidthSeconds, ultrasonicPowerValid, ultrasonicTargetFromPolar,
  ultrasonicTriggerHigh, resetUltrasonicRuntime, ULTRASONIC_PING_MODEL,
} from './ultrasonicPingModel'

describe('modelo Parallax PING)))', () => {
  it('mapeia aliases 3-pin e 4-pin, topologia e limites da alimentação', () => {
    expect(canonicalUltrasonicPingPin('Signal')).toBe('sig')
    expect(canonicalUltrasonicPingPin('5V')).toBe('pos')
    expect(canonicalUltrasonicPingPin('Ground')).toBe('neg')
    expect(canonicalUltrasonicPingPin('trigger')).toBe('trig')
    expect(canonicalUltrasonicPingPin('echo')).toBe('echo')
    expect(ULTRASONIC_PING_MODEL.electrical.powerResistanceOhms).toBeCloseTo(166.6666667, 6)
    expect([4.499, 4.5, 5, 6, 6.001].map(ultrasonicPowerValid)).toEqual([false, true, true, true, false])
    expect(ultrasonicTriggerHigh(2)).toBe(false)
    expect(ultrasonicTriggerHigh(2.001)).toBe(true)
  })

  it('usa alvo, ângulo e normalização inclusive nos extremos da zona válida', () => {
    const defaultTarget = evaluateUltrasonicTarget()
    expect(defaultTarget.targetPosition).toEqual({ x: 0, y: -200 })
    expect(defaultTarget.inRange).toBe(true)
    expect(defaultTarget.normalizedDistance).toBeCloseTo(1 / 3, 12)
    expect(defaultTarget.distanceCm).toBeCloseTo(113.44, 2)
    expect(evaluateUltrasonicTarget(ultrasonicTargetFromPolar(100, 240)).inRange).toBe(true)
    expect(evaluateUltrasonicTarget(ultrasonicTargetFromPolar(400, 300)).normalizedDistance).toBeCloseTo(1, 12)
    expect(evaluateUltrasonicTarget(ultrasonicTargetFromPolar(99.999, 270)).inRange).toBe(false)
    expect(evaluateUltrasonicTarget(ultrasonicTargetFromPolar(400.001, 270)).inRange).toBe(false)
    expect(evaluateUltrasonicTarget(ultrasonicTargetFromPolar(200, 239.999)).inRange).toBe(false)
  })

  it('aceita falling pulse de 2 µs inclusive e rejeita o imediatamente menor', () => {
    const fallAfter = (duration: number) => {
      const rising = advanceUltrasonicPingState(initialUltrasonicPingState(), 5, 1, 0.25)
      return advanceUltrasonicPingState(rising, 0, 1 + duration, 0.25)
    }
    expect(fallAfter(1.999e-6)).toMatchObject({ phase: 'idle', acceptedPings: 0, rejectedShortPulses: 1 })
    expect(fallAfter(2e-6)).toMatchObject({ phase: 'transmit', acceptedPings: 1, echoStartsAtSeconds: 1 + 2e-6 + 750e-6 })
    expect(fallAfter(2.001e-6)).toMatchObject({ phase: 'transmit', acceptedPings: 1 })
  })

  it('agenda holdoff e larguras exatas para alvo interno e fora de alcance', () => {
    const rise = advanceUltrasonicPingState(initialUltrasonicPingState(), 5, 0, 1 / 3)
    const pulse = advanceUltrasonicPingState(rise, 0, 2e-6, 1 / 3)
    expect(pulse.echoStartsAtSeconds).toBeCloseTo(752e-6, 15)
    expect(pulse.echoEndsAtSeconds! - pulse.echoStartsAtSeconds!).toBeCloseTo(115e-6 + 18.385e-3 / 3, 15)
    expect(ultrasonicEchoActiveAt(pulse, pulse.echoStartsAtSeconds! - 1e-12)).toBe(false)
    expect(ultrasonicEchoActiveAt(pulse, pulse.echoStartsAtSeconds!)).toBe(true)
    expect(nextUltrasonicDeadline(pulse, 2e-6, 1e-3)).toBe(pulse.echoStartsAtSeconds)
    expect(ultrasonicEchoPulseWidthSeconds(-1)).toBe(18.5e-3)
  })

  it('perde um trigger mais curto que o subpasso se nenhuma amostra cair dentro do pulso', () => {
    const idle = initialUltrasonicPingState()
    const before = advanceUltrasonicPingState(idle, 0, 1, 0.5)
    // A 1.999 µs pulse occurred entirely between samples at 1 s and 1 s + 3 µs.
    const after = advanceUltrasonicPingState(before, 0, 1 + 3e-6, 0.5)
    expect(after).toMatchObject({ phase: 'idle', acceptedPings: 0, rejectedShortPulses: 0 })
  })

  it('ignora as bordas do próprio eco enquanto transmite e libera depois do deadline', () => {
    const triggerHigh = advanceUltrasonicPingState(initialUltrasonicPingState(), 5, 0, 0.5)
    const transmitting = advanceUltrasonicPingState(triggerHigh, 0, 2e-6, 0.5)
    const echoRises = advanceUltrasonicPingState(transmitting, 5, transmitting.echoStartsAtSeconds!, 0.5)
    expect(echoRises.phase).toBe('transmit')
    const echoFalls = advanceUltrasonicPingState(echoRises, 0, echoRises.echoEndsAtSeconds!, 0.5)
    expect(echoFalls).toMatchObject({ phase: 'idle', acceptedPings: 1 })
  })


  it('limpa estados de pulso no stop e preserva a posição temporária do alvo', () => {
    const position = { x: 0, y: -250 }
    const state = advanceUltrasonicPingState(initialUltrasonicPingState(), 5, 1, 0.5)
    const runtime = { ultrasonicTargetPositions: { ping: position }, ultrasonicStates: { ping: state } }
    const stopped = resetUltrasonicRuntime(runtime)
    expect(stopped.ultrasonicStates).toEqual({})
    expect(stopped.ultrasonicTargetPositions).toEqual({ ping: position })
  })
})
