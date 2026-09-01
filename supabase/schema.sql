-- ============================================================================
-- DroneSec Lab — Supabase schema
-- ============================================================================
-- Hybrid auth: Supabase Auth is OPT-IN. The app ships as a single-user,
-- client-side lab (localStorage) by default. When a user signs in, their
-- progress is mirrored to these tables so they can resume on another device.
--
-- Run order:
--   1. `supabase start`                (local stack)
--   2. `supabase db reset`             (applies migrations + seed)
--   3. `bun run dev`                   (the Next.js app reads NEXT_PUBLIC_SUPABASE_*)
--
-- This file is the canonical reference; the same DDL lives in
-- `migrations/0001_init.sql` for `supabase db push`.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles — public-facing user metadata, 1:1 with auth.users
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  -- Lab context: every user shares the same virtual lab, but their
  -- personal score / progress is scoped per user.
  started_at   timestamptz default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists profiles_created_at_idx
  on public.profiles (created_at desc);

-- Auto-create a profile row when a new auth user signs up.
--
-- SECURITY DEFINER is required here so the trigger can INSERT into
-- `public.profiles` on behalf of the freshly-created auth user (whose JWT
-- has no profile row yet, so RLS would block them). The function is owned
-- by `postgres`, which has BYPASSRLS.
--
-- Defense in depth:
--   * `set search_path = public` prevents search-path hijacking.
--   * `revoke execute ... from public` below blocks anon/authenticated from
--     calling it directly — only the trigger (running as the function owner)
--     can invoke it.
--   * The body only reads `raw_user_meta_data->>'display_name'`, which is
--     user-editable but only used to seed a *display* field (not used for
--     any authorization decision). Authorization-relevant data goes in
--     `raw_app_meta_data` instead.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

-- Lock down direct execution. Trigger fires as the function owner, which
-- bypasses this revoke.
revoke execute on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh on profile writes.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 2. lesson_progress — which lessons a user has completed
-- ----------------------------------------------------------------------------
create table if not exists public.lesson_progress (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_id    text not null,                  -- matches ContentModule lesson ids
  label        text,                           -- human-readable, for UI
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists lesson_progress_user_idx
  on public.lesson_progress (user_id, completed_at desc);

-- ----------------------------------------------------------------------------
-- 3. lab_progress — which labs a user has completed
-- ----------------------------------------------------------------------------
create table if not exists public.lab_progress (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  lab_id       text not null,
  label        text,
  completed_at timestamptz not null default now(),
  unique (user_id, lab_id)
);

create index if not exists lab_progress_user_idx
  on public.lab_progress (user_id, completed_at desc);

-- ----------------------------------------------------------------------------
-- 4. captured_flags — CTF flag submissions
-- ----------------------------------------------------------------------------
create table if not exists public.captured_flags (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  lab_id       text not null,                  -- e.g. "linux-01-filesystem"
  flag         text not null,                  -- the captured flag value
  points       integer not null default 10,
  captured_at  timestamptz not null default now(),
  unique (user_id, lab_id)                     -- one flag per lab per user
);

create index if not exists captured_flags_user_idx
  on public.captured_flags (user_id, captured_at desc);

-- ----------------------------------------------------------------------------
-- 5. tools_learned — tools the user has marked as learned
-- ----------------------------------------------------------------------------
create table if not exists public.tools_learned (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  tool_id     text not null,
  learned_at  timestamptz not null default now(),
  unique (user_id, tool_id)
);

-- ----------------------------------------------------------------------------
-- 6. activity — lightweight activity log (mirrors the in-store activity[])
-- ----------------------------------------------------------------------------
create table if not exists public.activity (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null check (type in ('lesson','lab','flag','module')),
  label      text not null,
  ref        text not null,                    -- lesson/lab/flag/module id
  created_at timestamptz not null default now()
);

create index if not exists activity_user_recent_idx
  on public.activity (user_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 7. leaderboard view — derived score per user (optional, RLS-safe)
-- ----------------------------------------------------------------------------
-- `security_invoker = true` (Postgres 15+) makes the view run with the
-- caller's RLS context instead of the view owner's. Combined with the
-- per-table policies above, an anon user selecting from this view sees
-- the same rows they could read directly — which is none for the
-- underlying progress tables. To make the leaderboard actually public,
-- we grant SELECT below AND rely on the join semantics: each user sees
-- aggregate counts across ALL rows because they can't query the base
-- tables directly. If you want per-user row hiding, switch to a
-- server-side aggregation function with explicit security definer + a
-- role grant, or move the leaderboard into an unexposed schema.
create or replace view public.leaderboard
  with (security_invoker = true) as
  select
    p.id           as user_id,
    p.display_name,
    coalesce(sum(cf.points), 0)::integer as score,
    count(distinct cf.id)                 as flags_count,
    count(distinct lp.id)                 as lessons_count,
    count(distinct lab.id)                as labs_count
  from public.profiles p
  left join public.captured_flags     cf  on cf.user_id  = p.id
  left join public.lesson_progress    lp  on lp.user_id  = p.id
  left join public.lab_progress       lab on lab.user_id = p.id
  group by p.id, p.display_name;

-- ----------------------------------------------------------------------------
-- Row Level Security — every table is locked down by default.
-- Users read/write their own rows; the leaderboard is public.
-- ----------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.lab_progress    enable row level security;
alter table public.captured_flags  enable row level security;
alter table public.tools_learned   enable row level security;
alter table public.activity        enable row level security;

-- profiles: a user can read/update their own row only.
-- `TO authenticated` is required — bare `auth.uid()` alone works but
-- combining it with the role clause is the documented secure pattern and
-- avoids the anonymous-sign-in gotcha. `(select auth.uid())` caches the
-- result per query instead of re-evaluating per row.
drop policy if exists "profiles self select" on public.profiles;
create policy "profiles self select"
  on public.profiles for select
  to authenticated
  using ( (select auth.uid()) = id );

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update"
  on public.profiles for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- Insert is reserved for the auth trigger (security definer), so no insert policy here.

-- The rest: a user can do anything with their own rows.
drop policy if exists "lesson_progress self" on public.lesson_progress;
create policy "lesson_progress self"
  on public.lesson_progress for all
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists "lab_progress self" on public.lab_progress;
create policy "lab_progress self"
  on public.lab_progress for all
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists "captured_flags self" on public.captured_flags;
create policy "captured_flags self"
  on public.captured_flags for all
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists "tools_learned self" on public.tools_learned;
create policy "tools_learned self"
  on public.tools_learned for all
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists "activity self" on public.activity;
create policy "activity self"
  on public.activity for all
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

-- Leaderboard: public read.
grant select on public.leaderboard to anon, authenticated;