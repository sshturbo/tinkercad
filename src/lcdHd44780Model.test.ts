import { describe, expect, it } from 'vitest'
import { clockLcdHd44780Write, initialLcdHd44780State, lcdText } from './lcdHd44780Model'

const write = (state: ReturnType<typeof initialLcdHd44780State>, value: number, rs = false) => {
  const high = clockLcdHd44780Write(state, { enableHigh: true, registerSelect: rs, readWrite: false, data: value })
  return clockLcdHd44780Write(high, { enableHigh: false, registerSelect: rs, readWrite: false, data: value })
}
const write4 = (state: ReturnType<typeof initialLcdHd44780State>, value: number, rs = false) => write(write(state, value & 0xf0, rs), (value << 4) & 0xf0, rs)

describe('HD44780 16×2', () => {
  it('aceita clear, display on, cursor address e caracteres em oito bits', () => {
    let state = initialLcdHd44780State()
    state = write(state, 0x01)
    state = write(state, 0x0c)
    state = write(state, 0x80)
    for (const code of 'CircuitLab') state = write(state, code.charCodeAt(0), true)
    state = write(state, 0xc0)
    for (const code of 'Offline') state = write(state, code.charCodeAt(0), true)
    expect(lcdText(state)).toEqual(['CircuitLab      ', 'Offline         '])
    expect(state.acceptedBytes).toBe(21)
  })

  it('aceita instruções e dados em dois nibbles no modo de quatro bits', () => {
    let state = initialLcdHd44780State()
    state = write(state, 0x20) // Function set: switches to 4-bit mode.
    state = write4(state, 0x0c) // Display on.
    state = write4(state, 0x80) // DDRAM row 1, column 1.
    state = write4(state, 0x41, true) // 'A'
    state = write4(state, 0xc0) // DDRAM row 2, column 1.
    state = write4(state, 0x42, true) // 'B'
    expect(lcdText(state)).toEqual(['A               ', 'B               '])
  })

  it('ignora leitura e conserva a tela enquanto E fica alto', () => {
    const initial = initialLcdHd44780State()
    const reading = clockLcdHd44780Write(initial, { enableHigh: true, registerSelect: true, readWrite: true, data: 0x41 })
    expect(lcdText(reading)).toEqual(['                ', '                '])
  })
})
