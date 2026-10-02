"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BATCH_NAME, BATCH_ORDER, EMPTY_OUTREACH_FILTERS, filterRows, outreachCounts, toOutreachCsv, type OutreachFilters } from "@/lib/data/outreach/logic";
import { OUTREACH_STATUSES, STATUS_LABEL, type OutreachClient, type OutreachPatch, type OutreachRow, type OutreachSaved } from "@/lib/data/outreach/types";
import { OutreachDrawer } from "./OutreachDrawer";
import { OutreachEmails } from "./OutreachEmails";
import { OutreachSheet } from "./OutreachSheet";

/**
 * HQ's YC outreach desk: 700+ startups, their founders, the email written for
 * each, and the funding. Two views over the same filtered rows: a sheet for
 * scanning and an emails feed for reviewing drafts. Status and notes save to
 * the database as they change, so Frank and Matthew see the same desk.
 */

type Load = { state: "loading" } | { state: "error" } | { state: "missing"; reason: "not-configured" | "not-imported" } | { state: "ready"; importedAt: string | null };
type Mode = "sheet" | "emails";

const PAGE = 60;
const MODE_KEY = "hq-outreach-view";

function readMode(): Mode {
  try {
    return localStorage.getItem(MODE_KEY) === "emails" ? "emails" : "sheet";
  } catch {
    return "sheet";
  }
}

function download(name: string, text: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

const chip = (on: boolean) =>
  `inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
    on ? "border-ms-green bg-ms-sky-soft text-ms-green" : "border-ms-mist bg-white text-ms-body hover:border-ms-muted/40"
  }`;

export function OutreachDashboard({ client, where }: { client: OutreachClient; where: string }) {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [rows, setRows] = useState<OutreachRow[]>([]);
  const [filters, setFilters] = useState<OutreachFilters>(EMPTY_OUTREACH_FILTERS);
  const [mode, setMode] = useState<Mode>("sheet");
  const [limit, setLimit] = useState(PAGE);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => setMode(readMode()), []);

  useEffect(() => {
    let live = true;
    client
      .list()
      .then((result) => {
        if (!live) return;
        if (!result.ok) return setLoad({ state: "missing", reason: result.reason });
        setRows(result.rows);
        setLoad({ state: "ready", importedAt: result.importedAt });
      })
      .catch(() => live && setLoad({ state: "error" }));
    return () => {
      live = false;
    };
  }, [client]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const visible = useMemo(() => filterRows(rows, filters), [rows, filters]);
  const counts = useMemo(() => outreachCounts(rows), [rows]);
  const batches = useMemo(() => {
    const seen = new Map<string, number>();
    for (const row of rows) seen.set(row.company.batchShort, (seen.get(row.company.batchShort) ?? 0) + 1);
    return BATCH_ORDER.filter((batch) => seen.has(batch)).map((batch) => ({ batch, count: seen.get(batch) ?? 0 }));
  }, [rows]);

  const set = (patch: Partial<OutreachFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setLimit(PAGE);
  };

  const save = useCallback(
    async (slugs: string[], patch: OutreachPatch): Promise<OutreachSaved> => {
      const before = rows;
      // Show the change now; put it back if the save fails.
      setRows((current) => current.map((row) => (slugs.includes(row.slug) ? { ...row, ...patch } : row)));
      const saved = await client.update(slugs, patch).catch(() => ({ ok: false as const, error: "That didn't save. Try again." }));
      if (!saved.ok) {
        setRows(before);
        setToast(saved.error);
        return saved;
      }
      const bySlug = new Map(saved.rows.map((row) => [row.slug, row]));
      setRows((current) => current.map((row) => (bySlug.has(row.slug) ? { ...row, ...bySlug.get(row.slug) } : row)));
      if (patch.status) setToast(`${slugs.length > 1 ? `${slugs.length} companies` : "Saved"} → ${STATUS_LABEL[patch.status]}`);
      return saved;
    },
    [client, rows],
  );

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied");
    } catch {
      setToast("Copy failed. Select and copy by hand.");
    }
  }, []);

  const closeDrawer = useCallback(() => setOpenSlug(null), []);
  const openRow = openSlug ? rows.find((row) => row.slug === openSlug) ?? null : null;
  const switchMode = (next: Mode) => {
    setMode(next);
    setLimit(PAGE);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      // Private window: the switch still works for this visit.
    }
  };

  const kpis = [
    { label: "companies", value: counts.companies },
    { label: "founders", value: counts.founders },
    { label: "emails drafted", value: counts.drafts },
    { label: "approved", value: counts.statuses.approved },
    { label: "raised beyond YC", value: counts.raised },
    { label: "openers about you", value: counts.aboutYou },
  ];

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 pb-28 sm:px-[6.5%]">
      <div className="flex flex-wrap items-end justify-between gap-4 pt-4 sm:pt-8">
        <div>
          <p className="text-[13px] font-medium text-ms-muted">YC Winter, Spring, Summer and Fall 2026 · nothing sends from here</p>
          <h1 className="ms-display mt-3 text-[clamp(2.8rem,6vw,5rem)] text-ms-ink">YC outreach</h1>
        </div>
        <p className="max-w-full truncate rounded-full bg-ms-mist px-3.5 py-2 font-mono text-[12px] text-ms-body">{where}</p>
      </div>

      {load.state === "loading" && <p className="mt-10 text-ms-muted">Loading the desk…</p>}
      {load.state === "error" && <p className="mt-10 rounded-[20px] bg-[#fbe7e5] px-5 py-4 text-[#8f2a22]">We couldn&apos;t load the outreach desk. Refresh to try again.</p>}
      {load.state === "missing" && (
        <div className="mt-8 max-w-2xl rounded-[24px] bg-ms-mist px-6 py-5 text-[14px] text-ms-body">
          <p className="font-semibold text-ms-ink">{load.reason === "not-configured" ? "The database isn't configured here." : "No outreach data yet."}</p>
          <p className="mt-2">
            Apply <span className="font-mono">supabase/migrations/0021_yc_outreach.sql</span>, then load the bundle from the outreach tool:
          </p>
          <p className="mt-2 font-mono text-[12.5px]">node --env-file=.env.local scripts/import-outreach.ts private/outreach/hq-bundle.json --write</p>
        </div>
      )}

      {load.state === "ready" && (
        <>
          <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgb(23_25_28_/_0.05)] sm:grid-cols-3 lg:grid-cols-6">
            {kpis.map((kpi, index) => (
              <div key={kpi.label} className={`flex flex-col gap-1 p-5 ${index ? "border-l border-ms-mist" : ""}`}>
                <dt className="order-2 text-[12px] text-ms-muted">{kpi.label}</dt>
                <dd className="order-1 text-[28px] font-semibold tracking-[-0.04em] text-ms-ink tabular-nums">{kpi.value.toLocaleString()}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Status">
            {OUTREACH_STATUSES.map((status) => (
              <button key={status} type="button" aria-pressed={filters.status === status} onClick={() => set({ status: filters.status === status ? "" : status })} className={chip(filters.status === status)}>
                {STATUS_LABEL[status]}
                <span className="font-mono text-[11px] text-ms-muted">{counts.statuses[status]}</span>
              </button>
            ))}
          </div>

          <div className="sticky top-0 z-20 -mx-4 mt-4 flex flex-wrap items-center gap-2 border-b border-ms-mist bg-white/90 px-4 py-3 backdrop-blur max-md:static sm:-mx-[6.5%] sm:px-[6.5%]">
            <input
              type="search"
              value={filters.query}
              onChange={(event) => set({ query: event.target.value })}
              placeholder="Search companies, founders, emails…"
              aria-label="Search"
              className="h-10 min-w-0 flex-[1_1_16rem] rounded-full border border-ms-mist bg-ms-mist px-4 text-[14px] outline-none focus:border-ms-green focus:bg-white"
            />
            <div className="flex rounded-full bg-ms-mist p-1" role="group" aria-label="Batch">
              {[{ batch: "", count: rows.length }, ...batches].map(({ batch, count }) => (
                <button
                  key={batch || "all"}
                  type="button"
                  aria-pressed={filters.batch === batch}
                  onClick={() => set({ batch })}
                  className={`h-8 cursor-pointer rounded-full px-3 text-[13px] font-medium ${filters.batch === batch ? "bg-white text-ms-ink shadow-[0_0_0_1px_rgb(23_25_28_/_0.06)]" : "text-ms-body"}`}
                >
                  {batch ? BATCH_NAME[batch] : "All"} <span className="font-mono text-[11px] text-ms-muted max-sm:hidden">{count}</span>
                </button>
              ))}
            </div>
            <select value={filters.email} onChange={(event) => set({ email: event.target.value as OutreachFilters["email"] })} aria-label="Email" className="h-10 rounded-full border border-ms-mist bg-white px-3 text-[13px]">
              <option value="">Any email</option>
              <option value="found">Founder email found</option>
              <option value="inbox">Inbox found</option>
              <option value="guess">Guess only</option>
              <option value="none">No email</option>
            </select>
            <select value={filters.sort} onChange={(event) => set({ sort: event.target.value as OutreachFilters["sort"] })} aria-label="Sort" className="h-10 rounded-full border border-ms-mist bg-white px-3 text-[13px]">
              <option value="contact">Sort: best contact</option>
              <option value="raised">Sort: most raised</option>
              <option value="name">Sort: name</option>
              <option value="batch">Sort: batch</option>
              <option value="updated">Sort: recently touched</option>
            </select>
            <button type="button" aria-pressed={filters.raised} onClick={() => set({ raised: !filters.raised })} className={chip(filters.raised)}>
              Raised beyond YC
            </button>
            <button type="button" aria-pressed={filters.hiring} onClick={() => set({ hiring: !filters.hiring })} className={chip(filters.hiring)}>
              Hiring
            </button>
            <button type="button" aria-pressed={filters.aboutYou} onClick={() => set({ aboutYou: !filters.aboutYou })} className={chip(filters.aboutYou)}>
              Says something about you
            </button>
            <button type="button" onClick={() => set(EMPTY_OUTREACH_FILTERS)} className="h-9 cursor-pointer rounded-full px-3 text-[13px] font-semibold text-ms-muted hover:text-ms-ink">
              Reset
            </button>
          </div>

          <div className="mt-4 mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex rounded-full bg-ms-mist p-1" role="group" aria-label="View">
                {(["sheet", "emails"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={mode === value}
                    onClick={() => switchMode(value)}
                    className={`h-8 cursor-pointer rounded-full px-4 text-[13px] font-semibold capitalize ${mode === value ? "bg-white text-ms-ink shadow-[0_0_0_1px_rgb(23_25_28_/_0.06)]" : "text-ms-body"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-[14px] text-ms-muted" aria-live="polite">
                {visible.length.toLocaleString()} of {rows.length.toLocaleString()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => download(`axiom-yc-outreach-${new Date().toISOString().slice(0, 10)}.csv`, toOutreachCsv(visible))}
              className="h-10 cursor-pointer rounded-full bg-ms-ink px-4 text-[13px] font-semibold text-white hover:bg-black"
            >
              Export these as CSV
            </button>
          </div>

          {visible.length === 0 ? (
            <p className="py-16 text-center text-ms-muted">No companies match these filters.</p>
          ) : mode === "sheet" ? (
            <OutreachSheet rows={visible.slice(0, limit * 4)} openSlug={openSlug} onOpen={setOpenSlug} onStatus={(slug, status) => save([slug], { status })} onCopy={copy} />
          ) : (
            <OutreachEmails rows={visible.slice(0, limit)} onOpen={setOpenSlug} onStatus={(slug, status) => save([slug], { status })} onCopy={copy} />
          )}

          {visible.length > (mode === "sheet" ? limit * 4 : limit) && (
            <button type="button" onClick={() => setLimit((value) => value + PAGE)} className="mx-auto mt-6 block h-10 cursor-pointer rounded-full border border-ms-mist px-5 text-[13px] font-semibold text-ms-body hover:bg-ms-mist">
              Show more
            </button>
          )}
        </>
      )}

      {openRow && <OutreachDrawer row={openRow} client={client} onClose={closeDrawer} onSave={save} onCopy={copy} />}

      <div role="status" aria-live="polite" className={`pointer-events-none fixed top-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ms-ink px-4 py-2 text-[13px] font-medium text-white transition-opacity ${toast ? "opacity-100" : "opacity-0"}`}>
        {toast}
      </div>
    </main>
  );
}
