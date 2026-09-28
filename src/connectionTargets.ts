import { board, isBreadboardPart, terminalPosition, type Point } from './layout'
import { libraryIdFromPart, libraryPinNames, type LibraryRecords } from './library'
import { pinId, pinNames, type Project } from './model'
import { friendlyPinLabel } from './pinout'

export type ConnectionTarget = Point & { id: string; partId: string; label: string; isBoard: boolean }

export function connectionTargets(project: Project, records: LibraryRecords): ConnectionTarget[] {
  return project.parts.flatMap(part => {
    const isBoard = isBreadboardPart(part, records)
    // These boards are rendered with board:* IDs, including library breadboards.
    const ids = isBoard
      ? Array.from({ length: board.columns }, (_, column) => [
        ...['top-plus', 'top-minus', 'bottom-plus', 'bottom-minus'].map(rail => `board:${part.id}:${rail}:${column}`),
        ...['left', 'right'].flatMap(side => Array.from({ length: 5 }, (_, hole) => `board:${part.id}:row:${column}:${side}:${hole}`)),
      ]).flat()
      : (part.kind === 'library' ? libraryPinNames(records[libraryIdFromPart(part)]) : pinNames[part.kind])
        .filter(pin => !(part.kind === 'button' && pin === 'OUT')).map(pin => pinId(part, pin))
    return ids.flatMap(id => {
      const point = terminalPosition(project, id, records)
      if (!point) return []
      return [{ ...point, id, partId: part.id, isBoard, label: terminalLabel(project, id) }]
    })
  })
}

export function terminalLabel(project: Project, id: string): string {
  if (id.startsWith('board:')) {
    const [, partId, group, column, side, hole] = id.split(':')
    const part = project.parts.find(p => p.id === partId)
    const row = side === 'left' ? ['j', 'i', 'h', 'g', 'f'] : ['e', 'd', 'c', 'b', 'a']
    const rail = `${group.startsWith('top') ? 'superior' : 'inferior'} ${group.endsWith('plus') ? '+' : '−'}`
    return `${part?.label ?? partId}: ${group === 'row' ? row[Number(hole)] : rail}${Number(column) + 1}`
  }
  const separator = id.indexOf(':')
  const part = project.parts.find(p => p.id === id.slice(0, separator))
  return part ? friendlyPinLabel(part.kind, id.slice(separator + 1), part.label) : id
}

/** Resolve by distance, not SVG stacking order. A mounted pin wins a tie with its hole. */
export function nearestConnectionTarget(targets: ConnectionTarget[], point: Point, radius: number): ConnectionTarget | undefined {
  let nearest: ConnectionTarget | undefined
  let distance = radius
  for (const target of targets) {
    const nextDistance = Math.hypot(target.x - point.x, target.y - point.y)
    if (nextDistance > radius) continue
    if (!nearest || nextDistance < distance - 0.01 || (Math.abs(nextDistance - distance) <= 0.01 && nearest.isBoard && !target.isBoard)) {
      nearest = target
      distance = nextDistance
    }
  }
  return nearest
}
