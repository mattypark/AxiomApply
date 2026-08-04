-- SECURITY FIX — privilege escalation via profiles.is_admin / profiles.approved.
--
-- 0009 shipped protect_profile_flags() as SECURITY DEFINER and guarded on
-- `current_user`. Inside a SECURITY DEFINER function `current_user` is the
-- function OWNER (postgres), not the caller — so this clause was true on every
-- call and the guard skipped itself:
--
--     and current_user not in ('postgres', 'supabase_admin')
--
-- Net effect: any signed-in user could PATCH their own profile row with
-- {"is_admin": true, "approved": true} and become an admin. Verified
-- reproducible against the live project on 2026-08-03.
--
-- `session_user` is the fix: it reports the role that actually opened the
-- connection and is NOT rewritten by SECURITY DEFINER.
--
--   PostgREST (signed-in user) → session_user = 'authenticator' → guard applies
--   service_role key           → jwt_role = 'service_role'      → guard skipped
--   SQL editor / dashboard     → session_user = 'postgres'      → guard skipped
--
-- Safe to re-run.

create or replace function public.protect_profile_flags()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  jwt_role text;
begin
  jwt_role := coalesce(
    current_setting('request.jwt.claim.role', true),
    (nullif(current_setting('request.jwt.claims', true), '')::json ->> 'role'),
    ''
  );
  -- Only the service role / dashboard may flip these flags. session_user —
  -- NOT current_user, which SECURITY DEFINER rewrites to the function owner.
  if jwt_role <> 'service_role'
     and session_user not in ('postgres', 'supabase_admin') then
    new.is_admin := old.is_admin;
    new.approved := old.approved;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_flags on public.profiles;
create trigger profiles_protect_flags
  before update on public.profiles
  for each row execute function public.protect_profile_flags();

-- Belt and braces: revoke direct column writes from the client-facing roles so
-- the flags are unreachable even if the trigger is ever dropped again.
revoke update (is_admin, approved) on public.profiles from anon, authenticated;

-- Damage check — anyone who escalated themselves before this fix landed.
-- Review the output; this migration deliberately does NOT auto-reset flags,
-- because a legitimately-granted admin would be wiped along with an attacker.
do $$
declare
  n int;
begin
  select count(*) into n from public.profiles where is_admin or approved;
  raise notice 'profiles with is_admin or approved set: %', n;
end;
$$;
