import { invoke } from '@tauri-apps/api/core'
import { simulate } from './simulator'
import { simulateElectrical, supportsDcSimulation } from './electricalSimulator'
import { extractedModelNames } from './extracted-models'
import { normalizeProjectPinNames, sanitizeProjectForNative, type Project, type Runtime, type Simulation } from './model'

export const native = '__TAURI_INTERNALS__' in window
export type ProjectSummary = { id: string; name: string; updated_at: number }
export type SimulationResult = { simulation: Simulation; runtime: Runtime; engine: 'rust' | 'typescript' }

export async function runSimulation(project: Project, runtime: Runtime, advanceClock = false, timeStepSeconds = 0, simulationTimeSeconds = 0, maximumSubstepSeconds = 0.01): Promise<SimulationResult> {
  const normalized = normalizeProjectPinNames(project)
  if (supportsDcSimulation(normalized)) {
    return { ...simulateElectrical(normalized, runtime, timeStepSeconds, simulationTimeSeconds, maximumSubstepSeconds), engine: 'typescript' }
  }
  if (native && !project.parts.some(part => part.kind === 'library' || extractedModelNames.has(String(part.properties?.simulationModel ?? '')))) {
    try {
      const sanitized = sanitizeProjectForNative(normalized)
      const res = await invoke<{ simulation: Simulation; runtime: Runtime }>('simulate_step', { project: sanitized, runtime, advanceClock })
      if (res) return { ...res, simulation: { ...res.simulation, mode: 'digital' }, engine: 'rust' }
    } catch (err) {
      console.warn('Simulação nativa falhou, alternando para simulação interna:', err)
    }
  }
  const res = simulate(normalized, runtime, advanceClock)
  return { ...res, engine: 'typescript' }
}

const storageKey = 'circuitlab-offline-projects'
function browserProjects(): Record<string, { project: Project; updated_at: number }> {
  try { return JSON.parse(localStorage.getItem(storageKey) ?? '{}') }
  catch { return {} }
}

export async function saveProject(project: Project): Promise<void> {
  const sanitized = sanitizeProjectForNative(project)
  if (native) return invoke('save_project', { project: sanitized })
  const all = browserProjects()
  all[sanitized.id] = { project: sanitized, updated_at: Date.now() }
  localStorage.setItem(storageKey, JSON.stringify(all))
}

export async function listProjects(): Promise<ProjectSummary[]> {
  if (native) return invoke('list_projects')
  return Object.values(browserProjects()).map(({ project, updated_at }) => ({ id: project.id, name: project.name, updated_at })).sort((a, b) => b.updated_at - a.updated_at)
}

export async function loadProject(id: string): Promise<Project> {
  if (native) return invoke('load_project', { id })
  const project = browserProjects()[id]?.project
  if (!project) throw new Error('Projeto não encontrado')
  return project
}
