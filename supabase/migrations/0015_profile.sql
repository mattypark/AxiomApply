-- Account rebuild: phone, profile picture, and the storage bucket behind it.
--
-- Two nullable columns and one public bucket. Nothing is backfilled — the
-- account page fills these from the applicant's own application on first
-- visit (see lib/applications.ts getMyApplication), and only into fields the
-- user has left empty.
--
-- The bucket is PUBLIC on read on purpose: founders reviewing the intern
-- directory need to see faces, and a signed-URL flow would mean minting a URL
-- per row per page load. Write access stays owner-only, enforced by path.
--
-- Safe to re-run.

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_url text;

comment on column public.profiles.avatar_url is
  'Public URL into the avatars bucket. The object path is always '
  '<auth.uid()>/<filename> — the storage policies below depend on that shape.';

-- ---------------------------------------------------------------------------
-- Storage: avatars
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Anyone may read. This is what makes profiles.avatar_url renderable in an
-- <img> without a signed URL, and what lets an approved startup see a face.
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Write access is scoped to the user's own folder. storage.foldername(name)
-- returns the path segments, so segment 1 must be the caller's uid: an upload
-- to "<someone-else>/me.jpg" fails the WITH CHECK.
drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Intern directory: show the face, keep everything else hidden
-- ---------------------------------------------------------------------------
--
-- Re-created from 0012 with avatar_url added and nothing else changed. The
-- column list in this view is the privacy boundary — display_name still holds
-- the email address and must never appear here.
--
-- A photo is identifying in a way a pseudonym is not. It is exposed only to
-- APPROVED startups (the WHERE clause below is unchanged), and it is opt-in by
-- construction: the column is null until the intern uploads one.
--
-- DROP then CREATE, not CREATE OR REPLACE: replace can only append columns to
-- an existing view, so adding avatar_url in reading order reads as renaming
-- `school` and Postgres refuses (42P16). The grants below are re-issued after,
-- because dropping the view drops them with it.

drop view if exists public.intern_directory;

create view public.intern_directory
with (security_invoker = false) as
select
  p.id,
  'Builder ' || upper(substr(replace(p.id::text, '-', ''), 1, 4)) as handle,
  p.avatar_url,
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
  and exists (
    select 1
    from public.profiles viewer
    where viewer.id = auth.uid()
      and viewer.role = 'startup'
      and viewer.approved
  );

revoke all on public.intern_directory from anon;
grant select on public.intern_directory to authenticated;

comment on view public.intern_directory is
  'Interns visible to APPROVED startups only. Column list is the privacy '
  'boundary — never add display_name (it holds the email) or any admin flag.';
