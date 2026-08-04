-- Applications in Postgres, mirroring the Google Sheet.
--
-- The Sheet stays the working surface: the apply form still POSTs to the
-- Apps Script webhook exactly as it always has, and lib/apply-contract.ts is
-- a FROZEN wire contract this migration does not touch. Supabase is the
-- SECOND destination — same data, queryable, so the product can answer "has
-- this person applied", drive the Apply tab, and segment decision emails.
--
-- Column names follow the FORM field names (apply-contract.ts), and `status`
-- uses the SHEET's own vocabulary so nothing has to be translated by hand
-- when Matthew works the Sheet: Applied / waitlist / Accepted / Rejected.
--
-- Safe to re-run.

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),

  -- Null when the applicant wasn't signed in — the form works signed-out,
  -- and historical Sheet rows predate accounts entirely. Linked by email.
  user_id uuid references public.profiles on delete set null,

  -- Step 1 — identity
  name text,
  email text not null,
  phone text,
  school text,
  grade text,

  -- Step 2 — fit
  interest text,
  chapter text,
  startup_role text,
  background text,
  fields_interest text,
  startup_picks text,

  -- Step 3 — optional
  letter text,
  instagram text,
  linkedin text,
  github text,
  other_link text,
  resume_url text,
  extra_file_url text,
  comments text,

  -- Review. Lowercased Sheet vocabulary.
  status text not null default 'applied'
    check (status in ('applied', 'waitlist', 'accepted', 'rejected', 'withdrawn')),
  reviewer text,
  selected_for text,
  decision_reason text,
  decided_at timestamptz,

  -- Collected at ACCEPT time, not signup — most applicants are minors and
  -- asking upfront depresses completion.
  guardian_name text,
  guardian_email text,

  -- Anything the Sheet carries that this schema doesn't model yet. Backfill
  -- writes the whole row here so no column is ever silently dropped.
  sheet_row jsonb,
  source text not null default 'web' check (source in ('web', 'sheet_backfill')),

  submitted_at timestamptz not null default now()
);

-- One application per email per submission instant. Makes the Sheet backfill
-- re-runnable: importing twice updates rather than duplicates.
create unique index if not exists applications_dedupe_idx
  on public.applications (lower(email), submitted_at);

create index if not exists applications_user_idx
  on public.applications (user_id, submitted_at desc);
create index if not exists applications_status_idx
  on public.applications (status, submitted_at desc);

alter table public.applications enable row level security;

-- Applicants read their own rows — matched either by account or, for rows
-- that came from the Sheet before they signed up, by verified email.
drop policy if exists "applications_select_own" on public.applications;
create policy "applications_select_own"
  on public.applications for select
  using (
    auth.uid() = user_id
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- A signed-in user may file their own application.
drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own"
  on public.applications for insert
  with check (auth.uid() = user_id);

-- Status is decided by Axiom, never by the applicant. No update policy for
-- anon/authenticated, and UPDATE is revoked outright as a second layer.
revoke update on public.applications from anon, authenticated;

comment on table public.applications is
  'Mirror of the Google Sheet. The Apps Script webhook remains untouched and '
  'the Sheet stays authoritative for review; this table makes status and '
  'segmentation queryable. status uses the Sheet vocabulary, lowercased.';
