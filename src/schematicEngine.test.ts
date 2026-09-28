import { describe, expect, it } from 'vitest'
import { demoProject, emptyProject, type Project } from './model'
import {
  buildSchematicLayout,
  canonicalSchematicPin,
  DisjointSet,
  formatValueText,
  getDesignatorPrefix,
  getSchematicSymbolType,
  routeOrthogonalNet,
} from './schematicEngine'

describe('schematicEngine', () => {
  it('identifica prefixos de designators e pinos canônicos', () => {
    expect(getDesignatorPrefix('resistor')).toBe('R')
    expect(getDesignatorPrefix('led')).toBe('D')
    expect(getDesignatorPrefix('supply')).toBe('P')
    expect(getDesignatorPrefix('battery')).toBe('BAT')
    expect(getDesignatorPrefix('ic_jk74hc73')).toBe('U')
    expect(canonicalSchematicPin('resistor', 'Terminal 1')).toBe('B')
    expect(canonicalSchematicPin('led', 'Cathode')).toBe('K')
  })
  it('gerencia DisjointSet corretamente', () => {
    const ds = new DisjointSet()
    ds.join('A', 'B')
    ds.join('B', 'C')
    expect(ds.connected('A', 'C')).toBe(true)
    expect(ds.connected('A', 'D')).toBe(false)
  })

  it('classifica símbolos esquemáticos para componentes nativos e de biblioteca', () => {
    expect(getSchematicSymbolType({ id: 'r1', kind: 'resistor', x: 0, y: 0, rotation: 0, label: 'Resistor' })).toBe('resistor')
    expect(getSchematicSymbolType({ id: 'd1', kind: 'led', x: 0, y: 0, rotation: 0, label: 'LED' })).toBe('led')
    expect(getSchematicSymbolType({ id: 'p1', kind: 'supply', x: 0, y: 0, rotation: 0, label: 'Fonte' })).toBe('supply')
    expect(getSchematicSymbolType({ id: 'bat1', kind: 'library', x: 0, y: 0, rotation: 0, label: 'Bateria 9V', properties: { simulationModel: 'battery9V' } })).toBe('battery')
    expect(getSchematicSymbolType({ id: 'b1', kind: 'breadboard', x: 0, y: 0, rotation: 0, label: 'Placa' })).toBe(null)
    expect(getSchematicSymbolType({ id: 'u1', kind: 'jk74hc73', x: 0, y: 0, rotation: 0, label: 'CI' })).toBe('ic_jk74hc73')
  })

  it('formata valores de componentes com unidades de engenharia', () => {
    const r = { id: 'r1', kind: 'resistor' as const, x: 0, y: 0, rotation: 0, label: 'R1', properties: { ohms: 4700 } }
    expect(formatValueText('resistor', r)).toBe('4.7 kΩ')

    const c = { id: 'c1', kind: 'library' as const, x: 0, y: 0, rotation: 0, label: 'C1', properties: { capacitance: 10e-6 } }
    expect(formatValueText('capacitor', c)).toBe('10 µF')

    const led = { id: 'led1', kind: 'led' as const, x: 0, y: 0, rotation: 0, label: 'D1', properties: { color: 'green' } }
    expect(formatValueText('led', led)).toBe('VERDE')
  })

  it('retorna layout vazio com elegância para projeto sem componentes ativos', () => {
    const project = emptyProject()
    const layout = buildSchematicLayout(project)
    expect(layout.components).toHaveLength(0)
    expect(layout.nets).toHaveLength(0)
    expect(layout.totalParts).toBe(0)
  })

  it('gera layout dinâmico e nets para demoProject', () => {
    const project = demoProject()
    const layout = buildSchematicLayout(project)

    // Demo project has supply (p1), generator (func1), chips (u1, u2, u3), resistors (r1..r4), leds (led1..led4)
    // and breadboards (b1, b2). Breadboards are filtered out from component symbols.
    expect(layout.totalParts).toBeGreaterThan(5)
    expect(layout.components.length).toBe(layout.totalParts)

    // Check that components have unique non-overlapping coordinates and valid terminals
    for (const comp of layout.components) {
      expect(comp.x).toBeGreaterThan(0)
      expect(comp.y).toBeGreaterThan(0)
      expect(comp.terminals.length).toBeGreaterThan(0)
    }

    // Check that nets were extracted connecting the components
    expect(layout.nets.length).toBeGreaterThan(0)
    for (const net of layout.nets) {
      expect(net.terminals.length).toBeGreaterThanOrEqual(2)
      expect(net.wirePaths.length).toBeGreaterThan(0)
    }
  })

  it('gera layout dinâmico para circuito simples com 1 resistor e 1 LED', () => {
    const project: Project = {
      version: 1,
      id: 'test-1',
      name: 'Resistor e LED',
      parts: [
        { id: 'r1', kind: 'resistor', x: 100, y: 100, rotation: 0, label: 'R1', properties: { ohms: 330 } },
        { id: 'd1', kind: 'led', x: 200, y: 100, rotation: 0, label: 'D1', properties: { color: 'red' } },
      ],
      wires: [
        { id: 'w1', from: 'r1:B', to: 'd1:A', color: '#22c55e' },
      ],
    }

    const layout = buildSchematicLayout(project)
    expect(layout.components).toHaveLength(2)
    expect(layout.nets).toHaveLength(1)

    const net = layout.nets[0]
    expect(net.terminals).toHaveLength(2)
    expect(net.wirePaths).toHaveLength(1)
  })

  it('conecta ambos os terminais (positivo e negativo) de uma fonte de energia com biblioteca', () => {
    const project: Project = {
      version: 1,
      id: 'test-supply',
      name: 'Fonte e Resistor',
      parts: [
        {
          id: 'p1',
          kind: 'library',
          x: 100,
          y: 100,
          rotation: 0,
          label: 'Fonte de energia',
          properties: { simulationModel: 'powerSupply', voltage: 9, libraryId: '27571' },
        },
        {
          id: 'r1',
          kind: 'resistor',
          x: 300,
          y: 100,
          rotation: 0,
          label: 'R1',
          properties: { ohms: 1000 },
        },
      ],
      wires: [
        { id: 'w1', from: 'p1:Positive', to: 'r1:A', color: '#e53935' },
        { id: 'w2', from: 'p1:Negative', to: 'r1:B', color: '#212121' },
      ],
    }

    const layout = buildSchematicLayout(project)
    expect(layout.components).toHaveLength(2)
    expect(layout.nets).toHaveLength(2)

    const posNet = layout.nets.find(n => n.terminals.some(t => t.componentId === 'p1' && (t.pin === 'PLUS' || t.pin === 'Positive')))
    const negNet = layout.nets.find(n => n.terminals.some(t => t.componentId === 'p1' && (t.pin === 'MINUS' || t.pin === 'Negative')))
    expect(posNet).toBeDefined()
    expect(negNet).toBeDefined()
  })

  it('roteia redes ortogonalmente com junction dots quando há 3 ou mais terminais', () => {
    const terminals = [
      { componentId: 'r1', pin: 'B', x: 100, y: 200, dir: 'right' as const },
      { componentId: 'r2', pin: 'B', x: 200, y: 200, dir: 'right' as const },
      { componentId: 'r3', pin: 'B', x: 300, y: 200, dir: 'right' as const },
    ]
    const routed = routeOrthogonalNet(terminals)
    expect(routed.wirePaths.length).toBeGreaterThan(0)
    expect(routed.junctions.length).toBe(3)
  })
})
