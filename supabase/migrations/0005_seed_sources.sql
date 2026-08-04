-- Seed the first two ingestion sources.
-- Safe to re-run: guarded by NOT EXISTS on url.

insert into public.sources (name, url, adapter, config)
select 'Simplify — Summer 2026 Internships',
       'https://github.com/SimplifyJobs/Summer2026-Internships',
       'simplify_github',
       '{"repo": "SimplifyJobs/Summer2026-Internships", "season": "summer", "year": 2026}'::jsonb
where not exists (
  select 1 from public.sources
  where url = 'https://github.com/SimplifyJobs/Summer2026-Internships'
);

insert into public.sources (name, url, adapter, config)
select 'Interndock — Summer 2027 list',
       'https://www.interndock.com/tracker/guides/summer-2027-internships-list',
       'interndock_html',
       '{"season": "summer", "year": 2027}'::jsonb
where not exists (
  select 1 from public.sources
  where url = 'https://www.interndock.com/tracker/guides/summer-2027-internships-list'
);
