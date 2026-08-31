'use client'

import * as React from 'react'
import { Moon, Sun, Terminal } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Cambiar tema"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="text-muted-foreground hover:text-foreground"
    >
      {mounted && theme === 'dark' ? (
        <Sun className="size-4" />
      ) : (
        <Terminal className="size-4" />
      )}
    </Button>
  )
}
