import { board } from './layout'
import type { Project, Wire, WirePoint } from './model'

export type SnapGuide = {
  type: 'x' | 'y'
  pos: number
  label?: string
}

export function roundedWirePath(points: WirePoint[], radius = 9): string {
  const nodes = points.filter((point, index) => index === 0 || Math.hypot(point.x - points[index - 1].x, point.y - points[index - 1].y) > 0.1)
  if (!nodes.length) return ''
  let path = `M ${nodes[0].x} ${nodes[0].y}`
  for (let index = 1; index < nodes.length - 1; index++) {
    const before = nodes[index - 1], corner = nodes[index], after = nodes[index + 1]
    const incoming = { x: corner.x - before.x, y: corner.y - before.y }
    const outgoing = { x: after.x - corner.x, y: after.y - corner.y }
    const a = Math.hypot(incoming.x, incoming.y), b = Math.hypot(outgoing.x, outgoing.y)
    if (a < 0.1 || b < 0.1) continue
    const cross = incoming.x * outgoing.y - incoming.y * outgoing.x
    const dot = incoming.x * outgoing.x + incoming.y * outgoing.y
    if (Math.abs(cross) < 0.001 && dot > 0) continue
    const trim = Math.min(radius, a / 3, b / 3)
    const entry = { x: corner.x - incoming.x / a * trim, y: corner.y - incoming.y / a * trim }
    const exit = { x: corner.x + outgoing.x / b * trim, y: corner.y + outgoing.y / b * trim }
    path += ` L ${entry.x} ${entry.y} Q ${corner.x} ${corner.y} ${exit.x} ${exit.y}`
  }
  const last = nodes[nodes.length - 1]
  return `${path} L ${last.x} ${last.y}`
}

export function wirePolylinePoints(project: Project, wire: Wire, a: WirePoint, b: WirePoint): WirePoint[] {
  if (wire.bends && wire.bends.length > 0) return [a, ...wire.bends, b]
  const from = project.parts.find(p => wire.from.startsWith(`${p.id}:`))
  const to = project.parts.find(p => wire.to.startsWith(`${p.id}:`))
  if (from?.kind === 'supply') {
    const outside = board.x - 25
    const belowPanel = wire.from.endsWith(':PLUS') ? a.y + 28 : a.y + 43
    return [a, { x: a.x, y: belowPanel }, { x: outside, y: belowPanel }, { x: outside, y: b.y }, b]
  }
  if (to?.kind === 'supply') {
    const outside = board.x - 25
    const belowPanel = wire.to.endsWith(':PLUS') ? b.y + 28 : b.y + 43
    return [a, { x: outside, y: a.y }, { x: outside, y: belowPanel }, { x: b.x, y: belowPanel }, b]
  }
  if (from?.kind === 'generator') {
    const outside = board.x - 20
    const belowPanel = a.y + (wire.from.endsWith(':GND') ? 45 : 30)
    if (wire.from.endsWith(':GND')) return [a, { x: a.x, y: belowPanel }, { x: b.x, y: belowPanel }, b]
    const upper = Math.min(b.y - 28, 276)
    return [a, { x: a.x, y: belowPanel }, { x: outside, y: belowPanel }, { x: outside, y: upper }, { x: b.x, y: upper }, b]
  }
  if (to?.kind === 'generator') {
    const outside = board.x - 20
    const belowPanel = b.y + (wire.to.endsWith(':GND') ? 45 : 30)
    if (wire.to.endsWith(':GND')) return [a, { x: a.x, y: belowPanel }, { x: b.x, y: belowPanel }, b]
    const upper = Math.min(a.y - 28, 276)
    return [a, { x: a.x, y: upper }, { x: outside, y: upper }, { x: outside, y: belowPanel }, { x: b.x, y: belowPanel }, b]
  }
  if (Math.abs(a.x - b.x) < 7 || Math.abs(a.y - b.y) < 7) return [a, b]
  if (from && ['dff7474', 'jk74hc73', 'nand74hc00'].includes(from.kind)) {
    const exitsTop = a.y < from.y
    if (to && to.id === 'u3') {
      const bottomLane = wire.from.includes('Saída 1') ? 456 : 446
      return [a, { x: a.x, y: bottomLane }, { x: b.x - 12, y: bottomLane }, { x: b.x - 12, y: b.y }, b]
    }
    const lane = to?.kind === 'resistor' ? (exitsTop ? 228 : 442) : exitsTop ? Math.min(a.y, b.y) - 28 : Math.max(a.y, b.y) + 28
    return [a, { x: a.x, y: lane }, { x: b.x, y: lane }, b]
  }
  const middle = (a.x + b.x) / 2
  return [a, { x: middle, y: a.y }, { x: middle, y: b.y }, b]
}

export function snapBendPoint(
  target: WirePoint,
  prev: WirePoint,
  next: WirePoint,
  endA: WirePoint,
  endB: WirePoint,
  tolerance = 8,
): { snapped: WirePoint; guides: SnapGuide[] } {
  let x = Math.round(target.x)
  let y = Math.round(target.y)
  const guides: SnapGuide[] = []

  const xCandidates: Array<{ pos: number; label: string; priority: number }> = [
    { pos: Math.round((endA.x + endB.x) / 2), label: 'Centro X', priority: 1 },
    { pos: Math.round((prev.x + next.x) / 2), label: 'Centro Seg', priority: 2 },
    { pos: prev.x, label: '90°', priority: 3 },
    { pos: next.x, label: '90°', priority: 3 },
    { pos: endA.x, label: 'Alin A', priority: 4 },
    { pos: endB.x, label: 'Alin B', priority: 4 },
  ]

  // Breadboard 12px grid
  const nearestCol = Math.round((target.x - 214) / 12)
  if (nearestCol >= 0 && nearestCol <= 60) {
    xCandidates.push({ pos: 214 + nearestCol * 12, label: 'Grid', priority: 5 })
  }

  let bestXDist = tolerance + 1
  let bestXCandidate: { pos: number; label: string; priority: number } | null = null

  for (const cand of xCandidates) {
    const dist = Math.abs(target.x - cand.pos)
    if (dist <= tolerance) {
      if (
        !bestXCandidate ||
        cand.priority < bestXCandidate.priority ||
        (cand.priority === bestXCandidate.priority && dist < bestXDist)
      ) {
        bestXDist = dist
        bestXCandidate = cand
      }
    }
  }

  if (bestXCandidate) {
    x = bestXCandidate.pos
    guides.push({ type: 'x', pos: x, label: bestXCandidate.label })
  }

  const yCandidates: Array<{ pos: number; label: string; priority: number }> = [
    { pos: Math.round((endA.y + endB.y) / 2), label: 'Centro Y', priority: 1 },
    { pos: Math.round((prev.y + next.y) / 2), label: 'Centro Seg', priority: 2 },
    { pos: 336, label: 'Canal Central', priority: 2 },
    { pos: 228, label: 'Canal Sup', priority: 3 },
    { pos: 444, label: 'Canal Inf', priority: 3 },
    { pos: prev.y, label: '90°', priority: 3 },
    { pos: next.y, label: '90°', priority: 3 },
    { pos: endA.y, label: 'Alin A', priority: 4 },
    { pos: endB.y, label: 'Alin B', priority: 4 },
  ]

  let bestYDist = tolerance + 1
  let bestYCandidate: { pos: number; label: string; priority: number } | null = null

  for (const cand of yCandidates) {
    const dist = Math.abs(target.y - cand.pos)
    if (dist <= tolerance) {
      if (
        !bestYCandidate ||
        cand.priority < bestYCandidate.priority ||
        (cand.priority === bestYCandidate.priority && dist < bestYDist)
      ) {
        bestYDist = dist
        bestYCandidate = cand
      }
    }
  }

  if (bestYCandidate) {
    y = bestYCandidate.pos
    guides.push({ type: 'y', pos: y, label: bestYCandidate.label })
  }

  return { snapped: { x, y }, guides }
}

export function centerWireBends(a: WirePoint, b: WirePoint): WirePoint[] {
  if (Math.abs(a.x - b.x) <= 7 || Math.abs(a.y - b.y) <= 7) return []

  // Check if crossing breadboard center channel (336)
  if ((a.y < 336 && b.y > 336) || (a.y > 336 && b.y < 336)) {
    return [
      { x: a.x, y: 336 },
      { x: b.x, y: 336 },
    ]
  }

  // If mostly horizontal separation
  if (Math.abs(a.x - b.x) >= Math.abs(a.y - b.y)) {
    const midX = Math.round((a.x + b.x) / 2)
    return [
      { x: midX, y: a.y },
      { x: midX, y: b.y },
    ]
  }

  // Mostly vertical separation
  const midY = Math.round((a.y + b.y) / 2)
  return [
    { x: a.x, y: midY },
    { x: b.x, y: midY },
  ]
}
