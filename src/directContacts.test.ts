import { describe, expect, it } from 'vitest'
import { findDirectContact, isDirectContact, refreshDirectContacts, snapDirectContact } from './directContacts'
import { terminalPosition } from './layout'
import { emptyRuntime, validProject, type Project } from './model'
import { simulate } from './simulator'

const circuit = (): Project => ({
  version: 1, id: 'direct', name: 'Contato resistor LED',
  parts: [
    { id: 'r', kind: 'resistor', label: 'R1', x: 119, y: 157, rotation: 0 },
    { id: 'd', kind: 'led', label: 'D1', x: 112, y: 100, rotation: 0 },
    { id: 's', kind: 'supply', label: 'P1', x: -200, y: 0, rotation: 0, properties: { voltage: 5 } },
  ],
  wires: [
    { id: 'power', from: 's:PLUS', to: 'r:B', color: 'red' },
    { id: 'ground', from: 's:MINUS', to: 'd:K', color: 'black' },
  ],
})

describe('contato físico sem fio entre componentes', () => {
  it('ao soltar o resistor perto do ânodo, alinha os terminais e mantém o contato', () => {
    const initial = circuit()
    const project = {
      ...initial,
      parts: initial.parts.map(part => part.id === 'r' ? { ...part, x: 500, y: 260 } : part),
    }
    // Simulate dragging the part back near the LED, then releasing with a
    // small gap between the lead tips. The release snap closes that gap.
    const released = {
      ...project,
      parts: project.parts.map(part => part.id === 'r' ? { ...part, x: 119, y: 157 } : part),
    }
    const candidate = findDirectContact(released, 'r', {})!
    expect(candidate.from.id).toBe('r:A')
    expect(candidate.to.id).toBe('d:A')
    expect(candidate.distance).toBeGreaterThan(0)
    const attached = refreshDirectContacts(snapDirectContact(released, candidate), {})
    expect(terminalPosition(attached, 'r:A')).toEqual(terminalPosition(attached, 'd:A'))
    expect(attached.wires.filter(isDirectContact)).toHaveLength(1)
    expect(attached.wires.filter(wire => !wire.hidden)).toHaveLength(2)
    expect(simulate(attached, emptyRuntime()).simulation.leds.d).toBe('1')
    expect(refreshDirectContacts(attached, {})).toBe(attached)
  })

  it('aproximação ou sobreposição do corpo não cria contato elétrico', () => {
    expect(refreshDirectContacts(circuit(), {}).wires.filter(isDirectContact)).toHaveLength(0)
    const far = { ...circuit(), parts: circuit().parts.map(part => part.id === 'r' ? { ...part, x: 500 } : part) }
    expect(findDirectContact(far, 'r', {})).toBeUndefined()
    const sameBody = { ...circuit(), parts: circuit().parts.map(part => part.id === 'r' ? { ...part, x: 112, y: 100 } : part) }
    expect(findDirectContact(sameBody, 'r', {})).toBeUndefined()
  })

  it.each(['r', 'd'])('desconecta ao afastar qualquer lado (%s), preservando os fios', partId => {
    const project = circuit()
    const attached = refreshDirectContacts(snapDirectContact(project, findDirectContact(project, 'r', {})!), {})
    const moved = refreshDirectContacts({ ...attached, parts: attached.parts.map(part => part.id === partId ? { ...part, x: part.x + 100 } : part) }, {})
    expect(moved.wires.filter(isDirectContact)).toHaveLength(0)
    expect(moved.wires).toEqual(project.wires)
    expect(simulate(moved, emptyRuntime()).simulation.leds.d).not.toBe('1')
    // Undo restores the saved project and its electrical contact.
    expect(simulate(attached, emptyRuntime()).simulation.leds.d).toBe('1')
  })

  it('girar desfaz o contato e permite encaixar o terminal na nova orientação', () => {
    const project = circuit()
    const attached = refreshDirectContacts(snapDirectContact(project, findDirectContact(project, 'r', {})!), {})
    const rotated = refreshDirectContacts({ ...attached, parts: attached.parts.map(part => part.id === 'r' ? { ...part, rotation: 90 } : part) }, {})
    expect(rotated.wires.filter(isDirectContact)).toHaveLength(0)
    const near = { ...rotated, parts: rotated.parts.map(part => part.id === 'r' ? { ...part, x: 86, y: 115 } : part) }
    const candidate = findDirectContact(near, 'r', {})!
    expect(candidate.from.id).toBe('r:A')
    const joined = refreshDirectContacts(snapDirectContact(near, candidate), {})
    expect(joined.wires.filter(isDirectContact)).toHaveLength(1)
    expect(simulate(joined, emptyRuntime()).simulation.leds.d).toBe('1')
  })

  it('salva o contato no formato existente sem perder contatos de protoboard', () => {
    const project = circuit()
    project.wires.push({ id: 'snap-r-B', from: 'r:B', to: 'board:bb:row:0:left:0', color: 'gray', hidden: true })
    const attached = refreshDirectContacts(snapDirectContact(project, findDirectContact(project, 'r', {})!), {})
    const loaded: Project = JSON.parse(JSON.stringify(attached))
    expect(validProject(loaded)).toBe(true)
    expect(loaded.wires.filter(isDirectContact)).toHaveLength(1)
    expect(refreshDirectContacts(loaded, {}).wires).toContainEqual(project.wires[2])
    expect(simulate(loaded, emptyRuntime()).simulation.leds.d).toBe('1')
  })
})
