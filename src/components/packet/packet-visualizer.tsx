'use client'

import * as React from 'react'
import { ChevronRight, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PacketLayer, PacketSection as PacketSectionType } from '@/lib/content/types'

const LAYER_COLORS: Record<NonNullable<PacketLayer['color']>, { bg: string; border: string; text: string; label: string }> = {
  ethernet: { bg: 'bg-[oklch(0.28_0.05_30)]', border: 'border-[oklch(0.6_0.12_30)]', text: 'text-[oklch(0.85_0.08_30)]', label: 'L2' },
  ip: { bg: 'bg-[oklch(0.28_0.05_200)]', border: 'border-[oklch(0.6_0.1_200)]', text: 'text-[oklch(0.85_0.08_200)]', label: 'L3' },
  udp: { bg: 'bg-[oklch(0.28_0.06_160)]', border: 'border-[oklch(0.65_0.12_160)]', text: 'text-[oklch(0.85_0.1_160)]', label: 'L4' },
  tcp: { bg: 'bg-[oklch(0.28_0.05_280)]', border: 'border-[oklch(0.6_0.12_280)]', text: 'text-[oklch(0.85_0.08_280)]', label: 'L4' },
  payload: { bg: 'bg-[oklch(0.3_0.04_60)]', border: 'border-[oklch(0.65_0.1_60)]', text: 'text-[oklch(0.88_0.08_60)]', label: 'L7' },
  mavlink: { bg: 'bg-[oklch(0.3_0.06_300)]', border: 'border-[oklch(0.65_0.13_300)]', text: 'text-[oklch(0.85_0.1_300)]', label: 'APP' },
  http: { bg: 'bg-[oklch(0.3_0.05_85)]', border: 'border-[oklch(0.7_0.12_85)]', text: 'text-[oklch(0.88_0.08_85)]', label: 'L7' },
}

export function PacketVisualizer({ section }: { section: PacketSectionType }) {
  const [active, setActive] = React.useState<number>(0)
  const layer = section.layers[active]
  const colors = layer?.color ? LAYER_COLORS[layer.color] : null

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border/70 bg-card/40">
      {section.title && (
        <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-2.5">
          <Layers className="size-4 text-primary" />
          <span className="text-sm font-medium">{section.title}</span>
        </div>
      )}
      <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
        {/* Stack of layers */}
        <div className="space-y-1 p-4">
          {section.description && (
            <p className="mb-3 text-xs text-muted-foreground">{section.description}</p>
          )}
          <div className="space-y-1.5">
            {section.layers.map((l, i) => {
              const c = l.color ? LAYER_COLORS[l.color] : null
              return (
                <button
                  key={l.name}
                  onClick={() => setActive(i)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-all',
                    active === i
                      ? c
                        ? cn(c.bg, c.border, c.text, 'ring-1 ring-ring/40')
                        : 'border-primary bg-primary/10 text-foreground ring-1 ring-ring/40'
                      : 'border-border/60 bg-background/40 text-foreground/70 hover:border-border hover:bg-muted/30',
                  )}
                >
                  {c && (
                    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold', c.bg, c.text)}>
                      {c.label}
                    </span>
                  )}
                  <span className="font-mono-tight text-sm font-medium">{l.name}</span>
                  <ChevronRight
                    className={cn(
                      'ml-auto size-4 transition-transform',
                      active === i ? 'rotate-90' : 'opacity-40',
                    )}
                  />
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Encapsulamiento: de abajo arriba se envuelve, de arriba abajo se desenvuelve
          </div>
        </div>

        {/* Active layer detail */}
        <div className="border-t border-border/50 bg-muted/20 p-4 lg:border-l lg:border-t-0">
          {layer && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-mono-tight text-sm font-semibold text-foreground">
                  {layer.name}
                </h4>
                {colors && (
                  <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold', colors.bg, colors.text)}>
                    {colors.label}
                  </span>
                )}
              </div>
              {layer.description && (
                <p className="text-xs text-muted-foreground">{layer.description}</p>
              )}
              <div className="space-y-1.5">
                {layer.fields.map((f, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[110px_1fr] gap-2 rounded border border-border/40 bg-background/60 px-2.5 py-1.5"
                  >
                    <span className="font-mono-tight text-[11px] text-muted-foreground">
                      {f.label}
                    </span>
                    <span className="font-mono-tight text-[11px] text-foreground">
                      {f.value}
                      {f.note && (
                        <span className="ml-2 text-muted-foreground">— {f.note}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
