'use client'

import * as React from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { useProgressStore, type ToolMastery } from '@/store/progress-store'

/**
 * useProgressSync — mirrors progress-store to Supabase when signed in.
 *
 * Hydration (on login): server rows are merged into local state, with
 * server-wins on conflicting keys. Any local-only keys are then pushed
 * up to the server.
 *
 * Steady state (while signed in): every store change is debounced 1s,
 * then we upsert any keys the server hasn't seen yet. We track "what
 * the server has" as a Set per table — not an offset — so deletions
 * and re-additions work correctly.
 *
 * ponytail: debounced with a 1s trailing window. activity[] is append-
 * only and bypasses the debounce so the activity log stays accurate.
 */
export function useProgressSync() {
  const session = useAuthStore((s) => s.session)
  const userId = session?.user?.id ?? null

  // Hydrate from server on user change.
  React.useEffect(() => {
    if (!userId) return

    let cancelled = false
    ;(async () => {
      const [lessons, labs, flags, tools] = await Promise.all([
        supabase
          .from('lesson_progress')
          .select('lesson_id,label,completed_at')
          .eq('user_id', userId),
        supabase
          .from('lab_progress')
          .select('lab_id,label,completed_at')
          .eq('user_id', userId),
        supabase
          .from('captured_flags')
          .select('lab_id,flag,captured_at')
          .eq('user_id', userId),
        supabase
          .from('tools_learned')
          .select('tool_id,learned_at')
          .eq('user_id', userId),
      ])

      if (cancelled) return

      const local = useProgressStore.getState()
      // serverOnly* = keys present on the server but not locally.
      const serverOnlyLessons = (lessons.data ?? [])
        .filter((r) => !local.completedLessons[r.lesson_id])
        .map((r) => r.lesson_id)
      const serverOnlyLabs = (labs.data ?? [])
        .filter((r) => !local.completedLabs[r.lab_id])
        .map((r) => r.lab_id)
      const serverOnlyFlagLabs = (flags.data ?? [])
        .filter((r) => !local.flags[r.lab_id])
        .map((r) => r.lab_id)
      const serverOnlyTools = (tools.data ?? [])
        .filter((r) => !local.toolsLearned[r.tool_id])
        .map((r) => r.tool_id)

      // Merge into local state, server-wins on shared keys.
      const completedLessons: Record<string, boolean> = {
        ...local.completedLessons,
      }
      const completedLabs: Record<string, boolean> = { ...local.completedLabs }
      const flagsMap: Record<string, string> = { ...local.flags }
      const toolsLearned: Record<string, ToolMastery> = {
        ...local.toolsLearned,
      }
      for (const id of serverOnlyLessons) completedLessons[id] = true
      for (const id of serverOnlyLabs) completedLabs[id] = true
      for (const r of flags.data ?? []) {
        if (!flagsMap[r.lab_id]) flagsMap[r.lab_id] = r.flag
      }
      for (const r of tools.data ?? []) {
        if (!toolsLearned[r.tool_id]) {
          toolsLearned[r.tool_id] = {
            toolId: r.tool_id,
            learnedAt: new Date(r.learned_at).getTime(),
          }
        }
      }

      useProgressStore.setState({
        completedLessons,
        completedLabs,
        flags: flagsMap,
        toolsLearned,
      })

      // Push any local-only keys up. After this, the server has *all* keys
      // (the merged set), so the subscriber's "synced" Sets start full.
      const localOnlyLessons = Object.keys(local.completedLessons)
      const localOnlyLabs = Object.keys(local.completedLabs)
      const localOnlyFlagEntries = Object.entries(local.flags)
      const localOnlyTools = Object.keys(local.toolsLearned)

      const tasks: Array<Promise<unknown>> = []
      // supabase.from(...).upsert(...) is chainable; await it via `.then`.
      // ponytail: the builder resolves to a `{data,error}` tuple, so we
      // wrap in `Promise.resolve(...)` to keep the array uniform.
      if (localOnlyLessons.length) {
        tasks.push(
          Promise.resolve(
            supabase
              .from('lesson_progress')
              .upsert(
                localOnlyLessons.map((lesson_id) => ({
                  user_id: userId,
                  lesson_id,
                  label: null,
                })),
                { onConflict: 'user_id,lesson_id' },
              ),
          ),
        )
      }
      if (localOnlyLabs.length) {
        tasks.push(
          Promise.resolve(
            supabase
              .from('lab_progress')
              .upsert(
                localOnlyLabs.map((lab_id) => ({
                  user_id: userId,
                  lab_id,
                  label: null,
                })),
                { onConflict: 'user_id,lab_id' },
              ),
          ),
        )
      }
      if (localOnlyFlagEntries.length) {
        tasks.push(
          Promise.resolve(
            supabase
              .from('captured_flags')
              .upsert(
                localOnlyFlagEntries.map(([lab_id, flag]) => ({
                  user_id: userId,
                  lab_id,
                  flag,
                })),
                { onConflict: 'user_id,lab_id' },
              ),
          ),
        )
      }
      if (localOnlyTools.length) {
        tasks.push(
          Promise.resolve(
            supabase
              .from('tools_learned')
              .upsert(
                localOnlyTools.map((tool_id) => ({ user_id: userId, tool_id })),
                { onConflict: 'user_id,tool_id' },
              ),
          ),
        )
      }
      await Promise.all(tasks)
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  // Steady state: subscribe to progress-store, debounce, upsert new keys.
  React.useEffect(() => {
    if (!userId) return

    // The sets the server currently has. After hydration runs, these are
    // seeded from the merged state. The subscriber diffs future states
    // against these sets to know what to push up.
    const seed = useProgressStore.getState()
    const syncedLessons = new Set(Object.keys(seed.completedLessons))
    const syncedLabs = new Set(Object.keys(seed.completedLabs))
    const syncedFlags = new Set(Object.keys(seed.flags))
    const syncedTools = new Set(Object.keys(seed.toolsLearned))
    let syncedActivityTs = seed.activity[0]?.ts ?? 0

    let timer: ReturnType<typeof setTimeout> | null = null

    const flush = () => {
      const state = useProgressStore.getState()

      const newLessonIds: string[] = []
      for (const id of Object.keys(state.completedLessons)) {
        if (!syncedLessons.has(id)) newLessonIds.push(id)
      }
      const newLabIds: string[] = []
      for (const id of Object.keys(state.completedLabs)) {
        if (!syncedLabs.has(id)) newLabIds.push(id)
      }
      const newFlagEntries: Array<{ lab_id: string; flag: string }> = []
      for (const [lab_id, flag] of Object.entries(state.flags)) {
        if (!syncedFlags.has(lab_id)) {
          newFlagEntries.push({ lab_id, flag })
        }
      }
      const newToolIds: string[] = []
      for (const id of Object.keys(state.toolsLearned)) {
        if (!syncedTools.has(id)) newToolIds.push(id)
      }

      if (newLessonIds.length) {
        void supabase
          .from('lesson_progress')
          .upsert(
            newLessonIds.map((lesson_id) => ({
              user_id: userId,
              lesson_id,
              label: null,
            })),
            { onConflict: 'user_id,lesson_id' },
          )
        for (const id of newLessonIds) syncedLessons.add(id)
      }
      if (newLabIds.length) {
        void supabase
          .from('lab_progress')
          .upsert(
            newLabIds.map((lab_id) => ({
              user_id: userId,
              lab_id,
              label: null,
            })),
            { onConflict: 'user_id,lab_id' },
          )
        for (const id of newLabIds) syncedLabs.add(id)
      }
      if (newFlagEntries.length) {
        void supabase
          .from('captured_flags')
          .upsert(
            newFlagEntries.map((e) => ({ user_id: userId, ...e })),
            { onConflict: 'user_id,lab_id' },
          )
        for (const e of newFlagEntries) syncedFlags.add(e.lab_id)
      }
      if (newToolIds.length) {
        void supabase
          .from('tools_learned')
          .upsert(
            newToolIds.map((tool_id) => ({ user_id: userId, tool_id })),
            { onConflict: 'user_id,tool_id' },
          )
        for (const id of newToolIds) syncedTools.add(id)
      }

      // Activity log is append-only. Compare by ts (monotonic), so a
      // re-arranged log doesn't re-upload old entries.
      const newestTs = state.activity[0]?.ts ?? 0
      if (newestTs > syncedActivityTs) {
        const newEntries: Array<{
          user_id: string
          type: 'lesson' | 'lab' | 'flag' | 'module'
          label: string
          ref: string
        }> = []
        for (const e of state.activity) {
          if (e.ts <= syncedActivityTs) break
          newEntries.push({
            user_id: userId,
            type: e.type,
            label: e.label,
            ref: e.ref,
          })
        }
        if (newEntries.length) {
          void supabase.from('activity').insert(newEntries)
        }
        syncedActivityTs = newestTs
      }
    }

    const unsubscribe = useProgressStore.subscribe(() => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(flush, 1000)
    })

    return () => {
      if (timer) clearTimeout(timer)
      unsubscribe()
    }
  }, [userId])
}