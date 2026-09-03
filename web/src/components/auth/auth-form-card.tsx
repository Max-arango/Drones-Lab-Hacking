'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { LogIn, TriangleAlert, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore, type OAuthProvider } from '@/store/auth-store'
import { cn } from '@/lib/utils'

/* ──────────────────────────────────────────────────────────────────
 * i18n — small inline dict, no library. Lang is local to the gate
 * (passed via `lang` prop from AuthFullScreen) so the sidebar
 * dialog still uses the same strings regardless.
 * ────────────────────────────────────────────────────────────────── */
type Lang = 'en' | 'es'

const DICT = {
  en: {
    eyebrow: 'ACADEMY · ACCESS',
    title: 'Sign in to your hangar',
    subtitle:
      'Sync your progress across devices, climb the leaderboard, and unlock CTF challenges.',
    signin: 'Sign in',
    signup: 'Create account',
    or: 'or continue with',
    orNoAcc: 'or without an account',
    email: 'Email',
    password: 'Password',
    name: 'Display name',
    forgot: 'Forgot password?',
    guestTitle: 'No account, no problem',
    guestBody:
      'You can explore everything as a guest. Progress is stored only on this device and is lost if you clear site data or switch browsers.',
    guestCta: 'Continue as guest',
    createAcc: 'Create an account',
  },
  es: {
    eyebrow: 'ACADEMIA · ACCESO',
    title: 'Entra a tu hangar',
    subtitle:
      'Sincroniza tu progreso entre dispositivos, sube en el leaderboard y desbloquea retos CTF.',
    signin: 'Iniciar sesión',
    signup: 'Crear cuenta',
    or: 'o continúa con',
    orNoAcc: 'o sin cuenta',
    email: 'Correo',
    password: 'Contraseña',
    name: 'Nombre de piloto',
    forgot: '¿Olvidaste la contraseña?',
    guestTitle: 'Sin cuenta, sin problema',
    guestBody:
      'Puedes explorar todo como invitado. El progreso se guarda solo en este dispositivo y se pierde si borras los datos del sitio o cambias de navegador.',
    guestCta: 'Continuar como invitado',
    createAcc: 'Crear una cuenta',
  },
} as const

const tFor = (lang: Lang) => DICT[lang]

/* ──────────────────────────────────────────────────────────────────
 * Google + GitHub icon glyphs (kept inline — no extra dep)
 * ────────────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────────────
 * Field — animated floating label + underline glow.
 * No JS state, all CSS-driven via :placeholder-shown + :focus-within.
 * ────────────────────────────────────────────────────────────────── */
interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  id: string
  label: string
  icon?: React.ReactNode
  trailing?: React.ReactNode
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(function Field(
  { id, label, icon, trailing, className, ...rest },
  ref,
) {
  return (
    <div className="auth-field">
      <input
        ref={ref}
        id={id}
        placeholder=" "
        className={cn('auth-input', icon ? 'pl-10' : undefined, className)}
        autoComplete="off"
        {...rest}
      />
      {icon && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4"
        >
          {icon}
        </span>
      )}
      <label htmlFor={id} className={cn('auth-label', icon ? 'left-10' : undefined)}>
        {label}
      </label>
      {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>}
      <span className="auth-underline" aria-hidden />
    </div>
  )
})

/* ──────────────────────────────────────────────────────────────────
 * PasswordField — Field with an eye-toggle. Self-contained, no state
 * leaked to parent.
 * ────────────────────────────────────────────────────────────────── */
function PasswordField({
  id,
  label,
  disabled,
  required,
  minLength,
}: {
  id: string
  label: string
  disabled?: boolean
  required?: boolean
  minLength?: number
}) {
  const [show, setShow] = React.useState(false)
  return (
    <Field
      id={id}
      label={label}
      type={show ? 'text' : 'password'}
      autoComplete="current-password"
      disabled={disabled}
      required={required}
      minLength={minLength}
      icon={<Lock />}
      trailing={
        <button
          type="button"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow((s) => !s)}
          className="grid size-7 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  )
}

/* ──────────────────────────────────────────────────────────────────
 * EmailForm — pure presentational, delegates submit to the store
 * ────────────────────────────────────────────────────────────────── */
function EmailForm({
  mode,
  lang,
  onSubmit,
}: {
  mode: 'signin' | 'signup'
  lang: Lang
  onSubmit: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>
}) {
  const loading = useAuthStore((s) => s.loading)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [displayName, setDisplayName] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const t = tFor(lang)

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
      toast.success(lang === 'es' ? 'Revisa tu correo para confirmar la cuenta.' : 'Check your email to confirm your account.')
    }
  }

  const busy = loading || submitting

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {mode === 'signup' && (
        <Field
          id={`${mode}-name`}
          name="name"
          label={t.name}
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={busy}
          icon={<User />}
        />
      )}
      <Field
        id={`${mode}-email`}
        name="email"
        type="email"
        label={t.email}
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={busy}
        icon={<Mail />}
      />
      <PasswordField
        id={`${mode}-password`}
        label={t.password}
        disabled={busy}
        required
        minLength={6}
      />

      <Button type="submit" className="w-full" disabled={busy}>
        {mode === 'signin' ? t.signin : t.signup}
      </Button>
    </form>
  )
}

/* ──────────────────────────────────────────────────────────────────
 * OAuthRow — Google + GitHub buttons. Same callbacks as before.
 * ────────────────────────────────────────────────────────────────── */
function OAuthRow({ onPick }: { onPick: (provider: OAuthProvider) => void }) {
  const loading = useAuthStore((s) => s.loading)
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={() => onPick('google')}
        className="gap-2"
      >
        <GoogleIcon />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={() => onPick('github')}
        className="gap-2"
      >
        <GitHubIcon />
        GitHub
      </Button>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
 * ContinueAsGuest — amber warning block. Only rendered when the
 * parent passes `onContinueAsGuest`.
 * ────────────────────────────────────────────────────────────────── */
function ContinueAsGuest({ lang, onPick }: { lang: Lang; onPick: () => void }) {
  const t = tFor(lang)
  return (
    <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
      <div className="flex items-start gap-2">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-400" />
        <div className="space-y-2">
          <p className="font-mono-tight text-[10px] uppercase tracking-widest text-amber-300">
            {t.guestTitle}
          </p>
          <p className="text-muted-foreground">{t.guestBody}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={onPick}
          >
            <LogIn className="size-3.5" />
            {t.guestCta}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
 * Divider — the "or" / "or without an account" hairline label
 * ────────────────────────────────────────────────────────────────── */
function Divider({ label }: { label: string }) {
  return (
    <div className="relative my-4 flex items-center" aria-hidden>
      <div className="grow border-t border-border" />
      <span className="font-mono-tight bg-card px-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="grow border-t border-border" />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
 * AuthFormCard — the shared form orchestrator. No Dialog wrapper.
 * Used both by the full-screen gate and the sidebar dialog.
 * ────────────────────────────────────────────────────────────────── */
export interface AuthFormCardProps {
  /**
   * Optional EN/ES strings. When omitted, defaults to 'en' and the
   * LangToggle in the full-screen gate is the source of truth.
   * The sidebar dialog always passes 'en' (kept stable for now).
   */
  lang?: Lang
  /**
   * When provided, a guest CTA block is rendered. Used by the gate.
   * The sidebar dialog omits it.
   */
  onContinueAsGuest?: () => void
  /**
   * autoFocus the email input on mount. Gate passes `true` so the
   * first keypress starts typing.
   */
  autoFocusEmail?: boolean
}

export function AuthFormCard({
  lang = 'en',
  onContinueAsGuest,
  autoFocusEmail = false,
}: AuthFormCardProps) {
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail)
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail)
  const signInWithOAuth = useAuthStore((s) => s.signInWithOAuth)
  const t = tFor(lang)

  const handleOAuth = async (provider: OAuthProvider) => {
    const { error } = await signInWithOAuth(provider)
    if (error) toast.error(error)
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <p className="font-mono-tight text-[10px] uppercase tracking-[0.22em] text-primary">
          {t.eyebrow}
        </p>
        <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.025em]">
          {t.title}
        </h2>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">{t.signin}</TabsTrigger>
          <TabsTrigger value="signup">{t.signup}</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="mt-4 space-y-4">
          <EmailForm mode="signin" lang={lang} onSubmit={signInWithEmail} />
          <Divider label={t.or} />
          <OAuthRow onPick={handleOAuth} />
        </TabsContent>

        <TabsContent value="signup" className="mt-4 space-y-4">
          <EmailForm mode="signup" lang={lang} onSubmit={signUpWithEmail} />
          <Divider label={t.or} />
          <OAuthRow onPick={handleOAuth} />
        </TabsContent>
      </Tabs>

      {onContinueAsGuest && (
        <>
          <Divider label={t.orNoAcc} />
          <ContinueAsGuest lang={lang} onPick={onContinueAsGuest} />
        </>
      )}
    </div>
  )
}
