import type {
  ContentModule,
  ModuleGroup,
  Tool,
  GlossaryTerm,
  LearningPath,
  Lab,
} from './types'

import { startHereModule } from './modules/start-here'
import { linuxModule } from './modules/linux'
import { networkingModule } from './modules/networking'
import { droneArchitectureModule } from './modules/drone-architecture'
import { stubModules } from './modules/stubs'
import { tools as toolData } from './tools'
import { glossary as glossaryData } from './glossary'
import { learningPaths as pathData } from './learning-paths'

/* ------------------------------------------------------------------ */
/* Module groups (drives sidebar ordering)                            */
/* ------------------------------------------------------------------ */

export interface GroupMeta {
  id: ModuleGroup
  label: string
  order: number
}

export const moduleGroups: GroupMeta[] = [
  { id: 'foundation', label: 'Foundation', order: 0 },
  { id: 'packets', label: 'Packets & Capture', order: 1 },
  { id: 'wireless', label: 'Wireless', order: 2 },
  { id: 'discovery', label: 'Discovery & Endpoints', order: 3 },
  { id: 'request', label: 'Request Labs', order: 4 },
  { id: 'drone-protocol', label: 'Drone Protocols', order: 5 },
  { id: 'offensive', label: 'Offensive', order: 6 },
  { id: 'defensive', label: 'Defensive', order: 7 },
  { id: 'meta', label: 'Reference', order: 8 },
]

/* ------------------------------------------------------------------ */
/* Module registry                                                    */
/* ------------------------------------------------------------------ */

export const modules: ContentModule[] = [
  startHereModule,
  linuxModule,
  networkingModule,
  droneArchitectureModule,
  ...stubModules,
].sort((a, b) => {
  const ga = moduleGroups.find((g) => g.id === a.group)?.order ?? 99
  const gb = moduleGroups.find((g) => g.id === b.group)?.order ?? 99
  if (ga !== gb) return ga - gb
  return a.number.localeCompare(b.number)
})

export const moduleById = (id: string): ContentModule | undefined =>
  modules.find((m) => m.id === id)

export const lessonById = (
  moduleId: string,
  lessonId: string,
) => {
  const mod = moduleById(moduleId)
  return mod?.lessons.find((l) => l.id === lessonId)
}

export function modulesByGroup(group: ModuleGroup): ContentModule[] {
  return modules.filter((m) => m.group === group)
}

/* ------------------------------------------------------------------ */
/* Labs registry                                                      */
/* ------------------------------------------------------------------ */

export const labs: Lab[] = modules.flatMap((m) => m.labs ?? [])

export const labById = (id: string): Lab | undefined =>
  labs.find((l) => l.id === id)

/* ------------------------------------------------------------------ */
/* Tools / Glossary / Paths                                           */
/* ------------------------------------------------------------------ */

export const tools: Tool[] = toolData
export const toolById = (id: string): Tool | undefined =>
  tools.find((t) => t.id === id)

export const glossary: GlossaryTerm[] = glossaryData
export const glossaryByTerm = (term: string): GlossaryTerm | undefined =>
  glossary.find((g) => g.term.toLowerCase() === term.toLowerCase())

export const learningPaths: LearningPath[] = pathData

/* ------------------------------------------------------------------ */
/* Aggregate stats                                                    */
/* ------------------------------------------------------------------ */

export const totalLessons = modules.reduce(
  (acc, m) => acc + m.lessons.length,
  0,
)

export const totalLabs = labs.length

export const availableModules = modules.filter((m) => m.status === 'available')
export const comingSoonModules = modules.filter((m) => m.status === 'coming-soon')
