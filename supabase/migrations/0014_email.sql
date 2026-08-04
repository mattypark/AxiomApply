-- Email suppression + a send log.
--
-- Two tables, both keyed by lowercased email so they work for people who have
-- no account (the apply form works signed-out and the Sheet predates accounts).
--
-- email_optouts is TOPIC-scoped, never global: someone who unsubscribes from
-- network updates must still receive news about their own application. See
-- docs/email-program.md. Hard bounces and spam complaints land here too, from
-- the Resend webhook, so a bad address is suppressed within a send cycle.
--
-- Safe to re-run.

create table if not exists public.email_optouts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  -- 'network-updates' is the marketing topic. Transactional mail has no topic
  -- and is never suppressed by an unsubscribe — only by a bounce/complaint.
  topic text not null default 'network-updates'
    check (topic in ('network-updates', 'all')),
  reason text not null default 'unsubscribe'
    check (reason in ('unsubscribe', 'bounced', 'complained', 'manual')),
  created_at timestamptz not null default now()
);

create unique index if not exists email_optouts_unique_idx
  on public.email_optouts (lower(email), topic);

create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  -- Matches the template function name in lib/email/templates.ts.
  template text not null,
  mail_class text not null default 'transactional'
    check (mail_class in ('transactional', 'marketing')),
  provider_id text,
  ok boolean not null,
  error text,
  sent_at timestamptz not null default now()
);

create index if not exists email_log_email_idx
  on public.email_log (lower(email), sent_at desc);

-- Both tables are operational, not user-facing. RLS on with no policies means
-- anon and authenticated can read nothing; the service role still writes.
alter table public.email_optouts enable row level security;
alter table public.email_log enable row level security;

comment on table public.email_optouts is
  'Topic-scoped suppression. An unsubscribe from network-updates must never '
  'stop transactional mail about the recipient''s own application.';
