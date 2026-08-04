-- Startup onboarding fields + manual approval gate.
-- Startups fill company/linkedin/social/looking_for at onboarding and stay
-- locked out of the dashboard until Matthew flips approved = true.

alter table public.profiles add column if not exists company text;
alter table public.profiles add column if not exists linkedin text;
alter table public.profiles add column if not exists social text;
alter table public.profiles add column if not exists looking_for text;
alter table public.profiles add column if not exists approved boolean not null default false;

-- Users may update their own row but can NEVER change is_admin or approved —
-- both are pinned to their current values (dashboard/service role only).
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid())
    and approved = (select p.approved from public.profiles p where p.id = auth.uid())
  );
