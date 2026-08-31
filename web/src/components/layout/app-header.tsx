'use client'

import * as React from 'react'
import { Search, Command, Menu, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { useNavStore } from '@/store/nav-store'
import { GlobalSearch } from '@/components/search/global-search'

export function AppHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [searchOpen, setSearchOpen] = React.useState(false)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur-md sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 lg:hidden"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden size-9 lg:flex"
          onClick={onToggleSidebar}
          aria-label="Collapse sidebar"
        >
          <PanelLeft className="size-4" />
        </Button>

        <button
          onClick={() => setSearchOpen(true)}
          className="group ml-1 flex h-9 flex-1 items-center gap-2.5 rounded-md border border-border/60 bg-muted/30 px-3 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 sm:max-w-md"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">
            <span className="hidden sm:inline">Buscar lecciones, labs, herramientas…</span>
            <span className="sm:hidden">Buscar…</span>
          </span>
          <kbd className="hidden items-center gap-0.5 rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono-tight text-[10px] text-muted-foreground sm:flex">
            <Command className="size-2.5" />K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-1">
          <a
            href="https://owasp.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md border border-border/60 px-2.5 py-1.5 font-mono-tight text-[11px] text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground md:inline-block"
          >
            refs
          </a>
          <ThemeToggle />
        </div>
      </header>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
