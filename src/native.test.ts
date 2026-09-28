import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { emptyProject, emptyRuntime, type Project } from './model'
import { getTwoPinDiodeDescriptor, TWO_PIN_DIODE_MODEL } from './twoPinDiodeModel'

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
let runSimulation: typeof import('./native')['runSimulation']

beforeAll(async () => {
  vi.stubGlobal('window', { __TAURI_INTERNALS__: {} })
  runSimulation = (await import('./native')).runSimulation
})
beforeEach(() => vi.mocked(invoke).mockReset())
afterAll(() => vi.unstubAllGlobals())

describe('novos projetos no aplicativo desktop', () => {
  it('começa com uma bancada vazia e uma identidade nova', () => {
    const first = emptyProject(), second = emptyProject()
    expect(first.parts).toEqual([])
    expect(first.wires).toEqual([])
    expect(first.name).toBe('Novo circuito')
    expect(first.id).not.toBe(second.id)
  })

  it('simula fonte, resistor e LED da biblioteca pelo motor elétrico compartilhado', async () => {
    const project: Project = { ...emptyProject(), parts: [
      { id: 's', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { simulationModel: 'powerSupply', voltage: 5 } },
      { id: 'r', kind: 'library', x: 0, y: 100, rotation: 0, label: 'Resistor', properties: { simulationModel: 'resistor' } },
      { id: 'd', kind: 'library', x: 100, y: 100, rotation: 0, label: 'LED', properties: { simulationModel: 'led2' } },
    ], wires: [
      { id: 'w1', from: 's:Positive', to: 'r:Terminal 1', color: 'red' },
      { id: 'contact:rd', from: 'r:Terminal 2', to: 'd:Anode', color: 'green', hidden: true },
      { id: 'w2', from: 's:Negative', to: 'd:Cathode', color: 'black' },
    ] }
    const result = await runSimulation(project, emptyRuntime())
    expect(result.engine).toBe('typescript')
    expect(result.simulation.converged).toBe(true)
    expect(result.simulation.mode).toBe('dc')
    expect(result.simulation.leds.d).toBe('1')
    const led = getTwoPinDiodeDescriptor('led', 'red')
    let low = 0, high = 0.1
    for (let i = 0; i < 100; i++) {
      const current = (low + high) / 2
      const required = led.thermalVoltageV * Math.log1p(current / led.saturationCurrentA) + current * (220 + TWO_PIN_DIODE_MODEL.led.seriesResistanceOhms)
      if (required < 5) low = current
      else high = current
    }
    expect(Math.abs(result.simulation.currents?.r ?? 0)).toBeCloseTo((low + high) / 2, 6)
    expect(invoke).not.toHaveBeenCalled()
  })

  it('avança um capacitor no solver compartilhado ao receber um passo de tempo', async () => {
    const project: Project = { ...emptyProject(), parts: [
      { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
      { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 1000 } },
      { id: 'c', kind: 'library', x: 0, y: 0, rotation: 0, label: 'C1', properties: { simulationModel: 'capacitor', capacitance: 0.001 } },
    ], wires: [
      { id: 'w1', from: 's:PLUS', to: 'r:A', color: 'red' },
      { id: 'w2', from: 'r:B', to: 'c:Terminal 1', color: 'red' },
      { id: 'w3', from: 'c:Terminal 2', to: 's:MINUS', color: 'black' },
    ] }
    const result = await runSimulation(project, emptyRuntime(), false, 0.01)
    expect(result.engine).toBe('typescript')
    expect(result.simulation.mode).toBe('transient')
    expect(result.simulation.voltages?.['c:Terminal 1']).toBeCloseTo(5 * 10.01 / 1010.01, 10)
    expect(result.runtime.capacitorVoltages?.c).toBeCloseTo(5 * 10 / 1010.01, 10)
    expect(invoke).not.toHaveBeenCalled()
  })

  it('simula o indutor pelo mesmo solver transitório no aplicativo desktop', async () => {
    const project: Project = { ...emptyProject(), parts: [
      { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte', properties: { voltage: 5 } },
      { id: 'r', kind: 'resistor', x: 0, y: 100, rotation: 0, label: 'R1', properties: { ohms: 10 } },
      { id: 'l', kind: 'library', x: 100, y: 100, rotation: 0, label: 'L1', properties: { simulationModel: 'inductor', inductance: 1 } },
    ], wires: [
      { id: 'w1', from: 's:PLUS', to: 'r:A', color: 'red' },
      { id: 'w2', from: 'r:B', to: 'l:Terminal 1', color: 'red' },
      { id: 'w3', from: 'l:Terminal 2', to: 's:MINUS', color: 'black' },
    ] }
    const result = await runSimulation(project, emptyRuntime(), false, 0.01)
    expect(result.engine).toBe('typescript')
    expect(result.simulation.mode).toBe('transient')
    expect(result.simulation.currents?.l).toBeCloseTo(0.05 / 1.1, 9)
    expect(result.runtime.inductorCurrents?.l).toBeCloseTo(0.05 / 1.1, 9)
    expect(invoke).not.toHaveBeenCalled()
  })

  it('normaliza nomes de terminais antes de enviar um circuito nativo ao Rust', async () => {
    const project: Project = { ...emptyProject(), parts: [
      { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte' },
      { id: 'u', kind: 'nand74hc00', x: 100, y: 0, rotation: 0, label: 'U1' },
    ], wires: [
      { id: 'plus', from: 's:Positive', to: 'u:VCC', color: 'red' },
      { id: 'minus', from: 's:Negative', to: 'u:GND', color: 'black' },
    ] }
    await runSimulation(project, emptyRuntime())
    expect(invoke).toHaveBeenCalledWith('simulate_step', expect.objectContaining({
      project: expect.objectContaining({ wires: [
        expect.objectContaining({ from: 's:PLUS', to: 'u:Potência' }),
        expect.objectContaining({ from: 's:MINUS', to: 'u:Solo' }),
      ] }),
    }))
  })

  it('sanitiza coordenadas indefinidas ou ausentes ao enviar para o Tauri', async () => {
    // Project with missing or NaN coordinates
    const project = {
      ...emptyProject(),
      parts: [
        { id: 's', kind: 'supply', label: 'Fonte' } as any,
        { id: 'd', kind: 'and', x: NaN, y: undefined, rotation: null, label: 'Porta AND' } as any,
      ],
      wires: [
        { id: 'w', from: 's:PLUS', to: 'd:A', color: 'red', bends: [{ x: NaN, y: 10 } as any] },
      ],
    }
    await runSimulation(project, emptyRuntime())
    expect(invoke).toHaveBeenCalledWith('simulate_step', expect.objectContaining({
      project: expect.objectContaining({
        parts: expect.arrayContaining([
          expect.objectContaining({ id: 's', x: 0, y: 0, rotation: 0 }),
          expect.objectContaining({ id: 'd', x: 0, y: 0, rotation: 0 }),
        ]),
        wires: expect.arrayContaining([
          expect.objectContaining({
            bends: [expect.objectContaining({ x: 0, y: 10 })],
          }),
        ]),
      }),
    }))
  })

  it('usa o motor TypeScript de lógica se o comando nativo falhar', async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error('RPC error'))
    const project: Project = { ...emptyProject(), parts: [
      { id: 's', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte' },
      { id: 'd', kind: 'led', x: 100, y: 0, rotation: 0, label: 'LED' },
      { id: 'u', kind: 'nand', x: 200, y: 0, rotation: 0, label: 'NAND' },
    ], wires: [
      { id: 'w1', from: 's:PLUS', to: 'd:A', color: 'red' },
      { id: 'w2', from: 's:MINUS', to: 'd:K', color: 'black' },
    ] }
    const result = await runSimulation(project, emptyRuntime())
    expect(result.engine).toBe('typescript')
    expect(result.simulation.mode).toBe('digital')
    expect(result.simulation.leds.d).toBe('1')
  })
})

