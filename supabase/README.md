# Supabase (optional backend)

DroneSec Lab runs as a single-user, client-side app by default — state lives
in `localStorage` and there is no account system. **Supabase is optional.**
You only need it if you want cross-device progress sync or a leaderboard.

This directory holds the schema, migrations, and seed for that opt-in backend.

## Layout

```
supabase/
├── schema.sql                 # canonical, commented DDL (read this first)
├── migrations/
│   └── 0001_init.sql          # what `supabase db push` actually applies
├── seed.sql                   # empty by design — see file for why
└── README.md                  # you are here
```

## What the schema tracks

| Table            | Purpose                                              |
|------------------|------------------------------------------------------|
| `profiles`       | 1:1 with `auth.users`. Display name, avatar, start.  |
| `lesson_progress`| Lessons completed by a user.                         |
| `lab_progress`   | Labs completed by a user.                            |
| `captured_flags` | CTF flags — one row per (user, lab).                 |
| `tools_learned`  | Tools the user has marked as learned.                |
| `activity`       | Lightweight activity log (mirrors the in-store log). |
| `leaderboard`    | View: aggregate score per user. Public read.         |

All tables are RLS-locked: users can read/write only their own rows. The
`leaderboard` view is publicly readable. `auth.users` is managed by Supabase
Auth (bcrypt + JWT); we never touch passwords ourselves.

## Local setup

```bash
# 1. Install the Supabase CLI if you don't have it
brew install supabase/tap/supabase   # or scoop / npm i -g supabase

# 2. From the repo root
supabase init                       # only if supabase/config.toml doesn't exist
supabase start                      # spins up the local stack via Docker

# 3. Apply migrations + seed to the local DB
supabase db reset

# 4. Print the env vars the Next.js app needs
supabase status -o env | grep SUPABASE_
```

Then in `web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase status>
```

Restart `bun run dev` and the app picks them up.

## Creating your first user

The lab is single-user by design — there are no seeded demo accounts. Sign
up through the in-app signup form once the UI is wired, or use the Studio
at <http://127.0.0.1:54323> → Authentication → Users → **Add user → Create
new user**. The `handle_new_user()` trigger creates the matching
`public.profiles` row automatically.

## Deploying to production

```bash
supabase link --project-ref <ref>
supabase db push                   # applies migrations/0001_init.sql
```

Then set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in
your hosting provider (Vercel, etc.). **Never** commit the service-role key.

## What this does NOT do

- No real-world targets, no outbound traffic, no offensive automation. The
  Supabase backend only stores user progress; the simulated lab in
  `web/src/lib/terminal/engine.ts` is still 100% client-side and runs
  against the virtual `10.10.10.0/24` lab network.
- No email delivery is configured. Magic-link signup requires SMTP; for
  local dev, the in-memory email server (Mailpit at `:54324`) captures
  auth emails for inspection.