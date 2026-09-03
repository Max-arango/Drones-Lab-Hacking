'use client'

import * as React from 'react'
import { AuthFullScreen } from '@/components/auth/auth-fullscreen'
import { useAuthStore } from '@/store/auth-store'
import { useGuestStore } from '@/store/guest-store'

/**
 * First-load gate. While the user has neither signed in nor explicitly
 * chosen guest mode, mounts the full-screen login. Deep links
 * (`#/module/...`) are preserved because the gate is just a UI layer
 * on top of the rest of the app — once dismissed (by sign-in or by
 * picking guest), the underlying route is already where the user wants
 * to be.
 */
export function AuthGate() {
  const session = useAuthStore((s) => s.session)
  const initialized = useAuthStore((s) => s.initialized)
  const isGuest = useGuestStore((s) => s.isGuest)
  const chooseGuest = useGuestStore((s) => s.chooseGuest)

  // Wait for auth to hydrate before deciding — otherwise a logged-in user
  // sees the gate for a frame on every reload.
  if (!initialized) return null
  if (session) return null
  if (isGuest) return null

  return <AuthFullScreen onContinueAsGuest={chooseGuest} />
}
