-- GitHub link on profiles (interns add socials at onboarding or later).

alter table public.profiles add column if not exists github text;
