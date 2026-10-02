import { describe, expect, it } from 'vitest'
import { demoProject, validProject } from './model'
import { centerWireBends, roundedWirePath, snapBendPoint, wirePolylinePoints } from './wireGeometry'

describe('fios com dobras', () => {
  it('desenha a curva pelos pontos escolhidos e preserva as extremidades', () => {
    const path = roundedWirePath([{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 30 }, { x: 90, y: 30 }])
    expect(path).toMatch(/^M 0 0 /)
    expect(path).toContain('Q 40 0')
    expect(path).toContain('Q 40 30')
    expect(path).toMatch(/L 90 30$/)
  })

  it('aceita projetos antigos e valida pontos de fios novos ao importar', () => {
    const project = demoProject()
    expect(validProject(project)).toBe(true)
    const withBend = { ...project, wires: [{ ...project.wires[0], bends: [{ x: 123, y: 456 }] }, ...project.wires.slice(1)] }
    expect(validProject(JSON.parse(JSON.stringify(withBend)))).toBe(true)
    expect(validProject({ ...withBend, wires: [{ ...withBend.wires[0], bends: [{ x: Infinity, y: 0 }] }] })).toBe(false)
  })

  it('alinha e centraliza dobra com snapBendPoint', () => {
    const endA = { x: 200, y: 240 }
    const endB = { x: 300, y: 400 }
    // Test center snapping: midpoint X is 250, midpoint Y is 320
    const nearCenter = { x: 252, y: 318 }
    const resultCenter = snapBendPoint(nearCenter, endA, endB, endA, endB, 8)
    expect(resultCenter.snapped.x).toBe(250)
    expect(resultCenter.snapped.y).toBe(320)
    expect(resultCenter.guides.some(g => g.label === 'Centro X')).toBe(true)
    expect(resultCenter.guides.some(g => g.label === 'Centro Y')).toBe(true)

    // Test orthogonal alignment: near endA.x (200) -> 90 degrees
    const nearOrtho = { x: 202, y: 335 } // 335 is near breadboard center channel (336)
    const resultOrtho = snapBendPoint(nearOrtho, endA, endB, endA, endB, 8)
    expect(resultOrtho.snapped.x).toBe(200)
    expect(resultOrtho.snapped.y).toBe(336)
    expect(resultOrtho.guides.some(g => g.label === '90°' || g.label === 'Alin A')).toBe(true)
    expect(resultOrtho.guides.some(g => g.label === 'Canal Central')).toBe(true)
  })

  it('calcula curvas centralizadas com centerWireBends', () => {
    // Top to bottom crossing channel 336
    const a = { x: 214, y: 258 }
    const b = { x: 310, y: 399 }
    const bends = centerWireBends(a, b)
    expect(bends).toHaveLength(2)
    expect(bends[0]).toEqual({ x: 214, y: 336 })
    expect(bends[1]).toEqual({ x: 310, y: 336 })

    // Collinear points don't need bends
    const col = centerWireBends({ x: 100, y: 200 }, { x: 100, y: 300 })
    expect(col).toEqual([])
  })

  it('extrai polyline de fio com wirePolylinePoints', () => {
    const project = demoProject()
    const wire = project.wires[0]
    const a = { x: 10, y: 20 }
    const b = { x: 100, y: 200 }
    const points = wirePolylinePoints(project, wire, a, b)
    expect(points[0]).toEqual(a)
    expect(points[points.length - 1]).toEqual(b)
  })

  it('preserva dobras intermediárias ao calcular pontos do fio', () => {
    const project = demoProject()
    const wireWithBends = {
      ...project.wires[0],
      bends: [
        { x: 10, y: 100 },
        { x: 100, y: 100 },
      ],
    }
    const a = { x: 10, y: 20 }
    const b = { x: 100, y: 200 }
    const points = wirePolylinePoints(project, wireWithBends, a, b)
    expect(points).toEqual([
      { x: 10, y: 20 },
      { x: 10, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 200 },
    ])
    const path = roundedWirePath(points)
    expect(path).toContain('M 10 20')
    expect(path).toContain('100 200')
  })
})
