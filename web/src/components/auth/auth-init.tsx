'use client'

import * as React from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useProgressSync } from '@/store/progress-sync'

/**
 * Renders nothing. Mounts once at the top level to bootstrap auth and the
 * progress mirror. Safe to render inside the layout because it owns no DOM.
 */
export function AuthInit() {
  const initialize = useAuthStore((s) => s.initialize)
  const initialized = useAuthStore((s) => s.initialized)

  React.useEffect(() => {
    void initialize()
  }, [initialize])

  useProgressSync()

  if (!initialized) return null
  return null
}