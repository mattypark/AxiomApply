-- HQ: the columns the live dashboard reads and writes, and its audit log.
--
-- HQ (/hq/<code>, docs/DESIGN-AFTER-SUBMIT.md) is where Matthew reads and
-- decides applications. The Sheet keeps working as the backup, and decisions
-- can be made in either place, so every decided row now records WHERE it was
-- decided and what the Sheet's column Y said the last time it was pushed.
-- That pair is what lets /api/sheet/decisions tell "the Sheet changed since"
-- from "the Sheet just hasn't caught up with HQ yet".
--
-- "Read" is a deliberate act (a Mark read button), not opening the drawer: a
-- glance is not a read, and an applicant's status track moves on it.
--
-- Every statement is guarded. Safe to re-run.

-- Interns --------------------------------------------------------------------
alter table public.applications
  add column if not exists read_at timestamptz,
  add column if not exists read_by text,
  add column if not exists decided_by text,
  add column if not exists decided_via text,
  add column if not exists sheet_decision text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'applications_decided_via_check'
  ) then
    alter table public.applications
      add constraint applications_decided_via_check
      check (decided_via is null or decided_via in ('sheet', 'hq'));
  end if;
end $$;

-- Chapters -------------------------------------------------------------------
alter table public.chapter_applications
  add column if not exists read_at timestamptz,
  add column if not exists read_by text,
  add column if not exists decided_at timestamptz,
  add column if not exists decided_by text,
  add column if not exists decided_via text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chapter_applications_decided_via_check'
  ) then
    alter table public.chapter_applications
      add constraint chapter_applications_decided_via_check
      check (decided_via is null or decided_via in ('sheet', 'hq'));
  end if;
end $$;

-- Startups -------------------------------------------------------------------
-- Until now a startup application had no status of its own: approval was a
-- flag on the founder's profile, and only for founders who signed in. HQ
-- decides every application the same way, so the inquiry gets the interns'
-- vocabulary. `handled` stays for the old admin view.
alter table public.startup_inquiries
  add column if not exists status text not null default 'applied',
  add column if not exists read_at timestamptz,
  add column if not exists read_by text,
  add column if not exists decided_at timestamptz,
  add column if not exists decided_by text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'startup_inquiries_status_check'
  ) then
    alter table public.startup_inquiries
      add constraint startup_inquiries_status_check
      check (status in ('applied', 'waitlist', 'accepted', 'rejected', 'withdrawn'));
  end if;
end $$;

-- Audit ----------------------------------------------------------------------
-- Who looked at a minor's contact details, who exported, who decided, who
-- marked something read. Written by the service role only: RLS is on and
-- there are deliberately no policies, so anon and authenticated clients can
-- neither read nor write it.
create table if not exists public.hq_audit (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_email text not null,
  action text not null check (action in ('reveal', 'export', 'decide', 'mark_read')),
  target_ids text[] not null default '{}',
  detail jsonb
);

create index if not exists hq_audit_at_idx on public.hq_audit (at desc);

alter table public.hq_audit enable row level security;

notify pgrst, 'reload schema';
