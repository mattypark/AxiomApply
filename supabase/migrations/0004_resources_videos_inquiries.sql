-- Resource library (sites / repos / guides / videos), team videos,
-- and startup contact inquiries.

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('website', 'github_repo', 'guide', 'video')),
  title text not null,
  url text not null,
  description text,
  tags text[] not null default '{}',
  order_index int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.resources enable row level security;

create policy "resources_public_read"
  on public.resources for select
  using (published = true);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  embed_url text not null,
  order_index int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.videos enable row level security;

create policy "videos_public_read"
  on public.videos for select
  using (published = true);

create table if not exists public.startup_inquiries (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  name text not null,
  email text not null,
  message text,
  role_interest text,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.startup_inquiries enable row level security;

-- The contact form works without an account; reads are service-role only.
create policy "inquiries_anon_insert"
  on public.startup_inquiries for insert
  with check (true);
