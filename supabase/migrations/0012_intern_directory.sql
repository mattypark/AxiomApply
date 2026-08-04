-- Approved startups browse real interns.
--
-- Constraint: profiles RLS lets a user read ONLY their own row, and that must
-- not change — profiles.display_name defaults to the user's EMAIL ADDRESS
-- (see handle_new_user() in 0001), so any policy that hands a whole profile
-- row to a startup leaks every intern's email.
--
-- Instead: a view that is owned by postgres and therefore bypasses RLS on the
-- base table, with the access rule written into the view's own WHERE clause.
-- Columns are chosen explicitly here, so the exposed surface is this file and
-- nothing else. profiles RLS stays exactly as strict as it was.
--
-- Exposed:      grade, school, seasons, fields, experience, looking_for,
--               github, linkedin, social, joined_at, and a stable pseudonym.
-- NOT exposed:  display_name (email), is_admin, approved, company, updated_at.
--
-- Safe to re-run.

create or replace view public.intern_directory
with (security_invoker = false) as
select
  p.id,
  -- Stable pseudonym so a founder can refer to someone before a match.
  -- Derived from the uuid, so it never reveals a name or an email.
  'Builder ' || upper(substr(replace(p.id::text, '-', ''), 1, 4)) as handle,
  p.school,
  p.grade,
  p.preferred_seasons,
  p.preferred_fields,
  p.experience,
  p.looking_for,
  p.github,
  p.linkedin,
  p.social,
  p.created_at as joined_at
from public.profiles p
where p.role = 'intern'
  -- Only an approved startup may read this view. An intern, a signed-out
  -- visitor, or an unapproved startup gets zero rows.
  and exists (
    select 1
    from public.profiles viewer
    where viewer.id = auth.uid()
      and viewer.role = 'startup'
      and viewer.approved
  );

-- Signed-in users only. anon must never reach this.
revoke all on public.intern_directory from anon;
grant select on public.intern_directory to authenticated;

comment on view public.intern_directory is
  'Interns visible to APPROVED startups only. Column list is the privacy '
  'boundary — never add display_name (it holds the email) or any admin flag.';
