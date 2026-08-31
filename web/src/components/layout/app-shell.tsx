'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { AppFooter } from '@/components/layout/app-footer'
import { useNavStore } from '@/store/nav-store'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)
  const hydrateFromHash = useNavStore((s) => s.hydrateFromHash)
  const navigate = useNavStore((s) => s.navigate)
  const view = useNavStore((s) => s.view)

  // Hydrate from URL hash on mount + listen to popstate (back button).
  React.useEffect(() => {
    const init = () => hydrateFromHash(window.location.hash)
    init()
    const onPop = () => hydrateFromHash(window.location.hash)
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('hashchange', onPop)
    }
  }, [hydrateFromHash])

  // Close mobile sidebar on view change
  React.useEffect(() => {
    setSidebarOpen(false)
  }, [view])

  const toggleSidebar = () => {
    setCollapsed((v) => !v)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div
        className={cn(
          'hidden shrink-0 border-r border-border/60 transition-all duration-200 lg:block',
          collapsed ? 'w-0 overflow-hidden' : 'w-64',
        )}
      >
        <AppSidebar />
      </div>

      {/* Mobile sidebar (drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 border-r border-border/60 bg-sidebar shadow-xl">
            <AppSidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          onToggleSidebar={() => {
            if (window.matchMedia('(min-width: 1024px)').matches) {
              toggleSidebar()
            } else {
              setSidebarOpen(true)
            }
          }}
        />
        <main id="app-main" className="flex-1 overflow-y-auto">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  )
}
