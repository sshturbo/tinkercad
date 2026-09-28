import { describe, expect, it } from 'vitest'
import { connectionTargets, nearestConnectionTarget, terminalLabel } from './connectionTargets'
import { demoProject, type Project } from './model'
import { terminalPosition } from './layout'
import type { LibraryRecords } from './library'

const project: Project = {
  version: 1, id: 'connections', name: 'Resistor e LED', wires: [],
  parts: [
    { id: 'r', kind: 'resistor', label: 'R1', x: 100, y: 100, rotation: 90 },
    { id: 'd', kind: 'led', label: 'D1', x: 200, y: 100, rotation: 0 },
  ],
}

describe('alvos de conexão da bancada', () => {
  it('encontra o terminal do resistor rotacionado e diferencia ânodo de cátodo', () => {
    const targets = connectionTargets(project, {})
    expect(nearestConnectionTarget(targets, { x: 59.5, y: 100 }, 10)?.id).toBe('r:B')
    // Overlapping hit areas must choose the nearest pin, not the last SVG node.
    expect(nearestConnectionTarget(targets, { x: 190, y: 115 }, 30)?.id).toBe('d:K')
    expect(nearestConnectionTarget([...targets].reverse(), { x: 190, y: 115 }, 30)?.id).toBe('d:K')
    expect(nearestConnectionTarget(targets, { x: 211, y: 115 }, 30)?.id).toBe('d:A')
    expect(terminalLabel(project, 'd:A')).toBe('D1: Ânodo (+)')
    expect(terminalLabel(project, 'd:K')).toBe('D1: Cátodo (-)')
  })

  it('não conecta no corpo da peça nem captura terminais distantes', () => {
    const targets = connectionTargets(project, {})
    expect(nearestConnectionTarget(targets, { x: 100, y: 100 }, 10)).toBeUndefined()
    expect(nearestConnectionTarget(targets, { x: 1000, y: 1000 }, 14)).toBeUndefined()
  })

  it('mantém a tolerância em pixels ao aplicar o zoom do canvas', () => {
    const target = connectionTargets(project, {}).find(t => t.id === 'r:B')!
    for (const scale of [0.4, 1, 2.5]) {
      expect(nearestConnectionTarget([target], { x: target.x + 9 / scale, y: target.y }, 10 / scale)?.id).toBe('r:B')
      expect(nearestConnectionTarget([target], { x: target.x + 11 / scale, y: target.y }, 10 / scale)).toBeUndefined()
    }
  })

  it('prioriza o pino sobre o furo onde está encaixado, em qualquer ordem', () => {
    const demo = demoProject()
    const targets = connectionTargets(demo, {})
    const point = terminalPosition(demo, 'r1:A')!
    expect(nearestConnectionTarget(targets, point, 10)?.id).toBe('r1:A')
    expect(nearestConnectionTarget([...targets].reverse(), point, 10)?.id).toBe('r1:A')
    const hole = terminalPosition(demo, 'board:b1:row:0:left:0')!
    expect(nearestConnectionTarget(targets, hole, 10)?.id).toBe('board:b1:row:0:left:0')
  })

  it('resolve pinos da biblioteca com os mesmos IDs e posições usados pelos fios', () => {
    const records: LibraryRecords = {
      resistor: {
        id: 'resistor', device_id: 'resistor', name: 'Resistor',
        extents: { left: -5, top: -20, width: 10, height: 40 },
        pins_and_terminals: [
          { name: 'Terminal 1', x: 0, y: 20, terminal_type: 'breadboard_male' },
          { name: 'Terminal 2', x: 0, y: -20, terminal_type: 'breadboard_male' },
        ],
      },
    }
    const libraryProject: Project = { ...project, parts: [
      { ...project.parts[0], kind: 'library', properties: { libraryId: 'resistor' } },
      { ...project.parts[1], kind: 'button' },
    ] }
    const targets = connectionTargets(libraryProject, records)
    expect(targets.map(target => target.id)).toContain('r:Terminal 1')
    expect(targets.map(target => target.id)).not.toContain('d:OUT')
    const point = terminalPosition(libraryProject, 'r:Terminal 1', records)!
    expect(nearestConnectionTarget(targets, point, 10)?.id).toBe('r:Terminal 1')
  })
})
