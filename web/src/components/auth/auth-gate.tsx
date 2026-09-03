'use client'

import * as React from 'react'
import { AuthFullScreen } from '@/components/auth/auth-fullscreen'
import { useAuthStore } from '@/store/auth-store'

/**
 * First-load gate. Mounts the full-screen login until the user is
 * authenticated. There is no "continue as guest" path — every visit
 * must sign in (or the "Remember me" checkbox must be checked to
 * keep the session across reloads).
 *
 * Strategy: always show the gate on the first render; dismiss it
 * only after we have confirmed that Supabase returned a real session.
 */
export function AuthGate() {
  const session = useAuthStore((s) => s.session)
  const initialized = useAuthStore((s) => s.initialized)

  // Once initialized, the only way to hide the gate is to have a
  // session. No guest flag, no localStorage bypass.
  if (initialized && session) return null

  return <AuthFullScreen />
}
