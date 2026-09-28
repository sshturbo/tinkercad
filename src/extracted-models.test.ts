import { describe, expect, it } from 'vitest'
import { emptyRuntime, type Level } from './model'
import { driveExtractedCombinational, driveExtractedSequential, extractedModelNames, extractedModelPins, updateExtractedSequential } from './extracted-models'

const combinational = [
  { model: '74HC00', inputs: 'AB', count: 4, fn: (bits: number[]) => !(bits[0] && bits[1]) },
  { model: '74HC02', inputs: 'AB', count: 4, fn: (bits: number[]) => !(bits[0] || bits[1]) },
  { model: '74HC04', inputs: 'A', count: 6, fn: (bits: number[]) => !bits[0] },
  { model: '74HC08', inputs: 'AB', count: 4, fn: (bits: number[]) => bits[0] && bits[1] },
  { model: '74HC10', inputs: 'ABC', count: 3, fn: (bits: number[]) => !bits.every(Boolean) },
  { model: '74HC11', inputs: 'ABC', count: 3, fn: (bits: number[]) => bits.every(Boolean) },
  { model: '74HC14', inputs: 'A', count: 6, fn: (bits: number[]) => !bits[0] },
  { model: '74HC20', inputs: 'ABCD', count: 2, fn: (bits: number[]) => !bits.every(Boolean) },
  { model: '74HC21', inputs: 'ABCD', count: 2, fn: (bits: number[]) => bits.every(Boolean) },
  { model: '74HC27', inputs: 'ABC', count: 3, fn: (bits: number[]) => !bits.some(Boolean) },
  { model: '74HC32', inputs: 'AB', count: 4, fn: (bits: number[]) => bits.some(Boolean) },
  { model: '74HC86', inputs: 'AB', count: 4, fn: (bits: number[]) => bits.reduce((value, bit) => value !== Boolean(bit), false) },
  { model: '74HC132', inputs: 'AB', count: 4, fn: (bits: number[]) => !(bits[0] && bits[1]) },
] as const

describe('conformidade dos modelos digitais extraídos', () => {
  it('declara pinos para todas as 19 famílias locais e testa as 13 portas combinacionais', () => {
    expect(extractedModelNames.size).toBe(20)
    for (const model of extractedModelNames) expect(extractedModelPins(model).length, model).toBeGreaterThan(2)
    for (const gate of combinational) {
      for (let channel = 1; channel <= gate.count; channel++) {
        const inputNames = [...gate.inputs].map(name => gate.model === '74HC04' || gate.model === '74HC14' ? `Input ${channel}` : `Input ${channel}${name}`)
        for (let assignment = 0; assignment < 2 ** inputNames.length; assignment++) {
          const values = inputNames.map((_, bit) => Boolean(assignment & (1 << bit)))
          const read = (pin: string): Level => values[inputNames.indexOf(pin)] ? '1' : '0'
          const driven = new Map<string, Level>()
          expect(driveExtractedCombinational(gate.model, read, (pin, value) => driven.set(pin, value))).toBe(true)
          expect(driven.get(`Output ${channel}`), `${gate.model} canal ${channel} entrada ${assignment}`).toBe(gate.fn(values) ? '1' : '0')
        }
      }
    }
  })

  it('aplica tabelas de soma e estado desconhecido das famílias combinacionais adicionais', () => {
    const adder = new Map<string, Level>()
    const sumInputs: Record<string, Level> = { 'Carry In': '1', 'Input 0A': '1', 'Input 0B': '0', 'Input 1A': '0', 'Input 1B': '1', 'Input 2A': '0', 'Input 2B': '0', 'Input 3A': '0', 'Input 3B': '0' }
    expect(driveExtractedCombinational('74HC283', pin => sumInputs[pin] ?? 'X', (pin, value) => adder.set(pin, value))).toBe(true)
    expect(Object.fromEntries(adder)).toEqual({ 'Output Bit 0': '0', 'Output Bit 1': '0', 'Output Bit 2': '1', 'Output Bit 3': '0', 'Carry Out': '0' })
    const unknown = new Map<string, Level>()
    driveExtractedCombinational('74HC08', pin => pin === 'Input 1A' ? 'X' : '1', (pin, value) => unknown.set(pin, value))
    expect(unknown.get('Output 1')).toBe('X')
    driveExtractedCombinational('74HC08', pin => pin === 'Input 1A' ? 'X' : '0', (pin, value) => unknown.set(pin, value))
    expect(unknown.get('Output 1')).toBe('0')
  })

  it('verifica atualização e leitura de saída das seis famílias sequenciais', () => {
    const runtime = emptyRuntime()
    const projectPart = 'chip'
    const update = (model: string, inputs: Record<string, Level>) => updateExtractedSequential(model, projectPart, runtime, pin => inputs[pin] ?? '0')
    const readOutputs = (model: string) => {
      const values = new Map<string, Level>()
      expect(driveExtractedSequential(model, projectPart, runtime, (pin, value) => values.set(pin, value))).toBe(true)
      return values
    }

    runtime.q['chip:Q1'] = '0'
    runtime.prev_clock['chip:Clock 1'] = '1'
    expect(update('74HC73', { 'Clock 1': '0', 'J 1': '1', 'K 1': '1', 'Reset 1': '1', 'Reset 2': '1' })).toBe(true)
    expect(readOutputs('74HC73').get('Output 1')).toBe('1')

    runtime.prev_clock['chip:Clock 1'] = '0'
    expect(update('74HC74', { 'Clock 1': '1', 'Input 1': '1', 'Set 1': '1', 'Reset 1': '1', 'Set 2': '1', 'Reset 2': '1' })).toBe(true)
    expect(readOutputs('74HC74').get('Output 1')).toBe('1')

    expect(update('74HC75', { 'Enable 1 & 2': '1', 'Enable 3 & 4': '0', 'Input 1': '1' })).toBe(true)
    expect(readOutputs('74HC75').get('Output 1')).toBe('1')

    runtime.q['chip:Q0'] = '0'
    runtime.prev_clock['chip:Clock 0'] = '1'
    expect(update('74HC93', { 'Clock 0': '0', 'Clock 1': '1', 'Reset 1': '0', 'Reset 2': '0' })).toBe(true)
    expect(readOutputs('74HC93').get('Output Bit 0')).toBe('1')

    runtime.q['chip:Q0'] = '1'
    runtime.prev_clock['chip:Clock'] = '0'
    expect(update('74HC4017', { Clock: '1', 'Clock Enable': '0', Reset: '0' })).toBe(true)
    expect(readOutputs('74HC4017').get('Output 2')).toBe('1')

    runtime.prev_clock['chip:Shift Register Clock'] = '0'
    expect(update('74HC595', { 'Shift Register Clear': '1', 'Shift Register Clock': '1', 'Output Register Clock': '0', Input: '1' })).toBe(true)
    runtime.prev_clock['chip:Output Register Clock'] = '0'
    expect(update('74HC595', { 'Shift Register Clear': '1', 'Shift Register Clock': '1', 'Output Register Clock': '1', Input: '0' })).toBe(true)
    expect(readOutputs('74HC595').get('Output 1')).toBe('1')
  })
})
