'use client'

import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export type OAuthProvider = 'google' | 'github'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  initialized: boolean

  initialize: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<{ error: string | null }>
  signInWithOAuth: (provider: OAuthProvider) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return
    // Always flip `initialized` to true — even on failure — so UI gates
    // (e.g. AuthGate) can render their fallback path. Without this, a
    // misconfigured Supabase client (empty env vars) would leave
    // `initialized` at `false` forever and the auth gate would never show.
    try {
      const { data } = await supabase.auth.getSession()
      set({
        session: data.session,
        user: data.session?.user ?? null,
      })
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null })
      })
    } catch {
      // Swallow — user stays unauthenticated; AuthGate handles the rest.
    } finally {
      set({ initialized: true })
    }
  },

  signInWithEmail: async (email, password) => {
    set({ loading: true })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false })
    return { error: error?.message ?? null }
  },

  signUpWithEmail: async (email, password, displayName) => {
    set({ loading: true })
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

  signInWithOAuth: async (provider) => {
    set({ loading: true })
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
    await supabase.auth.signOut()
    set({ loading: false })
  },
}))