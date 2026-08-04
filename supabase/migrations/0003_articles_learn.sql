-- Articles (2/day, admin-authored) + Learn curriculum modules.

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body_md text not null default '',
  cover_url text,
  tags text[] not null default '{}',
  published boolean not null default false,
  published_at timestamptz,
  author_id uuid references public.profiles on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_published_idx
  on public.articles (published, published_at desc);

alter table public.articles enable row level security;

create policy "articles_public_read"
  on public.articles for select
  using (published = true);

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch
  before update on public.articles
  for each row execute function public.touch_updated_at();

create table if not exists public.learn_modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  track text not null,
  title text not null,
  order_index int not null default 0,
  body_md text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.learn_modules enable row level security;

create policy "learn_public_read"
  on public.learn_modules for select
  using (published = true);
