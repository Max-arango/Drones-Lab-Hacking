'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  BookOpen,
  FlaskConical,
  Wrench,
  BookA,
  FileText,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { modules, tools, glossary, labs, labById } from '@/lib/content/registry'
import { useNavStore } from '@/store/nav-store'

interface SearchEntry {
  id: string
  label: string
  sublabel: string
  icon: LucideIcon
  group: string
  onSelect: () => void
}

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const navigate = useNavStore((s) => s.navigate)

  const entries: SearchEntry[] = React.useMemo(() => {
    const list: SearchEntry[] = []

    // Lessons
    for (const m of modules) {
      for (const l of m.lessons) {
        list.push({
          id: l.id,
          label: l.title,
          sublabel: `${m.number} · ${m.title}`,
          icon: FileText,
          group: 'Lecciones',
          onSelect: () =>
            navigate({ kind: 'lesson', moduleId: m.id, lessonId: l.id }),
        })
      }
    }
    // Modules
    for (const m of modules) {
      list.push({
        id: m.id,
        label: `${m.number} — ${m.title}`,
        sublabel: m.subtitle,
        icon: BookOpen,
        group: 'Módulos',
        onSelect: () => navigate({ kind: 'module', moduleId: m.id }),
      })
    }
    // Labs
    for (const lab of labs) {
      list.push({
        id: lab.id,
        label: `LAB ${lab.number} — ${lab.title}`,
        sublabel: lab.objective,
        icon: FlaskConical,
        group: 'Laboratorios',
        onSelect: () => navigate({ kind: 'lab', labId: lab.id }),
      })
    }
    // Tools
    for (const t of tools) {
      list.push({
        id: t.id,
        label: t.name,
        sublabel: t.useCase,
        icon: Wrench,
        group: 'Herramientas',
        onSelect: () => navigate({ kind: 'tool', toolId: t.id }),
      })
    }
    // Glossary
    for (const g of glossary) {
      list.push({
        id: g.term,
        label: g.term,
        sublabel: g.definition.slice(0, 60) + '…',
        icon: BookA,
        group: 'Glosario',
        onSelect: () => navigate({ kind: 'glossary', term: g.term }),
      })
    }
    return list
  }, [navigate])

  const filtered = React.useMemo(() => {
    // group by group, preserve order
    const groups: Record<string, SearchEntry[]> = {}
    for (const e of entries) {
      ;(groups[e.group] ??= []).push(e)
    }
    return groups
  }, [entries])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar lecciones, módulos, labs, herramientas, términos…" />
      <CommandList>
        <CommandEmpty>No hay resultados.</CommandEmpty>
        {Object.entries(filtered).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((e) => (
              <CommandItem
                key={e.id}
                value={`${e.label} ${e.sublabel}`}
                onSelect={() => {
                  e.onSelect()
                  onOpenChange(false)
                }}
              >
                <e.icon className="size-4 text-muted-foreground" />
                <div className="flex flex-1 flex-col">
                  <span className="text-sm">{e.label}</span>
                  <span className="text-xs text-muted-foreground">{e.sublabel}</span>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground/50" />
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
