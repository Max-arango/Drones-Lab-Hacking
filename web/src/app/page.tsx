'use client'

import * as React from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { AuthGate } from '@/components/auth/auth-gate'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import {
  ModuleView,
  LessonView,
  LabView,
  ToolView,
  ToolboxView,
  GlossaryView,
  LearningPathView,
  LeaderboardView,
  ProfileView,
} from '@/components/views'
import { useNavStore } from '@/store/nav-store'

export default function Home() {
  const view = useNavStore((s) => s.view)

  return (
    <>
      <AuthGate />
      <AppShell>
        {view.kind === 'dashboard' && <DashboardView />}
        {view.kind === 'module' && view.moduleId && (
          <ModuleView moduleId={view.moduleId} />
        )}
        {view.kind === 'lesson' && view.moduleId && view.lessonId && (
          <LessonView moduleId={view.moduleId} lessonId={view.lessonId} />
        )}
        {view.kind === 'lab' && view.labId && <LabView labId={view.labId} />}
        {view.kind === 'tool' && view.toolId && <ToolView toolId={view.toolId} />}
        {view.kind === 'toolbox' && <ToolboxView />}
        {view.kind === 'glossary' && <GlossaryView term={view.term} />}
        {view.kind === 'learning-path' && <LearningPathView />}
        {view.kind === 'search' && <DashboardView />}
        {view.kind === 'leaderboard' && <LeaderboardView />}
        {view.kind === 'profile' && <ProfileView />}
      </AppShell>
    </>
  )
}
