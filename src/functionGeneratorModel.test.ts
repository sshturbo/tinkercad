import { describe, expect, it } from 'vitest'
import {
  FUNCTION_GENERATOR_MODEL,
  functionGeneratorOutputResistanceOhms,
  functionGeneratorShapeAtPhase,
  functionGeneratorVoltageAtPhase,
  functionGeneratorVoltageAtTime,
  normalizeFunctionGeneratorPhase,
  normalizeFunctionGeneratorProperties,
} from './functionGeneratorModel'

describe('modelo temporal do gerador de função', () => {
  it('gera onda quadrada bipolar com Vpp e offset central', () => {
    const properties = { frequency: 2, amplitude: 4, offset: 1, waveform: 'square' }
    expect(functionGeneratorVoltageAtTime(properties, 0)).toBe(3)
    expect(functionGeneratorVoltageAtTime(properties, 0.25)).toBe(-1)
    expect(functionGeneratorVoltageAtTime(properties, 0.5)).toBe(3)
    expect(functionGeneratorVoltageAtTime(properties, 0.75)).toBe(-1)
  })

  it('calcula a senoide e a triangular nos pontos de fase conhecidos', () => {
    expect(functionGeneratorShapeAtPhase('sine', 0)).toBeCloseTo(0, 12)
    expect(functionGeneratorShapeAtPhase('sine', 0.25)).toBeCloseTo(1, 12)
    expect(functionGeneratorShapeAtPhase('sine', 0.75)).toBeCloseTo(-1, 12)
    expect(functionGeneratorShapeAtPhase('triangle', 0)).toBeCloseTo(0, 12)
    expect(functionGeneratorShapeAtPhase('triangle', 0.25)).toBeCloseTo(1, 12)
    expect(functionGeneratorShapeAtPhase('triangle', 0.5)).toBeCloseTo(0, 12)
    expect(functionGeneratorShapeAtPhase('triangle', 0.75)).toBeCloseTo(-1, 12)
    expect(functionGeneratorShapeAtPhase('triangle', 1)).toBeCloseTo(0, 12)
  })

  it('aplica a frequência como período e repete a fase para tempos negativos', () => {
    const properties = { frequency: 4, amplitude: 6, offset: 2, waveform: 'triangle' }
    expect(functionGeneratorVoltageAtTime(properties, 0)).toBeCloseTo(2, 12)
    expect(functionGeneratorVoltageAtTime(properties, 1 / 16)).toBeCloseTo(5, 12)
    expect(functionGeneratorVoltageAtTime(properties, 1 / 4)).toBeCloseTo(2, 12)
    expect(functionGeneratorVoltageAtTime(properties, -1 / 16)).toBeCloseTo(-1, 12)
  })

  it('mantém padrões offline compatíveis quando propriedades estão ausentes ou inválidas', () => {
    expect(normalizeFunctionGeneratorProperties()).toEqual({
      frequency: 1, amplitude: 5, offset: 2.5, waveform: 'square',
    })
    expect(normalizeFunctionGeneratorProperties({
      frequency: Number.NaN, amplitude: 'bad', offset: Infinity, waveform: 'sawtooth',
    })).toEqual({ frequency: 1, amplitude: 5, offset: 2.5, waveform: 'square' })
    expect(functionGeneratorVoltageAtPhase(undefined, Number.NaN)).toBe(5)
    expect(functionGeneratorVoltageAtTime(undefined, Number.NaN)).toBe(5)
  })

  it('limita controles aos intervalos do modelo extraído', () => {
    expect(normalizeFunctionGeneratorProperties({ frequency: -10, amplitude: -1, offset: -20 }))
      .toEqual({ frequency: 1, amplitude: 0, offset: -5, waveform: 'square' })
    expect(normalizeFunctionGeneratorProperties({ frequency: 9e9, amplitude: 100, offset: 20 }))
      .toEqual({ frequency: 1_000_000, amplitude: 10, offset: 5, waveform: 'square' })
    expect(normalizeFunctionGeneratorProperties({ frequency: '1000', amplitude: '2.5', offset: '-1', waveform: 'sine' }))
      .toEqual({ frequency: 1000, amplitude: 2.5, offset: -1, waveform: 'sine' })
  })

  it('normaliza fases negativas, grandes e inválidas', () => {
    expect(normalizeFunctionGeneratorPhase(-0.25)).toBeCloseTo(0.75, 12)
    expect(normalizeFunctionGeneratorPhase(12.25)).toBeCloseTo(0.25, 12)
    expect(normalizeFunctionGeneratorPhase(Infinity)).toBe(0)
  })

  it('declara a resistência interna de 50 ohms descrita na extração', () => {
    expect(functionGeneratorOutputResistanceOhms()).toBe(50)
    expect(FUNCTION_GENERATOR_MODEL.source).toContain('function_generator--module-85044.js')
  })
})
