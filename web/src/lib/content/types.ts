/**
 * Content Engine — Type definitions.
 *
 * All educational content (modules, lessons, labs, tools, glossary) is
 * represented as typed data objects, NOT hardcoded React components. A
 * generic `<LessonRenderer>` walks the `sections` array and renders the
 * appropriate component for each section type. This keeps content authoring
 * declarative and lets new modules be added without touching UI code.
 */

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type SectionStatus = 'available' | 'coming-soon'

/* ------------------------------------------------------------------ */
/* Lessons                                                            */
/* ------------------------------------------------------------------ */

export type LessonSection =
  | TextSection
  | CodeSection
  | TerminalSection
  | CalloutSection
  | PacketSection
  | TableSection
  | StepsSection
  | DiagramSection
  | InteractiveTerminalSection
  | ProtocolMapSection
  | LayeredArchitectureSection
  | FlagChallengeSection
  | DividerSection

export interface BaseSection {
  id: string
}

export interface TextSection extends BaseSection {
  type: 'text'
  /** Markdown content. */
  content: string
}

export interface CodeSection extends BaseSection {
  type: 'code'
  /** Language for syntax highlighting (bash, ts, json, python, c, ...). */
  lang: string
  code: string
  caption?: string
  /** Optional filename label shown in the window chrome. */
  file?: string
}

export interface TerminalSection extends BaseSection {
  type: 'terminal'
  /** Pre-rendered terminal transcript (prompt + command + output). */
  lines: TerminalLine[]
  caption?: string
}

export interface TerminalLine {
  prompt?: string
  command?: string
  output?: string
  comment?: string
}

export interface CalloutSection extends BaseSection {
  type: 'callout'
  variant: 'info' | 'warning' | 'danger' | 'success' | 'tip' | 'legal'
  title: string
  content: string
}

export interface PacketSection extends BaseSection {
  type: 'packet'
  title?: string
  description?: string
  layers: PacketLayer[]
}

export interface PacketLayer {
  name: string
  fields: { label: string; value: string; note?: string }[]
  color?: 'ethernet' | 'ip' | 'udp' | 'tcp' | 'payload' | 'mavlink' | 'http'
  description?: string
}

export interface TableSection extends BaseSection {
  type: 'table'
  headers: string[]
  rows: string[][]
  caption?: string
}

export interface StepsSection extends BaseSection {
  type: 'steps'
  title?: string
  steps: { title: string; content: string; code?: string }[]
}

export interface DiagramSection extends BaseSection {
  type: 'diagram'
  title?: string
  /** ASCII-style diagram rendered in a mono block. */
  ascii: string
  description?: string
}

export interface InteractiveTerminalSection extends BaseSection {
  type: 'interactive-terminal'
  title?: string
  description?: string
  /** Pre-seeded commands the lab accepts (key = exact command). */
  preset?: string
}

export interface ProtocolMapSection extends BaseSection {
  type: 'protocol-map'
  title?: string
  planes: {
    name: string
    description: string
    protocols: { name: string; desc: string }[]
    color: 'control' | 'data' | 'telemetry' | 'video' | 'management'
  }[]
}

export interface LayeredArchitectureSection extends BaseSection {
  type: 'layered-architecture'
  title?: string
  layers: {
    name: string
    role: string
    examples: string
    attackSurface: string
  }[]
}

export interface FlagChallengeSection extends BaseSection {
  type: 'flag-challenge'
  labId: string
  title: string
  prompt: string
  /** The expected flag value (compared case-insensitively, trimmed). */
  expectedFlag: string
  hint?: string
  /** Points awarded (informational; actual scoring in progress store). */
  points?: number
}

export interface DividerSection extends BaseSection {
  type: 'divider'
  label?: string
}

/* ------------------------------------------------------------------ */
/* Quizzes                                                            */
/* ------------------------------------------------------------------ */

export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'identify-protocol'
  | 'scenario'

export interface QuizQuestion {
  id: string
  type: QuestionType
  question: string
  /** For multiple-choice / identify-protocol. */
  options?: string[]
  /** Index into options. */
  correctIndex?: number
  /** For true-false. */
  answer?: boolean
  explanation: string
}

export interface Quiz {
  id: string
  title?: string
  questions: QuizQuestion[]
}

/* ------------------------------------------------------------------ */
/* Lessons                                                            */
/* ------------------------------------------------------------------ */

export interface Lesson {
  id: string
  moduleId: string
  title: string
  slug: string
  duration: string
  difficulty: Difficulty
  summary: string
  objectives: string[]
  sections: LessonSection[]
  quiz?: Quiz
  tools?: string[]
}

/* ------------------------------------------------------------------ */
/* Labs                                                               */
/* ------------------------------------------------------------------ */

export interface Lab {
  id: string
  moduleId?: string
  number: string
  title: string
  difficulty: Difficulty
  category: 'network' | 'wireless' | 'web' | 'api' | 'embedded' | 'forensics' | 're' | 'drone-protocol'
  objective: string
  context: string
  target: string
  recon: string[]
  clues: string[]
  tools: string[]
  hints: string[]
  tasks: string[]
  flag: string
  flagPrompt: string
  solution: string[]
  mitigation: string[]
}

/* ------------------------------------------------------------------ */
/* Modules                                                            */
/* ------------------------------------------------------------------ */

export interface ContentModule {
  id: string
  number: string
  title: string
  subtitle: string
  slug: string
  group: ModuleGroup
  difficulty: Difficulty
  estimatedTime: string
  prerequisites: string[]
  description: string
  icon: string
  status: SectionStatus
  lessons: Lesson[]
  labs?: Lab[]
  tools?: string[]
  outcomes?: string[]
}

export type ModuleGroup =
  | 'foundation'
  | 'packets'
  | 'wireless'
  | 'discovery'
  | 'request'
  | 'drone-protocol'
  | 'offensive'
  | 'defensive'
  | 'meta'

/* ------------------------------------------------------------------ */
/* Tools                                                              */
/* ------------------------------------------------------------------ */

export interface Tool {
  id: string
  name: string
  category: 'capture' | 'network' | 'wireless' | 'web' | 'binary' | 'forensics' | 'utility'
  level: Difficulty
  description: string
  useCase: string
  commands: { cmd: string; desc: string }[]
  commonMistakes?: string[]
  relatedLab?: string
  icon: string
}

/* ------------------------------------------------------------------ */
/* Glossary                                                           */
/* ------------------------------------------------------------------ */

export interface GlossaryTerm {
  term: string
  acronym?: string
  definition: string
  whyItMatters: string
  example: string
  category: 'network' | 'wireless' | 'drone' | 'web' | 'binary' | 'security'
}

/* ------------------------------------------------------------------ */
/* Learning Paths                                                     */
/* ------------------------------------------------------------------ */

export interface LearningPath {
  id: string
  name: string
  level: Difficulty
  description: string
  icon: string
  steps: { moduleId: string; label: string }[]
}
