# DroneSec Lab

An open-source, interactive platform for learning **drone cybersecurity** —
defensive and CTF-style, lab-only, fully self-paced.

> **Ethical scope.** Every command and target in this project is virtual
> (`10.10.10.0/24`, `drone-lab.local`, `localhost`). The terminal is a
> in-memory simulator (`web/src/lib/terminal/engine.ts`). No real offensive
> automation, no outbound traffic, no production systems are touched.
> Educational and defensive use only.

---

## What you get

- A **typed content engine** for lessons, labs, quizzes, and tools
  (Spanish-authored, pedagogy-driven: theory → visualization → demo →
  lab → exercise → challenge → defense).
- A **simulated Linux shell** with a virtual filesystem, virtual lab
  network, and a fake drone API (`nmap`, `nc`, `tcpdump`, `dig`, …).
- A **single-route Next.js 16 SPA** (React 19, Tailwind 4, shadcn/ui,
  Zustand) with deep-linkable navigation driven by `location.hash`.
- An **opt-in Supabase backend** (in `supabase/`) for cross-device
  progress sync, accounts, and a leaderboard. Not required.
- A **public leaderboard** (`#/leaderboard`) and a per-user **profile**
  page (`#/profile`) once Supabase is wired.

---

## Quick start

```bash
cd web
bun install
bun run dev    # http://localhost:3000
```

That's it. The lab runs as a single user with state in `localStorage`. No
account, no backend, no signup wall.

### Optional: enable cross-device sync

```bash
# 1. Start the local Supabase stack (Docker required)
supabase start

# 2. Apply migrations
supabase db reset

# 3. Copy the URL + publishable key from `supabase status` into web/.env.local
cat >> web/.env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste from supabase status>
EOF

# 4. Restart bun run dev
```

> **Key format.** Use the new `sb_publishable_*` key (not the legacy
> `anon` JWT). The publishable key supports independent rotation, which
> the legacy JWT format does not. `web/.env.local.example` ships with the
> publishable key for the project's deployed Supabase instance.

### Optional: enable OAuth providers

The auth dialog supports email+password out of the box. To enable
"Continue with Google" and "Continue with GitHub":

1. In the Supabase dashboard → Authentication → Providers → enable
   Google and/or GitHub.
2. For each provider, paste the OAuth client ID and secret from your
   Google Cloud Console / GitHub Developer Settings. The redirect URI
   is shown in the Supabase UI.
3. Add your app's domain to the provider's authorized redirect URIs.

See `supabase/README.md` for the full schema, RLS policies, and
production-deploy steps.

---

## Repository layout

```
.
├── web/                # the Next.js application (run everything from here)
│   ├── src/
│   │   ├── app/        # single route: /
│   │   ├── components/ # views, content renderer, UI primitives
│   │   ├── lib/        # content engine, terminal simulator, helpers
│   │   └── store/      # Zustand stores (nav, progress)
│   ├── prisma/         # unused scaffold (see web/CLAUDE.md)
│   └── …
├── supabase/           # opt-in backend (schema, migrations, seed)
│   ├── schema.sql
│   ├── migrations/0001_init.sql
│   ├── seed.sql
│   └── README.md
├── CLAUDE.md           # guidance for AI agents working in this repo
├── worklog.md          # build phases (FASE I done: modules 00–03)
├── LICENSE             # GNU AGPL-3.0
└── README.md           # you are here
```

The web app is the source of truth for everything user-facing. Root-level
files are project meta only.

---

## Architecture in one paragraph

The app is a **single-route SPA** (`/`) whose view is determined by a
discriminated-union `ViewState` in `web/src/store/nav-store.ts`, mirrored
to `location.hash`. All lessons/labs/modules are **typed data objects**
that a generic `<LessonRenderer>` walks — content is never hardcoded JSX.
Progress is a **Zustand store persisted to localStorage** by default; when
the user signs in, the same store syncs to Supabase tables under
`supabase/schema.sql`. There is no server-side rendering of content and
no API routes beyond what Supabase provides.

---

## Commands

All run from `web/`:

| Command            | What it does                                     |
|--------------------|--------------------------------------------------|
| `bun run dev`      | Dev server on `:3000`, logs to `dev.log`         |
| `bun run build`    | `next build` (standalone) + copies static assets |
| `bun run start`    | Standalone server via bun, logs to `server.log`  |
| `bun run lint`     | ESLint                                           |
| `bunx tsc --noEmit`| **The real typecheck** — `next build` skips this |
| `bun run db:push`  | `prisma db push --accept-data-loss` (unused)     |

---

## Contributing

Content contributions (new lessons, labs, modules) are the most valuable.
See `web/src/lib/content/` for the typed schema (`types.ts`,
`registry.ts`, `modules/`). Every module file must stay clean under
`bun run lint` and `bunx tsc --noEmit`.

Code contributions: keep diffs small, follow the existing patterns, and
don't break the ethical scope.

---

## License

[GNU AGPL-3.0](LICENSE). Copyleft: if you deploy a modified version of
this platform, you must make your source available. This keeps the
knowledge base and its improvements open for everyone learning from it.