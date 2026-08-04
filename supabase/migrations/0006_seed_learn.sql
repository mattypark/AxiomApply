-- Seed starter Learn modules (one per track). Safe to re-run.

insert into public.learn_modules (slug, track, title, order_index, body_md, published)
select 'ai-101-use-ai-like-a-builder', 'ai', 'AI 101 — Use AI like a builder, not a tourist', 0, $md$
## Why this track exists

Every startup in the Axiom network uses AI daily. The interns who stand out aren't the ones who "know about AI" — they're the ones who ship with it.

## The 3 levels

1. **User** — you chat with ChatGPT/Claude. Everyone is here. Zero edge.
2. **Operator** — you build repeatable workflows: prompts with structure, tool use, evals. Rare in high school. Real edge.
3. **Builder** — you wire models into products with APIs. This gets you hired.

## This week's rep

- Pick one boring task you do weekly (notes → summary, research → table).
- Automate it end-to-end with one AI workflow.
- Write down: input format, prompt, output format, where it fails.

That written breakdown IS the interview story. Startups hire people who can show their reps.
$md$, true
where not exists (select 1 from public.learn_modules where slug = 'ai-101-use-ai-like-a-builder');

insert into public.learn_modules (slug, track, title, order_index, body_md, published)
select 'cs-101-ship-something-real', 'cs', 'CS 101 — Ship something real in 14 days', 0, $md$
## The rule

A deployed scrappy project beats a perfect local one. Every time.

## The 14-day plan

- **Days 1–2:** Pick a problem YOU have. Not a todo app.
- **Days 3–8:** Build the ugliest version that works. One feature.
- **Days 9–10:** Deploy it (Vercel is free). Send the link to 5 people.
- **Days 11–14:** Fix the top complaint. Redeploy. Write a short README.

## What startups actually check

- Is it live? (a URL, not a screenshot)
- Can you explain WHY you built it that way?
- Did anyone use it?

Three "yes" answers put you ahead of most college applicants.
$md$, true
where not exists (select 1 from public.learn_modules where slug = 'cs-101-ship-something-real');

insert into public.learn_modules (slug, track, title, order_index, body_md, published)
select 'marketing-101-distribution-first', 'marketing', 'Marketing 101 — Distribution beats polish', 0, $md$
## The one idea

Startups don't die from bad products. They die from silence. If you can get attention reliably, you are valuable at 15 or 50.

## Prove it with one artifact

Pick one channel and run a 2-week experiment:

- **Short-form video:** 10 posts, one hook style per post. Track hooks vs. retention.
- **Twitter/X or LinkedIn:** 10 posts about one niche. Track which format gets replies.
- **Cold outreach:** 25 personalized DMs for any project. Track reply rate.

## Write the memo

One page: what you tried, the numbers, what you'd do next with $100. That memo is your marketing resume — startups care about the loop (try → measure → adjust), not follower count.
$md$, true
where not exists (select 1 from public.learn_modules where slug = 'marketing-101-distribution-first');
