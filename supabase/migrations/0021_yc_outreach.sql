-- YC outreach desk for HQ (/hq/<code>/outreach).
--
-- One row per company in YC's 2026 batches: the company and its founders,
-- the email drafted for it, its funding, and where outreach stands. Built by
-- the separate axiom-yc-outreach tool and loaded with
-- scripts/import-outreach.ts. This repo is public, so the data only ever
-- lives here, never in git.
--
-- Founders' names and addresses are personal data: RLS is on with no
-- policies, so only the service role (HQ's server routes, behind the admin
-- gate and the HQ code) can read or write it. The anon and authenticated
-- roles see nothing.
--
-- Every statement is guarded. Safe to re-run.

create table if not exists public.yc_outreach (
  slug text primary key,
  company jsonb not null,
  draft jsonb,
  funding jsonb,
  status text not null default 'new',
  note text not null default '',
  contact text,
  updated_at timestamptz,
  updated_by text,
  imported_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'yc_outreach_status_check') then
    alter table public.yc_outreach
      add constraint yc_outreach_status_check
      check (status in ('new', 'shortlist', 'drafted', 'approved', 'sent', 'replied', 'call', 'pass'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'yc_outreach_note_length') then
    alter table public.yc_outreach
      add constraint yc_outreach_note_length check (char_length(note) <= 4000);
  end if;
end $$;

alter table public.yc_outreach enable row level security;

-- No policies on purpose: service role only.
revoke all on public.yc_outreach from anon, authenticated;

create index if not exists yc_outreach_status_idx on public.yc_outreach (status);
