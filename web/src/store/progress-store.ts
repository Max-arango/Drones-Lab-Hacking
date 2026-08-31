'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Progress store — persisted to localStorage.
 *
 * Single-user lab environment (no auth), so progress is tracked client-side.
 * Tracks completed lessons, completed labs, captured flags, score, and a
 * lightweight activity log.
 */

export interface ActivityEntry {
  ts: number
  type: 'lesson' | 'lab' | 'flag' | 'module'
  label: string
  ref: string
}

export interface ToolMastery {
  toolId: string
  learnedAt: number
}

interface ProgressState {
  completedLessons: Record<string, boolean>
  completedLabs: Record<string, boolean>
  flags: Record<string, string>
  score: number
  startedAt: number | null
  lastActivity: number | null
  activity: ActivityEntry[]
  toolsLearned: Record<string, ToolMastery>

  completeLesson: (lessonId: string, label: string) => void
  completeLab: (labId: string, label: string) => void
  submitFlag: (labId: string, flag: string, expected: string, label: string) => boolean
  learnTool: (toolId: string) => void
  reset: () => void
  totalCompleted: () => number
}

function pushActivity(
  list: ActivityEntry[],
  entry: ActivityEntry,
  max = 40,
): ActivityEntry[] {
  const next = [entry, ...list]
  return next.slice(0, max)
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: {},
      completedLabs: {},
      flags: {},
      score: 0,
      startedAt: null,
      lastActivity: null,
      activity: [],
      toolsLearned: {},

      completeLesson: (lessonId, label) => {
        const state = get()
        if (state.completedLessons[lessonId]) return
        const ts = Date.now()
        set({
          completedLessons: { ...state.completedLessons, [lessonId]: true },
          score: state.score + 25,
          startedAt: state.startedAt ?? ts,
          lastActivity: ts,
          activity: pushActivity(state.activity, {
            ts,
            type: 'lesson',
            label,
            ref: lessonId,
          }),
        })
      },

      completeLab: (labId, label) => {
        const state = get()
        if (state.completedLabs[labId]) return
        const ts = Date.now()
        set({
          completedLabs: { ...state.completedLabs, [labId]: true },
          score: state.score + 100,
          lastActivity: ts,
          activity: pushActivity(state.activity, {
            ts,
            type: 'lab',
            label,
            ref: labId,
          }),
        })
      },

      submitFlag: (labId, flag, expected, label) => {
        const normalized = flag.trim().toUpperCase()
        const expectedNorm = expected.trim().toUpperCase()
        if (normalized !== expectedNorm) return false
        const state = get()
        const ts = Date.now()
        const already = state.flags[labId]
        set({
          flags: { ...state.flags, [labId]: normalized },
          completedLabs: { ...state.completedLabs, [labId]: true },
          score: state.score + (already ? 0 : 150),
          lastActivity: ts,
          activity: pushActivity(state.activity, {
            ts,
            type: 'flag',
            label: `Flag: ${label}`,
            ref: labId,
          }),
        })
        return true
      },

      learnTool: (toolId) => {
        const state = get()
        if (state.toolsLearned[toolId]) return
        set({
          toolsLearned: {
            ...state.toolsLearned,
            [toolId]: { toolId, learnedAt: Date.now() },
          },
        })
      },

      reset: () => {
        set({
          completedLessons: {},
          completedLabs: {},
          flags: {},
          score: 0,
          startedAt: null,
          lastActivity: null,
          activity: [],
          toolsLearned: {},
        })
      },

      totalCompleted: () => {
        const s = get()
        return (
          Object.keys(s.completedLessons).length +
          Object.keys(s.completedLabs).length
        )
      },
    }),
    {
      name: 'dronesec-progress',
      version: 1,
    },
  ),
)
