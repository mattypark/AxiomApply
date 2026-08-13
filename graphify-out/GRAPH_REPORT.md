# Graph Report - axiom-pathways  (2026-08-10)

## Corpus Check
- 160 files · ~179,048 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 701 nodes · 1322 edges · 46 communities (42 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `57d15d4e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_index.astro|index.astro]]
- [[_COMMUNITY_Connect the form to Google Sheets|Connect the form to Google Sheets]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_line|line]]
- [[_COMMUNITY_start|start]]
- [[_COMMUNITY_startApplication|startApplication]]
- [[_COMMUNITY_..stylesglobal.css|../styles/global.css]]
- [[_COMMUNITY_attachFiles|attachFiles]]
- [[_COMMUNITY_astro.config.mjs|astro.config.mjs]]
- [[_COMMUNITY_ApplyEngine.tsx|ApplyEngine.tsx]]
- [[_COMMUNITY_Axiom Pathways — email program|Axiom Pathways — email program]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_InternApplication.tsx|InternApplication.tsx]]
- [[_COMMUNITY_apply-sections.ts|apply-sections.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_Next session — account rebuild, backend verification, deploy|Next session — account rebuild, backend verification, deploy]]
- [[_COMMUNITY_getServerSupabase|getServerSupabase]]
- [[_COMMUNITY_ApplyFlow.tsx|ApplyFlow.tsx]]
- [[_COMMUNITY_templates.ts|templates.ts]]
- [[_COMMUNITY_MediaPanel.tsx|MediaPanel.tsx]]
- [[_COMMUNITY_sheet-decisions.ts|sheet-decisions.ts]]
- [[_COMMUNITY_Deploy — Vercel, Supabase, Resend, Apps Script|Deploy — Vercel, Supabase, Resend, Apps Script]]
- [[_COMMUNITY_applications.ts|applications.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_Apply page rebuild — build spec|Apply page rebuild — build spec]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_InquiryForm.tsx|InquiryForm.tsx]]
- [[_COMMUNITY_AvatarUploader.tsx|AvatarUploader.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_Axiom Pathways — Setup (Matthew's checklist)|Axiom Pathways — Setup (Matthew's checklist)]]
- [[_COMMUNITY_vercel.json|vercel.json]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_middleware.ts|middleware.ts]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]

## God Nodes (most connected - your core abstractions)
1. `getServerSupabase()` - 44 edges
2. `getAdminSupabase()` - 31 edges
3. `getUser()` - 26 edges
4. `getProfile()` - 25 edges
5. `GlassPanel()` - 24 edges
6. `compilerOptions` - 16 edges
7. `Reveal()` - 14 edges
8. `deliver()` - 14 edges
9. `requireAdmin()` - 13 edges
10. `GlassButton()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `InternshipsPage()` --calls--> `getServerSupabase()`  [EXTRACTED]
  app/(intern)/internships/page.tsx → lib/supabase/server.ts
- `LearnModulePage()` --calls--> `getServerSupabase()`  [EXTRACTED]
  app/(intern)/learn/[slug]/page.tsx → lib/supabase/server.ts
- `LearnPage()` --calls--> `getServerSupabase()`  [EXTRACTED]
  app/(intern)/learn/page.tsx → lib/supabase/server.ts
- `DemoCallPage()` --calls--> `getUser()`  [EXTRACTED]
  app/startup/demo-call/page.tsx → lib/auth.ts
- `AccountPage()` --calls--> `getMyApplication()`  [EXTRACTED]
  app/(intern)/account/page.tsx → lib/applications.ts

## Import Cycles
- None detected.

## Communities (46 total, 4 thin omitted)

### Community 0 - "index.astro"
Cohesion: 0.06
Nodes (40): AuthPage(), metadata, ApplyPage(), metadata, InternHomePage(), metadata, realName(), InternLayout() (+32 more)

### Community 1 - "Connect the form to Google Sheets"
Cohesion: 0.14
Nodes (13): Architecture worth knowing before editing, Axiom Pathways, Conventions, Dual write on submit, Email, Migrations, One engine, two applications, Pinned slides (+5 more)

### Community 2 - "package.json"
Cohesion: 0.07
Nodes (28): dependencies, cheerio, framer-motion, gsap, lenis, next, react, react-dom (+20 more)

### Community 3 - "dependencies"
Cohesion: 0.09
Nodes (32): EditArticlePage(), metadata, AdminArticlesPage(), metadata, AdminLayout(), metadata, AdminSourcesPage(), metadata (+24 more)

### Community 4 - "line"
Cohesion: 0.10
Nodes (34): AdminDecisionsPage(), Counts, loadCounts(), metadata, TEMPLATE_LABEL, notifyAccountCreated(), adminClientOrThrow(), buildQueue() (+26 more)

### Community 5 - "start"
Cohesion: 0.08
Nodes (21): metadata, sections, metadata, sections, metadata, sections, metadata, sections (+13 more)

### Community 6 - "startApplication"
Cohesion: 0.07
Nodes (22): ARRIVAL, AssetRing(), Chip, Founder, FOUNDERS, TAILS, useFittedRadius(), useOrbitSync() (+14 more)

### Community 7 - "../styles/global.css"
Cohesion: 0.14
Nodes (21): genericJsonAdapter, DEFAULT_SELECTORS, firstString(), harvestObjects(), inferTermFromUrl(), interndockAdapter, looksLikeRole(), simplifyGithubAdapter (+13 more)

### Community 8 - "attachFiles"
Cohesion: 0.09
Nodes (17): Faq, FAQS, FaqSection(), FeatureSection(), Panel, PANELS, HowSection(), STEPS (+9 more)

### Community 9 - "astro.config.mjs"
Cohesion: 0.12
Nodes (13): LearnPage(), metadata, TRACK_LABELS, metadata, PRINCIPLES, DirectoryRow, InternsPage(), metadata (+5 more)

### Community 11 - "ApplyEngine.tsx"
Cohesion: 0.11
Nodes (15): ApplyEngineProps, Button(), ButtonProps, FieldShellProps, FileField(), FileFieldProps, MultiCheckboxField(), MultiCheckboxProps (+7 more)

### Community 12 - "Axiom Pathways — email program"
Cohesion: 0.09
Nodes (22): 1. Intern welcome, 1. Push from the Sheet, 2. Application received, 2. Build the queue, 3. Accepted — matched with a startup, 3. Send in batches, 4. Not selected, 5. Startup approved (+14 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 14 - "page.tsx"
Cohesion: 0.15
Nodes (8): metadata, metadata, metadata, CenterReveal(), founders, socials, startups, startupSteps

### Community 15 - "page.tsx"
Cohesion: 0.17
Nodes (11): AccountPage(), GRADES, listOf(), metadata, realName(), ArticleEditor(), GlassInput(), GlassTextarea() (+3 more)

### Community 16 - "InternApplication.tsx"
Cohesion: 0.17
Nodes (12): ApplyPrefill, SubmitResult, InternApplication(), Half, HALVES, OnboardingApplication(), Side, StartupApplication() (+4 more)

### Community 17 - "apply-sections.ts"
Cohesion: 0.12
Nodes (16): Answers, CONTRACT_FIELDS, CONTRACT_TYPE_TO_QUESTION, FIELD_OPTIONS, INTERN_SECTIONS, isSectionComplete(), isVisible(), Question (+8 more)

### Community 18 - "page.tsx"
Cohesion: 0.17
Nodes (11): InternshipsPage(), metadata, Search, CompanyLogo(), faviconFor(), hostOf(), InternshipCard(), SEASON_CLASS (+3 more)

### Community 19 - "Next session — account rebuild, backend verification, deploy"
Cohesion: 0.12
Nodes (16): 1. Account / profile rebuild — not started, 1a. Schema (needs a migration, `supabase/migrations/0015_profile.sql`), 1b. Profile picture — Supabase Storage, 1c. Prefill Account from the application, 1d. Question parity audit, 2. Backend verification — built, never verified live, 3. Email — templates done, sending unverified, 4. Vercel + env — what Matthew has to do (+8 more)

### Community 20 - "getServerSupabase"
Cohesion: 0.27
Nodes (10): ArticlesPage(), metadata, sitemap(), completeInternOnboarding(), completeStartupOnboarding(), setAvatarUrl(), setRole(), signOut() (+2 more)

### Community 21 - "ApplyFlow.tsx"
Cohesion: 0.18
Nodes (10): ApplyPrefill, FormData, FormFiles, Dropzone(), DropzoneProps, GlassSelect(), APPLY_STEPS, ApplyField (+2 more)

### Community 22 - "templates.ts"
Cohesion: 0.21
Nodes (14): accepted(), accountCreated(), applicationReceived(), Email, Footer, greeting(), internWelcome(), MatchVars (+6 more)

### Community 23 - "MediaPanel.tsx"
Cohesion: 0.18
Nodes (12): ApplyEngine(), FOUNDER_PHOTOS, INTERN_PANELS, INTERN_STATS, MediaPanel(), Panel, STARTUP_PANELS, STARTUP_STATS (+4 more)

### Community 24 - "sheet-decisions.ts"
Cohesion: 0.27
Nodes (9): POST(), DECISION_WORDS, parseDecision(), ParsedRow, ParseResult, parseSheetDate(), parseSheetRows(), SheetRow (+1 more)

### Community 25 - "Deploy — Vercel, Supabase, Resend, Apps Script"
Cohesion: 0.18
Nodes (10): 1. Supabase, 1a. Migrations, 1b. Auth → URL Configuration, 1c. Google provider, 2. Environment variables, 3. Apps Script — the two Sheets, 4. Resend, 5. Before the first deploy (+2 more)

### Community 26 - "applications.ts"
Cohesion: 0.24
Nodes (9): CONTRACT_COLUMNS, recordApplication(), RecordResult, StartupApplicationResult, submitStartupApplication(), syncInternProfile(), sendStartupReceived(), postStartupToSheet() (+1 more)

### Community 27 - "route.ts"
Cohesion: 0.44
Nodes (8): GET(), optOut(), POST(), read(), isValidToken(), secret(), sign(), unsubscribeUrl()

### Community 28 - "Apply page rebuild — build spec"
Cohesion: 0.22
Nodes (8): Answered 2026-08-03, Apply page rebuild — build spec, Branding, Constraints, Layout, Line-fill animation, Source to port from, Two question sets

### Community 29 - "page.tsx"
Cohesion: 0.39
Nodes (5): ArticlePage(), generateMetadata(), getArticle(), LearnModulePage(), ArticleBody()

### Community 30 - "InquiryForm.tsx"
Cohesion: 0.39
Nodes (5): DemoCallPage(), metadata, InquiryForm(), InquiryResult, submitInquiry()

### Community 31 - "AvatarUploader.tsx"
Cohesion: 0.29
Nodes (4): ACCEPTED, Gate(), GoogleButton(), getBrowserSupabase()

### Community 32 - "layout.tsx"
Cohesion: 0.33
Nodes (4): inter, jetbrains, metadata, LenisProvider()

### Community 33 - "Axiom Pathways — Setup (Matthew's checklist)"
Cohesion: 0.33
Nodes (5): Axiom Pathways — Setup (Matthew's checklist), Environment variables, Local dev, Stage 3 — Supabase project (once), Stage 4 — Cron

### Community 34 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, crons, framework, outputDirectory

## Knowledge Gaps
- **251 isolated node(s):** `metadata`, `GRADES`, `metadata`, `metadata`, `metadata` (+246 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getServerSupabase()` connect `getServerSupabase` to `index.astro`, `dependencies`, `astro.config.mjs`, `page.tsx`, `page.tsx`, `applications.ts`, `page.tsx`, `InquiryForm.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `getUser()` connect `index.astro` to `applications.ts`, `dependencies`, `getServerSupabase`, `InquiryForm.tsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `GlassPanel()` connect `astro.config.mjs` to `index.astro`, `dependencies`, `line`, `start`, `page.tsx`, `page.tsx`, `page.tsx`, `getServerSupabase`, `page.tsx`, `InquiryForm.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `metadata`, `GRADES`, `metadata` to the rest of the system?**
  _251 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.06498015873015874 - nodes in this community are weakly interconnected._
- **Should `Connect the form to Google Sheets` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._