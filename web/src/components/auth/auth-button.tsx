'use client'

import * as React from 'react'
import { LogIn, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/auth-store'
import { AuthDialog } from '@/components/auth/auth-dialog'

function displayLabel(email: string | undefined): string {
  if (!email) return 'Pilot'
  const local = email.split('@')[0] ?? email
  return local.length > 14 ? `${local.slice(0, 13)}…` : local
}

export function AuthButton() {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const [open, setOpen] = React.useState(false)

  if (!user) {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-2"
          onClick={() => setOpen(true)}
        >
          <LogIn className="size-3.5" />
          Sign in
        </Button>
        <AuthDialog open={open} onOpenChange={setOpen} />
      </>
    )
  }

  const meta = (user.user_metadata ?? {}) as {
    display_name?: string
    avatar_url?: string
    full_name?: string
  }
  const name = meta.display_name || meta.full_name
  const label = name ?? displayLabel(user.email)
  const avatarUrl = meta.avatar_url

  const initials = label
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex w-full items-center gap-2.5 rounded-md border border-sidebar-border bg-sidebar-accent/30 px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-sidebar-accent/50">
          <Avatar className="size-6">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={label} /> : null}
            <AvatarFallback className="text-[10px]">{initials || 'P'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate font-mono-tight text-foreground">{label}</div>
            {user.email && label !== user.email && (
              <div className="truncate font-mono-tight text-[10px] text-muted-foreground">
                {user.email}
              </div>
            )}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground">
          Signed in
        </DropdownMenuLabel>
        {user.email && (
          <DropdownMenuItem disabled className="font-mono-tight text-xs">
            {user.email}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            void signOut()
          }}
          className="gap-2"
        >
          <LogOut className="size-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}