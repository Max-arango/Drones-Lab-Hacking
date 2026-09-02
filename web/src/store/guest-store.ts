'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GuestState {
  /**
   * True once the user has explicitly chosen "Continue as guest" on the
   * first-load gate. Persisted in localStorage so the modal only shows
   * once per device, even across reloads.
   */
  isGuest: boolean
  chosenAt: number | null
  chooseGuest: () => void
  clear: () => void
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      isGuest: false,
      chosenAt: null,
      chooseGuest: () => set({ isGuest: true, chosenAt: Date.now() }),
      clear: () => set({ isGuest: false, chosenAt: null }),
    }),
    {
      name: 'drones-lab:guest',
      // Only persist the user's choice; the actions are stable.
      partialize: (s) => ({ isGuest: s.isGuest, chosenAt: s.chosenAt }),
    },
  ),
)
