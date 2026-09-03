'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AuthFormCard } from '@/components/auth/auth-form-card'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Sidebar-triggered dialog. The form internals live in
 * `AuthFormCard` so this component is just the Radix Dialog shell
 * the first-load `AuthGate` (see `auth-fullscreen.tsx`) does NOT
 * use this — it renders `AuthFormCard` directly inside its own
 * full-screen layout.
 */
export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>
            Sign in to sync your progress across devices.
          </DialogDescription>
        </DialogHeader>
        <AuthFormCard />
      </DialogContent>
    </Dialog>
  )
}
