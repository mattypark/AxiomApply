# Graph Report - axiom-pathways  (2026-07-07)

## Corpus Check
- 7 files · ~103,265 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 72 nodes · 93 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d38aa46c`
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

## God Nodes (most connected - your core abstractions)
1. `Connect the form to Google Sheets` - 9 edges
2. `line()` - 8 edges
3. `respond()` - 6 edges
4. `start()` - 5 edges
5. `startApplication()` - 5 edges
6. `scripts` - 4 edges
7. `append()` - 4 edges
8. `../styles/global.css` - 3 edges
9. `shape()` - 3 edges
10. `frame()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `line()` --calls--> `append()`  [EXTRACTED]
  src/pages/index.astro → src/pages/index.astro  _Bridges community 6 → community 4_

## Import Cycles
- None detected.

## Communities (11 total, 2 thin omitted)

### Community 0 - "index.astro"
Cohesion: 0.11
Nodes (11): @vercel/analytics, FAQ, field, form, formData, formFiles, hint, startups (+3 more)

### Community 1 - "Connect the form to Google Sheets"
Cohesion: 0.17
Nodes (11): Axiom Pathways — site + application form, Connect the form to Google Sheets, Editing the script later, Notes / gotchas, Run locally, Step 1 — Open the script editor, Step 2.5 — Paste your Sheet ID (IMPORTANT), Step 2 — Paste the webhook code (+3 more)

### Community 2 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, preview, type, version

### Community 3 - "dependencies"
Cohesion: 0.29
Nodes (5): dependencies, astro, gsap, lenis, @vercel/analytics

### Community 4 - "line"
Cohesion: 0.48
Nodes (7): line(), respond(), showContact(), showMenu(), showQuestions(), showSocials(), showStartupsInline()

### Community 5 - "start"
Cohesion: 0.40
Nodes (6): build(), closeStartups(), frame(), shape(), start(), staticDraw()

### Community 6 - "startApplication"
Cohesion: 0.50
Nodes (5): append(), fieldHTML(), renderForm(), startApplication(), thinking()

## Knowledge Gaps
- **29 isolated node(s):** `name`, `type`, `version`, `private`, `dev` (+24 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `respond()` (e.g. with `showContact()` and `showMenu()`) actually correct?**
  _`respond()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `type`, `version` to the rest of the system?**
  _29 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._