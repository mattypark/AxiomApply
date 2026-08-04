-- Ingestion sources + internships feed + per-user saves.

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  adapter text not null check (adapter in ('simplify_github', 'interndock_html', 'generic_json', 'manual')),
  config jsonb not null default '{}',
  active boolean not null default true,
  last_run_at timestamptz,
  last_status text,
  last_count int,
  created_at timestamptz not null default now()
);

-- No public read: config may hold selectors/paths. Service-role only.
alter table public.sources enable row level security;

create table if not exists public.internships (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources on delete set null,
  company text not null,
  role text not null,
  season text not null check (season in ('summer', 'fall', 'winter', 'spring')),
  year int,
  locations text[] not null default '{}',
  url text,
  sponsorship text,
  categories text[] not null default '{}',
  is_open boolean not null default true,
  featured boolean not null default false,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  dedupe_key text generated always as (
    lower(company) || '|' || lower(role) || '|' || season || '|' || coalesce(year::text, '')
  ) stored,
  unique (dedupe_key)
);

create index if not exists internships_season_idx on public.internships (season, year);
create index if not exists internships_open_idx on public.internships (is_open, first_seen_at desc);

alter table public.internships enable row level security;

-- Anyone (including signed-out visitors) can browse listings.
create policy "internships_public_read"
  on public.internships for select
  using (true);

create table if not exists public.saved_internships (
  user_id uuid not null references public.profiles on delete cascade,
  internship_id uuid not null references public.internships on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, internship_id)
);

alter table public.saved_internships enable row level security;

create policy "saved_all_own"
  on public.saved_internships for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
