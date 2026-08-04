-- Profiles: 1:1 with auth.users, auto-created on signup.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text check (role in ('intern', 'startup')),
  is_admin boolean not null default false,
  display_name text,
  school text,
  grade text,
  preferred_seasons text[] not null default '{}',
  preferred_fields text[] not null default '{}',
  experience text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users read + update their own row. is_admin is only ever set from the
-- dashboard / SQL editor (service role bypasses RLS; clients can't touch it
-- because the update policy's WITH CHECK pins it to its current value).
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid())
  );

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();
