import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_OUTREACH_FILTERS,
  claimsAboutMatthew,
  contactFor,
  csvCell,
  filterRows,
  outreachCounts,
  parseUpdate,
  raiseOf,
  safeUrl,
  toOutreachCsv,
} from "../lib/data/outreach/logic.ts";
import type { OutreachRow } from "../lib/data/outreach/types.ts";

function row(over: Partial<OutreachRow> & { slug: string }, company: Partial<OutreachRow["company"]> = {}): OutreachRow {
  return {
    draft: null,
    funding: null,
    status: "new",
    note: "",
    contact: null,
    updatedAt: null,
    updatedBy: null,
    ...over,
    company: {
      name: over.slug,
      batch: "Fall 2026",
      batchShort: "F26",
      website: `https://${over.slug}.ai`,
      domain: `${over.slug}.ai`,
      oneLiner: "agents",
      industry: "B2B",
      locations: "SF",
      teamSize: 3,
      ycUrl: `https://www.ycombinator.com/companies/${over.slug}`,
      logoUrl: null,
      links: { linkedin: null, x: null, github: null, youtube: null, instagram: null, tiktok: null, discord: null, crunchbase: null, careers: null, calendar: null },
      founders: [{ name: "Sam Lee", title: "CEO", linkedin: "https://linkedin.com/in/sam", x: null, email: `sam@${over.slug}.ai`, emailSource: "guess" }],
      best: { name: "Sam Lee", email: `sam@${over.slug}.ai`, source: "guess" },
      internJobs: 0,
      jobCount: 0,
      ...company,
    },
  };
}

const draft = (style: string) => ({ to: { name: "Sam", email: "sam@x.ai", source: "guess" }, subject: "yo sam", body: "yo sam!\n\nhook\n\nany thoughts?\n\nmatthew", hook: "hook", style, closer: "any thoughts?" });

test("contactFor prefers a hand-set address", () => {
  assert.equal(contactFor(row({ slug: "acme" }))?.source, "guess");
  const manual = contactFor(row({ slug: "acme", contact: "real@acme.ai" }));
  assert.equal(manual?.email, "real@acme.ai");
  assert.equal(manual?.source, "manual");
});

test("raiseOf only counts announced rounds with an amount", () => {
  assert.equal(raiseOf(row({ slug: "a", funding: { status: "none_found" } })), null);
  assert.equal(raiseOf(row({ slug: "a", funding: { status: "announced", amountUsd: 3e6, amountLabel: "$3M" } }))?.amountLabel, "$3M");
});

test("filterRows: batch, status, raised, about-you, email source, search, sort", () => {
  const rows = [
    row({ slug: "big", funding: { status: "announced", amountUsd: 9e6 }, status: "drafted", draft: draft("gen z compliment") }, { batchShort: "W26" }),
    row({ slug: "small", funding: { status: "announced", amountUsd: 2e6 }, draft: draft("was into this too") }),
    row({ slug: "none", contact: "x@none.ai" }, { best: null }),
  ];
  const run = (patch: Partial<typeof EMPTY_OUTREACH_FILTERS>) => filterRows(rows, { ...EMPTY_OUTREACH_FILTERS, ...patch }).map((r) => r.slug);
  assert.deepEqual(run({ batch: "W26" }), ["big"]);
  assert.deepEqual(run({ status: "drafted" }), ["big"]);
  assert.deepEqual(run({ raised: true, sort: "raised" }), ["big", "small"]);
  assert.deepEqual(run({ aboutYou: true }), ["small"]);
  assert.deepEqual(run({ email: "guess", sort: "name" }), ["big", "small"]);
  assert.deepEqual(run({ query: "x@none" }), ["none"]);
  assert.equal(run({ sort: "contact" })[0], "none"); // manual address sorts first
  assert.equal(claimsAboutMatthew(rows[1]), true);
});

test("outreachCounts", () => {
  const counts = outreachCounts([row({ slug: "a", draft: draft("hiring"), status: "approved" }), row({ slug: "b" })]);
  assert.equal(counts.companies, 2);
  assert.equal(counts.drafts, 1);
  assert.equal(counts.statuses.approved, 1);
  assert.equal(counts.statuses.new, 1);
});

test("parseUpdate accepts only known fields and shapes", () => {
  assert.deepEqual(parseUpdate({ slugs: ["acme", "acme"], patch: { status: "approved" } }), { ok: true, slugs: ["acme"], patch: { status: "approved" } });
  assert.deepEqual(parseUpdate({ slugs: ["acme"], patch: { contact: " Real@Acme.ai " } }), { ok: true, slugs: ["acme"], patch: { contact: "real@acme.ai" } });
  assert.deepEqual(parseUpdate({ slugs: ["acme"], patch: { contact: null } }), { ok: true, slugs: ["acme"], patch: { contact: null } });
  assert.equal(parseUpdate({ slugs: ["acme"], patch: { status: "hacked" } }).ok, false);
  assert.equal(parseUpdate({ slugs: ["../x"], patch: { status: "pass" } }).ok, false);
  assert.equal(parseUpdate({ slugs: [], patch: { status: "pass" } }).ok, false);
  assert.equal(parseUpdate({ slugs: ["acme"], patch: { contact: "nope" } }).ok, false);
  assert.equal(parseUpdate({ slugs: ["acme"], patch: { company: {} } }).ok, false);
  const long = parseUpdate({ slugs: ["acme"], patch: { note: "x".repeat(5000) } });
  assert.ok(long.ok && long.patch.note?.length === 4000);
});

test("CSV cells escape quotes, newlines and spreadsheet formulas", () => {
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  assert.equal(csvCell("a\nb"), '"a\nb"');
  assert.equal(csvCell("=HYPERLINK(1)"), "'=HYPERLINK(1)");
  const csv = toOutreachCsv([row({ slug: "acme", draft: draft("hiring") })]);
  assert.match(csv.split("\n")[0], /^slug,company,batch/);
  assert.match(csv, /sam@acme\.ai/);
});

test("safeUrl keeps http(s) only", () => {
  assert.equal(safeUrl("acme.ai"), "https://acme.ai/");
  assert.equal(safeUrl("javascript:alert(1)"), null);
  assert.equal(safeUrl(null), null);
});
