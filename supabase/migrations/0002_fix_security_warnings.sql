-- Migration: 0002_fix_security_warnings
-- Fixes two security warnings flagged by `get_advisors(security)` after
-- applying 0001_init. See supabase/schema.sql for the commented version.
--
-- Both are real, exploitable issues:
--   * touch_updated_at: a mutable search_path lets an attacker create
--     a malicious function earlier in the search_path that shadows
--     `now()` or another call inside the trigger.
--   * handle_new_user: a SECURITY DEFINER function in `public` is
--     callable by anon/authenticated via PostgREST by default. The
--     `revoke from public` in 0001 was not enough — Supabase's
--     `supabase_realtime_admin` and related roles auto-grant EXECUTE
--     back on every migration. We must revoke from anon and
--     authenticated explicitly.

-- 1) Pin search_path on touch_updated_at.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) Revoke EXECUTE from anon and authenticated.
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- Note: rls_auto_enable is a Supabase-managed function and is not our
-- problem — its warning persists but is expected.