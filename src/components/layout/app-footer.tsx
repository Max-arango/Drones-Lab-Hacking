'use client'

import { Terminal, ShieldAlert, Github } from 'lucide-react'

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/20">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-primary" />
          <span className="font-mono-tight">
            DroneSec Lab — laboratorio educativo. Solo para entornos controlados y autorizados.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="size-3.5 text-[oklch(0.78_0.12_85)]" />
            Scope ético requerido
          </span>
          <span className="font-mono-tight">v0.1 · FASE I</span>
        </div>
      </div>
    </footer>
  )
}
