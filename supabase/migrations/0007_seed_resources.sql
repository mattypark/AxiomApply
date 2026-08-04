-- Seed the internship resource library with real, working links.
-- Safe to re-run: guarded by NOT EXISTS on url.

-- Websites
insert into public.resources (kind, title, url, description, order_index)
select 'website', 'Interndock', 'https://www.interndock.com',
       'Season-by-season internship trackers and application guides.', 0
where not exists (select 1 from public.resources where url = 'https://www.interndock.com');

insert into public.resources (kind, title, url, description, order_index)
select 'website', 'Simplify', 'https://simplify.jobs',
       'Track applications and autofill forms — the tool behind the famous GitHub lists.', 1
where not exists (select 1 from public.resources where url = 'https://simplify.jobs');

insert into public.resources (kind, title, url, description, order_index)
select 'website', 'YC Work at a Startup', 'https://www.workatastartup.com',
       'Apply once, get seen by hundreds of Y Combinator startups.', 2
where not exists (select 1 from public.resources where url = 'https://www.workatastartup.com');

insert into public.resources (kind, title, url, description, order_index)
select 'website', 'Wellfound (AngelList Talent)', 'https://wellfound.com',
       'Startup jobs and internships with salary/equity shown up front.', 3
where not exists (select 1 from public.resources where url = 'https://wellfound.com');

insert into public.resources (kind, title, url, description, order_index)
select 'website', 'LinkedIn Student Jobs', 'https://www.linkedin.com/jobs/student-jobs',
       'Filter to internships; set alerts so new postings hit your inbox first.', 4
where not exists (select 1 from public.resources where url = 'https://www.linkedin.com/jobs/student-jobs');

-- GitHub repos
insert into public.resources (kind, title, url, description, order_index)
select 'github_repo', 'SimplifyJobs — Summer Internships', 'https://github.com/SimplifyJobs/Summer2026-Internships',
       'The canonical community-maintained internship list. Updated daily — our feed pulls from it.', 0
where not exists (select 1 from public.resources where url = 'https://github.com/SimplifyJobs/Summer2026-Internships');

insert into public.resources (kind, title, url, description, order_index)
select 'github_repo', 'SimplifyJobs — Off-Season Internships', 'https://github.com/SimplifyJobs/Off-Season-Internships',
       'Fall, winter, and spring listings — most students never look here. Less competition.', 1
where not exists (select 1 from public.resources where url = 'https://github.com/SimplifyJobs/Off-Season-Internships');

insert into public.resources (kind, title, url, description, order_index)
select 'github_repo', 'SimplifyJobs — New Grad Positions', 'https://github.com/SimplifyJobs/New-Grad-Positions',
       'For older siblings and college seniors — same format, full-time roles.', 2
where not exists (select 1 from public.resources where url = 'https://github.com/SimplifyJobs/New-Grad-Positions');

-- Guides
insert into public.resources (kind, title, url, description, order_index)
select 'guide', 'Interndock — Summer 2027 list', 'https://www.interndock.com/tracker/guides/summer-2027-internships-list',
       'The Summer 2027 master list — the earliest applications open here first.', 0
where not exists (select 1 from public.resources where url = 'https://www.interndock.com/tracker/guides/summer-2027-internships-list');

insert into public.resources (kind, title, url, description, order_index)
select 'guide', 'How to email a founder (YC)', 'https://www.ycombinator.com/library/4b-how-to-write-cold-emails',
       'Cold email that actually gets replies — short, specific, proof of work.', 1
where not exists (select 1 from public.resources where url = 'https://www.ycombinator.com/library/4b-how-to-write-cold-emails');

insert into public.resources (kind, title, url, description, order_index)
select 'guide', 'Axiom — apply directly', 'https://www.axiompathways.org/apply',
       'Skip the queue: apply through Axiom and get hand-matched into the network.', 2
where not exists (select 1 from public.resources where url = 'https://www.axiompathways.org/apply');
