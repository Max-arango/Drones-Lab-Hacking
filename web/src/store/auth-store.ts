'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export type OAuthProvider = 'google' | 'github'

/**
 * Persistence preference. Lives in a separate persisted store
 * (NOT in the auth store) so we can read it BEFORE Supabase hydrates.
 * `remember: true` → keep the Supabase session across reloads.
 * `remember: false` (default) → force sign-out on every page load.
 */
type RememberMode = 'remember' | 'forget'

interface RememberState {
  mode: RememberMode
  setMode: (mode: RememberMode) => void
}

const REMEMBER_KEY = 'drones-lab:remember'

const getStoredRememberMode = (): RememberMode => {
  if (typeof window === 'undefined') return 'forget'
  const v = window.localStorage.getItem(REMEMBER_KEY)
  return v === 'remember' ? 'remember' : 'forget'
}

export const useRememberStore = create<RememberState>()(
  persist(
    (set) => ({
      mode: getStoredRememberMode(),
      setMode: (mode) => set({ mode }),
    }),
    { name: REMEMBER_KEY },
  ),
)

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  initialized: boolean

  initialize: () => Promise<void>
  signInWithEmail: (
    email: string,
    password: string,
    remember: boolean,
  ) => Promise<{ error: string | null }>
  signUpWithEmail: (
    email: string,
    password: string,
    remember: boolean,
    displayName?: string,
  ) => Promise<{ error: string | null }>
  signInWithOAuth: (
    provider: OAuthProvider,
    remember: boolean,
  ) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return

    const forget = getStoredRememberMode() === 'forget'

    try {
      if (forget) {
        // The "forget" path: never trust a persisted session. We have
        // to nuke Supabase's own localStorage entry BEFORE the client
        // reads it on the next page load, so we just sign out now and
        // start fresh.
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
        set({ session: null, user: null })
      } else {
        const { data } = await supabase.auth.getSession()
        set({
          session: data.session,
          user: data.session?.user ?? null,
        })
        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user ?? null })
        })
      }
    } catch {
      // Swallow — user stays unauthenticated; AuthGate handles the rest.
    } finally {
      set({ initialized: true })
    }
  },

  signInWithEmail: async (email, password, remember) => {
    set({ loading: true })
    useRememberStore.getState().setMode(remember ? 'remember' : 'forget')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false })
    return { error: error?.message ?? null }
  },

  signUpWithEmail: async (email, password, remember, displayName) => {
    set({ loading: true })
    useRememberStore.getState().setMode(remember ? 'remember' : 'forget')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: displayName
        ? { data: { display_name: displayName } }
        : undefined,
    })
    set({ loading: false })
    return { error: error?.message ?? null }
  },

  signInWithOAuth: async (provider, remember) => {
    set({ loading: true })
    useRememberStore.getState().setMode(remember ? 'remember' : 'forget')
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/`
        : undefined
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: redirectTo ? { redirectTo } : {},
    })
    set({ loading: false })
    return { error: error?.message ?? null }
  },

  signOut: async () => {
    set({ loading: true })
    await supabase.auth.signOut({ scope: 'local' })
    useRememberStore.getState().setMode('forget')
    set({ loading: false, session: null, user: null })
  },
}))
