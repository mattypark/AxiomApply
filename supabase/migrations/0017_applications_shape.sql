-- Bring `applications` up to the shape the code has always assumed.
--
-- The live table was created leaner than 0013 describes: 11 columns, with the
-- applicant's name under `full_name`. Nothing in the codebase ever used that
-- spelling, and roughly twenty columns the code reads and writes were simply
-- absent. The failure was silent in both directions:
--
--   · lib/actions/applications.ts mirrors every web application here on a
--     best-effort path that swallows its own errors, so every insert since
--     launch failed against the missing columns and nobody saw a thing. That
--     is why the table is empty next to a Sheet holding 700+ rows.
--   · lib/applications.ts reads name/phone/school/grade/interest for the
--     applicant's own dashboard, and PostgREST rejects the whole select when
--     one column in it does not exist.
--   · the Sheet push failed with "Could not find the 'name' column of
--     'applications' in the schema cache", which is what finally surfaced it.
--
-- Every statement is guarded, so this is safe to re-run and safe on a table
-- that already matches. Columns are added nullable: the point is to stop
-- rejecting writes, not to impose a shape on rows that predate this.

-- `full_name` → `name`, only when that is actually the situation. A table
-- already carrying `name` is left alone, and one carrying both keeps both
-- rather than losing a column to a rename.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'applications'
      and column_name = 'full_name'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'applications'
      and column_name = 'name'
  ) then
    alter table public.applications rename column full_name to name;
  end if;
end $$;

-- The apply form's own fields, named exactly as lib/apply-contract.ts sends
-- them. Adding to this list means adding a question to the form, not the
-- other way round.
alter table public.applications
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists school text,
  add column if not exists grade text,
  add column if not exists interest text,
  add column if not exists chapter text,
  add column if not exists startup_role text,
  add column if not exists background text,
  add column if not exists fields_interest text,
  add column if not exists startup_picks text,
  add column if not exists letter text,
  add column if not exists instagram text,
  add column if not exists linkedin text,
  add column if not exists github text,
  add column if not exists other_link text,
  add column if not exists resume_url text,
  add column if not exists extra_file_url text,
  add column if not exists comments text;

-- Review columns. `reviewer` and `selected_for` come straight off the Sheet
-- (columns X and Z); `sheet_row` keeps the raw answers so a column this
-- schema does not model yet is never silently dropped.
alter table public.applications
  add column if not exists reviewer text,
  add column if not exists selected_for text,
  add column if not exists sheet_row jsonb,
  add column if not exists source text not null default 'web';

-- One application per email per submission instant, which is what makes a
-- re-push an update rather than a second row. Created only when absent, since
-- an existing index under a different name would collide.
create unique index if not exists applications_dedupe_idx
  on public.applications (lower(email), submitted_at);

create index if not exists applications_user_idx
  on public.applications (user_id, submitted_at desc);
create index if not exists applications_status_idx
  on public.applications (status, submitted_at desc);

-- PostgREST caches the schema and answers from that cache; without this the
-- new columns stay invisible to the API for up to a minute after the
-- migration, and the next push fails exactly as the last one did.
notify pgrst, 'reload schema';
