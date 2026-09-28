import { access, cp, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(projectRoot, 'circuit-library')
const destination = join(projectRoot, 'assets', 'circuit-library')
const derivedExtents = {
  '8-port I2C expander': { left: -41, top: -16, width: 82, height: 32 },
  'Arduino Uno R3': { left: -135, top: -105, width: 270, height: 210 },
  'Solar Cell': { left: -157.5, top: 0, width: 315, height: 355 },
}

let sourceExists = true
try {
  await access(source)
} catch {
  sourceExists = false
}

if (sourceExists) {
  await cp(source, destination, { recursive: true, force: true })
} else {
  await access(destination)
}

async function filesNamed(directory, name) {
  const entries = await readdir(directory, { withFileTypes: true })
  const found = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) found.push(...await filesNamed(path, name))
    else if (entry.name === name) found.push(path)
  }
  return found
}

for (const recordPath of await filesNamed(destination, 'record.json')) {
  const record = JSON.parse(await readFile(recordPath, 'utf8'))
  let extents = record.extents
  let hasExtents = extents && [extents.left, extents.top, extents.width, extents.height].every(Number.isFinite) && extents.width > 0 && extents.height > 0
  if (!hasExtents && derivedExtents[record.name]) {
    extents = derivedExtents[record.name]
    record.extents = extents
    hasExtents = true
    await writeFile(recordPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
  }

  for (const svg of record.svgs ?? []) {
    const svgPath = join(dirname(recordPath), svg.file ?? '')
    let sourceSvg
    try {
      sourceSvg = await readFile(svgPath, 'utf8')
    } catch {
      continue
    }

    const opening = sourceSvg.match(/<svg\b[^>]*>/i)?.[0]
    if (!opening) continue

    let normalizedOpening = opening
      .replace(/\s(?:x|y|width|height)\s*=\s*(["'])[^"']*\1/gi, '')
    if (!/\sxmlns\s*=/i.test(normalizedOpening)) {
      normalizedOpening = normalizedOpening.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    if (!/\sxmlns:xlink\s*=/i.test(normalizedOpening)) {
      normalizedOpening = normalizedOpening.replace(/<svg\b/i, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
    }
    if (hasExtents) {
      const viewBox = `${extents.left} ${extents.top} ${extents.width} ${extents.height}`
      normalizedOpening = /\bviewBox\s*=\s*(["'])[^"']*\1/i.test(normalizedOpening)
        ? normalizedOpening.replace(/\bviewBox\s*=\s*(["'])[^"']*\1/i, `viewBox="${viewBox}"`)
        : normalizedOpening.replace(/>$/, ` viewBox="${viewBox}">`)
    }

    if (normalizedOpening !== opening) await writeFile(svgPath, sourceSvg.replace(opening, normalizedOpening), 'utf8')
  }
}
