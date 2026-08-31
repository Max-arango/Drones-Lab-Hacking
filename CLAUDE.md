# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**DroneSec Lab** — an interactive educational platform teaching drone cybersecurity (defensive/CTF, lab-only). Next.js 16 App Router + React 19 + TypeScript + Tailwind 4 + shadcn/ui + Zustand + Prisma/SQLite. Runtime and package manager is **bun** (`bun.lock`). Single-user lab, no auth.

Ethical scope is a hard constraint: every command/target in content is a virtual lab (`10.10.10.0/24`, `drone-lab.local`, `localhost`). No real offensive automation, no outbound traffic — the terminal is simulated (see below). Keep new content inside this scope.

## Commands

```bash
bun run dev          # dev server on :3000, tees to dev.log
bun run build        # next build (standalone) + manual copy of static/ and public/ into .next/standalone
bun run start        # runs the standalone server via bun, tees to server.log
bun run lint         # eslint
bunx tsc --noEmit    # the REAL typecheck — see gotcha below
bun run db:push      # prisma db push --accept-data-loss
bun run db:generate  # prisma generate
```

No test runner is configured. `tests/*.sh` are runtime/container build scripts, not app tests. `Mathematics-Simulator/` is an unrelated stray sandbox (one `primes.test.ts`, no runner) — ignore unless asked.

## Architecture — the two things that require reading multiple files

### 1. Single-route SPA driven by Zustand + `location.hash`

Only `/` ever renders (`src/app/page.tsx`). There is no file-based routing for views. Navigation is a discriminated-union `ViewState` in `src/store/nav-store.ts`, mirrored to `location.hash` so back/forward and deep links work (e.g. `#/module/01-linux/lesson/filesystem`).

To add a view, touch all three:
1. Extend the `ViewKind` union + `parseHash()` in `src/store/nav-store.ts`.
2. Add a render branch in `src/app/page.tsx`.
3. Add the view component (exported from `@/components/views`).

### 2. Content engine — content is typed DATA, not components

All lessons/labs/modules/tools/glossary are typed objects, never hardcoded JSX. A generic `<LessonRenderer>` (`src/components/content/lesson-renderer.tsx`) walks a lesson's `sections[]` and dispatches each `LessonSection` variant to a component.

- `src/lib/content/types.ts` — the source of truth. `LessonSection` is a discriminated union of ~13 section types (text, code, terminal, callout, packet, table, steps, diagram, interactive-terminal, protocol-map, layered-architecture, flag-challenge, divider).
- `src/lib/content/registry.ts` — aggregates all modules, defines `moduleGroups` (drives sidebar order), exposes lookups (`moduleById`, etc.).
- `src/lib/content/modules/*.ts` — one file per real module (`start-here`, `linux`, `networking`, `drone-architecture`); `stubs.ts` holds the 23 "coming soon" modules.

To add a module: write a typed `ContentModule` file in `modules/`, import + spread it in `registry.ts`'s `modules[]`.
To add a section type: add the interface to the `LessonSection` union in `types.ts` **and** a matching render branch in `lesson-renderer.tsx` — the union and the renderer must stay in lockstep.

Content is authored in Spanish following a fixed pedagogy (THEORY → VISUALIZATION → DEMO → LAB → EXERCISE → CHALLENGE → DEFENSE); commands stay in English. Every module file's `bun run lint` and `bunx tsc --noEmit` must stay clean.

### Simulated terminal

`src/lib/terminal/engine.ts` is an in-memory Linux shell simulator: a virtual FS, a virtual lab network (`LAB_HOSTS`, 10.10.10.0/24: router/drone/gcs), and a fake drone API. It interprets a safe subset (help, ls, cat, ip, ss, ping, dig, nmap, nc, curl, tcpdump, strings, xxd, hexdump). Not a real shell — no process execution, no egress.

### Progress

`src/store/progress-store.ts` — Zustand + `persist` to localStorage (completed lessons/labs, captured flags, score, activity). Single-user, no server, no auth.

## Gotchas

- **`next.config.ts` sets `typescript.ignoreBuildErrors: true`** — `bun run build` does NOT fail on type errors. Always run `bunx tsc --noEmit` to actually typecheck. `reactStrictMode` is off.
- **Prisma schema (`prisma/schema.prisma`) is unused scaffold** — `User`/`Post` models, not wired to any feature. App state lives in localStorage, not the DB. Don't assume the DB backs anything.
- Path alias `@/*` → `./src/*`.
- Theme is fixed: dark terminal, emerald primary, amber accent — no blue/indigo.
- The `build` script manually copies `.next/static` and `public/` into `.next/standalone/` because `output: "standalone"` doesn't include them.
- Git root is the parent `proyects/` directory; this project lives in a subfolder. `Caddyfile` reverse-proxies `:81 → :3000` (with dynamic `XTransformPort` override).
- `worklog.md` tracks build phases (FASE I done: modules 00–03 fully built, 04–27 are stubs).
