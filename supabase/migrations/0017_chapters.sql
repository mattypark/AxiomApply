-- Chapter applications: people starting an Axiom chapter at their school.
--
-- Deliberately NOT a third value of profiles.role. Running a chapter is
-- additive — the same person can be an intern, or bring a startup in, or both.
-- Making it a role would force a choice the product does not want to force, so
-- chapter membership lives here as its own record and profiles.role is left
-- exactly as it is ('intern' | 'startup').
--
-- Same dual-write shape as the startups: a brand-new Google Sheet is where
-- Matthew reviews (APPS_SCRIPT_CHAPTERS.gs, its own script and deployment),
-- and this table is what the product reads — Chapter HQ needs to know whether
-- someone is under review or approved, and a Sheet cannot answer that.
--
-- Columns follow the question ids in lib/apply-sections.ts (CHAPTER_SECTIONS).
-- Safe to re-run.

create table if not exists public.chapter_applications (
  id uuid primary key default gen_random_uuid(),

  -- Null when the application was filed signed-out, which is the common case.
  -- lib/chapters.ts claims the row by email once an account exists.
  user_id uuid references public.profiles on delete set null,

  status text not null default 'applied'
    check (status in ('applied', 'review', 'approved', 'rejected', 'withdrawn')),

  -- you
  name text not null,
  email text not null,
  phone text,
  grade text,
  city text,
  linkedin text,
  other_link text,

  -- your school
  school text not null,
  school_type text,
  school_size text,
  club_process text,
  advisor_status text,
  advisor_name text,
  existing_clubs text,

  -- why you
  qualified text,
  built text,
  why_axiom text,
  hardest text,

  -- the plan
  first_30 text,
  first_members text,
  cadence text,
  member_value text,
  startups_local text,
  biggest_risk text,

  -- commitment
  hours text,
  how_long text,
  cofounders text,
  cofounder_names text,
  monthly_call text,
  also_interested text,
  anything_else text,

  -- Anything the form carries that this schema does not model yet, so no
  -- answer is ever silently dropped between a form change and a migration.
  sheet_row jsonb,

  submitted_at timestamptz not null default now()
);

-- One application per email per submission instant — makes a re-import or a
-- double-submit update rather than duplicate.
create unique index if not exists chapter_applications_dedupe_idx
  on public.chapter_applications (lower(email), submitted_at);

create index if not exists chapter_applications_user_idx
  on public.chapter_applications (user_id, submitted_at desc);
create index if not exists chapter_applications_status_idx
  on public.chapter_applications (status, submitted_at desc);

alter table public.chapter_applications enable row level security;

-- The form works signed-out, so the insert cannot require auth.uid(). The
-- server action uses the service-role client anyway; this policy is what keeps
-- a direct anon insert from being rejected outright.
drop policy if exists "chapter_applications_insert" on public.chapter_applications;
create policy "chapter_applications_insert"
  on public.chapter_applications for insert
  with check (true);

-- Founders read their own row — by account, or by verified email for the
-- applications filed before they signed up.
drop policy if exists "chapter_applications_select_own" on public.chapter_applications;
create policy "chapter_applications_select_own"
  on public.chapter_applications for select
  using (
    auth.uid() = user_id
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Approval is Axiom's to grant, never the applicant's to set. No update policy
-- for anon/authenticated, and UPDATE revoked outright as a second layer.
revoke update on public.chapter_applications from anon, authenticated;

comment on table public.chapter_applications is
  'Chapter founders. Additive to profiles.role, never a value of it — a '
  'chapter lead may also be an intern or a startup. Reviewed in its own '
  'Google Sheet; this table is what gates Chapter HQ.';
