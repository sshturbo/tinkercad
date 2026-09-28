import { describe, expect, it } from 'vitest'
import { advanceTimer555Latch, canonicalTimer555Pin, requestedTimer555Latch, TIMER555_MODEL } from './timer555Model'

describe('modelo extraído do Timer555', () => {
  it('descreve aliases DIP8, ladder de 5 kΩ e os pulls', () => {
    expect(TIMER555_MODEL.pins).toMatchObject({
      ground: { engine: 'GND', aliases: ['Ground', 'GND', '1'] },
      trigger: { engine: 'TRIG', aliases: ['Trigger', 'TRIG', '2'] },
      output: { engine: 'OUT', aliases: ['Out', 'OUT', '3'] },
      reset: { engine: 'Reset', aliases: ['Reset', 'RESET', '4'] },
      control: { engine: 'CTRL', aliases: ['Control Voltage', 'CTRL', '5'] },
      threshold: { engine: 'THR', aliases: ['Threshold', 'THR', '6'] },
      discharge: { engine: 'DIS', aliases: ['Discharge', 'DIS', '7'] },
      vcc: { engine: 'Vcc', aliases: ['Power', 'Vcc', 'VCC', '8'] },
    })
    expect(TIMER555_MODEL.ladder).toEqual({ resistorOhms: 5000, sections: 3 })
    expect(TIMER555_MODEL.inputPulls).toEqual({ triggerToVccOhms: 1e7, thresholdToGroundOhms: 5e7, resetToVccOhms: 4e4 })
    expect(TIMER555_MODEL.output).toEqual({ activeResistanceOhms: 15, inactiveResistanceOhms: 1e8 })
  })

  it('canonicaliza nome de sinal, nome do catálogo e pino DIP8', () => {
    expect(canonicalTimer555Pin('Trigger')).toBe('TRIG')
    expect(canonicalTimer555Pin('TRIG')).toBe('TRIG')
    expect(canonicalTimer555Pin('2')).toBe('TRIG')
    expect(canonicalTimer555Pin('Power')).toBe('Vcc')
    expect(canonicalTimer555Pin('8')).toBe('Vcc')
    expect(canonicalTimer555Pin('unknown')).toBeUndefined()
  })

  it('aplica prioridade Reset, depois Threshold, depois Trigger e conserva o latch', () => {
    expect(requestedTimer555Latch({ resetV: 0.999, groundV: 0, thresholdV: 0, controlV: 3.3, referenceV: 1.67, triggerV: 0 })).toBe(false)
    // Reset is a strict comparator: exactly 1 V above GND is released.
    expect(requestedTimer555Latch({ resetV: 1, groundV: 0, thresholdV: 0, controlV: 3.3, referenceV: 1.67, triggerV: 0 })).toBe(true)
    expect(requestedTimer555Latch({ resetV: 1, groundV: 0, thresholdV: 3.31, controlV: 3.3, referenceV: 1.67, triggerV: 0 })).toBe(false)
    expect(requestedTimer555Latch({ resetV: 0, groundV: 0, thresholdV: 0, controlV: 3.3, referenceV: 4, triggerV: 0 })).toBe(false)
    // Threshold equality does not reset; the lower comparator may still set.
    expect(requestedTimer555Latch({ resetV: 5, groundV: 0, thresholdV: 3.3, controlV: 3.3, referenceV: 1.67, triggerV: 0 })).toBe(true)
    expect(requestedTimer555Latch({ resetV: 5, groundV: 0, thresholdV: 0, controlV: 3.3, referenceV: 1.67, triggerV: 1.669 })).toBe(true)
    expect(requestedTimer555Latch({ resetV: 5, groundV: 0, thresholdV: 0, controlV: 3.3, referenceV: 1.67, triggerV: 1.67 })).toBeUndefined()
  })

  it('inicia alto e mantém a mudança pendente por 0.5 µs', () => {
    const initial = { latchHigh: TIMER555_MODEL.latch.initialHigh }
    expect(advanceTimer555Latch(initial, false, 0)).toMatchObject({ latchHigh: true, pendingLatchHigh: false, delayRemainingSeconds: 0.5e-6 })
    const first = advanceTimer555Latch(advanceTimer555Latch(initial, false, 0), undefined, 0.2e-6)
    expect(first).toMatchObject({ latchHigh: true, pendingLatchHigh: false, delayRemainingSeconds: 0.3e-6 })
    const completed = advanceTimer555Latch(first, false, 0.3e-6)
    expect(completed).toEqual({ latchHigh: false, pendingLatchHigh: undefined, delayRemainingSeconds: undefined })
  })

  it('cancela uma transição atrasada se o comparador voltar a pedir o estado atual', () => {
    const pending = advanceTimer555Latch({ latchHigh: true }, false, 0)
    expect(advanceTimer555Latch(pending, true, 1e-6)).toEqual({ latchHigh: true, pendingLatchHigh: undefined, delayRemainingSeconds: undefined })
  })
})
