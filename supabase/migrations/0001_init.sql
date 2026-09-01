-- Migration: 0001_init
-- Creates the DroneSec Lab progress tables, RLS policies, and triggers.
-- See ../schema.sql for the canonical, commented version of this DDL.

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  started_at   timestamptz default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists profiles_created_at_idx
  on public.profiles (created_at desc);

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

-- Lock down direct execution; the trigger runs as the function owner.
revoke execute on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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

create table if not exists public.lesson_progress (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_id    text not null,
  label        text,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists lesson_progress_user_idx
  on public.lesson_progress (user_id, completed_at desc);

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

create table if not exists public.captured_flags (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  lab_id       text not null,
  flag         text not null,
  points       integer not null default 10,
  captured_at  timestamptz not null default now(),
  unique (user_id, lab_id)
);

create index if not exists captured_flags_user_idx
  on public.captured_flags (user_id, captured_at desc);

create table if not exists public.tools_learned (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  tool_id     text not null,
  learned_at  timestamptz not null default now(),
  unique (user_id, tool_id)
);

create table if not exists public.activity (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null check (type in ('lesson','lab','flag','module')),
  label      text not null,
  ref        text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_user_recent_idx
  on public.activity (user_id, created_at desc);

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
  left join public.captured_flags  cf  on cf.user_id  = p.id
  left join public.lesson_progress lp  on lp.user_id  = p.id
  left join public.lab_progress    lab on lab.user_id = p.id
  group by p.id, p.display_name;

alter table public.profiles        enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.lab_progress    enable row level security;
alter table public.captured_flags  enable row level security;
alter table public.tools_learned   enable row level security;
alter table public.activity        enable row level security;

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

grant select on public.leaderboard to anon, authenticated;