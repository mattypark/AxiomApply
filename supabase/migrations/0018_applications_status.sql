-- One status vocabulary, the Sheet's own, lowercased.
--
-- The live table carries an `applications_status_check` written against some
-- other set of words, so every insert from the Sheet push was rejected with
-- "new row for relation applications violates check constraint". Nothing in
-- the codebase writes a status literal to this table — the web form relies on
-- the column default and the review path writes these five — so the
-- constraint, not the code, is the thing that is out of step.
--
-- Values match lib/applications.ts (ApplicationStatus) and the Sheet's column
-- Y, lowercased:
--
--   applied    nobody has looked at it yet. The default.
--   waitlist   read, wanted, no seat
--   accepted   matched. Never mailed automatically — that email needs the
--              startup, role and founder, which the Sheet does not carry
--   rejected   a real no
--   withdrawn  they pulled out. Mailed nothing.
--
-- Safe to re-run.

-- ORDER MATTERS, and getting it wrong is not obvious.
--
-- The old constraint has to go BEFORE the rows are normalised. An UPDATE is
-- checked against whatever constraint is in force at the time, so rewriting a
-- row to 'applied' while a constraint that does not know that word is still
-- attached fails with "new row for relation applications violates check
-- constraint" — the same message the inserts were failing with, now coming
-- from the fix rather than the bug.
alter table public.applications
  drop constraint if exists applications_status_check;

-- Now the rows, unconstrained. This has to happen before the new constraint
-- is added: a CHECK added over data that violates it fails while naming the
-- constraint rather than the offending row.
update public.applications
set status = case lower(trim(coalesce(status, '')))
  when '' then 'applied'
  when 'submitted' then 'applied'
  when 'pending' then 'applied'
  when 'new' then 'applied'
  when 'received' then 'applied'
  when 'under review' then 'applied'
  when 'waitlisted' then 'waitlist'
  when 'declined' then 'rejected'
  when 'denied' then 'rejected'
  when 'not selected' then 'rejected'
  else lower(trim(status))
end
where status is null
   or status <> lower(trim(status))
   or lower(trim(status)) not in
      ('applied', 'waitlist', 'accepted', 'rejected', 'withdrawn');

-- Anything still outside the vocabulary after that mapping is a value nobody
-- anticipated. Park it at 'applied' rather than dropping the row: 'applied'
-- means "undecided", which is the truthful reading of a status this schema
-- cannot interpret, and it keeps the person in the waitlist bucket instead of
-- silently removing them from every count.
update public.applications
set status = 'applied'
where status not in ('applied', 'waitlist', 'accepted', 'rejected', 'withdrawn');

alter table public.applications
  add constraint applications_status_check
  check (status in ('applied', 'waitlist', 'accepted', 'rejected', 'withdrawn'));

-- The web form never sets a status explicitly, so the default is what every
-- application from the site gets. It has to be inside the constraint above or
-- the apply form starts failing the moment this runs.
alter table public.applications
  alter column status set default 'applied';

notify pgrst, 'reload schema';
