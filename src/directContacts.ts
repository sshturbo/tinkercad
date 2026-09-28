import { connectionTargets, type ConnectionTarget } from './connectionTargets'
import { isBreadboardPart } from './layout'
import type { LibraryRecords } from './library'
import type { Project, Wire } from './model'

// IDs survive both JSON and the native SQLite/Rust project format.
export const isDirectContact = (wire: Wire) => Boolean(wire.hidden && wire.id.startsWith('contact:'))
export const directSnapRadius = 18
const contactTolerance = 0.5
export type DirectContactCandidate = { from: ConnectionTarget; to: ConnectionTarget; distance: number }

function componentTargets(project: Project, records: LibraryRecords) {
  return connectionTargets({ ...project, parts: project.parts.filter(part => !isBreadboardPart(part, records)) }, records)
}

export function findDirectContact(project: Project, partId: string, records: LibraryRecords, radius = directSnapRadius): DirectContactCandidate | undefined {
  const targets = componentTargets(project, records)
  const moving = targets.filter(target => target.partId === partId)
  const fixed = targets.filter(target => target.partId !== partId)
  let candidate: DirectContactCandidate | undefined
  for (const from of moving) for (const to of fixed) {
    const distance = Math.hypot(from.x - to.x, from.y - to.y)
    if (distance <= radius && (!candidate || distance < candidate.distance)) candidate = { from, to, distance }
  }
  return candidate
}

/** Physical contacts conduct only while the two pin tips actually coincide. */
export function refreshDirectContacts(project: Project, records: LibraryRecords): Project {
  const targets = componentTargets(project, records)
  const contacts: Wire[] = []
  for (let i = 0; i < targets.length; i++) for (let j = i + 1; j < targets.length; j++) {
    const a = targets[i], b = targets[j]
    if (a.partId === b.partId || Math.hypot(a.x - b.x, a.y - b.y) > contactTolerance) continue
    const [from, to] = [a.id, b.id].sort()
    contacts.push({ id: `contact:${JSON.stringify([from, to])}`, from, to, color: '#15803d', hidden: true })
  }
  const previous = project.wires.filter(isDirectContact)
  const ids = new Set(previous.map(wire => wire.id))
  if (previous.length === contacts.length && contacts.every(wire => ids.has(wire.id))) return project
  return { ...project, wires: [...project.wires.filter(wire => !isDirectContact(wire)), ...contacts] }
}

export function snapDirectContact(project: Project, candidate: DirectContactCandidate): Project {
  const dx = Number.isFinite(candidate.to.x - candidate.from.x) ? candidate.to.x - candidate.from.x : 0
  const dy = Number.isFinite(candidate.to.y - candidate.from.y) ? candidate.to.y - candidate.from.y : 0
  return { ...project, parts: project.parts.map(part => part.id === candidate.from.partId
    ? { ...part, x: (Number.isFinite(part.x) ? part.x : 0) + dx, y: (Number.isFinite(part.y) ? part.y : 0) + dy } : part) }
}
