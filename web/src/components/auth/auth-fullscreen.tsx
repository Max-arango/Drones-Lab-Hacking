'use client'

import * as React from 'react'
import { motion, MotionConfig, m } from 'framer-motion'
import { Lock, Plane, Radar, Wifi, ShieldCheck, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuthFormCard } from '@/components/auth/auth-form-card'

/* ──────────────────────────────────────────────────────────────────
 * i18n — left panel + lang toggle copy
 * ────────────────────────────────────────────────────────────────── */
type Lang = 'en' | 'es'

const COPY = {
  en: {
    brand: 'DroneSec Lab',
    version: 'v0.42',
    tagline: 'drone cybersecurity academy',
    eyebrow: 'DRONESEC · CYBER RANGE',
    h1a: 'Train. Hack.',
    h1b: 'Secure the swarm.',
    features: [
      {
        title: 'Real protocol analysis',
        body: 'Wireshark, tcpdump, MAVLink — over real captures, never synthetic.',
      },
      {
        title: 'Linux, networks, Wi-Fi, firmware',
        body: 'From the kernel up to MAVLink, in a controlled virtual lab.',
      },
      {
        title: 'Progress that travels with you',
        body: 'Sign in to sync your hangar across every device you fly from.',
      },
    ],
    secure: 'authorized testing only · no live systems · 10.10.10.0/24 lab',
    switchTo: 'ES',
  },
  es: {
    brand: 'DroneSec Lab',
    version: 'v0.42',
    tagline: 'academia de ciberseguridad de drones',
    eyebrow: 'DRONESEC · CYBER RANGE',
    h1a: 'Entrena. Hackea.',
    h1b: 'Asegura el enjambre.',
    features: [
      {
        title: 'Análisis real de protocolos',
        body: 'Wireshark, tcpdump, MAVLink — sobre capturas reales, nunca sintéticas.',
      },
      {
        title: 'Linux, redes, Wi-Fi, firmware',
        body: 'Desde el kernel hasta MAVLink, en un laboratorio virtual controlado.',
      },
      {
        title: 'Progreso que viaja contigo',
        body: 'Inicia sesión para sincronizar tu hangar en cada dispositivo.',
      },
    ],
    secure: 'solo pruebas autorizadas · sin sistemas en producción · lab 10.10.10.0/24',
    switchTo: 'EN',
  },
} as const

/* ──────────────────────────────────────────────────────────────────
 * MouseAmbient — three radial gradients that lerp toward the cursor
 * via --mx/--my CSS vars. Honors prefers-reduced-motion.
 * ────────────────────────────────────────────────────────────────── */
function MouseAmbient() {
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return // No lerp loop on reduced-motion devices.

    let raf = 0
    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let cx = tx
    let cy = ty
    let active = true

    const onMove = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
    }

    const tick = () => {
      cx += (tx - cx) * 0.08
      cy += (ty - cy) * 0.08
      el.style.setProperty('--mx', `${cx}px`)
      el.style.setProperty('--my', `${cy}px`)
      if (active) raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      active = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden auth-gate-bg"
      style={{ ['--mx' as never]: '50%', ['--my' as never]: '50%' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(620px circle at var(--mx) var(--my), oklch(0.72 0.17 160 / 0.22), transparent 62%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(820px circle at calc(var(--mx) + 220px) calc(var(--my) + 120px), oklch(0.78 0.15 85 / 0.10), transparent 65%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(540px circle at calc(var(--mx) - 180px) calc(var(--my) - 100px), oklch(0.65 0.21 25 / 0.07), transparent 60%)',
        }}
      />
      <svg className="absolute inset-0 size-full opacity-[0.07]" aria-hidden>
        <defs>
          <pattern
            id="auth-gate-grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-gate-grid)" />
      </svg>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
 * RadarSweep — 3 concentric rings + rotating conic sweep + pulsing
 * drone icon. CSS-driven; static when prefers-reduced-motion.
 * ────────────────────────────────────────────────────────────────── */
function RadarSweep() {
  return (
    <div
      className="relative mx-auto size-72"
      aria-hidden
    >
      {/* outer rings */}
      <div className="absolute inset-0 rounded-full border border-primary/20" />
      <div className="absolute inset-6 rounded-full border border-primary/30" />
      <div className="absolute inset-12 rounded-full border border-primary/40" />
      {/* crosshair */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary/15" />
      <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-primary/15" />
      {/* sweep wedge (rotating conic-gradient) */}
      <div
        className="auth-sweep absolute inset-0 rounded-full opacity-70 mix-blend-screen"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, oklch(0.72 0.17 160 / 0.55) 50deg, oklch(0.78 0.15 85 / 0.30) 70deg, transparent 100deg)',
        }}
      />
      {/* outer ping ring */}
      <div
        className="auth-pulse absolute inset-0 rounded-full"
        style={{ boxShadow: '0 0 0 0 oklch(0.72 0.17 160 / 0)' }}
      />
      {/* center: drone icon */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="auth-pulse grid size-16 place-items-center rounded-full bg-primary/15 ring-1 ring-primary/40">
          <Plane className="size-7 text-primary" strokeWidth={1.5} />
        </div>
      </div>
      {/* satellite pings */}
      <div
        className="auth-blink-dot absolute left-1/2 top-3 size-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_8px_oklch(0.72_0.17_160)]"
        aria-hidden
      />
      <div
        className="auth-blink-dot absolute right-3 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_6px_oklch(0.78_0.15_85)]"
        aria-hidden
      />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
 * Feature dot — the glowing emerald dot used in feature rows
 * ────────────────────────────────────────────────────────────────── */
function FeatureDot({ Icon }: { Icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }> }) {
  return (
    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 shadow-[0_0_14px_oklch(0.72_0.17_160/0.30)]">
      <Icon className="size-3.5 text-primary" strokeWidth={1.5} />
    </span>
  )
}

/* ──────────────────────────────────────────────────────────────────
 * LeftPanel — brand, h1, features, RadarSweep, tagline
 * ────────────────────────────────────────────────────────────────── */
function LeftPanel({ lang }: { lang: Lang }) {
  const c = COPY[lang]
  const featureIcons = [Radar, Wifi, ShieldCheck]

  return (
    <aside className="relative z-10 hidden flex-col justify-between p-8 md:flex md:p-12 lg:p-14">
      {/* brand row */}
      <div className="flex items-center gap-2.5">
        <div className="relative grid size-9 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/30">
          <Plane className="size-4 text-primary" strokeWidth={1.6} />
          <span className="auth-blink-dot absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-accent ring-2 ring-background" />
        </div>
        <div className="leading-tight">
          <p className="font-mono-tight text-sm font-semibold tracking-tight">
            {c.brand}
            <span className="ml-2 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono-tight text-[9px] uppercase tracking-widest text-primary/80">
              {c.version}
            </span>
          </p>
          <p className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground">
            {c.tagline}
          </p>
        </div>
      </div>

      {/* center: copy + radar */}
      <div className="my-8 flex flex-1 flex-col items-start justify-center gap-10 lg:flex-row lg:items-center lg:gap-14">
        <div className="flex max-w-md flex-col gap-5">
          <p className="font-mono-tight text-[11px] uppercase tracking-[0.24em] text-primary">
            {c.eyebrow}
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-[56px]">
            <span
              className="block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(180deg, oklch(0.97 0 0) 0%, oklch(0.72 0.17 160) 75%, oklch(0.78 0.15 85) 100%)',
              }}
            >
              {c.h1a}
            </span>
            <span className="block bg-clip-text text-transparent">
              <span
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, oklch(0.93 0.01 150) 0%, oklch(0.78 0.15 85) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {c.h1b}
              </span>
            </span>
          </h1>

          <ul className="space-y-3">
            {c.features.map((f, i) => {
              const Icon = featureIcons[i] ?? Radar
              return (
                <li key={f.title} className="flex items-start gap-3">
                  <FeatureDot Icon={Icon} />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{f.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {f.body}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <RadarSweep />
      </div>

      {/* security tagline */}
      <div className="font-mono-tight flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        <Lock className="size-3" />
        {c.secure}
      </div>
    </aside>
  )
}

/* ──────────────────────────────────────────────────────────────────
 * LangToggle — top-right monospace EN/ES switcher
 * ────────────────────────────────────────────────────────────────── */
function LangToggle({
  lang,
  onChange,
}: {
  lang: Lang
  onChange: (next: Lang) => void
}) {
  const next: Lang = lang === 'en' ? 'es' : 'en'
  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      className="auth-fade-in fixed top-4 right-4 z-20 flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5 font-mono-tight text-[11px] font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-md transition-colors hover:border-primary/40 hover:text-foreground md:top-6 md:right-6"
      aria-label={`Switch language to ${next === 'en' ? 'English' : 'Spanish'}`}
    >
      <Languages className="size-3.5" />
      {COPY[lang].switchTo}
    </button>
  )
}

/* ──────────────────────────────────────────────────────────────────
 * AuthFullScreen — the first-load gate. Renders directly (no Dialog).
 * ────────────────────────────────────────────────────────────────── */
export function AuthFullScreen() {
  // Lazy initializer: read <html lang> on first render. On the server
  // `document` is undefined; during hydration the value matches the
  // SSR fallback ('en'), so no mismatch.
  const [lang, setLang] = React.useState<Lang>(() => {
    if (typeof document === 'undefined') return 'en'
    const fromHtml = document.documentElement.lang
    return fromHtml === 'es' ? 'es' : 'en'
  })

  return (
    <MotionConfig reducedMotion="user">
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        role="dialog"
        aria-modal="true"
        aria-label={lang === 'es' ? 'Iniciar sesión' : 'Sign in'}
        className={cn(
          'fixed inset-0 z-50 grid grid-cols-1 overflow-hidden bg-background md:grid-cols-[1.05fr_1fr]',
        )}
      >
        <MouseAmbient />

        <m.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="contents md:block"
        >
          <LeftPanel lang={lang} />
        </m.aside>

        <m.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1], delay: 0.05 }}
          className="relative z-10 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10"
        >
          <div className="auth-glass-border w-full max-w-md rounded-2xl">
            <div
              className="rounded-2xl bg-card/70 p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_oklch(1_0_0/0.04),inset_0_1px_0_oklch(1_0_0/0.06)] backdrop-blur-xl sm:p-7"
            >
              <AuthFormCard
                lang={lang}
                autoFocusEmail
              />
            </div>
          </div>
        </m.section>

        <LangToggle lang={lang} onChange={setLang} />
      </m.div>
    </MotionConfig>
  )
}
