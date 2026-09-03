'use client'

import * as React from 'react'
import {
  Rocket,
  Terminal,
  Network,
  Radio,
  Package,
  Fish,
  Wifi,
  Radar,
  Plug,
  Webhook,
  Filter,
  Repeat,
  Plane,
  Crosshair,
  Cpu,
  Binary,
  Bomb,
  Search,
  ShieldCheck,
  Siren,
  Trophy,
  Wrench,
  BookA,
  Route,
  User,
  ChevronDown,
  ChevronRight,
  CircleDot,
  CheckCircle2,
  Lock,
  Layers,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { modules, moduleGroups, moduleById, labs } from '@/lib/content/registry'
import { useNavStore } from '@/store/nav-store'
import { useProgressStore } from '@/store/progress-store'
import { AuthButton } from '@/components/auth/auth-button'
import type { ContentModule, ModuleGroup } from '@/lib/content/types'

const ICONS: Record<string, LucideIcon> = {
  Rocket,
  Terminal,
  Network,
  Radio,
  Package,
  Fish,
  Wifi,
  Radar,
  Plug,
  Webhook,
  Filter,
  Repeat,
  Plane,
  Crosshair,
  Cpu,
  Binary,
  Bomb,
  Search,
  ShieldCheck,
  Siren,
  Trophy,
  Wrench,
  BookA,
  Route,
}

function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? CircleDot
}

function ModuleItem({ module: m }: { module: ContentModule }) {
  const navigate = useNavStore((s) => s.navigate)
  const currentView = useNavStore((s) => s.view)
  const completedLessons = useProgressStore((s) => s.completedLessons)
  const isActive =
    currentView.moduleId === m.id &&
    (currentView.kind === 'module' || currentView.kind === 'lesson')

  const totalLessons = m.lessons.length
  const doneLessons = m.lessons.filter((l) => completedLessons[l.id]).length
  const progress = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0
  const isComingSoon = m.status === 'coming-soon'

  return (
    <button
      onClick={() => navigate({ kind: 'module', moduleId: m.id })}
      className={cn(
        'group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
        isActive
          ? 'bg-primary/10 text-foreground'
          : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
      )}
    >
      <ModuleIcon
        name={m.icon}
        className={cn(
          'size-4 shrink-0',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
        )}
      />
      <span className="flex-1 truncate">
        <span className="font-mono-tight text-[10px] text-muted-foreground/70">
          {m.number}
        </span>{' '}
        {m.title}
      </span>
      {isComingSoon ? (
        <Lock className="size-3 shrink-0 text-muted-foreground/50" />
      ) : totalLessons > 0 && doneLessons === totalLessons ? (
        <CheckCircle2 className="size-3.5 shrink-0 text-[oklch(0.78_0.13_160)]" />
      ) : doneLessons > 0 ? (
        <span className="font-mono-tight text-[10px] text-primary/70">{progress}%</span>
      ) : null}
    </button>
  )
}

/** Icon component declared at module scope to satisfy static-components rule. */
function ModuleIcon({ name, className }: { name: string; className?: string }) {
  const icon = getIcon(name)
  return <>{React.createElement(icon, { className })}</>
}

function GroupSection({ group }: { group: { id: ModuleGroup; label: string } }) {
  const [open, setOpen] = React.useState(true)
  const groupModules = modules.filter((m) => m.group === group.id)

  if (groupModules.length === 0) return null

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 hover:text-foreground"
      >
        {open ? (
          <ChevronDown className="size-3" />
        ) : (
          <ChevronRight className="size-3" />
        )}
        {group.label}
      </button>
      {open && (
        <div className="space-y-0.5">
          {groupModules.map((m) => (
            <ModuleItem key={m.id} module={m} />
          ))}
        </div>
      )}
    </div>
  )
}

export function AppSidebar() {
  const navigate = useNavStore((s) => s.navigate)
  const currentView = useNavStore((s) => s.view)
  const completedLessons = useProgressStore((s) => s.completedLessons)
  const completedLabs = useProgressStore((s) => s.completedLabs)
  const score = useProgressStore((s) => s.score)

  const totalDone =
    Object.keys(completedLessons).length + Object.keys(completedLabs).length

  return (
    <aside className="flex h-full w-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo / title */}
      <button
        onClick={() => navigate({ kind: 'dashboard' })}
        className="flex shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4 py-3.5 text-left transition-colors hover:bg-sidebar-accent/40"
      >
        <div className="relative flex size-8 items-center justify-center rounded-md bg-primary/15">
          <Plane className="size-4 text-primary" />
          <div className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-[oklch(0.78_0.13_160)] ring-2 ring-sidebar" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-mono-tight text-sm font-bold tracking-tight text-foreground">
            DroneSec<span className="text-primary">_</span>Lab
          </span>
          <span className="font-mono-tight text-[10px] text-muted-foreground">
            drone cybersecurity academy
          </span>
        </div>
      </button>

      {/* Nav */}
      <ScrollArea className="flex-1 px-2 py-3">
        <div className="space-y-3">
          {/* Quick nav */}
          <div className="space-y-0.5">
            <button
              onClick={() => navigate({ kind: 'dashboard' })}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                currentView.kind === 'dashboard'
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              )}
            >
              <Layers className="size-4" />
              Dashboard
            </button>
            <button
              onClick={() => navigate({ kind: 'learning-path' })}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                currentView.kind === 'learning-path'
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              )}
            >
              <Route className="size-4" />
              Learning Path
            </button>
            <button
              onClick={() => navigate({ kind: 'toolbox' })}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                currentView.kind === 'toolbox'
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              )}
            >
              <Wrench className="size-4" />
              Toolbox
            </button>
            <button
              onClick={() => navigate({ kind: 'glossary' })}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                currentView.kind === 'glossary'
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              )}
            >
              <BookA className="size-4" />
              Glossary
            </button>
            <button
              onClick={() => navigate({ kind: 'leaderboard' })}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                currentView.kind === 'leaderboard'
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              )}
            >
              <Trophy className="size-4" />
              Leaderboard
            </button>
            <button
              onClick={() => navigate({ kind: 'profile' })}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                currentView.kind === 'profile'
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              )}
            >
              <User className="size-4" />
              Profile
            </button>
          </div>

          <div className="h-px bg-sidebar-border" />

          {/* Module groups */}
          {moduleGroups.map((g) => (
            <GroupSection key={g.id} group={g} />
          ))}

          <div className="h-px bg-sidebar-border" />

          {/* Labs shortcut */}
          <button
            onClick={() => navigate({ kind: 'lab', labId: labs[0]?.id ?? '' })}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          >
            <Crosshair className="size-4" />
            Attack Labs
            <span className="ml-auto rounded-full bg-muted/60 px-1.5 py-0.5 font-mono-tight text-[10px]">
              {labs.length}
            </span>
          </button>
        </div>
      </ScrollArea>

      {/* Footer status */}
      <div className="shrink-0 space-y-2 border-t border-sidebar-border bg-sidebar-accent/20 px-4 py-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-mono-tight text-muted-foreground">
            {totalDone} completed
          </span>
          <span className="font-mono-tight font-semibold text-primary">
            {score} pts
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-muted/40">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, (totalDone / Math.max(1, modules.reduce((a, m) => a + m.lessons.length, 0))) * 100)}%` }}
          />
        </div>
        <AuthButton />
      </div>
    </aside>
  )
}
