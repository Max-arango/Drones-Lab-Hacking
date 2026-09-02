'use client'

import * as React from 'react'
import { AuthDialog } from '@/components/auth/auth-dialog'
import { useAuthStore } from '@/store/auth-store'
import { useGuestStore } from '@/store/guest-store'

/**
 * First-load gate. While the user has neither signed in nor explicitly
 * chosen guest mode, mounts a non-dismissible auth dialog. Deep links
 * (`#/module/...`) are preserved because the dialog is just a UI layer
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
  // sees the modal for a frame on every reload.
  if (!initialized) return null
  if (session) return null
  if (isGuest) return null

  return (
    <AuthDialog
      // `forceOpen` ignores `open`/`onOpenChange` from the caller.
      forceOpen
      onContinueAsGuest={chooseGuest}
    />
  )
}
