import { describe, expect, it } from 'vitest'
import { demoProject, validProject } from './model'
import { roundedWirePath } from './wireGeometry'

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
})
