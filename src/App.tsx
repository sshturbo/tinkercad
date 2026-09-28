import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardPaste,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Layers,
  LayoutGrid,
  List,
  Maximize2,
  Minus,
  Plus,
  Redo2,
  RotateCcw,
  RotateCw,
  Save,
  Search,
  Share2,
  Sparkles,
  StepForward,
  Trash2,
  Undo2,
  Upload,
  X,
  Zap,
} from 'lucide-react'
import Canvas, { type View } from './Canvas'
import SchematicView from './SchematicView'
import {
  getComponentDetail,
  getComponentDescription,
  type ComponentDetail,
} from './componentDetailsData'
import ComponentPopover, { standardWireColors } from './ComponentPopover'
import {
  emptyProject,
  initialRuntime,
  labels,
  newId,
  normalizeProjectPinNames,
  pinNames,
  validProject,
  type Part,
  type Project,
  type Runtime,
  type Simulation,
  type Wire,
  type WirePoint,
} from './model'
import { boardPoint, terminalPosition } from './layout'
import { terminalLabel } from './connectionTargets'
import { findDirectContact, isDirectContact, refreshDirectContacts, snapDirectContact } from './directContacts'
import {
  getComponentDisplayName,
  libraryAssetUrl,
  libraryBoardConnections,
  libraryItemForKind,
  libraryItemSupportsSimulation,
  libraryKindForItem,
  libraryIdFromPart,
  libraryPinNames,
  CATALOG_GROUPS,
  loadCatalogItems,
  loadLibraryItems,
  loadLibraryRecord,
  type CatalogMenuKey,
  type LibraryCatalogItem,
  type LibraryRecord,
  type LibraryRecords,
} from './library'
import { listProjects, loadProject, native, runSimulation, saveProject, type ProjectSummary } from './native'
import { evaluatePIRSensorTarget, pirSensorDrivePulseOnTransition, resetPIRSensorRuntimeEdges, resolvePIRSensorTargetPosition } from './pirSensorModel'
import { resetUltrasonicRuntime, resolveUltrasonicTargetPosition } from './ultrasonicPingModel'
import './App.css'

const initialView: View = { x: -265, y: -20, width: 2050, height: 820 }

function attachInsertedPins(
  project: Project,
  partId: string,
  align: boolean,
  libraryRecords: LibraryRecords,
  alignTolerance = 24,
  terminalTolerance = 18,
): Project {
  let part = project.parts.find(p => p.id === partId)
  if (!part || part.kind === 'breadboard') return project
  if (part.kind === 'library' && libraryRecords[libraryIdFromPart(part)]?.name.startsWith('Breadboard')) return project
  const partKind = part.kind
  const physicalPins = partKind === 'library'
    ? libraryPinNames(libraryRecords[libraryIdFromPart(part)])
    : pinNames[partKind].filter(pin => !(partKind === 'button' && pin === 'OUT'))
  const holes: { id: string; x: number; y: number }[] = []
  for (const board of project.parts.filter(p => p.kind === 'breadboard')) {
    for (let column = 0; column < 30; column++) {
      const ids = ['top-plus', 'top-minus', 'bottom-plus', 'bottom-minus'].map(rail => `board:${board.id}:${rail}:${column}`)
      for (const side of ['left', 'right']) for (let hole = 0; hole < 5; hole++) ids.push(`board:${board.id}:row:${column}:${side}:${hole}`)
      for (const id of ids) {
        const pt = boardPoint(project, id, libraryRecords)
        if (pt) holes.push({ id, ...pt })
      }
    }
  }
  for (const board of project.parts.filter(p => p.kind === 'library')) {
    const record = libraryRecords[libraryIdFromPart(board)]
    if (!record?.name.startsWith('Breadboard')) continue
    for (const pin of libraryPinNames(record)) {
      const id = `${board.id}:${pin}`
      const point = terminalPosition(project, id, libraryRecords)
      if (point) holes.push({ id, ...point })
    }
  }
  const closest = (x: number, y: number) => {
    let nearest: typeof holes[number] | undefined, distance = Infinity
    for (const hole of holes) {
      const d = Math.hypot(hole.x - x, hole.y - y)
      if (d < distance) {
        nearest = hole
        distance = d
      }
    }
    return { nearest, distance }
  }
  if (align) {
    const shifts: { dx: number; dy: number }[] = []
    for (const pin of physicalPins) {
      const pt = terminalPosition(project, `${part.id}:${pin}`, libraryRecords)
      if (!pt) continue
      const { nearest, distance } = closest(pt.x, pt.y)
      if (nearest && distance <= alignTolerance) shifts.push({ dx: nearest.x - pt.x, dy: nearest.y - pt.y })
    }
    const median = (values: number[]) => {
      const valid = values.filter(Number.isFinite)
      if (!valid.length) return 0
      const sorted = [...valid].sort((a, b) => a - b)
      const middle = Math.floor(sorted.length / 2)
      return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
    }
    if (shifts.length) {
      const shiftX = median(shifts.map(shift => shift.dx))
      const shiftY = median(shifts.map(shift => shift.dy))
      const safeX = Number.isFinite(part.x) ? part.x : 0
      const safeY = Number.isFinite(part.y) ? part.y : 0
      part = { ...part, x: safeX + shiftX, y: safeY + shiftY }
      project = { ...project, parts: project.parts.map(p => p.id === partId ? part! : p) }
    }
  }
  const previousSnaps = project.wires.filter(w => w.hidden && !isDirectContact(w) && (w.from.startsWith(`${partId}:`) || w.to.startsWith(`${partId}:`)))
  const wires = project.wires.filter(w => !previousSnaps.includes(w))
  for (const pin of physicalPins) {
    const pt = terminalPosition(project, `${part.id}:${pin}`, libraryRecords)
    if (!pt) continue
    const { nearest, distance } = closest(pt.x, pt.y)
    if (nearest && distance <= terminalTolerance) {
      wires.push({ id: newId(), from: `${part.id}:${pin}`, to: nearest.id, color: '#86939c', hidden: true })
    }
  }
  return { ...project, wires }
}

function attachPartContacts(project: Project, partId: string, align: boolean, records: LibraryRecords): Project {
  const contact = align ? findDirectContact(project, partId, records) : undefined
  const positioned = contact ? snapDirectContact(project, contact) : project
  return refreshDirectContacts(attachInsertedPins(positioned, partId, align && !contact, records), records)
}

function internalBoardWires(part: Part, record: LibraryRecord): Wire[] {
  return libraryBoardConnections(record).map(([from, to], index) => ({
    id: `internal-${part.id}-${index}`,
    from: `${part.id}:${from}`,
    to: `${part.id}:${to}`,
    color: '#86939c',
    hidden: true,
  }))
}

function alignToSavedConnections(project: Project, partId: string, libraryRecords: LibraryRecords): Project {
  const part = project.parts.find(candidate => candidate.id === partId)
  if (!part) return project
  const shifts = project.wires.flatMap(wire => {
    if (!wire.hidden) return []
    const pin = wire.from.startsWith(`${partId}:`) ? wire.from : wire.to.startsWith(`${partId}:`) ? wire.to : undefined
    if (!pin) return []
    const hole = pin === wire.from ? wire.to : wire.from
    const from = terminalPosition(project, pin, libraryRecords)
    const to = boardPoint(project, hole, libraryRecords)
    return from && to ? [{ x: to.x - from.x, y: to.y - from.y }] : []
  })
  if (!shifts.length) return project
  const median = (values: number[]) => {
    const valid = values.filter(Number.isFinite)
    if (!valid.length) return 0
    const sorted = [...valid].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
  }
  const shiftX = median(shifts.map(shift => shift.x))
  const shiftY = median(shifts.map(shift => shift.y))
  const safeX = Number.isFinite(part.x) ? part.x : 0
  const safeY = Number.isFinite(part.y) ? part.y : 0
  const x = safeX + shiftX
  const y = safeY + shiftY
  if (Math.hypot(x - safeX, y - safeY) < 0.1) return project
  return { ...project, parts: project.parts.map(candidate => candidate.id === partId ? { ...candidate, x, y } : candidate) }
}

export default function App() {
  const [project, setProject] = useState<Project>(emptyProject)
  const projectRef = useRef(project)
  useEffect(() => { document.title = `${project.name} | CircuitLab Offline` }, [project.name])
  const [runtime, setRuntime] = useState<Runtime>(() => initialRuntime(project))
  const [simulation, setSimulation] = useState<Simulation>()
  const [running, setRunning] = useState(false)
  const [simulationStarted, setSimulationStarted] = useState(false)
  const [simulationEngine, setSimulationEngine] = useState<'rust' | 'typescript'>(native ? 'rust' : 'typescript')
  const [simTime, setSimTime] = useState(0)
  const lastSimTimeRef = useRef(0)
  const transientStateRef = useRef<{ projectId: string; capacitorVoltages: Record<string, number>; capacitorCurrents: Record<string, number>; inductorCurrents: Record<string, number>; inductorVoltages: Record<string, number> }>({ projectId: '', capacitorVoltages: {}, capacitorCurrents: {}, inductorCurrents: {}, inductorVoltages: {} })
  const [speed, setSpeed] = useState(1)
  const [maximumSubstepSeconds, setMaximumSubstepSeconds] = useState(0.01)
  const [selected, setSelected] = useState<string>()
  const [pending, setPending] = useState<string>()
  const [wireBends, setWireBends] = useState<WirePoint[]>([])
  const [wireColor, setWireColor] = useState('#43a047')
  const [wireColorDropdownOpen, setWireColorDropdownOpen] = useState(false)
  const [fileMenuOpen, setFileMenuOpen] = useState(false)
  const [wireType, setWireType] = useState('normal')
  const [past, setPast] = useState<Project[]>([])
  const [future, setFuture] = useState<Project[]>([])
  const [dirty, setDirty] = useState(false)
  const [clipboardPart, setClipboardPart] = useState<Part | null>(null)
  const [view, setView] = useState(initialView)
  const [viewMode, setViewMode] = useState<'circuit' | 'schematic'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#schematic') return 'schematic'
    return 'circuit'
  })

  const switchView = useCallback((mode: 'circuit' | 'schematic') => {
    setViewMode(mode)
    if (typeof window !== 'undefined') {
      if (mode === 'schematic') window.location.hash = '#schematic'
      else if (window.location.hash === '#schematic') {
        history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }
  }, [])

  // Drawer & Modals state
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [drawerViewMode, setDrawerViewMode] = useState<'grid' | 'list'>('list')
  const [selectedDetailItem, setSelectedDetailItem] = useState<LibraryCatalogItem | null>(null)
  const [detailFontSize, setDetailFontSize] = useState<'normal' | 'large'>('normal')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    description: true,
    'get-started': true,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeModal, setActiveModal] = useState<null | 'code' | 'bom' | 'schematic' | 'export' | 'share' | 'library' | 'help'>(null)
  const [library, setLibrary] = useState<ProjectSummary[]>([])
  const [catalogItems, setCatalogItems] = useState<LibraryCatalogItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CatalogMenuKey>('components-basic')
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [allComponents, setAllComponents] = useState<LibraryCatalogItem[]>([])
  const catalogCache = useRef<Record<string, LibraryCatalogItem[]>>({})
  const [libraryRecords, setLibraryRecords] = useState<LibraryRecords>({})
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogDetailsLoading, setCatalogDetailsLoading] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [notesVisible, setNotesVisible] = useState(true)
  const [toast, setToast] = useState('')
  const importRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const libraryRecordCache = useRef(new Map<string, LibraryRecord>())
  const libraryRecordRequests = useRef(new Map<string, Promise<LibraryRecord>>())
  const libraryPinMigrations = useRef(new Set<string>())

  const cancelWire = () => {
    setPending(undefined)
    setWireBends([])
  }

  const message = useCallback((value: string) => {
    setToast(value)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 3500)
  }, [])

  const ensureLibraryRecord = useCallback((item: LibraryCatalogItem) => {
    const id = String(item.id)
    const cached = libraryRecordCache.current.get(id)
    if (cached) return Promise.resolve(cached)
    const pendingRequest = libraryRecordRequests.current.get(id)
    if (pendingRequest) return pendingRequest
    const request = loadLibraryRecord(item)
      .then(record => {
        libraryRecordCache.current.set(id, record)
        return record
      })
      .finally(() => libraryRecordRequests.current.delete(id))
    libraryRecordRequests.current.set(id, request)
    return request
  }, [])

  // Pre-load all components in the background for board lookups & migrations
  useEffect(() => {
    let active = true
    loadLibraryItems()
      .then(items => {
        if (active) {
          setAllComponents(items)
          catalogCache.current['components-all'] = items
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  // Load items for the selected category in the components drawer
  useEffect(() => {
    let active = true
    if (catalogCache.current[selectedCategory]) {
      setCatalogItems(catalogCache.current[selectedCategory])
      setCatalogLoading(false)
      setCatalogError('')
      return
    }
    setCatalogLoading(true)
    loadCatalogItems(selectedCategory)
      .then(items => {
        if (active) {
          catalogCache.current[selectedCategory] = items
          setCatalogItems(items)
          setCatalogLoading(false)
          setCatalogError('')
        }
      })
      .catch(error => {
        if (active) {
          setCatalogError(`Não foi possível abrir a categoria: ${String(error)}`)
          setCatalogLoading(false)
        }
      })
    return () => { active = false }
  }, [selectedCategory])

  useEffect(() => {
    if (catalogItems.length === 0) return
    let active = true
    const cached = Object.fromEntries(
      catalogItems.flatMap(item => {
        const id = String(item.id)
        const record = libraryRecordCache.current.get(id)
        return record ? [[id, record] as const] : []
      }),
    )
    if (Object.keys(cached).length) setLibraryRecords(current => ({ ...current, ...cached }))
    const missing = catalogItems.filter(item => !libraryRecordCache.current.has(String(item.id)))
    if (!missing.length) {
      setCatalogDetailsLoading(false)
      return
    }
    setCatalogDetailsLoading(true)
    Promise.allSettled(missing.map(async item => ({ id: String(item.id), record: await ensureLibraryRecord(item) }))).then(results => {
      if (!active) return
      const loaded: LibraryRecords = {}
      let failed = 0
      for (const result of results) {
        if (result.status === 'fulfilled') loaded[result.value.id] = result.value.record
        else failed++
      }
      setLibraryRecords(current => ({ ...current, ...loaded }))
      setCatalogDetailsLoading(false)
      if (failed) setCatalogError(`${failed} detalhe(s) não puderam ser carregados.`)
      else setCatalogError('')
    })
    return () => { active = false }
  }, [catalogItems, ensureLibraryRecord])

  const componentPool = allComponents.length ? allComponents : catalogItems

  useEffect(() => {
    if (!componentPool.length) return
    let changed = false
    const nextParts = projectRef.current.parts.map(part => {
      const storedId = libraryIdFromPart(part)
      const item = componentPool.find(candidate => String(candidate.id) === storedId) ??
        (part.kind === 'library' ? undefined : libraryItemForKind(componentPool, part.kind))
      if (!item) return part
      if (storedId === String(item.id) && part.properties?.libraryPath === item.path && part.properties?.libraryThumbnail === item.thumbnail && part.properties?.simulationModel === (item.simulation_model ?? '')) return part
      changed = true
      return {
        ...part,
        properties: {
          ...part.properties,
          libraryId: String(item.id),
          libraryPath: item.path ?? '',
          libraryThumbnail: item.thumbnail,
          simulationModel: item.simulation_model ?? '',
        },
      }
    })
    if (!changed) return
    const migrated = { ...projectRef.current, parts: nextParts }
    projectRef.current = migrated
    setProject(migrated)
  }, [componentPool, project])

  const savedLibraryIds = project.parts
    .map(libraryIdFromPart)
    .filter(Boolean)
    .join('|')

  useEffect(() => {
    if (!savedLibraryIds || componentPool.length === 0) return
    const ids = new Set(savedLibraryIds.split('|'))
    const savedItems = componentPool.filter(item => ids.has(String(item.id)))
    Promise.allSettled(savedItems.map(async item => ({ id: String(item.id), record: await ensureLibraryRecord(item) }))).then(results => {
      const loaded: LibraryRecords = {}
      for (const result of results) {
        if (result.status === 'fulfilled') loaded[result.value.id] = result.value.record
      }
      setLibraryRecords(current => ({ ...current, ...loaded }))
    })
  }, [savedLibraryIds, componentPool, ensureLibraryRecord])

  useEffect(() => {
    let next = projectRef.current
    let changed = false
    for (const part of next.parts) {
      const libraryId = libraryIdFromPart(part)
      const record = libraryRecords[libraryId]
      if (part.kind === 'library' && record?.name.startsWith('Breadboard')) {
        const existing = new Set(next.wires.map(wire => wire.id))
        const missing = internalBoardWires(part, record).filter(wire => !existing.has(wire.id))
        if (missing.length) {
          next = { ...next, wires: [...next.wires, ...missing] }
          changed = true
        }
      }
      const migrationKey = `${next.id}:${part.id}:${libraryId}:source-pins-v2`
      if (!libraryId || part.kind === 'breadboard' || libraryPinMigrations.current.has(migrationKey) || !record) continue
      if (part.kind === 'library' && record.name.startsWith('Breadboard')) continue
      const hasSnaps = next.wires.some(wire => wire.hidden && (wire.from.startsWith(`${part.id}:`) || wire.to.startsWith(`${part.id}:`)))
      if (hasSnaps) {
        next = alignToSavedConnections(next, part.id, libraryRecords)
        changed = true
      } else {
        const attached = attachInsertedPins(next, part.id, false, libraryRecords)
        if (attached.wires.length !== next.wires.length) {
          next = attached
          changed = true
        }
      }
      libraryPinMigrations.current.add(migrationKey)
    }
    if (!changed) return
    projectRef.current = next
    setProject(next)
  }, [libraryRecords, project])

  const commit = useCallback((next: Project) => {
    if (next === projectRef.current) return
    const previous = projectRef.current
    setPast(p => [...p.slice(-49), previous])
    setFuture([])
    projectRef.current = next
    setProject(next)
    setDirty(true)
  }, [])

  const replace = useCallback((next: Project) => {
    next = normalizeProjectPinNames(next)
    projectRef.current = next
    setProject(next)
    setRuntime(initialRuntime(next))
    setSimulation(undefined)
    setPast([])
    setFuture([])
    setSelected(undefined)
    setPending(undefined)
    setWireBends([])
    setRunning(false)
    setSimulationStarted(false)
    setSimTime(0)
    setDirty(false)
  }, [])

  const undo = useCallback(() => {
    if (!past.length) return
    const previous = past[past.length - 1]
    const current = projectRef.current
    setPast(past.slice(0, -1))
    setFuture(f => [...f, current])
    projectRef.current = previous
    setProject(previous)
    setSelected(undefined)
    setPending(undefined)
    setWireBends([])
    setDirty(true)
  }, [past])

  const redo = useCallback(() => {
    if (!future.length) return
    const next = future[future.length - 1]
    const current = projectRef.current
    setFuture(future.slice(0, -1))
    setPast(p => [...p, current])
    projectRef.current = next
    setProject(next)
    setSelected(undefined)
    setPending(undefined)
    setWireBends([])
    setDirty(true)
  }, [future])

  // Do not energize or settle any circuit until the user starts it or advances a step.
  useEffect(() => {
    if (!simulationStarted) {
      setSimulation(undefined)
      lastSimTimeRef.current = simTime
      return
    }
    if (transientStateRef.current.projectId !== project.id) {
      transientStateRef.current = { projectId: project.id, capacitorVoltages: {}, capacitorCurrents: {}, inductorCurrents: {}, inductorVoltages: {} }
    }
    const timeStepSeconds = Math.max(0, simTime - lastSimTimeRef.current)
    lastSimTimeRef.current = simTime
    let alive = true
    runSimulation(project, { ...runtime, capacitorVoltages: transientStateRef.current.capacitorVoltages, capacitorCurrents: transientStateRef.current.capacitorCurrents, inductorCurrents: transientStateRef.current.inductorCurrents, inductorVoltages: transientStateRef.current.inductorVoltages }, false, timeStepSeconds, simTime, maximumSubstepSeconds)
      .then(result => {
        if (!alive) return
        transientStateRef.current = { projectId: project.id, capacitorVoltages: result.runtime.capacitorVoltages ?? {}, capacitorCurrents: result.runtime.capacitorCurrents ?? {}, inductorCurrents: result.runtime.inductorCurrents ?? {}, inductorVoltages: result.runtime.inductorVoltages ?? {} }
        setSimulation(result.simulation)
        setSimulationEngine(result.engine)
        if (result.simulation.converged === false) {
          message(result.simulation.diagnostics?.[0] ?? 'A simulação elétrica não convergiu.')
        }
        const preparedRuntimeChanged =
          JSON.stringify(result.runtime.q) !== JSON.stringify(runtime.q) ||
          JSON.stringify(result.runtime.prev_clock) !== JSON.stringify(runtime.prev_clock) ||
          JSON.stringify(result.runtime.pirTargetPositions ?? {}) !== JSON.stringify(runtime.pirTargetPositions ?? {}) ||
          JSON.stringify(result.runtime.pirInRange ?? {}) !== JSON.stringify(runtime.pirInRange ?? {}) ||
          JSON.stringify(result.runtime.pirDrivePulses ?? {}) !== JSON.stringify(runtime.pirDrivePulses ?? {}) ||
          JSON.stringify(result.runtime.timer555Latch ?? {}) !== JSON.stringify(runtime.timer555Latch ?? {}) ||
          JSON.stringify(result.runtime.timer555PendingLatch ?? {}) !== JSON.stringify(runtime.timer555PendingLatch ?? {}) ||
          JSON.stringify(result.runtime.timer555DelayRemainingSeconds ?? {}) !== JSON.stringify(runtime.timer555DelayRemainingSeconds ?? {}) ||
          JSON.stringify(result.runtime.timer556Latch ?? {}) !== JSON.stringify(runtime.timer556Latch ?? {}) ||
          JSON.stringify(result.runtime.timer556PendingLatch ?? {}) !== JSON.stringify(runtime.timer556PendingLatch ?? {}) ||
          JSON.stringify(result.runtime.timer556DelayRemainingSeconds ?? {}) !== JSON.stringify(runtime.timer556DelayRemainingSeconds ?? {}) ||
          JSON.stringify(result.runtime.ultrasonicTargetPositions ?? {}) !== JSON.stringify(runtime.ultrasonicTargetPositions ?? {}) ||
          JSON.stringify(result.runtime.ultrasonicStates ?? {}) !== JSON.stringify(runtime.ultrasonicStates ?? {})
        if (preparedRuntimeChanged) {
          setRuntime(current => ({
            ...current,
            q: result.runtime.q,
            prev_clock: result.runtime.prev_clock,
            pirTargetPositions: result.runtime.pirTargetPositions ?? current.pirTargetPositions,
            pirInRange: result.runtime.pirInRange ?? current.pirInRange,
            pirDrivePulses: result.runtime.pirDrivePulses ?? current.pirDrivePulses,
            timer555Latch: result.runtime.timer555Latch ?? current.timer555Latch,
            timer555PendingLatch: result.runtime.timer555PendingLatch ?? current.timer555PendingLatch,
            timer555DelayRemainingSeconds: result.runtime.timer555DelayRemainingSeconds ?? current.timer555DelayRemainingSeconds,
            timer556Latch: result.runtime.timer556Latch ?? current.timer556Latch,
            timer556PendingLatch: result.runtime.timer556PendingLatch ?? current.timer556PendingLatch,
            timer556DelayRemainingSeconds: result.runtime.timer556DelayRemainingSeconds ?? current.timer556DelayRemainingSeconds,
            ultrasonicTargetPositions: result.runtime.ultrasonicTargetPositions ?? current.ultrasonicTargetPositions,
            ultrasonicStates: result.runtime.ultrasonicStates ?? current.ultrasonicStates,
          }))
        }
      })
      .catch(err => {
        if (alive) message(`Falha na simulação: ${String(err)}`)
      })
    return () => {
      alive = false
    }
  }, [project, runtime, message, simulationStarted, simTime, maximumSubstepSeconds])

  // Running simulation clock timer
  useEffect(() => {
    if (!running) return
    const frequency = Number(project.parts.find(p => p.kind === 'generator')?.properties?.frequency ?? 1)
    let last = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now(),
        seconds = Math.min((now - last) / 1000, 0.2)
      last = now
      setRuntime(r => {
        const phase = ((r.phase ?? 0.5) + seconds * Math.max(0.01, Math.min(10, frequency * speed))) % 1
        const pirDrivePulses = Object.fromEntries(Object.keys(r.pirDrivePulses ?? {}).map(id => [id, 0]))
        return { ...r, phase, clock_high: phase < 0.5, pirDrivePulses }
      })
      setSimTime(t => t + seconds * speed)
    }, 40)
    return () => window.clearInterval(timer)
  }, [running, project, speed])


  const selectedPart = project.parts.find(p => p.id === selected)
  const selectedWire = project.wires.find(w => w.id === selected)

  const save = useCallback(async () => {
    try {
      await saveProject(projectRef.current)
      setDirty(false)
      message('Projeto salvo no CircuitLab Studio')
    } catch (err) {
      message(`Erro ao salvar: ${String(err)}`)
    }
  }, [message])

  const copyPart = useCallback(() => {
    const partToCopy = projectRef.current.parts.find(p => p.id === selected)
    if (!partToCopy) return
    setClipboardPart(partToCopy)
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(JSON.stringify({ type: 'circuitlab-part', part: partToCopy }))
      }
    } catch {}
    message(`"${partToCopy.label || labels[partToCopy.kind] || partToCopy.kind}" copiado`)
  }, [selected, message])

  const pastePart = useCallback(async (sourceOverride?: Part) => {
    let sourcePart = sourceOverride ?? clipboardPart
    if (!sourcePart) {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
          const text = await navigator.clipboard.readText()
          if (text) {
            const parsed = JSON.parse(text)
            if (parsed && parsed.type === 'circuitlab-part' && parsed.part) {
              sourcePart = parsed.part
            }
          }
        }
      } catch {}
    }
    if (!sourcePart) {
      message('Nenhum componente copiado para colar')
      return
    }

    const nextId = newId()
    const baseName = (sourcePart.label || labels[sourcePart.kind] || sourcePart.kind).replace(/\s+\d+$/, '')
    const count = projectRef.current.parts.filter(p =>
      p.kind === sourcePart!.kind && (p.kind !== 'library' || libraryIdFromPart(p) === libraryIdFromPart(sourcePart!))
    ).length
    const newLabel = count > 0 ? `${baseName} ${count + 1}` : (sourcePart.label || baseName)

    const newPart: Part = {
      ...sourcePart,
      id: nextId,
      label: newLabel,
      x: (sourcePart.x ?? 200) + 35,
      y: (sourcePart.y ?? 200) + 35,
      properties: sourcePart.properties ? { ...sourcePart.properties } : undefined,
    }

    let nextWires = [...projectRef.current.wires]
    if (newPart.kind === 'library') {
      const libId = libraryIdFromPart(newPart)
      const record = libraryRecords[libId]
      if (record && record.name.startsWith('Breadboard')) {
        nextWires = [...nextWires, ...internalBoardWires(newPart, record)]
      }
    }

    const projectWithPart: Project = {
      ...projectRef.current,
      parts: [...projectRef.current.parts, newPart],
      wires: nextWires,
    }

    const finalProject = attachPartContacts(projectWithPart, newPart.id, false, libraryRecords)
    commit(finalProject)
    setSelected(newPart.id)
    setClipboardPart(newPart)
    message(`"${newPart.label}" colado na bancada`)
  }, [clipboardPart, libraryRecords, commit, message])

  // Keyboard shortcuts (including 'r' to rotate, Ctrl+C to copy, Ctrl+V to paste, Ctrl+D to duplicate)
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
      const hasTextSelection = !!(typeof window !== 'undefined' && window.getSelection()?.toString())
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void save()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        void openLibrary()
      } else if (!inInput && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        replace(emptyProject())
        setView(initialView)
        switchView('circuit')
        message('Novo circuito em branco iniciado')
      } else if (!inInput && !hasTextSelection && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && selectedPart) {
        e.preventDefault()
        copyPart()
      } else if (!inInput && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        void pastePart()
      } else if (!inInput && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedPart) {
        e.preventDefault()
        copyPart()
        void pastePart(selectedPart)
      } else if (!inInput && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (!inInput && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      } else if (!inInput && e.key.toLowerCase() === 'r' && selected) {
        const part = projectRef.current.parts.find(p => p.id === selected)
        if (part && part.kind !== 'breadboard') {
          e.preventDefault()
          updatePart({ rotation: (part.rotation + 90) % 360 })
        }
      } else if (!inInput && e.key === 'Backspace' && pending) {
        e.preventDefault()
        setWireBends(points => points.slice(0, -1))
      } else if (!inInput && (e.key === 'Delete' || e.key === 'Backspace') && selected) {
        e.preventDefault()
        removeSelected()
      } else if (e.key === 'Escape') {
        cancelWire()
        setSelected(undefined)
        setActiveModal(null)
        setWireColorDropdownOpen(false)
        setFileMenuOpen(false)
        setCategoryDropdownOpen(false)
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })

  const addLibraryPart = async (item: LibraryCatalogItem) => {
    try {
      const record = await ensureLibraryRecord(item)
      setLibraryRecords(current => ({ ...current, [String(item.id)]: record }))
      const kind = libraryKindForItem(item)
      const count = projectRef.current.parts.filter(part =>
        libraryIdFromPart(part) === String(item.id),
      ).length
      const defaults: Part['properties'] = kind === 'resistor'
        ? { ohms: 220, resistanceUnit: 'Ω' }
        : kind === 'led'
        ? { color: 'green' }
        : kind === 'generator'
        ? { frequency: 1, amplitude: 5, offset: 2.5, waveform: 'square' }
        : kind === 'supply'
        ? (item.simulation_model === 'battery9V'
            ? { voltage: 9, current: 1 }
            : item.simulation_model === 'coinCell'
            ? { voltage: 3, current: 0.1 }
            : { voltage: 5, current: 5 })
        : item.simulation_model === 'capacitor'
        ? { capacitance: 100e-9 }
        : item.simulation_model === 'capacitor_polarized'
        ? { capacitance: 1e-6 }
        : item.simulation_model === 'inductor'
        ? { inductance: 10e-6 }
        : item.simulation_model === 'potentiometer_v2'
        ? { resistance: 250_000, position: 0 }
        : item.simulation_model === 'ldr_v2'
        ? { lightLevel: 0 }
        : item.simulation_model === 'sensorForce'
        ? { force: 0 }
        : item.simulation_model === 'sensorFlex'
        ? { bend: 0 }
        : item.simulation_model === 'TMP36'
        ? { temperatureC: 25 }
        : item.simulation_model === 'solarCell'
        ? { illumination: 100 }
        : undefined
      const part: Part = {
        id: newId(),
        kind,
        x: kind === 'breadboard'
          ? 180 + projectRef.current.parts.filter(existing => existing.kind === 'breadboard').length * 790
          : 335 + (projectRef.current.parts.length % 8) * 47,
        y: kind === 'breadboard' ? 145 : 260 + (projectRef.current.parts.length % 5) * 50,
        rotation: 0,
        label: count ? `${item.name} ${count + 1}` : item.name,
        properties: {
          ...defaults,
          libraryId: String(item.id),
          libraryPath: item.path ?? '',
          libraryThumbnail: item.thumbnail,
          simulationModel: item.simulation_model ?? '',
        },
      }
      commit({
        ...projectRef.current,
        parts: [...projectRef.current.parts, part],
        wires: [...projectRef.current.wires, ...internalBoardWires(part, record)],
      })
      setSelected(part.id)
      cancelWire()
      message(libraryItemSupportsSimulation(item) ? `${item.name} adicionado à bancada` : `${item.name} adicionado como peça visual`)
    } catch (error) {
      message(`Falha ao carregar ${item.name}: ${String(error)}`)
    }
  }

  const terminal = (id: string) => {
    if (!terminalPosition(projectRef.current, id, libraryRecords)) {
      message('Terminal indisponível. Aguarde o carregamento do componente.')
      return
    }
    if (!pending) {
      setPending(id)
      setWireBends([])
      setSelected(undefined)
      return
    }
    if (pending === id) {
      cancelWire()
      return
    }
    const existing = projectRef.current.wires.find(
      w => !w.hidden && ((w.from === pending && w.to === id) || (w.from === id && w.to === pending))
    )
    if (existing) {
      message('Esses terminais já estão conectados')
      cancelWire()
      setSelected(existing.id)
      return
    }
    const wire: Wire = { id: newId(), from: pending, to: id, color: wireColor, bends: wireBends.length ? wireBends : undefined }
    commit({ ...projectRef.current, wires: [...projectRef.current.wires, wire] })
    cancelWire()
    setSelected(wire.id)
    message(`Conectado: ${terminalLabel(projectRef.current, wire.from)} → ${terminalLabel(projectRef.current, wire.to)}`)
  }

  const removeSelected = () => {
    if (!selected) return
    const current = projectRef.current
    if (current.parts.some(p => p.id === selected)) {
      commit({
        ...current,
        parts: current.parts.filter(p => p.id !== selected),
        wires: current.wires.filter(
          w =>
            !w.from.startsWith(`${selected}:`) &&
            !w.to.startsWith(`${selected}:`) &&
            !w.from.startsWith(`board:${selected}:`) &&
            !w.to.startsWith(`board:${selected}:`)
        ),
      })
    } else {
      commit({ ...current, wires: current.wires.filter(w => w.id !== selected) })
    }
    setSelected(undefined)
  }

  const jk = project.parts.filter(p => p.kind === 'jk74hc73').slice(0, 2)
  const counterBits =
    jk.length === 2
      ? [
          simulation?.q[`${jk[0].id}:1`],
          simulation?.q[`${jk[0].id}:2`],
          simulation?.q[`${jk[1].id}:1`],
          simulation?.q[`${jk[1].id}:2`],
        ]
      : []
  const counterValue =
    counterBits.length === 4 && counterBits.every(bit => bit === '0' || bit === '1')
      ? counterBits.reduce<number>((sum, bit, index) => sum + (bit === '1' ? 2 ** index : 0), 0)
      : undefined

  const updatePart = (changes: Partial<Part>) => {
    if (!selectedPart) return
    const next = {
      ...projectRef.current,
      parts: projectRef.current.parts.map(p => (p.id === selectedPart.id ? { ...p, ...changes } : p)),
    }
    commit(changes.rotation !== undefined ? attachPartContacts(next, selectedPart.id, false, libraryRecords) : next)
  }

  const updateWire = (changes: Partial<Wire>) => {
    if (!selectedWire) return
    const next = {
      ...projectRef.current,
      wires: projectRef.current.wires.map(w => (w.id === selectedWire.id ? { ...w, ...changes } : w)),
    }
    commit(next)
  }

  const changeWireColor = (hex: string) => {
    setWireColor(hex)
    if (selectedWire) {
      updateWire({ color: hex })
    }
    setWireColorDropdownOpen(false)
  }

  const zoom = (factor: number) =>
    setView(v => {
      const width = Math.max(450, Math.min(2600, v.width * factor)),
        ratio = width / v.width
      return { x: v.x + (v.width * (1 - ratio)) / 2, y: v.y + (v.height * (1 - ratio)) / 2, width, height: v.height * ratio }
    })

  const zoomFit = () => setView(initialView)

  const openLibrary = async () => {
    try {
      setLibrary(await listProjects())
      setActiveModal('library')
    } catch (err) {
      message(`Erro ao abrir projetos: ${String(err)}`)
    }
  }

  const openProject = async (id: string) => {
    try {
      replace(await loadProject(id))
      setActiveModal(null)
      message('Projeto aberto com sucesso')
    } catch (err) {
      message(`Erro ao abrir: ${String(err)}`)
    }
  }

  const exportProjectJSON = () => {
    const blob = new Blob([JSON.stringify(projectRef.current, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/[^a-z0-9_-]/gi, '-').toLowerCase() || 'circuito'}.json`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    message('Arquivo JSON exportado')
  }

  const exportProjectBOM = () => {
    const rows = ['Quantidade,Componente,Referência,Propriedades']
    const partMap = new Map<string, { name: string; count: number; labels: string[]; props: string }>()
    for (const p of project.parts) {
      const key = `${p.kind}-${JSON.stringify(p.properties ?? {})}`
      const entry = partMap.get(key) ?? {
        name: libraryRecords[libraryIdFromPart(p)]?.name ?? labels[p.kind],
        count: 0,
        labels: [],
        props: p.kind === 'resistor' ? `${p.properties?.ohms ?? 220} Ω` : p.kind === 'led' ? String(p.properties?.color ?? 'red') : '',
      }
      entry.count++
      entry.labels.push(p.label)
      partMap.set(key, entry)
    }
    for (const item of partMap.values()) {
      rows.push(`${item.count},"${item.name}","${item.labels.join(', ')}","${item.props}"`)
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/[^a-z0-9_-]/gi, '-').toLowerCase() || 'circuito'}-bom.csv`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    message('Lista de componentes (BOM) exportada em CSV')
  }

  const importProject = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data: unknown = JSON.parse(await file.text())
      if (!validProject(data)) throw new Error('Formato de projeto inválido')
      replace({ ...data, id: newId() })
      message('Projeto importado com sucesso')
    } catch (err) {
      message(`Erro ao importar: ${String(err)}`)
    }
    e.target.value = ''
  }

  const copyShareLink = () => {
    const jsonString = JSON.stringify(project, null, 2)
    navigator.clipboard.writeText(jsonString).then(() => {
      message('Estrutura do circuito copiada (JSON)!')
    })
  }

  const formatSimTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const tenths = Math.floor((seconds * 10) % 10)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`
  }

  // Filtered components list based on search and category
  const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const searchText = normalizeSearch(searchQuery.trim())
  const filteredLibraryItems = catalogItems.filter(item => {
    if (!searchText) return true
    const record = libraryRecords[String(item.id)]
    const searchable = [
      item.name,
      item.id,
      item.device_id,
      item.simulation_model,
      item.basic ? 'básico basic' : '',
      item.category,
      item.description,
      record?.description,
      ...(item.tags ?? []),
      ...(record?.tags ?? []),
      ...(record?.categories ?? []),
      record?.footprint?.name,
    ].filter(Boolean).join(' ')
    return normalizeSearch(searchable).includes(searchText)
  })

  const currentCategoryItem = CATALOG_GROUPS.flatMap(g => g.items).find(i => i.key === selectedCategory)
  const currentCategoryGroup = CATALOG_GROUPS.find(g => g.items.some(i => i.key === selectedCategory))
  const currentGroupLabel = currentCategoryGroup?.label ?? 'Componentes'
  const currentItemLabel = currentCategoryItem?.label ?? 'Básico'

  const activeColorObj = standardWireColors.find(c => c.hex === wireColor) ?? standardWireColors[0]

  const openComponentDetail = (item: LibraryCatalogItem) => {
    setSelectedDetailItem(item)
    const detail = getComponentDetail(item.id) || getComponentDetail(item.name)
    const initialOpen: Record<string, boolean> = {}
    if (detail?.sections) {
      for (const sec of detail.sections) {
        initialOpen[sec.id] = sec.defaultOpen
      }
    } else {
      initialOpen['description'] = true
    }
    setOpenSections(initialOpen)
  }

  const toggleDetailSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const addStarterById = async (starterId?: string | null) => {
    if (!starterId) return
    try {
      const starters = await loadCatalogItems('starters-all')
      const item = starters.find(s => s.id === starterId || s.device_id === starterId)
      if (item) {
        await addLibraryPart(item)
      } else {
        await addLibraryPart({
          kind: 'component',
          id: starterId,
          name: `Exemplo ${starterId}`,
          thumbnail: `starters/basic/${starterId}.png`,
          basic: false,
        })
      }
      message('Circuito de exemplo adicionado à bancada')
    } catch (err) {
      message(`Erro ao carregar circuito de exemplo: ${String(err)}`)
    }
  }

  const activeDetailData: ComponentDetail | null = selectedDetailItem
    ? (getComponentDetail(selectedDetailItem.id) || getComponentDetail(selectedDetailItem.name) || {
        id: String(selectedDetailItem.id),
        name: getComponentDisplayName(selectedDetailItem.name),
        shortDescription: selectedDetailItem.description || '',
        sections: [
          {
            id: 'description',
            title: 'Descrição',
            text: selectedDetailItem.description || 'Componente eletrônico para simulação e montagem em circuitos.',
            defaultOpen: true,
          },
          {
            id: 'connect-it',
            title: 'Conectar',
            text: 'Conecte os terminais deste componente aos barramentos da protoboard ou a outros componentes.',
            defaultOpen: false,
          },
          {
            id: 'how-to-use',
            title: 'Como é utilizado',
            text: 'Posicione o componente na bancada e inicie a simulação para observar o comportamento dinâmico.',
            defaultOpen: false,
          },
        ],
      })
    : null

  return (
    <div className="app-shell" onClick={() => { setWireColorDropdownOpen(false); setFileMenuOpen(false); setCategoryDropdownOpen(false); }}>
      {/* ========================================================
          TOP HEADER BAR - CIRCUITLAB STUDIO BRANDING & MENUS
          ======================================================== */}
      <header className="topbar">
        <div className="brand" title="CircuitLab Studio · Bancada de Circuitos">
          <div className="circuitlab-logo-emblem">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="url(#brandGrad)" />
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <rect x="7" y="7" width="14" height="14" rx="3" stroke="#ffffff" strokeWidth="1.6" fill="#0f172a" />
              <line x1="14" y1="2" x2="14" y2="7" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="14" y1="21" x2="14" y2="26" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="14" x2="7" y2="14" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="21" y1="14" x2="26" y2="14" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="14" cy="14" r="2.5" fill="#38bdf8" />
            </svg>
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-title">CircuitLab</span>
              <span className="brand-badge">STUDIO</span>
            </div>
            <span className="brand-subtitle">EDA &amp; SIMULAÇÃO</span>
          </div>
        </div>

        <span className="topbar-divider" />

        {/* File / Project Dropdown Menu */}
        <div className="file-menu-container" onClick={e => e.stopPropagation()}>
          <button
            className={`btn-file-menu ${fileMenuOpen ? 'active' : ''}`}
            title="Menu Arquivo e Gerenciamento do Projeto"
            onClick={() => setFileMenuOpen(!fileMenuOpen)}
          >
            <FolderOpen size={14} />
            <span>Arquivo</span>
            <ChevronDown size={13} style={{ transform: fileMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
          </button>

          {fileMenuOpen && (
            <div className="file-menu-dropdown">
              <button
                className="file-menu-item"
                onClick={() => {
                  replace(emptyProject())
                  setView(initialView)
                  switchView('circuit')
                  setFileMenuOpen(false)
                  message('Novo circuito em branco iniciado')
                }}
              >
                <Plus size={15} color="#0284c7" />
                <span>Novo Circuito</span>
                <kbd>Ctrl+N</kbd>
              </button>

              <button
                className="file-menu-item"
                onClick={() => {
                  setFileMenuOpen(false)
                  void openLibrary()
                }}
              >
                <FolderOpen size={15} color="#0284c7" />
                <span>Abrir Projetos...</span>
                <kbd>Ctrl+O</kbd>
              </button>

              <button
                className="file-menu-item"
                onClick={() => {
                  setFileMenuOpen(false)
                  void save()
                }}
              >
                <Save size={15} color={dirty ? '#f59e0b' : '#10b981'} />
                <span>Salvar Projeto</span>
                <kbd>Ctrl+S</kbd>
              </button>

              <div className="file-menu-divider" />

              <button
                className="file-menu-item"
                disabled={!selectedPart}
                style={{ opacity: selectedPart ? 1 : 0.45 }}
                onClick={() => {
                  setFileMenuOpen(false)
                  copyPart()
                }}
              >
                <Copy size={15} color="#64748b" />
                <span>Copiar Componente</span>
                <kbd>Ctrl+C</kbd>
              </button>

              <button
                className="file-menu-item"
                disabled={!clipboardPart}
                style={{ opacity: clipboardPart ? 1 : 0.45 }}
                onClick={() => {
                  setFileMenuOpen(false)
                  void pastePart()
                }}
              >
                <ClipboardPaste size={15} color="#64748b" />
                <span>Colar Componente</span>
                <kbd>Ctrl+V</kbd>
              </button>

              <div className="file-menu-divider" />

              <button
                className="file-menu-item"
                onClick={() => {
                  setFileMenuOpen(false)
                  importRef.current?.click()
                }}
              >
                <Upload size={15} color="#64748b" />
                <span>Importar JSON...</span>
              </button>

              <button
                className="file-menu-item"
                onClick={() => {
                  setFileMenuOpen(false)
                  setActiveModal('export')
                }}
              >
                <Download size={15} color="#64748b" />
                <span>Exportar Circuito...</span>
              </button>

              <button
                className="file-menu-item"
                onClick={() => {
                  setFileMenuOpen(false)
                  setActiveModal('share')
                }}
              >
                <Share2 size={15} color="#64748b" />
                <span>Compartilhar...</span>
              </button>

              <div className="file-menu-divider" />

              <button
                className="file-menu-item"
                onClick={() => {
                  setFileMenuOpen(false)
                  setActiveModal('help')
                }}
              >
                <CircleHelp size={15} color="#64748b" />
                <span>Guia &amp; Atalhos</span>
              </button>
            </div>
          )}
        </div>

        <span className="topbar-divider" />

        <div className="project-title-area">
          <input
            className="project-title-input"
            aria-label="Nome do projeto"
            value={project.name}
            title="Clique para editar o nome do projeto"
            onChange={e => commit({ ...projectRef.current, name: e.target.value })}
          />
          <span
            className={`save-status-badge ${dirty ? 'dirty' : 'saved'}`}
            title={dirty ? 'Alterações pendentes · Clique ou pressione Ctrl+S para salvar' : 'Todas as alterações foram salvas'}
            onClick={() => { if (dirty) void save() }}
            style={{ cursor: dirty ? 'pointer' : 'default' }}
          >
            <span className={`save-dot ${dirty ? 'dirty' : ''}`} />
            {dirty ? 'Alterações pendentes' : 'Salvo'}
          </span>
        </div>

        <div className="top-actions-right">
          {/* Start / Stop simulation */}
          <button
            className={`btn-simulate ${running ? 'running' : ''}`}
            onClick={() => {
              const next = !running
              setRunning(next)
              setSimulationStarted(next)
              if (!next) setRuntime(current => ({
                ...resetUltrasonicRuntime(resetPIRSensorRuntimeEdges(current)),
                keypadPushed: Object.fromEntries(project.parts.filter(part => part.kind === 'library' && part.properties?.simulationModel === 'keypad_4x4').map(part => [part.id, null])),
                irDetected: Object.fromEntries(project.parts.filter(part => part.kind === 'library' && part.properties?.simulationModel === 'IRsensor').map(part => [part.id, false])),
                gasSensorLevel: Object.fromEntries(project.parts.filter(part => part.kind === 'library' && part.properties?.simulationModel === 'sensor_gas').map(part => [part.id, 0.2])),
              }))
            }}
            title={running ? 'Parar simulação do circuito' : 'Iniciar simulação do circuito'}
          >
            {running ? (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="11" fill="#e53935" />
                <rect x="8" y="8" width="8" height="8" rx="1" fill="#ffffff" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="11" fill="#00b850" />
                <polygon points="9.5,7.5 16.5,12 9.5,16.5" fill="#ffffff" />
              </svg>
            )}
            <span>{running ? 'Parar simulação' : 'Iniciar simulação'}</span>
          </button>

          {running && (
            <span className="sim-timer-pill" title="Tempo decorrido da simulação">
              {formatSimTimer(simTime)}
            </span>
          )}

          {/* Offline debug stepping controls */}
          <div className="sim-controls-group">
            <label className="sim-integration-control" title="Passo máximo usado pelo solver em cada avanço temporal">
              <span>Integração</span>
              <select
                aria-label="Passo de integração"
                value={maximumSubstepSeconds}
                onChange={e => setMaximumSubstepSeconds(Number(e.target.value))}
              >
                {[0.001, 0.005, 0.01, 0.02, 0.05].map(value => (
                  <option key={value} value={value}>{value * 1000} ms</option>
                ))}
              </select>
            </label>
            <button
              className="btn-sim-control"
              title={`Avançar um passo de integração (${maximumSubstepSeconds * 1000} ms) e meio ciclo do clock`}
              onClick={() => {
                setRunning(false)
                setSimulationStarted(true)
                setRuntime(r => {
                  const clock_high = !r.clock_high
                  const pirDrivePulses = Object.fromEntries(Object.keys(r.pirDrivePulses ?? {}).map(id => [id, 0]))
                  return { ...r, clock_high, phase: clock_high ? 0.25 : 0.75, pirDrivePulses }
                })
                setSimTime(t => t + maximumSubstepSeconds)
              }}
            >
              <StepForward size={14} />
              <span>Passo</span>
            </button>
            <button
              className="btn-sim-control"
              title="Resetar contagem e flip-flops"
              onClick={() => {
                setRunning(false)
                setSimulationStarted(false)
                setRuntime(initialRuntime(project))
                transientStateRef.current = { projectId: project.id, capacitorVoltages: {}, capacitorCurrents: {}, inductorCurrents: {}, inductorVoltages: {} }
                setSimTime(0)
                message('Contador e estados resetados')
              }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
            <select
              className="sim-speed-select"
              aria-label="Velocidade da simulação"
              value={speed}
              title="Velocidade da simulação"
              onChange={e => setSpeed(Number(e.target.value))}
            >
              {[0.25, 0.5, 1, 2, 5].map(v => (
                <option key={v} value={v}>
                  {v}×
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ========================================================
          SECONDARY TOOLBAR - WORKBENCH CONTROLS
          ======================================================== */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          {/* Rotate button */}
          <button
            className="toolbar-tool-btn"
            title="Girar componente selecionado (R)"
            disabled={!selectedPart || selectedPart.kind === 'breadboard'}
            onClick={() => {
              if (selectedPart && selectedPart.kind !== 'breadboard') {
                updatePart({ rotation: (selectedPart.rotation + 90) % 360 })
              }
            }}
          >
            <RotateCw size={16} />
            <span>Girar</span>
          </button>

          {/* Delete button */}
          <button
            className="toolbar-tool-btn"
            title="Excluir item selecionado (Del / Backspace)"
            disabled={!selected}
            onClick={removeSelected}
          >
            <Trash2 size={16} />
            <span>Excluir</span>
          </button>

          <span className="toolbar-separator" />

          {/* Copy button */}
          <button
            className="toolbar-tool-btn"
            title="Copiar componente selecionado (Ctrl+C)"
            disabled={!selectedPart}
            onClick={copyPart}
          >
            <Copy size={16} />
            <span>Copiar</span>
          </button>

          {/* Paste button */}
          <button
            className="toolbar-tool-btn"
            title="Colar componente (Ctrl+V)"
            disabled={!clipboardPart}
            onClick={() => void pastePart()}
          >
            <ClipboardPaste size={16} />
            <span>Colar</span>
          </button>

          <span className="toolbar-separator" />

          {/* Undo / Redo */}
          <button
            className="toolbar-tool-btn"
            title="Desfazer (Ctrl+Z)"
            disabled={!past.length}
            onClick={undo}
          >
            <Undo2 size={16} />
          </button>
          <button
            className="toolbar-tool-btn"
            title="Refazer (Ctrl+Y)"
            disabled={!future.length}
            onClick={redo}
          >
            <Redo2 size={16} />
          </button>

          <span className="toolbar-separator" />

          {/* Notes toggle */}
          <button
            className={`toolbar-tool-btn ${notesVisible ? 'active' : ''}`}
            title={notesVisible ? 'Ocultar anotações do circuito' : 'Exibir anotações do circuito'}
            onClick={() => setNotesVisible(!notesVisible)}
          >
            <FileText size={16} />
          </button>

          <span className="toolbar-separator" />

          {/* Wire Color Picker Dropdown */}
          <div
            className="wire-color-dropdown-container"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="wire-color-btn"
              title="Selecionar cor do fio"
              onClick={() => setWireColorDropdownOpen(!wireColorDropdownOpen)}
            >
              <span className="wire-swatch-circle" style={{ background: activeColorObj.hex }} />
              <span>{activeColorObj.name}</span>
              <ChevronDown size={14} />
            </button>

            {wireColorDropdownOpen && (
              <div className="wire-color-palette-popover">
                {standardWireColors.map(c => (
                  <button
                    key={c.hex}
                    className={`palette-color-item ${wireColor === c.hex ? 'selected' : ''}`}
                    onClick={() => changeWireColor(c.hex)}
                  >
                    <span className="palette-swatch" style={{ background: c.hex }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wire Connector Type */}
          <select
            className="wire-type-select"
            aria-label="Tipo de conector"
            value={wireType}
            title="Tipo de conector do fio"
            onChange={e => setWireType(e.target.value)}
          >
            <option value="normal">Normal</option>
            <option value="hookup">Gancho</option>
            <option value="alligator">Garra jacaré</option>
          </select>
        </div>

        <div className="toolbar-right">
          {/* View Mode switchers */}
          <div className="view-modes-group">
            <button
              className={`view-mode-btn ${viewMode === 'schematic' ? 'active' : ''}`}
              title="Diagrama esquemático EDA do circuito"
              onClick={() => switchView('schematic')}
            >
              <Zap size={14} />
              <span>Esquemático</span>
            </button>
            <button
              className="view-mode-btn"
              title="Lista de componentes (BOM)"
              onClick={() => setActiveModal('bom')}
            >
              <FileSpreadsheet size={14} />
              <span>Lista</span>
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'circuit' ? 'active' : ''}`}
              title="Área de trabalho de circuitos (Protoboard)"
              onClick={() => switchView('circuit')}
            >
              <Layers size={14} />
              <span>Circuito</span>
            </button>
          </div>

          {/* Code button */}
          <button
            className="btn-code"
            title="Editor de código / lógica digital (Verilog HDL)"
            onClick={() => setActiveModal('code')}
          >
            <Code2 size={15} />
            <span>Código</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          MAIN WORKSPACE (CANVAS + COMPONENTS DRAWER)
          ======================================================== */}
      <div className="workspace">
        <main className="editor">
          <div className="canvas-frame">
            {viewMode === 'schematic' ? (
              <SchematicView project={project} libraryRecords={libraryRecords} />
            ) : (
              <>
                {/* Top-Left Floating Navigation Controls */}
                <div className="canvas-nav-controls">
                  <button
                    className="nav-ctrl-btn"
                    title="Ajustar visualização (Ajustar à tela)"
                    onClick={zoomFit}
                  >
                    <Maximize2 size={16} />
                  </button>
                  <button
                    className="nav-ctrl-btn"
                    title="Aumentar zoom (+)"
                    onClick={() => zoom(1 / 1.15)}
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    className="nav-ctrl-btn"
                    title="Diminuir zoom (-)"
                    onClick={() => zoom(1.15)}
                  >
                    <Minus size={16} />
                  </button>
                </div>

                {/* Circuit Canvas */}
                <Canvas
                  project={project}
                  simulation={simulationStarted ? simulation : undefined}
                  libraryRecords={libraryRecords}
                  selected={selected}
                  pending={pending}
                  wireBends={wireBends}
                  wireColor={wireColor}
                  view={view}
                  setView={setView}
                  onSelect={setSelected}
                  onTerminal={terminal}
                  onWireBend={point => setWireBends(points => [...points, point])}
                  onUpdateWire={(wireId, changes, recordHistory = true) => {
                    const next = {
                      ...projectRef.current,
                      wires: projectRef.current.wires.map(w => (w.id === wireId ? { ...w, ...changes } : w)),
                    }
                    if (recordHistory) {
                      commit(next)
                    } else {
                      projectRef.current = next
                      setProject(next)
                      setDirty(true)
                    }
                  }}
                  onMovePart={(id, x, y) => {
                    const safeX = Number.isFinite(x) ? x : 0
                    const safeY = Number.isFinite(y) ? y : 0
                    const next = refreshDirectContacts({
                      ...projectRef.current,
                      parts: projectRef.current.parts.map(p => (p.id === id ? { ...p, x: safeX, y: safeY } : p)),
                    }, libraryRecords)
                    projectRef.current = next
                    setProject(next)
                    setDirty(true)
                  }}
                  onDropPart={original => {
                    const moved = projectRef.current.parts.find(p => {
                      const before = original.parts.find(old => old.id === p.id)
                      return before && (before.x !== p.x || before.y !== p.y)
                    })
                    if (moved) {
                      const isBoard = moved.kind === 'breadboard' ||
                        (moved.kind === 'library' && libraryRecords[libraryIdFromPart(moved)]?.name.startsWith('Breadboard'))
                      let next = projectRef.current
                      if (isBoard) {
                        for (const part of next.parts) {
                          if (part.id !== moved.id && part.kind !== 'breadboard') {
                            next = attachPartContacts(next, part.id, false, libraryRecords)
                          }
                        }
                      } else {
                        next = attachPartContacts(next, moved.id, true, libraryRecords)
                        const contact = next.wires.find(wire => isDirectContact(wire) && (wire.from.startsWith(`${moved.id}:`) || wire.to.startsWith(`${moved.id}:`)))
                        if (contact) message(`Contato direto: ${terminalLabel(next, contact.from)} ↔ ${terminalLabel(next, contact.to)}`)
                      }
                      projectRef.current = next
                      setProject(next)
                    }
                    setPast(p => [...p.slice(-49), original])
                    setFuture([])
                  }}
                  onToggleButton={(id, pressed) =>
                    setRuntime(r => ({ ...r, buttons: { ...r.buttons, [id]: pressed } }))
                  }
                  onCancelWire={cancelWire}
                />

                {/* Floating Component Inspector Popover */}
                {(selectedPart || selectedWire) && (
                  <ComponentPopover
                    part={selectedPart}
                    wire={selectedWire}
                    simulation={simulationStarted ? simulation : undefined}
                    simulationActive={simulationStarted}
                    keypadPushed={selectedPart && Object.prototype.hasOwnProperty.call(runtime.keypadPushed ?? {}, selectedPart.id) ? runtime.keypadPushed?.[selectedPart.id] : selectedPart?.properties?.pushed}
                    onKeypadPushed={(partId, pushed) => {
                      if (!simulationStarted) return
                      setRuntime(current => ({ ...current, keypadPushed: { ...(current.keypadPushed ?? {}), [partId]: pushed } }))
                    }}
                    irDetected={selectedPart ? runtime.irDetected?.[selectedPart.id] ?? false : false}
                    onIRSensorDetected={(partId, detected) => {
                      if (!simulationStarted) return
                      setRuntime(current => ({ ...current, irDetected: { ...(current.irDetected ?? {}), [partId]: detected } }))
                    }}
                    gasSensorLevel={selectedPart ? runtime.gasSensorLevel?.[selectedPart.id] ?? 0.2 : 0.2}
                    onGasSensorLevel={(partId, level) => {
                      if (!simulationStarted) return
                      const normalized = Math.max(0, Math.min(1, Number.isFinite(level) ? level : 0.2))
                      setRuntime(current => ({ ...current, gasSensorLevel: { ...(current.gasSensorLevel ?? {}), [partId]: normalized } }))
                    }}
                    pirTargetPosition={selectedPart ? runtime.pirTargetPositions?.[selectedPart.id] ?? resolvePIRSensorTargetPosition(selectedPart.properties) : undefined}
                    pirInRange={selectedPart ? runtime.pirInRange?.[selectedPart.id] ?? simulation?.pirSensorInRange?.[selectedPart.id] : undefined}
                    ultrasonicTargetPosition={selectedPart ? runtime.ultrasonicTargetPositions?.[selectedPart.id] ?? resolveUltrasonicTargetPosition(selectedPart.properties) : undefined}
                    ultrasonicInRange={selectedPart ? simulation?.ultrasonicPing?.[selectedPart.id]?.inRange : undefined}
                    onUltrasonicTargetChange={(partId, position) => {
                      if (!simulationStarted) return
                      setRuntime(current => ({ ...current, ultrasonicTargetPositions: { ...(current.ultrasonicTargetPositions ?? {}), [partId]: position } }))
                    }}
                    onPIRTargetChange={(partId, position) => {
                      if (!simulationStarted) return
                      const inRange = evaluatePIRSensorTarget(position).inRange
                      setRuntime(current => {
                        const previous = Object.prototype.hasOwnProperty.call(current.pirInRange ?? {}, partId) ? current.pirInRange?.[partId] : null
                        const transition = pirSensorDrivePulseOnTransition(previous, inRange)
                        return {
                          ...current,
                          pirTargetPositions: { ...(current.pirTargetPositions ?? {}), [partId]: position },
                          pirInRange: { ...(current.pirInRange ?? {}), [partId]: inRange },
                          pirDrivePulses: { ...(current.pirDrivePulses ?? {}), [partId]: transition ? 1 : Math.max(0, current.pirDrivePulses?.[partId] ?? 0) },
                        }
                      })
                    }}
                    libraryItem={selectedPart
                      ? catalogItems.find(item => String(item.id) === libraryIdFromPart(selectedPart))
                      : undefined}
                    libraryRecord={selectedPart
                      ? libraryRecords[libraryIdFromPart(selectedPart)]
                      : undefined}
                    onUpdatePart={updatePart}
                    onUpdateWire={updateWire}
                    onRotatePart={() => {
                      if (selectedPart && selectedPart.kind !== 'breadboard') {
                        updatePart({ rotation: (selectedPart.rotation + 90) % 360 })
                      }
                    }}
                    onDelete={removeSelected}
                    onClose={() => setSelected(undefined)}
                  />
                )}

                {/* Wire Drawing Tip Banner */}
                {pending && (
                  <div className="wire-tip" role="status">
                    <span className="save-dot" style={{ background: '#0284c7' }} />
                    <span>
                      <strong>{terminalLabel(project, pending)}</strong> · Clique ou arraste até outro terminal. Clique na bancada para criar dobras.
                    </span>
                    <button className="wire-tip-cancel" onClick={cancelWire}>
                      Cancelar (Esc)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Simulation Status Bar */}
          <div className="bottom-sim-bar">
            <div className="bottom-sim-left">
              {counterValue !== undefined && (
                <div className="counter-display-badge">
                  <span>CONTADOR:</span>
                  <strong>
                    {counterValue.toString().padStart(2, '0')}{' '}
                    <small>({[...counterBits].reverse().join('')})</small>
                  </strong>
                </div>
              )}
              <div className="clock-display-badge">
                <span>CLK:</span>
                <strong className={runtime.clock_high ? 'high' : ''}>
                  {runtime.clock_high ? '1' : '0'}
                </strong>
              </div>
              <span className="wires-count-badge">
                Fios: {project.wires.filter(w => !w.hidden).length} · Contatos diretos: {project.wires.filter(isDirectContact).length}
              </span>
            </div>

            <div className="bottom-sim-right">
              {simulationStarted && simulation?.mode && <span className="simulation-mode-badge" title={simulation.mode === 'transient' ? 'Análise transitória trapezoidal com passo inicial backward Euler; o trigger ultrassônico continua amostrado nos subpassos' : simulation.mode === 'dc' ? 'Análise nodal modificada de corrente contínua, disponível para os tipos compatíveis' : 'Simulação lógica digital; não calcula tensão ou corrente analógica'}>
                {simulation.mode === 'transient' ? 'Transitório · MNA' : simulation.mode === 'dc' ? 'DC · MNA' : 'Lógica digital'}
              </span>}
              <span
                className={`engine-badge ${simulationEngine}`}
                title={
                  simulationEngine === 'rust'
                    ? 'Simulação processada pelo backend Rust nativo (Tauri IPC)'
                    : 'Motor TypeScript local; usado no navegador e nos circuitos DC do desktop'
                }
              >
                <span className="engine-dot" />
                {simulationEngine === 'rust' ? 'Rust (Nativo)' : 'TypeScript (Local)'}
              </span>
              <span className="save-status-badge saved">
                <span className="save-dot" />
                {running ? 'Simulação em execução' : 'Pronto para simulação'}
              </span>
            </div>
          </div>
        </main>

        {/* ========================================================
            RIGHT SIDEBAR - COMPONENT CATALOG DRAWER
            ======================================================== */}
        <aside className={`components-drawer ${drawerOpen ? '' : 'closed'}`}>
          {/* Edge toggle tab like the user's screenshot */}
          <button
            type="button"
            className="drawer-edge-toggle"
            title={drawerOpen ? 'Recolher painel de componentes' : 'Expandir painel de componentes'}
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <ChevronRight size={14} style={{ transform: drawerOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.15s ease' }} />
          </button>

          {selectedDetailItem && activeDetailData ? (
            <>
              {/* Detail View Header (Matching Image 2) */}
              <div className="drawer-detail-header">
                <button
                  type="button"
                  className="detail-close-btn"
                  title="Voltar para a lista de componentes"
                  onClick={() => setSelectedDetailItem(null)}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="10" fill="#e2e8f0" />
                    <path d="M7.5 7.5L14.5 14.5M14.5 7.5L7.5 14.5" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="detail-font-size-btn"
                  title="Alternar tamanho da fonte"
                  onClick={() => setDetailFontSize(f => f === 'normal' ? 'large' : 'normal')}
                >
                  <span style={{ fontSize: '11px', fontWeight: 800 }}>A</span>
                  <span style={{ fontSize: '14.5px', fontWeight: 800 }}>A</span>
                  <ChevronDown size={12} />
                </button>
              </div>

              {/* Detail View Body (Matching Image 2) */}
              <div className={`drawer-detail-content ${detailFontSize === 'large' ? 'font-large' : ''}`}>
                <div className="drawer-detail-hero">
                  <div
                    className="detail-hero-thumb"
                    title={`Adicionar ${activeDetailData.name} à bancada`}
                    onClick={() => void addLibraryPart(selectedDetailItem)}
                  >
                    <img src={libraryAssetUrl(selectedDetailItem.thumbnail)} alt={activeDetailData.name} />
                  </div>
                  <h3 className="detail-hero-title">{activeDetailData.name}</h3>
                  <button
                    type="button"
                    className="detail-add-btn"
                    title={`Adicionar ${activeDetailData.name} à bancada`}
                    onClick={() => void addLibraryPart(selectedDetailItem)}
                  >
                    <Plus size={14} />
                    <span>Adicionar ao circuito</span>
                  </button>
                </div>

                <div className="drawer-detail-accordions">
                  {activeDetailData.sections.map(section => {
                    const isOpen = !!openSections[section.id]
                    return (
                      <div key={section.id} className="detail-accordion-card">
                        <button
                          type="button"
                          className="detail-accordion-trigger"
                          onClick={() => toggleDetailSection(section.id)}
                        >
                          <span className="detail-triangle-caret">
                            {isOpen ? '▾' : '▸'}
                          </span>
                          <span className="detail-accordion-title">{section.title}</span>
                        </button>
                        {isOpen && (
                          <div className="detail-accordion-body">
                            {section.text && <p className="detail-section-text">{section.text}</p>}
                            {section.image && (
                              <img
                                className="detail-section-img"
                                src={section.image}
                                alt={activeDetailData.name}
                              />
                            )}
                            {section.starterThumbnail && (
                              <div
                                className="detail-starter-card"
                                title="Clique para adicionar este circuito de exemplo à bancada"
                                onClick={() => void addStarterById(section.starterId)}
                              >
                                <img
                                  src={libraryAssetUrl(section.starterThumbnail)}
                                  alt="Circuito inicial"
                                />
                              </div>
                            )}
                            {section.links && section.links.length > 0 && (
                              <div className="detail-links-list">
                                {section.links.map(link => (
                                  <a
                                    key={link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="detail-info-link"
                                  >
                                    <ExternalLink size={12} />
                                    <span>{link.label}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Category & Search Header */}
              <div className="drawer-header">
                <div className="drawer-top-row">
                  {/* Category Selector Box matching screenshot */}
                  <div className="category-dropdown-container" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      className={`category-dropdown-trigger ${categoryDropdownOpen ? 'open' : ''}`}
                      title="Selecionar categoria de componentes ou disparadores"
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    >
                      <div className="category-trigger-text">
                        <span className="category-group-tag">{currentGroupLabel}</span>
                        <span className="category-active-name">{currentItemLabel}</span>
                      </div>
                      <svg className={`category-trigger-caret ${categoryDropdownOpen ? 'open' : ''}`} width="10" height="7" viewBox="0 0 10 7">
                        <polygon points="0,0 10,0 5,7" fill="#1e293b" />
                      </svg>
                    </button>

                    {categoryDropdownOpen && (
                      <div className="category-menu-popover">
                        {CATALOG_GROUPS.map((group, groupIndex) => (
                          <div key={group.id} className="category-group-section">
                            <div className="category-group-title">
                              {group.id === 'components' ? <Layers size={13} /> : <Zap size={13} />}
                              <span>{group.label}</span>
                            </div>
                            {group.items.map((item, itemIndex) => {
                              const isLast = itemIndex === group.items.length - 1
                              const isSelected = selectedCategory === item.key
                              return (
                                <button
                                  key={item.key}
                                  type="button"
                                  className={`category-tree-node ${isSelected ? 'selected' : ''}`}
                                  onClick={() => {
                                    setSelectedCategory(item.key)
                                    setCategoryDropdownOpen(false)
                                  }}
                                >
                                  <span className="tree-glyph">{isLast ? '└──' : '├──'}</span>
                                  <span className="tree-node-label">{item.label}</span>
                                  {isSelected && <Check size={13} className="tree-node-check" />}
                                </button>
                              )
                            })}
                            {groupIndex < CATALOG_GROUPS.length - 1 && <div className="category-menu-divider" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* View Mode Toggle Button */}
                  <button
                    type="button"
                    className={`drawer-view-mode-btn ${drawerViewMode === 'list' ? 'active' : ''}`}
                    title={drawerViewMode === 'grid' ? 'Mudar para lista detalhada' : 'Mudar para grade (3 colunas)'}
                    onClick={() => setDrawerViewMode(drawerViewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {drawerViewMode === 'grid' ? <List size={18} /> : <LayoutGrid size={18} />}
                  </button>
                </div>

                {/* Search Box with Search Icon on the Right */}
                <div className="drawer-search-box">
                  <input
                    className="drawer-search-input"
                    placeholder="Pesquisar"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <Search size={16} className="drawer-search-icon" />
                  {searchQuery && (
                    <button
                      type="button"
                      className="drawer-search-clear"
                      onClick={() => setSearchQuery('')}
                      title="Limpar busca"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="drawer-content">
                {catalogLoading && <p className="drawer-empty-msg">Carregando catálogo local…</p>}
                {catalogError && <p className="library-load-error">{catalogError}</p>}
                {catalogDetailsLoading && <p className="library-load-status">Carregando descrições e pinagens…</p>}
                {!catalogLoading && !catalogError && filteredLibraryItems.length === 0 && (
                  <p className="drawer-empty-msg">Nenhum item encontrado para "{searchQuery}"</p>
                )}

                {drawerViewMode === 'grid' ? (
                  <div className="components-grid-3col">
                    {filteredLibraryItems.map(item => {
                      const displayName = getComponentDisplayName(item.name)
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className="component-card-clean"
                          title={`Clique para adicionar à bancada ou clique com botão direito para ver detalhes de ${displayName}`}
                          onClick={() => void addLibraryPart(item)}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            openComponentDetail(item)
                          }}
                        >
                          <div className="card-thumb-wrap">
                            <img className="card-thumb-img" src={libraryAssetUrl(item.thumbnail)} alt="" loading="lazy" />
                          </div>
                          <span className="card-clean-title">{displayName}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="components-list-view">
                    {filteredLibraryItems.map(item => {
                      const displayName = getComponentDisplayName(item.name)
                      const shortDesc = getComponentDescription(item.id, item.description || '')
                      return (
                        <div
                          key={item.id}
                          className="component-card-list-item"
                          title={`Clique para ver detalhes de ${displayName}`}
                          onClick={() => openComponentDetail(item)}
                        >
                          <div
                            className="component-card-list-thumb"
                            title={`Clique para adicionar ${displayName} à bancada`}
                            onClick={(e) => {
                              e.stopPropagation()
                              void addLibraryPart(item)
                            }}
                          >
                            <img src={libraryAssetUrl(item.thumbnail)} alt={displayName} loading="lazy" />
                          </div>
                          <div className="component-card-list-info">
                            <div className="component-card-list-header">
                              <span className="component-card-list-title">{displayName}</span>
                              <ChevronRight size={16} className="component-card-list-chevron" />
                            </div>
                            <span className="component-card-list-desc">
                              {shortDesc || 'Componente eletrônico para simulação e montagem em circuitos.'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>

      {/* ========================================================
          MODALS
          ======================================================== */}

      {/* 1. CODE MODAL */}
      {activeModal === 'code' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-head-title">
                <Code2 size={18} color="#0082c3" />
                <span>Código &amp; Lógica do Circuito</span>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: '0 0 12px', color: '#64748b' }}>
                Lógica comportamental em Verilog / HDL para o contador binário de 4 bits montado com CIs 74HC73 (Flip-Flops JK) e porta lógica 74HC00:
              </p>
              <pre className="code-viewer-block">
{`// =====================================================
// CIRCUITLAB STUDIO · EDA DIGITAL CORE
// Projeto: Contador Binário 4-Bits (Jefferson)
// Módulo: Contador binário de 4 bits com CI 74HC73
// =====================================================

module contador_4bit_circuitlab (
  input  wire       clk,        // Clock do Gerador de Funções (FUNC1)
  input  wire       reset_btn,  // Botão de Reset
  output wire [3:0] q,          // Saídas conectadas aos LEDs (D1..D4)
  output wire [3:0] q_not
);

  // Instanciação de dois CIs 74HC73 (Dual JK Flip-Flop com Clear)
  // U1: Flip-Flop 1 (Bit 0) e Flip-Flop 2 (Bit 1)
  // U2: Flip-Flop 3 (Bit 2) e Flip-Flop 4 (Bit 3)

  reg [3:0] count_reg = 4'b0000;

  always @(negedge clk or negedge reset_btn) begin
    if (!reset_btn) begin
      count_reg <= 4'b0000;
    end else begin
      count_reg <= count_reg + 1'b1;
    end
  end

  assign q = count_reg;
  assign q_not = ~count_reg;

endmodule`}
              </pre>
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary"
                onClick={() => {
                  navigator.clipboard.writeText(`// Projeto: Contador 20261987686 Jefferson\n// Contador binário 4-bits com 74HC73`)
                  message('Código copiado para a área de transferência!')
                }}
              >
                <Copy size={14} /> Copiar código
              </button>
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BOM (LISTA DE COMPONENTES) MODAL */}
      {activeModal === 'bom' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-head-title">
                <FileSpreadsheet size={18} color="#0082c3" />
                <span>Lista de Componentes (BOM)</span>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <table className="bom-table">
                <thead>
                  <tr>
                    <th>Qtd</th>
                    <th>Componente</th>
                    <th>Nome</th>
                    <th>Propriedades</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(
                    project.parts.reduce<
                      Record<string, { name: string; count: number; labels: string[]; props: string }>
                    >((acc, part) => {
                      const key = `${part.kind}-${JSON.stringify(part.properties ?? {})}`
                      if (!acc[key]) {
                        acc[key] = {
                          name: libraryRecords[libraryIdFromPart(part)]?.name ?? labels[part.kind],
                          count: 0,
                          labels: [],
                          props:
                            part.kind === 'resistor'
                              ? `${part.properties?.ohms ?? 220} Ω`
                              : part.kind === 'led'
                              ? `Cor: ${String(part.properties?.color ?? 'red')}`
                              : part.kind === 'generator'
                              ? `${part.properties?.frequency ?? 1} Hz, ${part.properties?.waveform ?? 'quadrado'}`
                              : part.kind === 'supply'
                              ? `${part.properties?.voltage ?? 5} V, ${part.properties?.current ?? 5} A`
                              : '',
                        }
                      }
                      acc[key].count++
                      acc[key].labels.push(part.label)
                      return acc
                    }, {})
                  ).map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{item.count}</strong>
                      </td>
                      <td>{item.name}</td>
                      <td>{item.labels.join(', ')}</td>
                      <td>{item.props || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={exportProjectBOM}>
                <Download size={14} /> Baixar CSV
              </button>
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXPORT MODAL */}
      {activeModal === 'export' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-head-title">
                <Download size={18} color="#0082c3" />
                <span>Exportar Circuito</span>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: '0 0 16px', color: '#64748b' }}>
                Escolha o formato no qual deseja exportar o circuito{' '}
                <strong>{project.name}</strong>:
              </p>
              <div style={{ display: 'grid', gap: 10 }}>
                <button className="project-item-btn" onClick={exportProjectJSON}>
                  <Download size={22} color="#0082c3" />
                  <div>
                    <strong>Circuito Completo (.JSON)</strong>
                    <small>Arquivo compatível com backup, importação e restauração completa</small>
                  </div>
                </button>
                <button className="project-item-btn" onClick={exportProjectBOM}>
                  <FileSpreadsheet size={22} color="#16a34a" />
                  <div>
                    <strong>Lista de Materiais (.CSV)</strong>
                    <small>Planilha com a lista de todos os componentes e especificações (BOM)</small>
                  </div>
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SHARE MODAL */}
      {activeModal === 'share' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-head-title">
                <Share2 size={18} color="#0284c7" />
                <span>Compartilhar Circuito · CircuitLab Studio</span>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: '0 0 12px', color: '#475569' }}>
                Compartilhe ou exporte o projeto <strong>{project.name}</strong> em formato JSON universal e aberto:
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                <input
                  readOnly
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 5,
                    fontSize: 12,
                    background: '#f8fafc',
                    fontFamily: 'monospace',
                  }}
                  value={`circuitlab://project/${project.id}?name=${encodeURIComponent(project.name)}`}
                />
                <button className="btn-primary" onClick={copyShareLink}>
                  <Copy size={14} /> Copiar JSON
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
                <button className="btn-secondary" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }} onClick={exportProjectJSON}>
                  <Download size={16} color="#0284c7" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>Baixar Projeto (.JSON)</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Pacote completo do circuito</div>
                  </div>
                </button>
                <button className="btn-secondary" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }} onClick={exportProjectBOM}>
                  <FileSpreadsheet size={16} color="#10b981" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>Baixar Lista (BOM)</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Planilha de componentes (.csv)</div>
                  </div>
                </button>
              </div>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 6, padding: 12, fontSize: 12, color: '#0369a1' }}>
                <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} />
                O <strong>CircuitLab Studio</strong> salva e compartilha seus projetos em formato JSON autônomo, garantindo portabilidade total sem dependência de serviços proprietários externos.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SCHEMATIC MODAL */}
      {activeModal === 'schematic' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            className="modal"
            style={{ maxWidth: 980, width: '94vw', height: '88vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div className="modal-head-title">
                <Zap size={18} color="#0082c3" />
                <span>Diagrama Esquemático · {project.name}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
              <SchematicView project={project} libraryRecords={libraryRecords} />
            </div>
            <div className="modal-footer" style={{ padding: '8px 16px' }}>
              <button
                className="btn-primary"
                onClick={() => {
                  setViewMode('schematic')
                  setActiveModal(null)
                }}
              >
                Abrir na Tela Principal
              </button>
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. LOCAL PROJECTS LIBRARY MODAL */}
      {activeModal === 'library' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-head-title">
                <FolderOpen size={18} color="#0082c3" />
                <span>Projetos Salvos</span>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <button
                  className="btn-primary"
                  onClick={() => {
                    replace(emptyProject())
                    setView(initialView)
                    switchView('circuit')
                    setActiveModal(null)
                    message('Novo circuito em branco iniciado')
                  }}
                >
                  <Plus size={14} /> Novo circuito
                </button>
                <button className="btn-secondary" onClick={() => importRef.current?.click()}>
                  <Upload size={14} /> Importar JSON
                </button>
                <input
                  ref={importRef}
                  type="file"
                  accept=".json,application/json"
                  hidden
                  onChange={e => void importProject(e)}
                />
              </div>

              {library.length ? (
                <div className="project-list">
                  {library.map(item => (
                    <button
                      key={item.id}
                      className="project-item-btn"
                      onClick={() => void openProject(item.id)}
                    >
                      <FolderOpen size={20} color="#0082c3" />
                      <div style={{ flex: 1 }}>
                        <strong>{item.name}</strong>
                        <small>{new Date(item.updated_at).toLocaleString('pt-BR')}</small>
                      </div>
                      <span style={{ color: '#0082c3', fontWeight: 'bold' }}>→</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  Ainda não há projetos salvos no banco local. Use o botão <strong>Salvar (Ctrl+S)</strong> para guardar o circuito atual.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. QUICK HELP / NOTES MODAL */}
      {activeModal === 'help' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-head-title">
                <CircleHelp size={18} color="#0284c7" />
                <span>Guia do CircuitLab Studio</span>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <h4 style={{ margin: '0 0 8px', color: '#1e293b' }}>Como interagir com a bancada</h4>
              <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.7, color: '#475569' }}>
                <li><strong>Girar componentes:</strong> Selecione o componente e clique em "Girar" ou tecle <strong>R</strong>.</li>
                <li><strong>Copiar e Colar:</strong> Selecione um componente e tecle <strong>Ctrl+C</strong> para copiar e <strong>Ctrl+V</strong> para colar. Você também pode duplicar com <strong>Ctrl+D</strong> ou usar os botões na barra de ferramentas.</li>
                <li><strong>Conectar sem fio:</strong> Arraste o corpo da peça até aproximar seu pino do pino de outra peça. Ao aparecer "Solte para conectar sem fio", solte: os terminais se encaixam e o círculo verde confirma o contato. Afastar ou girar a peça desfaz o contato se os pinos se separarem.</li>
                <li><strong>Excluir:</strong> Selecione um componente ou fio e pressione <strong>Delete</strong> ou <strong>Backspace</strong>.</li>
                <li><strong>Conectar fios:</strong> Clique no pino/furo de origem e depois no destino, ou arraste entre os terminais. O destaque verde mostra o terminal que receberá a ligação. Clique na bancada para criar dobras; <strong>Backspace</strong> remove a última e <strong>Esc</strong> cancela.</li>
                <li><strong>Cores dos fios:</strong> Altere a cor do fio no menu superior para categorizar alimentação (vermelho), terra (preto) e dados (verde/azul).</li>
                <li><strong>Simulação:</strong> Clique em <strong>Iniciar simulação</strong> para rodar em tempo real ou use <strong>Passo</strong> para avançar ciclo a ciclo.</li>
                <li><strong>Zoom &amp; Movimento:</strong> Use a roda do mouse para zoom, arraste o fundo para mover ou clique nos botões de navegação à esquerda.</li>
              </ul>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} color="#4ade80" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
