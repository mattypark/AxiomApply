-- The decision-mail queue.
--
-- Sits between "Matthew marked people in the Sheet" and "mail actually left
-- the building". Building the queue is one deliberate action; draining it is
-- another, in batches, by hand. Nothing in this schema is driven by a cron —
-- there is no scheduled job anywhere in this repo that sends mail.
--
-- Why a table and not just email_log: the queue is reviewable BEFORE the send.
-- Matthew reads the counts and the rendered copy on /admin/applications while
-- every row still says 'pending', and a rejection that shouldn't go out can be
-- caught while it is still a database row instead of someone's inbox.
--
-- Safe to re-run.

create table if not exists public.email_queue (
  id uuid primary key default gen_random_uuid(),

  -- Nullable: the queue is keyed by address, and a Sheet row that never made
  -- it into applications should still be mailable rather than silently lost.
  application_id uuid references public.applications on delete set null,

  email text not null,
  first_name text,

  -- Matches the exported function name in lib/email/templates.ts, same
  -- convention as email_log.template.
  template text not null
    check (template in ('notSelected', 'waitlisted')),

  -- The exact copy that will be sent, rendered from lib/email/templates.ts at
  -- queue time and frozen here. Storing it rather than re-rendering at send
  -- time is what makes the review real: the page shows this text, and this
  -- text is what goes out. Editing a template afterwards cannot change what a
  -- reviewed batch says.
  subject text not null,
  body text not null,

  status text not null default 'pending'
    check (status in ('pending', 'sent', 'skipped', 'failed')),

  -- Why a row is skipped or failed: 'suppressed', 'no-address', a provider
  -- error. Null while pending or after a clean send.
  reason text,

  provider_id text,
  queued_at timestamptz not null default now(),
  sent_at timestamptz
);

-- One decision email per person, ever.
--
-- This is the load-bearing line of the migration. Decision mail cannot be
-- unsent, and the realistic failure is not a bug in the send loop — it is a
-- second push from the Sheet, or a re-click after a timeout, quietly queueing
-- the same 600 people twice. The constraint makes that an error at insert
-- rather than a discovery in the reply-all.
create unique index if not exists email_queue_once_idx
  on public.email_queue (lower(email), template);

create index if not exists email_queue_pending_idx
  on public.email_queue (status, queued_at);

-- Operational, not user-facing. RLS on with no policies: anon and
-- authenticated read nothing, the service role still writes. Same posture as
-- email_log and email_optouts in 0014.
alter table public.email_queue enable row level security;

comment on table public.email_queue is
  'Decision emails staged for human review. Populated by /admin/applications '
  'from applications.status, drained in batches by an explicit click. Never '
  'sent by a scheduled job.';
