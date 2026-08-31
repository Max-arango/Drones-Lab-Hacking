'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import {
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Lightbulb,
  Scale,
  ChevronRight,
  ListOrdered,
  Table2,
  GitBranch,
  TerminalSquare,
  Flag,
  Network,
  Layers,
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type {
  Lesson,
  LessonSection,
  CalloutSection,
  TableSection,
  StepsSection,
  DiagramSection,
  TerminalSection,
  CodeSection,
  TextSection,
  ProtocolMapSection,
  LayeredArchitectureSection,
  FlagChallengeSection,
} from '@/lib/content/types'
import { PacketVisualizer } from '@/components/packet/packet-visualizer'

const SimulatedTerminal = dynamic(
  () => import('@/components/terminal/simulated-terminal').then((m) => m.SimulatedTerminal),
  { ssr: false },
)

const FlagChallenge = dynamic(
  () => import('@/components/content/flag-challenge').then((m) => m.FlagChallenge),
  { ssr: false },
)

const Quiz = dynamic(
  () => import('@/components/content/quiz').then((m) => m.Quiz),
  { ssr: false },
)

/* ------------------------------------------------------------------ */
/* Markdown-ish text renderer (minimal, no full markdown lib needed)   */
/* ------------------------------------------------------------------ */

function renderInline(text: string): React.ReactNode {
  // **bold**, `code`, [link](url)
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`'))
      return (
        <code key={i} className="rounded bg-muted/60 px-1.5 py-0.5 font-mono-tight text-[0.85em] text-primary">
          {part.slice(1, -1)}
        </code>
      )
    const m = part.match(/\[([^\]]+)\]\(([^)]+)\)/)
    if (m)
      return (
        <span key={i} className="font-mono-tight text-primary underline-offset-2 hover:underline">
          {m[1]}
        </span>
      )
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

function TextSectionView({ section }: { section: TextSection }) {
  const blocks = section.content.split('\n\n')
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-foreground/85">
      {blocks.map((block, i) => {
        const lines = block.split('\n')
        // List block (lines starting with - or *)
        if (lines.every((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '))) {
          return (
            <ul key={i} className="ml-1 space-y-1.5">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2 text-foreground/80">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" />
                  <span>{renderInline(l.trim().slice(2))}</span>
                </li>
              ))}
            </ul>
          )
        }
        // Numbered list
        if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
          return (
            <ol key={i} className="ml-1 space-y-1.5">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2 text-foreground/80">
                  <span className="font-mono-tight text-xs text-primary">{j + 1}.</span>
                  <span>{renderInline(l.trim().replace(/^\d+\.\s/, ''))}</span>
                </li>
              ))}
            </ol>
          )
        }
        return (
          <p key={i} className="text-foreground/85">
            {renderInline(block)}
          </p>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Code block                                                          */
/* ------------------------------------------------------------------ */

function CodeSectionView({ section }: { section: CodeSection }) {
  return (
    <figure className="my-4 overflow-hidden rounded-lg border border-border/60 bg-[oklch(0.13_0.008_160)]">
      <div className="flex items-center justify-between border-b border-border/40 bg-[oklch(0.17_0.008_160)] px-3 py-1.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="size-2.5 rounded-full bg-[oklch(0.65_0.21_25)]" />
            <span className="size-2.5 rounded-full bg-[oklch(0.78_0.15_85)]" />
            <span className="size-2.5 rounded-full bg-[oklch(0.72_0.17_160)]" />
          </div>
          {section.file && (
            <span className="ml-2 font-mono-tight text-xs text-muted-foreground">{section.file}</span>
          )}
        </div>
        <Badge variant="outline" className="font-mono-tight text-[10px] uppercase">
          {section.lang}
        </Badge>
      </div>
      <SyntaxHighlighter
        language={section.lang}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          background: 'transparent',
          padding: '0.875rem 1rem',
          fontSize: '13px',
          lineHeight: 1.6,
        }}
        codeTagProps={{ style: { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' } }}
      >
        {section.code}
      </SyntaxHighlighter>
      {section.caption && (
        <figcaption className="border-t border-border/40 px-3 py-1.5 text-xs text-muted-foreground">
          {section.caption}
        </figcaption>
      )}
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Terminal transcript                                                 */
/* ------------------------------------------------------------------ */

function TerminalSectionView({ section }: { section: TerminalSection }) {
  return (
    <figure className="my-4 overflow-hidden rounded-lg border border-border/60 bg-[oklch(0.13_0.008_160)]">
      <div className="flex items-center gap-2 border-b border-border/40 bg-[oklch(0.17_0.008_160)] px-3 py-1.5">
        <TerminalSquare className="size-3.5 text-primary" />
        <span className="font-mono-tight text-xs text-muted-foreground">terminal</span>
      </div>
      <div className="overflow-x-auto p-3 font-mono-tight text-[13px] leading-relaxed">
        {section.lines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {line.comment && (
              <div className="text-muted-foreground/60"># {line.comment}</div>
            )}
            {line.prompt && (
              <span className="text-[oklch(0.72_0.17_160)]">{line.prompt} </span>
            )}
            {line.command && <span className="text-foreground">{line.command}</span>}
            {line.output && (
              <span className="block text-foreground/70">{line.output}</span>
            )}
          </div>
        ))}
      </div>
      {section.caption && (
        <figcaption className="border-t border-border/40 px-3 py-1.5 text-xs text-muted-foreground">
          {section.caption}
        </figcaption>
      )}
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Callout                                                             */
/* ------------------------------------------------------------------ */

const CALLOUT_STYLES = {
  info: { icon: Info, cls: 'border-[oklch(0.6_0.1_200_/_0.4)] bg-[oklch(0.28_0.05_200_/_0.15)]', iconCls: 'text-[oklch(0.78_0.1_200)]' },
  warning: { icon: AlertTriangle, cls: 'border-[oklch(0.7_0.12_85_/_0.4)] bg-[oklch(0.3_0.05_85_/_0.15)]', iconCls: 'text-[oklch(0.82_0.12_85)]' },
  danger: { icon: AlertOctagon, cls: 'border-[oklch(0.65_0.2_25_/_0.4)] bg-[oklch(0.3_0.06_25_/_0.15)]', iconCls: 'text-[oklch(0.72_0.18_25)]' },
  success: { icon: CheckCircle2, cls: 'border-[oklch(0.65_0.12_160_/_0.4)] bg-[oklch(0.28_0.05_160_/_0.15)]', iconCls: 'text-[oklch(0.78_0.13_160)]' },
  tip: { icon: Lightbulb, cls: 'border-primary/30 bg-primary/5', iconCls: 'text-primary' },
  legal: { icon: Scale, cls: 'border-[oklch(0.6_0.1_280_/_0.4)] bg-[oklch(0.28_0.05_280_/_0.15)]', iconCls: 'text-[oklch(0.78_0.1_280)]' },
} as const

function CalloutView({ section }: { section: CalloutSection }) {
  const s = CALLOUT_STYLES[section.variant]
  const Icon = s.icon
  return (
    <div className={cn('my-4 flex gap-3 rounded-lg border p-4', s.cls)}>
      <Icon className={cn('mt-0.5 size-5 shrink-0', s.iconCls)} />
      <div className="space-y-1">
        <div className="text-sm font-semibold text-foreground">{section.title}</div>
        <div className="text-sm leading-relaxed text-foreground/80">
          {renderInline(section.content)}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Table                                                               */
/* ------------------------------------------------------------------ */

function TableSectionView({ section }: { section: TableSection }) {
  return (
    <figure className="my-4">
      <div className="overflow-x-auto rounded-lg border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              {section.headers.map((h, i) => (
                <th
                  key={i}
                  className="border-b border-border/60 px-3 py-2.5 text-left font-mono-tight text-xs uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, i) => (
              <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2.5 align-top text-foreground/80">
                    {j === 0 ? (
                      <span className="font-mono-tight text-foreground">{cell}</span>
                    ) : (
                      renderInline(cell)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {section.caption && (
        <figcaption className="mt-1.5 text-xs text-muted-foreground">{section.caption}</figcaption>
      )}
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

function StepsSectionView({ section }: { section: StepsSection }) {
  return (
    <div className="my-4">
      {section.title && (
        <div className="mb-3 flex items-center gap-2">
          <ListOrdered className="size-4 text-primary" />
          <span className="text-sm font-semibold">{section.title}</span>
        </div>
      )}
      <ol className="relative space-y-3 border-l border-border/60 pl-6">
        {section.steps.map((step, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[27px] flex size-5 items-center justify-center rounded-full border border-primary/40 bg-background text-[10px] font-bold text-primary">
              {i + 1}
            </span>
            <div className="rounded-lg border border-border/50 bg-card/30 p-3">
              <div className="text-sm font-medium text-foreground">{step.title}</div>
              <div className="mt-1 text-sm text-foreground/75">{renderInline(step.content)}</div>
              {step.code && (
                <pre className="mt-2 overflow-x-auto rounded bg-[oklch(0.13_0.008_160)] p-2.5 font-mono-tight text-xs text-foreground/90">
                  <code>{step.code}</code>
                </pre>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Diagram (ASCII art)                                                 */
/* ------------------------------------------------------------------ */

function DiagramSectionView({ section }: { section: DiagramSection }) {
  return (
    <figure className="my-4 overflow-hidden rounded-lg border border-border/60 bg-[oklch(0.13_0.008_160)]">
      <div className="flex items-center gap-2 border-b border-border/40 bg-[oklch(0.17_0.008_160)] px-3 py-1.5">
        <GitBranch className="size-3.5 text-primary" />
        <span className="font-mono-tight text-xs text-muted-foreground">diagram</span>
        {section.title && (
          <span className="ml-2 text-xs text-foreground/80">{section.title}</span>
        )}
      </div>
      <pre className="overflow-x-auto p-4 font-mono-tight text-[11.5px] leading-[1.5] text-foreground/85">
        {section.ascii}
      </pre>
      {section.description && (
        <figcaption className="border-t border-border/40 px-3 py-2 text-xs text-muted-foreground">
          {section.description}
        </figcaption>
      )}
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Protocol map (planes)                                               */
/* ------------------------------------------------------------------ */

const PLANE_COLORS = {
  control: 'border-[oklch(0.65_0.2_25_/_0.4)] bg-[oklch(0.3_0.06_25_/_0.12)] text-[oklch(0.82_0.12_25)]',
  data: 'border-[oklch(0.65_0.12_160_/_0.4)] bg-[oklch(0.28_0.05_160_/_0.12)] text-[oklch(0.8_0.1_160)]',
  telemetry: 'border-[oklch(0.7_0.12_85_/_0.4)] bg-[oklch(0.3_0.05_85_/_0.12)] text-[oklch(0.82_0.1_85)]',
  video: 'border-[oklch(0.6_0.12_280_/_0.4)] bg-[oklch(0.28_0.05_280_/_0.12)] text-[oklch(0.78_0.1_280)]',
  management: 'border-[oklch(0.65_0.1_200_/_0.4)] bg-[oklch(0.28_0.05_200_/_0.12)] text-[oklch(0.78_0.1_200)]',
} as const

function ProtocolMapView({ section }: { section: ProtocolMapSection }) {
  return (
    <div className="my-4">
      {section.title && (
        <div className="mb-3 flex items-center gap-2">
          <Network className="size-4 text-primary" />
          <span className="text-sm font-semibold">{section.title}</span>
        </div>
      )}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {section.planes.map((plane) => (
          <div key={plane.name} className={cn('rounded-lg border p-3', PLANE_COLORS[plane.color])}>
            <div className="text-sm font-semibold">{plane.name}</div>
            <p className="mt-1 text-xs text-foreground/70">{plane.description}</p>
            <div className="mt-2.5 space-y-1">
              {plane.protocols.map((p) => (
                <div key={p.name} className="font-mono-tight text-[11px]">
                  <span className="text-foreground">{p.name}</span>
                  <span className="text-muted-foreground"> — {p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Layered architecture                                                */
/* ------------------------------------------------------------------ */

function LayeredArchitectureView({ section }: { section: LayeredArchitectureSection }) {
  return (
    <div className="my-4">
      {section.title && (
        <div className="mb-3 flex items-center gap-2">
          <Layers className="size-4 text-primary" />
          <span className="text-sm font-semibold">{section.title}</span>
        </div>
      )}
      <div className="space-y-1.5">
        {section.layers.map((layer, i) => (
          <details key={i} open={i === 0} className="group rounded-lg border border-border/60 bg-card/30">
            <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-muted/20">
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" />
              <span className="font-mono-tight text-foreground">{layer.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{layer.examples}</span>
            </summary>
            <div className="space-y-2 border-t border-border/40 px-4 py-3 text-sm">
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Rol: </span>
                <span className="text-foreground/80">{layer.role}</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Superficie de ataque: </span>
                <span className="text-[oklch(0.78_0.12_85)]">{layer.attackSurface}</span>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Section router                                                      */
/* ------------------------------------------------------------------ */

function SectionView({ section }: { section: LessonSection }) {
  switch (section.type) {
    case 'text':
      return <TextSectionView section={section} />
    case 'code':
      return <CodeSectionView section={section} />
    case 'terminal':
      return <TerminalSectionView section={section} />
    case 'callout':
      return <CalloutView section={section} />
    case 'table':
      return <TableSectionView section={section} />
    case 'steps':
      return <StepsSectionView section={section} />
    case 'diagram':
      return <DiagramSectionView section={section} />
    case 'packet':
      return <PacketVisualizer section={section} />
    case 'interactive-terminal':
      return (
        <div className="my-4">
          {section.title && (
            <div className="mb-2 flex items-center gap-2">
              <TerminalSquare className="size-4 text-primary" />
              <span className="text-sm font-semibold">{section.title}</span>
            </div>
          )}
          {section.description && (
            <p className="mb-2 text-sm text-muted-foreground">{section.description}</p>
          )}
          <SimulatedTerminal preset={section.preset} />
        </div>
      )
    case 'protocol-map':
      return <ProtocolMapView section={section} />
    case 'layered-architecture':
      return <LayeredArchitectureView section={section} />
    case 'flag-challenge':
      return <FlagChallenge section={section} />
    case 'divider':
      return (
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/60" />
          {section.label && (
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {section.label}
            </span>
          )}
          <div className="h-px flex-1 bg-border/60" />
        </div>
      )
    default:
      return null
  }
}

/* ------------------------------------------------------------------ */
/* Lesson renderer                                                     */
/* ------------------------------------------------------------------ */

export function LessonRenderer({ lesson }: { lesson: Lesson }) {
  return (
    <article className="space-y-1">
      {/* Objectives */}
      {lesson.objectives.length > 0 && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="px-5 py-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
              Objetivos de la lección
            </div>
            <ul className="space-y-1.5">
              {lesson.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary/70" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      <div className="space-y-1">
        {lesson.sections.map((section) => (
          <SectionView key={section.id} section={section} />
        ))}
      </div>

      {/* Quiz */}
      {lesson.quiz && (
        <div className="mt-8">
          <Quiz quiz={lesson.quiz} lessonId={lesson.id} />
        </div>
      )}
    </article>
  )
}
