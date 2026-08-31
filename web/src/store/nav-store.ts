'use client'

import { create } from 'zustand'

/**
 * SPA navigation store.
 *
 * The platform is constrained to a single `/` route, so all navigation is
 * state-driven. The current view is described by a discriminated union and
 * mirrored to `location.hash` so the browser back/forward buttons work and
 * deep links are shareable (e.g. #/module/01-linux/lesson/filesystem).
 */

export type ViewKind =
  | 'dashboard'
  | 'module'
  | 'lesson'
  | 'lab'
  | 'tool'
  | 'glossary'
  | 'learning-path'
  | 'toolbox'
  | 'search'

export interface ViewState {
  kind: ViewKind
  moduleId?: string
  lessonId?: string
  labId?: string
  toolId?: string
  term?: string
}

interface NavState {
  view: ViewState
  /** Navigate to a new view (pushes a history entry). */
  navigate: (view: ViewState) => void
  /** Replace the current view without pushing history. */
  replace: (view: ViewState) => void
  /** Hydrate the store from a hash string. */
  hydrateFromHash: (hash: string) => void
}

function parseHash(hash: string): ViewState {
  const clean = hash.replace(/^#\/?/, '').trim()
  if (!clean) return { kind: 'dashboard' }
  const parts = clean.split('/').filter(Boolean)
  const [head, ...rest] = parts
  switch (head) {
    case 'dashboard':
      return { kind: 'dashboard' }
    case 'module':
      return { kind: 'module', moduleId: rest[0] }
    case 'lesson':
      return { kind: 'lesson', moduleId: rest[0], lessonId: rest[1] }
    case 'lab':
      return { kind: 'lab', labId: rest[0] }
    case 'tool':
      return { kind: 'tool', toolId: rest[0] }
    case 'toolbox':
      return { kind: 'toolbox' }
    case 'glossary':
      return { kind: 'glossary', term: rest[0] }
    case 'path':
      return { kind: 'learning-path' }
    case 'search':
      return { kind: 'search', term: rest[0] }
    default:
      return { kind: 'dashboard' }
  }
}

export function viewToHash(view: ViewState): string {
  switch (view.kind) {
    case 'dashboard':
      return '#/dashboard'
    case 'module':
      return view.moduleId ? `#/module/${view.moduleId}` : '#/dashboard'
    case 'lesson':
      return view.moduleId && view.lessonId
        ? `#/lesson/${view.moduleId}/${view.lessonId}`
        : '#/dashboard'
    case 'lab':
      return view.labId ? `#/lab/${view.labId}` : '#/dashboard'
    case 'tool':
      return view.toolId ? `#/tool/${view.toolId}` : '#/toolbox'
    case 'toolbox':
      return '#/toolbox'
    case 'glossary':
      return view.term ? `#/glossary/${view.term}` : '#/glossary'
    case 'learning-path':
      return '#/path'
    case 'search':
      return view.term ? `#/search/${view.term}` : '#/search'
    default:
      return '#/dashboard'
  }
}

export const useNavStore = create<NavState>((set, get) => ({
  view: { kind: 'dashboard' },

  navigate: (view) => {
    const hash = viewToHash(view)
    if (window.location.hash !== hash) {
      window.history.pushState({ view }, '', hash)
    }
    set({ view })
    // Scroll main content to top on navigation
    requestAnimationFrame(() => {
      const main = document.getElementById('app-main')
      if (main) main.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    })
  },

  replace: (view) => {
    const hash = viewToHash(view)
    window.history.replaceState({ view }, '', hash)
    set({ view })
  },

  hydrateFromHash: (hash) => {
    set({ view: parseHash(hash) })
  },
}))

/** Convenience selector hook. */
export function useCurrentView() {
  return useNavStore((s) => s.view)
}
