'use client'

import * as React from 'react'
import { Terminal as TerminalIcon, X, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { execCommand, PROMPT, type TerminalLine } from '@/lib/terminal/engine'

interface SimulatedTerminalProps {
  preset?: string
  title?: string
  description?: string
  className?: string
  /** If true, render compact (no header chrome). */
  compact?: boolean
}

let lineCounter = 0
function nextId() {
  lineCounter += 1
  return `tl-${lineCounter}`
}

export function SimulatedTerminal({
  preset,
  title = 'drone-lab — bash',
  description,
  className,
  compact,
}: SimulatedTerminalProps) {
  const [lines, setLines] = React.useState<TerminalLine[]>([
    {
      id: nextId(),
      output:
        'DroneSec Lab Terminal v1.0  —  red virtual 10.10.10.0/24\nEscribe `help` para ver los comandos. Targets: 10.10.10.10 (drone), 10.10.10.20 (gcs).',
    },
  ])
  const [input, setInput] = React.useState('')
  const [history, setHistory] = React.useState<string[]>(preset ? [preset] : [])
  const [histIdx, setHistIdx] = React.useState<number>(-1)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const run = (raw: string) => {
    const cmdLine: TerminalLine = { id: nextId(), prompt: PROMPT, command: raw }
    const result = execCommand(raw)
    const newLines: TerminalLine[] = [cmdLine]
    if (result.clear) {
      setLines([])
      return
    }
    if (result.output !== undefined && result.output !== '') {
      newLines.push({
        id: nextId(),
        output: result.output,
        isError: result.isError,
      })
    }
    setLines((prev) => [...prev, ...newLines])
    if (raw.trim()) {
      setHistory((prev) => [...prev, raw])
    }
    setHistIdx(-1)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    run(input)
    setInput('')
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(idx)
      setInput(history[idx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx === -1) return
      const idx = histIdx + 1
      if (idx >= history.length) {
        setHistIdx(-1)
        setInput('')
      } else {
        setHistIdx(idx)
        setInput(history[idx])
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  const runPreset = () => {
    if (preset) run(preset)
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border/70 bg-[oklch(0.14_0.008_160)] shadow-lg',
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {!compact && (
        <div className="flex items-center gap-2 border-b border-border/50 bg-[oklch(0.18_0.01_160)] px-3 py-2">
          <div className="flex gap-1.5">
            <span className="size-3 rounded-full bg-[oklch(0.65_0.21_25)]" />
            <span className="size-3 rounded-full bg-[oklch(0.78_0.15_85)]" />
            <span className="size-3 rounded-full bg-[oklch(0.72_0.17_160)]" />
          </div>
          <div className="ml-2 flex items-center gap-1.5 text-xs font-mono-tight text-muted-foreground">
            <TerminalIcon className="size-3.5" />
            <span>{title}</span>
          </div>
          {preset && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                runPreset()
              }}
            >
              Run preset
            </Button>
          )}
        </div>
      )}
      {description && (
        <p className="border-b border-border/40 bg-[oklch(0.16_0.008_160)] px-3 py-2 text-xs text-muted-foreground">
          {description}
        </p>
      )}
      <div
        ref={scrollRef}
        className="h-72 overflow-y-auto p-3 font-mono-tight text-[13px] leading-relaxed text-foreground/90"
      >
        {lines.map((line) => (
          <div key={line.id} className="whitespace-pre-wrap break-words">
            {line.prompt && (
              <span className="text-[oklch(0.72_0.17_160)]">{line.prompt} </span>
            )}
            {line.command && <span className="text-foreground">{line.command}</span>}
            {line.output && (
              <span
                className={cn(
                  'block',
                  line.isError
                    ? 'text-[oklch(0.7_0.18_25)]'
                    : 'text-foreground/80',
                )}
              >
                {line.output}
              </span>
            )}
          </div>
        ))}
        <form onSubmit={onSubmit} className="flex items-center">
          <span className="text-[oklch(0.72_0.17_160)]">{PROMPT}&nbsp;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="flex-1 bg-transparent text-foreground caret-[oklch(0.72_0.17_160)] outline-none"
            aria-label="Terminal input"
          />
        </form>
      </div>
    </div>
  )
}
