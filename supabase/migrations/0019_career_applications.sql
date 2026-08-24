-- Applications to work AT Axiom Pathways (the /careers pages).
--
-- Deliberately its own table rather than a `kind` column on public.applications:
-- that table is shaped around the frozen intern apply contract and is read by
-- the applicant workspace, the decisions sync, and the Sheet mirror. A team
-- application shares none of that lifecycle.

create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  role_slug text not null,
  role_title text not null,
  name text not null,
  email text not null,
  phone text,
  location text,
  -- Where the work is: portfolio, GitHub, a shipped thing. The whole filter.
  links text not null,
  why text not null,
  shipped text,
  availability text,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'call', 'trial', 'offer', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists career_applications_role_idx
  on public.career_applications (role_slug, created_at desc);

alter table public.career_applications enable row level security;

-- Applying needs no account. Reads are service-role / dashboard only, the same
-- shape as public.startup_inquiries.
create policy "career_applications_anon_insert"
  on public.career_applications for insert
  with check (true);
