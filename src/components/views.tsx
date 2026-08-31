'use client'

import * as React from 'react'
import {
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  Lock,
  Wrench,
  Target,
  ListChecks,
  Crosshair,
  ShieldCheck,
  Lightbulb,
  Flag,
  BookA,
  Route,
  ArrowLeftRight,
  Sprout,
  TrendingUp,
  Flame,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  modules,
  moduleById,
  lessonById,
  labById,
  tools,
  toolById,
  glossary,
  learningPaths,
} from '@/lib/content/registry'
import { useNavStore } from '@/store/nav-store'
import { useProgressStore } from '@/store/progress-store'
import { LessonRenderer } from '@/components/content/lesson-renderer'
import { useToast } from '@/hooks/use-toast'
import type { ContentModule, Tool, GlossaryTerm } from '@/lib/content/types'

/* ------------------------------------------------------------------ */
/* Breadcrumbs                                                         */
/* ------------------------------------------------------------------ */

function Breadcrumbs({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto text-xs text-muted-foreground">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight className="size-3 shrink-0 opacity-50" />}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-foreground"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground/80">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* Module view                                                         */
/* ------------------------------------------------------------------ */

export function ModuleView({ moduleId }: { moduleId: string }) {
  const mod = moduleById(moduleId)
  const navigate = useNavStore((s) => s.navigate)
  const completedLessons = useProgressStore((s) => s.completedLessons)

  if (!mod) {
    return <NotFound />
  }

  const done = mod.lessons.filter((l) => completedLessons[l.id]).length
  const pct = mod.lessons.length > 0 ? Math.round((done / mod.lessons.length) * 100) : 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', onClick: () => navigate({ kind: 'dashboard' }) },
          { label: `${mod.number} · ${mod.title}` },
        ]}
      />

      {/* Header */}
      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono-tight text-[10px]">
            {mod.number}
          </Badge>
          <Badge variant="outline" className="text-[10px] uppercase">
            {mod.difficulty}
          </Badge>
          <Badge variant="outline" className="text-[10px] uppercase">
            {mod.estimatedTime}
          </Badge>
          {mod.status === 'coming-soon' && (
            <Badge variant="outline" className="border-[oklch(0.7_0.12_85_/_0.4)] text-[10px] text-[oklch(0.82_0.12_85)]">
              <Lock className="mr-1 size-2.5" />
              Próximamente
            </Badge>
          )}
        </div>
        <h1 className="mt-3 font-mono-tight text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {mod.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{mod.subtitle}</p>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-foreground/80">
          {mod.description}
        </p>

        {mod.outcomes && mod.outcomes.length > 0 && (
          <Card className="mt-5 border-primary/20 bg-primary/[0.03]">
            <CardContent className="py-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Target className="size-3.5" />
                Lo que aprenderás
              </div>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {mod.outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary/60" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {mod.lessons.length > 0 && (
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progreso del módulo</span>
                <span className="font-mono-tight">
                  {done}/{mod.lessons.length} · {pct}%
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={() =>
                navigate({
                  kind: 'lesson',
                  moduleId: mod.id,
                  lessonId: mod.lessons[0].id,
                })
              }
            >
              {done > 0 ? 'Continuar' : 'Empezar'}
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        )}
      </div>

      <Separator className="my-6" />

      {/* Lessons */}
      <div className="space-y-2">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <ListChecks className="size-4 text-primary" />
          Lecciones
        </h2>
        {mod.lessons.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Este módulo no tiene lecciones detalladas todavía. Se desarrolla en una fase posterior.
            </CardContent>
          </Card>
        ) : (
          mod.lessons.map((lesson, i) => {
            const isDone = !!completedLessons[lesson.id]
            return (
              <button
                key={lesson.id}
                onClick={() =>
                  navigate({ kind: 'lesson', moduleId: mod.id, lessonId: lesson.id })
                }
                className={cn(
                  'group flex w-full items-center gap-3 rounded-lg border border-border/60 bg-card/30 p-3.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5',
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center">
                  {isDone ? (
                    <CheckCircle2 className="size-5 text-[oklch(0.78_0.13_160)]" />
                  ) : (
                    <span className="flex size-7 items-center justify-center rounded-full border border-border/60 font-mono-tight text-xs text-muted-foreground">
                      {i + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                      {lesson.title}
                    </h3>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {lesson.summary}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden font-mono-tight text-[10px] text-muted-foreground sm:inline">
                    <Clock className="mr-1 inline size-3" />
                    {lesson.duration}
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Tools */}
      {mod.tools && mod.tools.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Wrench className="size-4 text-primary" />
            Herramientas del módulo
          </h2>
          <div className="flex flex-wrap gap-2">
            {mod.tools.map((tid) => {
              const t = toolById(tid)
              if (!t) return null
              return (
                <Button
                  key={tid}
                  variant="outline"
                  size="sm"
                  className="font-mono-tight text-xs"
                  onClick={() => navigate({ kind: 'tool', toolId: t.id })}
                >
                  {t.name}
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Lesson view                                                         */
/* ------------------------------------------------------------------ */

export function LessonView({ moduleId, lessonId }: { moduleId: string; lessonId: string }) {
  const mod = moduleById(moduleId)
  const lesson = lessonById(moduleId, lessonId)
  const navigate = useNavStore((s) => s.navigate)

  if (!mod || !lesson) return <NotFound />

  const idx = mod.lessons.findIndex((l) => l.id === lessonId)
  const prev = idx > 0 ? mod.lessons[idx - 1] : null
  const next = idx < mod.lessons.length - 1 ? mod.lessons[idx + 1] : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', onClick: () => navigate({ kind: 'dashboard' }) },
          {
            label: `${mod.number} · ${mod.title}`,
            onClick: () => navigate({ kind: 'module', moduleId: mod.id }),
          },
          { label: lesson.title },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-mono-tight text-[10px]">
          {lesson.duration}
        </Badge>
        <Badge variant="outline" className="text-[10px] uppercase">
          {lesson.difficulty}
        </Badge>
        <span className="font-mono-tight text-[10px] text-muted-foreground">
          Lección {idx + 1} de {mod.lessons.length}
        </span>
      </div>

      <h1 className="mt-3 font-mono-tight text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {lesson.title}
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">{lesson.summary}</p>

      <Separator className="my-6" />

      <LessonRenderer lesson={lesson} />

      {/* Prev / Next nav */}
      <div className="mt-10 flex items-center justify-between gap-3 border-t border-border/60 pt-6">
        {prev ? (
          <Button
            variant="outline"
            onClick={() =>
              navigate({ kind: 'lesson', moduleId: mod.id, lessonId: prev.id })
            }
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">{prev.title}</span>
            <span className="sm:hidden">Anterior</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate({ kind: 'module', moduleId: mod.id })}
          >
            <ArrowLeft className="size-4" />
            Índice
          </Button>
        )}
        {next ? (
          <Button
            onClick={() =>
              navigate({ kind: 'lesson', moduleId: mod.id, lessonId: next.id })
            }
          >
            <span className="hidden sm:inline">{next.title}</span>
            <span className="sm:hidden">Siguiente</span>
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate({ kind: 'module', moduleId: mod.id })}
          >
            Módulo completo
            <CheckCircle2 className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Lab view                                                            */
/* ------------------------------------------------------------------ */

export function LabView({ labId }: { labId: string }) {
  const lab = labById(labId)
  const navigate = useNavStore((s) => s.navigate)
  const flags = useProgressStore((s) => s.flags)
  const submitFlag = useProgressStore((s) => s.submitFlag)
  const { toast } = useToast()

  const [flagInput, setFlagInput] = React.useState('')
  const [showSolution, setShowSolution] = React.useState(false)
  const [showHints, setShowHints] = React.useState(false)

  if (!lab) return <NotFound />
  const solved = !!flags[lab.id]

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = submitFlag(lab.id, flagInput, lab.flag, lab.title)
    if (ok) {
      toast({ title: '¡Flag correcta!', description: `+150 pts` })
    } else {
      toast({ title: 'Flag incorrecta', variant: 'destructive' })
    }
    setFlagInput('')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', onClick: () => navigate({ kind: 'dashboard' }) },
          { label: 'Attack Labs', onClick: () => navigate({ kind: 'module', moduleId: '15-attack-labs' }) },
          { label: `LAB ${lab.number}` },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge className="font-mono-tight text-[10px]">LAB {lab.number}</Badge>
        <Badge variant="outline" className="text-[10px] uppercase">{lab.difficulty}</Badge>
        <Badge variant="outline" className="text-[10px] uppercase">{lab.category}</Badge>
        {solved && (
          <Badge className="border-[oklch(0.65_0.12_160_/_0.4)] bg-[oklch(0.28_0.05_160_/_0.2)] text-[oklch(0.8_0.1_160)]">
            <CheckCircle2 className="mr-1 size-3" /> Resuelto
          </Badge>
        )}
      </div>

      <h1 className="mt-3 font-mono-tight text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {lab.title}
      </h1>

      <Card className="mt-4 border-primary/20 bg-primary/[0.03]">
        <CardContent className="py-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Crosshair className="size-3.5" />
            Objetivo
          </div>
          <p className="text-sm text-foreground/85">{lab.objective}</p>
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="size-4 text-primary" /> Contexto
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/80 pt-0">
            {lab.context}
            <div className="mt-2 font-mono-tight text-xs text-muted-foreground">
              Target: <span className="text-primary">{lab.target}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wrench className="size-4 text-primary" /> Herramientas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1.5">
              {lab.tools.map((t) => (
                <Badge key={t} variant="secondary" className="font-mono-tight text-[10px]">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ListChecks className="size-4 text-primary" /> Recon
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1.5 text-sm">
              {lab.recon.map((r, i) => (
                <li key={i} className="flex gap-2 text-foreground/80">
                  <span className="font-mono-tight text-[10px] text-muted-foreground">{i + 1}.</span>
                  <span className="font-mono-tight text-xs">{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ListChecks className="size-4 text-primary" /> Tareas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1.5 text-sm">
              {lab.tasks.map((t, i) => (
                <li key={i} className="flex gap-2 text-foreground/80">
                  <span className="font-mono-tight text-[10px] text-muted-foreground">{i + 1}.</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Flag submission */}
      <Card className="mt-5 border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Flag className="size-4 text-primary" /> Captura la flag
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {solved ? (
            <div className="flex items-center gap-2 rounded-md border border-[oklch(0.65_0.12_160_/_0.4)] bg-[oklch(0.28_0.05_160_/_0.15)] p-3 text-sm text-[oklch(0.8_0.1_160)]">
              <CheckCircle2 className="size-4" />
              <span>Flag capturada: <span className="font-mono-tight">{lab.flag}</span></span>
            </div>
          ) : (
            <form onSubmit={submit} className="flex gap-2">
              <input
                value={flagInput}
                onChange={(e) => setFlagInput(e.target.value)}
                placeholder={lab.flagPrompt}
                className="flex-1 rounded-md border border-border/60 bg-background px-3 py-2 font-mono-tight text-sm outline-none focus:border-primary"
              />
              <Button type="submit" disabled={!flagInput.trim()}>Enviar</Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Hints */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb className="size-4 text-[oklch(0.82_0.12_85)]" /> Pistas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button variant="ghost" size="sm" onClick={() => setShowHints((v) => !v)} className="mb-2 text-xs">
            {showHints ? 'Ocultar' : 'Mostrar'} pistas
          </Button>
          {showHints && (
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {lab.hints.map((h, i) => (
                <li key={i} className="flex gap-2">
                  <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-[oklch(0.82_0.12_85)]" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Solution */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ArrowLeftRight className="size-4 text-primary" /> Solución
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button variant="ghost" size="sm" onClick={() => setShowSolution((v) => !v)} className="mb-2 text-xs">
            {showSolution ? 'Ocultar' : 'Revelar'} solución
          </Button>
          {showSolution && (
            <ol className="space-y-1.5 text-sm">
              {lab.solution.map((s, i) => (
                <li key={i} className="flex gap-2 text-foreground/80">
                  <span className="font-mono-tight text-[10px] text-primary">{i + 1}.</span>
                  <span className="font-mono-tight text-xs">{s}</span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Mitigation */}
      <Card className="mt-4 border-[oklch(0.65_0.12_160_/_0.3)] bg-[oklch(0.28_0.05_160_/_0.05)]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck className="size-4 text-[oklch(0.78_0.13_160)]" /> Mitigación
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-1.5 text-sm">
            {lab.mitigation.map((m, i) => (
              <li key={i} className="flex gap-2 text-foreground/80">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[oklch(0.78_0.13_160)]" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

// (toast handled via useToast hook imported above)

/* ------------------------------------------------------------------ */
/* Tool view                                                           */
/* ------------------------------------------------------------------ */

export function ToolView({ toolId }: { toolId: string }) {
  const tool = toolById(toolId)
  const navigate = useNavStore((s) => s.navigate)
  if (!tool) return <NotFound />
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', onClick: () => navigate({ kind: 'dashboard' }) },
          { label: 'Toolbox', onClick: () => navigate({ kind: 'toolbox' }) },
          { label: tool.name },
        ]}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[10px] uppercase">{tool.category}</Badge>
        <Badge variant="outline" className="text-[10px] uppercase">{tool.level}</Badge>
      </div>
      <h1 className="mt-3 font-mono-tight text-2xl font-bold text-foreground sm:text-3xl">{tool.name}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">{tool.description}</p>

      <Card className="mt-5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="size-4 text-primary" /> Para qué sirve
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-foreground/80">{tool.useCase}</CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Wrench className="size-4 text-primary" /> Comandos clave
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {tool.commands.map((c, i) => (
            <div key={i} className="rounded-md border border-border/50 bg-[oklch(0.13_0.008_160)] p-2.5">
              <div className="font-mono-tight text-xs text-primary">{c.cmd}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.desc}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {tool.commonMistakes && tool.commonMistakes.length > 0 && (
        <Card className="mt-4 border-[oklch(0.7_0.12_85_/_0.3)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="size-4 text-[oklch(0.82_0.12_85)]" /> Errores comunes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1.5 text-sm">
              {tool.commonMistakes.map((m, i) => (
                <li key={i} className="flex gap-2 text-foreground/80">
                  <span className="text-[oklch(0.82_0.12_85)]">⚠</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Toolbox view                                                        */
/* ------------------------------------------------------------------ */

export function ToolboxView() {
  const navigate = useNavStore((s) => s.navigate)
  const [filter, setFilter] = React.useState<string>('all')
  const categories = ['all', 'capture', 'network', 'wireless', 'web', 'binary', 'forensics', 'utility']
  const filtered = filter === 'all' ? tools : tools.filter((t) => t.category === filter)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', onClick: () => navigate({ kind: 'dashboard' }) },
          { label: 'Toolbox' },
        ]}
      />
      <h1 className="mt-4 font-mono-tight text-2xl font-bold text-foreground sm:text-3xl">
        Toolbox
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Referencia de herramientas. Cada una con comandos clave, casos de uso y errores comunes.
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <Button
            key={c}
            variant={filter === c ? 'default' : 'outline'}
            size="sm"
            className="text-xs capitalize"
            onClick={() => setFilter(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t: Tool) => (
          <button
            key={t.id}
            onClick={() => navigate({ kind: 'tool', toolId: t.id })}
            className="group flex flex-col gap-2 rounded-lg border border-border/60 bg-card/40 p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">{t.name}</h3>
              <Badge variant="outline" className="text-[9px] uppercase">{t.level}</Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{t.useCase}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Glossary view                                                       */
/* ------------------------------------------------------------------ */

export function GlossaryView({ term: selectedTerm }: { term?: string }) {
  const navigate = useNavStore((s) => s.navigate)
  const [q, setQ] = React.useState('')
  const filtered = glossary.filter(
    (g) =>
      g.term.toLowerCase().includes(q.toLowerCase()) ||
      g.definition.toLowerCase().includes(q.toLowerCase()),
  )
  const selected = selectedTerm
    ? glossary.find((g) => g.term.toLowerCase() === selectedTerm.toLowerCase())
    : filtered[0]

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', onClick: () => navigate({ kind: 'dashboard' }) },
          { label: 'Glossary' },
        ]}
      />
      <h1 className="mt-4 font-mono-tight text-2xl font-bold text-foreground sm:text-3xl">Glossary</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Diccionario interactivo de términos de drone cybersecurity.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filtrar…"
            className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="max-h-[60vh] space-y-0.5 overflow-y-auto pr-1">
            {filtered.map((g: GlossaryTerm) => (
              <button
                key={g.term}
                onClick={() => navigate({ kind: 'glossary', term: g.term })}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                  selected?.term === g.term
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground',
                )}
              >
                <span className="font-mono-tight text-xs">{g.term}</span>
                {g.acronym && (
                  <span className="font-mono-tight text-[9px] text-muted-foreground/60">
                    {g.acronym.slice(0, 8)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          {selected ? (
            <Card>
              <CardContent className="space-y-4 p-5">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h2 className="font-mono-tight text-xl font-bold text-foreground">
                      {selected.term}
                    </h2>
                    {selected.acronym && (
                      <span className="font-mono-tight text-sm text-primary">
                        ({selected.acronym})
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="mt-1 text-[10px] uppercase">
                    {selected.category}
                  </Badge>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Definición
                  </div>
                  <p className="text-sm text-foreground/85">{selected.definition}</p>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    ¿Por qué importa en drones?
                  </div>
                  <p className="text-sm text-foreground/85">{selected.whyItMatters}</p>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ejemplo
                  </div>
                  <pre className="overflow-x-auto rounded-md border border-border/50 bg-[oklch(0.13_0.008_160)] p-3 font-mono-tight text-xs text-foreground/85">
{selected.example}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Selecciona un término para ver su definición.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Learning Path view                                                  */
/* ------------------------------------------------------------------ */

const PATH_ICONS: Record<string, LucideIcon> = {
  Sprout,
  TrendingUp,
  Flame,
  Swords: Crosshair,
  ShieldCheck,
  FlaskConical,
}

export function LearningPathView() {
  const navigate = useNavStore((s) => s.navigate)
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', onClick: () => navigate({ kind: 'dashboard' }) },
          { label: 'Learning Path' },
        ]}
      />
      <h1 className="mt-4 font-mono-tight text-2xl font-bold text-foreground sm:text-3xl">
        Rutas de aprendizaje
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Trayectos sugeridos según tu nivel y objetivo. Cada paso enlaza al módulo correspondiente.
      </p>

      <div className="mt-6 space-y-4">
        {learningPaths.map((p) => {
          const Icon = PATH_ICONS[p.icon] ?? Route
          return (
            <Card key={p.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">{p.name}</h2>
                      <Badge variant="outline" className="text-[10px] uppercase">{p.level}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                    <div className="mt-4 space-y-1.5">
                      {p.steps.map((s, i) => {
                        const mod = modules.find((m) => m.id === s.moduleId)
                        const available = mod?.status === 'available'
                        return (
                          <button
                            key={i}
                            onClick={() => available && navigate({ kind: 'module', moduleId: s.moduleId })}
                            disabled={!available}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors',
                              available
                                ? 'border-border/50 hover:border-primary/40 hover:bg-primary/5'
                                : 'border-dashed border-border/40 opacity-60',
                            )}
                          >
                            <span className="font-mono-tight text-xs text-muted-foreground">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="flex-1 text-foreground/85">{s.label}</span>
                            {available ? (
                              <ChevronRight className="size-3.5 text-muted-foreground" />
                            ) : (
                              <Lock className="size-3 text-muted-foreground/50" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Not found                                                           */
/* ------------------------------------------------------------------ */

function NotFound() {
  const navigate = useNavStore((s) => s.navigate)
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="font-mono-tight text-5xl font-bold text-muted-foreground/30">404</div>
      <p className="text-sm text-muted-foreground">
        Ese contenido no existe o aún no está disponible.
      </p>
      <Button variant="outline" onClick={() => navigate({ kind: 'dashboard' })}>
        Volver al dashboard
      </Button>
    </div>
  )
}
