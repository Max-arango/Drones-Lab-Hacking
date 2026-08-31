'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import {
  Plane,
  Terminal,
  Network,
  Fish,
  Crosshair,
  Webhook,
  Trophy,
  Flame,
  TrendingUp,
  Sprout,
  ShieldCheck,
  FlaskConical,
  Route,
  Activity,
  Lock,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  modules,
  availableModules,
  comingSoonModules,
  learningPaths,
} from '@/lib/content/registry'
import { useNavStore } from '@/store/nav-store'
import { useProgressStore } from '@/store/progress-store'

const SimulatedTerminal = dynamic(
  () => import('@/components/terminal/simulated-terminal').then((m) => m.SimulatedTerminal),
  { ssr: false },
)

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'hace un momento'
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`
  return `hace ${Math.floor(s / 86400)} d`
}

export function DashboardView() {
  const navigate = useNavStore((s) => s.navigate)
  const progress = useProgressStore()
  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0)
  const doneLessons = Object.keys(progress.completedLessons).length
  const doneLabs = Object.keys(progress.completedLabs).length
  const overallPct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0

  const quickLaunch = [
    { label: 'Terminal', icon: Terminal, view: { kind: 'lesson', moduleId: '00-start-here', lessonId: 'first-mission' } as const, accent: 'primary' },
    { label: 'Packet Lab', icon: Fish, view: { kind: 'lesson', moduleId: '02-networking', lessonId: 'packets-and-layers' } as const, accent: 'amber' },
    { label: 'Drone Architecture', icon: Plane, view: { kind: 'module', moduleId: '03-drone-architecture' } as const, accent: 'emerald' },
    { label: 'API Lab', icon: Webhook, view: { kind: 'module', moduleId: '10-api-security' } as const, accent: 'violet' },
    { label: 'CTF', icon: Trophy, view: { kind: 'module', moduleId: '15-attack-labs' } as const, accent: 'amber' },
    { label: 'Learning Paths', icon: Route, view: { kind: 'learning-path' } as const, accent: 'primary' },
  ]

  return (
    <div className="bg-grid">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex size-2 items-center justify-center">
                  <span className="absolute size-2 animate-ping rounded-full bg-primary/60" />
                  <span className="size-2 rounded-full bg-primary" />
                </span>
                <span className="font-mono-tight text-xs uppercase tracking-widest text-primary">
                  laboratorio activo · 10.10.10.0/24
                </span>
              </div>
              <h1 className="font-mono-tight text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                DroneSec<span className="text-primary">_</span>Lab
              </h1>
              <p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
                Academia interactiva de <span className="text-foreground">Drone Cybersecurity</span>.
                Aprende desde Linux y networking hasta análisis de protocolos, Wi-Fi, APIs,
                firmware, forense y seguridad de UAVs mediante laboratorios y simuladores controlados.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  onClick={() => navigate({ kind: 'module', moduleId: '00-start-here' })}
                  size="lg"
                >
                  <Flame className="size-4" />
                  Empezar desde cero
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate({ kind: 'lesson', moduleId: '00-start-here', lessonId: 'first-mission' })}
                >
                  <Zap className="size-4" />
                  Tu primera misión
                </Button>
              </div>
            </div>

            {/* Progress card */}
            <Card className="w-full max-w-sm border-primary/20 bg-card/60 backdrop-blur">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tu progreso
                  </span>
                  <Badge variant="outline" className="font-mono-tight text-[10px]">
                    FASE I
                  </Badge>
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono-tight text-3xl font-bold text-foreground">
                      {overallPct}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {doneLessons}/{totalLessons} lecciones
                    </span>
                  </div>
                  <Progress value={overallPct} className="mt-2 h-2" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md border border-border/50 bg-muted/20 p-2">
                    <div className="font-mono-tight text-lg font-bold text-primary">{progress.score}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">puntos</div>
                  </div>
                  <div className="rounded-md border border-border/50 bg-muted/20 p-2">
                    <div className="font-mono-tight text-lg font-bold text-foreground">{doneLabs}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">labs</div>
                  </div>
                  <div className="rounded-md border border-border/50 bg-muted/20 p-2">
                    <div className="font-mono-text-lg font-bold text-foreground font-mono-tight">
                      {Object.keys(progress.flags).length}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">flags</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        {/* Quick launch */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Zap className="size-4 text-primary" />
            Acceso rápido
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {quickLaunch.map((q) => (
              <button
                key={q.label}
                onClick={() => navigate(q.view)}
                className="group flex flex-col items-center gap-2 rounded-lg border border-border/60 bg-card/40 p-4 transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 transition-transform group-hover:scale-110">
                  <q.icon className="size-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground">{q.label}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Modules grid */}
          <section className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Plane className="size-4 text-primary" />
                Módulos disponibles
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => navigate({ kind: 'module', moduleId: '00-start-here' })}
              >
                Ver todos <ArrowRight className="ml-1 size-3" />
              </Button>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {availableModules.slice(0, 4).map((m) => {
                const done = m.lessons.filter((l) => progress.completedLessons[l.id]).length
                const pct = m.lessons.length > 0 ? Math.round((done / m.lessons.length) * 100) : 0
                return (
                  <button
                    key={m.id}
                    onClick={() => navigate({ kind: 'module', moduleId: m.id })}
                    className="group flex flex-col gap-2 rounded-lg border border-border/60 bg-card/40 p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-mono-tight text-[10px] text-muted-foreground">
                        {m.number}
                      </span>
                      <Badge variant="outline" className="text-[9px] uppercase">
                        {m.difficulty}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">
                        {m.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {m.description}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center gap-2">
                      <Progress value={pct} className="h-1 flex-1" />
                      <span className="font-mono-tight text-[10px] text-muted-foreground">
                        {done}/{m.lessons.length}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
            {comingSoonModules.length > 0 && (
              <div className="mt-3">
                <details className="group">
                  <summary className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <Lock className="size-3" />
                    {comingSoonModules.length} módulos próximamente (FASE II–VI)
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {comingSoonModules.map((m) => (
                      <Badge
                        key={m.id}
                        variant="outline"
                        className="font-mono-tight text-[10px] text-muted-foreground"
                      >
                        {m.number} · {m.title}
                      </Badge>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </section>

          {/* Recent activity + terminal */}
          <section className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="size-4 text-primary" />
                  Actividad reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {progress.activity.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Sin actividad todavía. Completa tu primera lección o lab para verla aquí.
                  </p>
                ) : (
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {progress.activity.slice(0, 8).map((a) => (
                        <div key={a.ts + a.ref} className="flex items-start gap-2 text-xs">
                          <div
                            className={cn(
                              'mt-1 size-1.5 shrink-0 rounded-full',
                              a.type === 'flag'
                                ? 'bg-[oklch(0.82_0.12_85)]'
                                : a.type === 'lab'
                                  ? 'bg-[oklch(0.72_0.17_160)]'
                                  : 'bg-primary/60',
                            )}
                          />
                          <div className="flex-1">
                            <div className="text-foreground/85">{a.label}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {timeAgo(a.ts)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden p-0">
              <SimulatedTerminal
                compact
                title="drone-lab — bash"
                description="Terminal del laboratorio. Pulsa y escribe help."
              />
            </Card>
          </section>
        </div>

        {/* Learning paths */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Route className="size-4 text-primary" />
            Rutas de aprendizaje
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {learningPaths.map((p) => {
              const Icon =
                p.id === 'beginner'
                  ? Sprout
                  : p.id === 'intermediate'
                    ? TrendingUp
                    : p.id === 'red-team'
                      ? Crosshair
                      : p.id === 'blue-team'
                        ? ShieldCheck
                        : p.id === 'researcher'
                          ? FlaskConical
                          : Flame
              const stepsDone = p.steps.filter(
                (s) => modules.find((m) => m.id === s.moduleId)?.status === 'available',
              ).length
              return (
                <button
                  key={p.id}
                  onClick={() => navigate({ kind: 'learning-path' })}
                  className="group flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">
                        {p.name}
                      </h3>
                      <span className="font-mono-tight text-[10px] text-muted-foreground">
                        {stepsDone}/{p.steps.length}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {p.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Ethical scope banner */}
        <section>
          <Card className="border-[oklch(0.7_0.12_85_/_0.3)] bg-[oklch(0.3_0.05_85_/_0.06)]">
            <CardContent className="flex items-start gap-3 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[oklch(0.82_0.12_85)]" />
              <div className="text-sm">
                <span className="font-semibold text-foreground">Scope ético obligatorio.</span>{' '}
                <span className="text-muted-foreground">
                  Todo lo que practicas aquí ocurre dentro de un laboratorio aislado y
                  simulado en tu navegador. Las técnicas conceptuales se explican para
                  defensa; solo se aplican sobre hardware propio o autorizado explícitamente.
                  Interferir con drones ajenos es ilegal.
                </span>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
