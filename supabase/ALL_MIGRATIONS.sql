-- ============================================================
-- AXIOM PATHWAYS — ALL MIGRATIONS (0001-0010), ONE-SHOT RUNNER
-- Safe to run on a fresh project OR re-run on an existing one.
-- ============================================================

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
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
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
drop policy if exists "internships_public_read" on public.internships;
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

drop policy if exists "saved_all_own" on public.saved_internships;
create policy "saved_all_own"
  on public.saved_internships for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
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

drop policy if exists "articles_public_read" on public.articles;
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

drop policy if exists "learn_public_read" on public.learn_modules;
create policy "learn_public_read"
  on public.learn_modules for select
  using (published = true);
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

drop policy if exists "resources_public_read" on public.resources;
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

drop policy if exists "videos_public_read" on public.videos;
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
drop policy if exists "inquiries_anon_insert" on public.startup_inquiries;
create policy "inquiries_anon_insert"
  on public.startup_inquiries for insert
  with check (true);
-- Seed the first two ingestion sources.
-- Safe to re-run: guarded by NOT EXISTS on url.

insert into public.sources (name, url, adapter, config)
select 'Simplify — Summer 2026 Internships',
       'https://github.com/SimplifyJobs/Summer2026-Internships',
       'simplify_github',
       '{"repo": "SimplifyJobs/Summer2026-Internships", "season": "summer", "year": 2026}'::jsonb
where not exists (
  select 1 from public.sources
  where url = 'https://github.com/SimplifyJobs/Summer2026-Internships'
);

insert into public.sources (name, url, adapter, config)
select 'Interndock — Summer 2027 list',
       'https://www.interndock.com/tracker/guides/summer-2027-internships-list',
       'interndock_html',
       '{"season": "summer", "year": 2027}'::jsonb
where not exists (
  select 1 from public.sources
  where url = 'https://www.interndock.com/tracker/guides/summer-2027-internships-list'
);
-- Seed starter Learn modules (one per track). Safe to re-run.

insert into public.learn_modules (slug, track, title, order_index, body_md, published)
select 'ai-101-use-ai-like-a-builder', 'ai', 'AI 101 — Use AI like a builder, not a tourist', 0, $md$
## Why this track exists

Every startup in the Axiom network uses AI daily. The interns who stand out aren't the ones who "know about AI" — they're the ones who ship with it.

## The 3 levels

1. **User** — you chat with ChatGPT/Claude. Everyone is here. Zero edge.
2. **Operator** — you build repeatable workflows: prompts with structure, tool use, evals. Rare in high school. Real edge.
3. **Builder** — you wire models into products with APIs. This gets you hired.

## This week's rep

- Pick one boring task you do weekly (notes → summary, research → table).
- Automate it end-to-end with one AI workflow.
- Write down: input format, prompt, output format, where it fails.

That written breakdown IS the interview story. Startups hire people who can show their reps.
$md$, true
where not exists (select 1 from public.learn_modules where slug = 'ai-101-use-ai-like-a-builder');

insert into public.learn_modules (slug, track, title, order_index, body_md, published)
select 'cs-101-ship-something-real', 'cs', 'CS 101 — Ship something real in 14 days', 0, $md$
## The rule

A deployed scrappy project beats a perfect local one. Every time.

## The 14-day plan

- **Days 1–2:** Pick a problem YOU have. Not a todo app.
- **Days 3–8:** Build the ugliest version that works. One feature.
- **Days 9–10:** Deploy it (Vercel is free). Send the link to 5 people.
- **Days 11–14:** Fix the top complaint. Redeploy. Write a short README.

## What startups actually check

- Is it live? (a URL, not a screenshot)
- Can you explain WHY you built it that way?
- Did anyone use it?

Three "yes" answers put you ahead of most college applicants.
$md$, true
where not exists (select 1 from public.learn_modules where slug = 'cs-101-ship-something-real');

insert into public.learn_modules (slug, track, title, order_index, body_md, published)
select 'marketing-101-distribution-first', 'marketing', 'Marketing 101 — Distribution beats polish', 0, $md$
## The one idea

Startups don't die from bad products. They die from silence. If you can get attention reliably, you are valuable at 15 or 50.

## Prove it with one artifact

Pick one channel and run a 2-week experiment:

- **Short-form video:** 10 posts, one hook style per post. Track hooks vs. retention.
- **Twitter/X or LinkedIn:** 10 posts about one niche. Track which format gets replies.
- **Cold outreach:** 25 personalized DMs for any project. Track reply rate.

## Write the memo

One page: what you tried, the numbers, what you'd do next with $100. That memo is your marketing resume — startups care about the loop (try → measure → adjust), not follower count.
$md$, true
where not exists (select 1 from public.learn_modules where slug = 'marketing-101-distribution-first');
-- Seed the internship resource library with real, working links.
-- Safe to re-run: guarded by NOT EXISTS on url.

-- Websites
insert into public.resources (kind, title, url, description, order_index)
select 'website', 'Interndock', 'https://www.interndock.com',
       'Season-by-season internship trackers and application guides.', 0
where not exists (select 1 from public.resources where url = 'https://www.interndock.com');

insert into public.resources (kind, title, url, description, order_index)
select 'website', 'Simplify', 'https://simplify.jobs',
       'Track applications and autofill forms — the tool behind the famous GitHub lists.', 1
where not exists (select 1 from public.resources where url = 'https://simplify.jobs');

insert into public.resources (kind, title, url, description, order_index)
select 'website', 'YC Work at a Startup', 'https://www.workatastartup.com',
       'Apply once, get seen by hundreds of Y Combinator startups.', 2
where not exists (select 1 from public.resources where url = 'https://www.workatastartup.com');

insert into public.resources (kind, title, url, description, order_index)
select 'website', 'Wellfound (AngelList Talent)', 'https://wellfound.com',
       'Startup jobs and internships with salary/equity shown up front.', 3
where not exists (select 1 from public.resources where url = 'https://wellfound.com');

insert into public.resources (kind, title, url, description, order_index)
select 'website', 'LinkedIn Student Jobs', 'https://www.linkedin.com/jobs/student-jobs',
       'Filter to internships; set alerts so new postings hit your inbox first.', 4
where not exists (select 1 from public.resources where url = 'https://www.linkedin.com/jobs/student-jobs');

-- GitHub repos
insert into public.resources (kind, title, url, description, order_index)
select 'github_repo', 'SimplifyJobs — Summer Internships', 'https://github.com/SimplifyJobs/Summer2026-Internships',
       'The canonical community-maintained internship list. Updated daily — our feed pulls from it.', 0
where not exists (select 1 from public.resources where url = 'https://github.com/SimplifyJobs/Summer2026-Internships');

insert into public.resources (kind, title, url, description, order_index)
select 'github_repo', 'SimplifyJobs — Off-Season Internships', 'https://github.com/SimplifyJobs/Off-Season-Internships',
       'Fall, winter, and spring listings — most students never look here. Less competition.', 1
where not exists (select 1 from public.resources where url = 'https://github.com/SimplifyJobs/Off-Season-Internships');

insert into public.resources (kind, title, url, description, order_index)
select 'github_repo', 'SimplifyJobs — New Grad Positions', 'https://github.com/SimplifyJobs/New-Grad-Positions',
       'For older siblings and college seniors — same format, full-time roles.', 2
where not exists (select 1 from public.resources where url = 'https://github.com/SimplifyJobs/New-Grad-Positions');

-- Guides
insert into public.resources (kind, title, url, description, order_index)
select 'guide', 'Interndock — Summer 2027 list', 'https://www.interndock.com/tracker/guides/summer-2027-internships-list',
       'The Summer 2027 master list — the earliest applications open here first.', 0
where not exists (select 1 from public.resources where url = 'https://www.interndock.com/tracker/guides/summer-2027-internships-list');

insert into public.resources (kind, title, url, description, order_index)
select 'guide', 'How to email a founder (YC)', 'https://www.ycombinator.com/library/4b-how-to-write-cold-emails',
       'Cold email that actually gets replies — short, specific, proof of work.', 1
where not exists (select 1 from public.resources where url = 'https://www.ycombinator.com/library/4b-how-to-write-cold-emails');

insert into public.resources (kind, title, url, description, order_index)
select 'guide', 'Axiom — apply directly', 'https://www.axiompathways.org/apply',
       'Skip the queue: apply through Axiom and get hand-matched into the network.', 2
where not exists (select 1 from public.resources where url = 'https://www.axiompathways.org/apply');
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
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid())
    and approved = (select p.approved from public.profiles p where p.id = auth.uid())
  );
-- Replace the subquery-pinning update policy with a simpler policy plus a
-- BEFORE UPDATE trigger. Same guarantee (users can never change is_admin or
-- approved), zero chance of RLS recursion, and profile saves stay simple.

drop policy if exists "profiles_update_own" on public.profiles;
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
-- GitHub link on profiles (interns add socials at onboarding or later).

alter table public.profiles add column if not exists github text;
