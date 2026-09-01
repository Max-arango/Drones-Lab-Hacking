'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore, type OAuthProvider } from '@/store/auth-store'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#FFC107"
        d="M21.8 10.2H12v3.8h5.6c-.5 2.6-2.7 4.3-5.6 4.3-3.4 0-6.2-2.7-6.2-6.1S8.6 5.8 12 5.8c1.5 0 2.9.5 4 1.5l2.8-2.8C16.9 2.9 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5 0 9.5-3.7 9.5-10 0-.6-.1-1.2-.2-1.8Z"
      />
      <path
        fill="#FF3D00"
        d="M3.2 7.3l3.1 2.3c.9-2.2 3.1-3.8 5.7-3.8 1.5 0 2.9.5 4 1.5l2.8-2.8C16.9 2.9 14.6 2 12 2 8 2 4.6 4.3 3.2 7.3Z"
      />
      <path
        fill="#4CAF50"
        d="M12 22c2.6 0 5-.9 6.8-2.5l-3.1-2.6c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.2-1.7-5.9-4.3l-3.2 2.4C4.5 19.6 8 22 12 22Z"
      />
      <path
        fill="#1976D2"
        d="M21.8 10.2H12v3.8h5.6c-.3 1.4-1.1 2.5-2.3 3.3l3.1 2.6c2.8-2.5 3.6-6.2 3.6-8.7 0-.6-.1-1.2-.2-1.8Z"
      />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-current">
      <path d="M12 .5C5.7.5.7 5.5.7 11.8c0 5 3.2 9.2 7.7 10.7.6.1.8-.2.8-.6v-2c-3.1.7-3.8-1.5-3.8-1.5-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.2-1.3-5.2-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.2 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.5 7.7-5.7 7.7-10.7C23.3 5.5 18.3.5 12 .5Z" />
    </svg>
  )
}

function EmailForm({
  mode,
  onSubmit,
}: {
  mode: 'signin' | 'signup'
  onSubmit: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>
}) {
  const loading = useAuthStore((s) => s.loading)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [displayName, setDisplayName] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await onSubmit(
      email,
      password,
      mode === 'signup' ? displayName || undefined : undefined,
    )
    setSubmitting(false)
    if (error) {
      toast.error(error)
    } else if (mode === 'signup') {
      toast.success('Check your email to confirm your account.')
    }
  }

  const busy = loading || submitting

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {mode === 'signup' && (
        <div className="space-y-1.5">
          <Label htmlFor={`${mode}-name`}>Display name</Label>
          <Input
            id={`${mode}-name`}
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Pilot name"
            disabled={busy}
          />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor={`${mode}-email`}>Email</Label>
        <Input
          id={`${mode}-email`}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${mode}-password`}>Password</Label>
        <Input
          id={`${mode}-password`}
          type="password"
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {mode === 'signin' ? 'Sign in' : 'Create account'}
      </Button>
    </form>
  )
}

function OAuthRow({ onPick }: { onPick: (provider: OAuthProvider) => void }) {
  const loading = useAuthStore((s) => s.loading)
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={() => onPick('google')}
      >
        <GoogleIcon />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={() => onPick('github')}
      >
        <GitHubIcon />
        GitHub
      </Button>
    </div>
  )
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail)
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail)
  const signInWithOAuth = useAuthStore((s) => s.signInWithOAuth)

  const handleOAuth = async (provider: OAuthProvider) => {
    const { error } = await signInWithOAuth(provider)
    if (error) toast.error(error)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Sign in to sync progress</DialogTitle>
          <DialogDescription>
            Local-only progress keeps working without an account. Signing in
            mirrors your progress across devices.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <EmailForm mode="signin" onSubmit={signInWithEmail} />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <OAuthRow onPick={handleOAuth} />
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <EmailForm mode="signup" onSubmit={signUpWithEmail} />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <OAuthRow onPick={handleOAuth} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}