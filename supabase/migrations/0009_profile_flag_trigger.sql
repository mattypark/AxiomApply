-- Replace the subquery-pinning update policy with a simpler policy plus a
-- BEFORE UPDATE trigger. Same guarantee (users can never change is_admin or
-- approved), zero chance of RLS recursion, and profile saves stay simple.

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

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
  -- Only the service role / dashboard may flip these flags.
  if jwt_role <> 'service_role'
     and current_user not in ('postgres', 'supabase_admin') then
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
