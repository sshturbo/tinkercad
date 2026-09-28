import type { WirePoint } from './model'

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
