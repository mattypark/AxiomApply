"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_FILTERS, type HqClient, type HqDetail, type HqFilters, type HqRow, type HqSort, type HqStats, type Range, type Side } from "@/lib/data/hq/types";
import { Card, ErrorCard, Kicker, SkeletonCard } from "@/components/hq/Card";
import { SIDE_LABEL } from "@/components/hq/labels";
import { BarList } from "@/components/hq/BarList";
import { Funnel } from "@/components/hq/Funnel";
import { KpiStrip } from "@/components/hq/KpiStrip";
import { ListPanel } from "@/components/hq/ListPanel";
import { SIDE_MARK, TimeChart } from "@/components/hq/TimeChart";
import { Track } from "@/components/hq/Track";
import { DetailDrawer } from "@/components/hq/DetailDrawer";

/**
 * HQ — Matthew and Frank's live view of every application.
 *
 * One filter state drives everything on the page: the numbers, the charts
 * and the list are always the same slice. Clicking a bar filters by it
 * (cross-filtering), and each breakdown ignores its own filter so it keeps
 * showing the alternatives.
 *
 * All counting happens behind `client` (on the server, live), so the page
 * holds the counts and one page of rows, never everyone's details. "Live"
 * is polling: every 45 seconds and whenever the window regains focus.
 */

const PAGE = 25;
const POLL_MS = 45_000;
const SEARCH_DEBOUNCE_MS = 250;

const RANGES: { value: Range; label: string }[] = [
  { value: "7", label: "7d" },
  { value: "30", label: "30d" },
  { value: "60", label: "60d" },
  { value: "all", label: "All" },
];
const SIDE_OPTIONS: { value: Side | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "intern", label: "Intern" },
  { value: "startup", label: "Startup" },
  { value: "chapter", label: "Chapter" },
];
const SIDE_COLORS: Record<string, string> = Object.fromEntries(
  (Object.keys(SIDE_MARK) as Side[]).map((side) => [SIDE_LABEL[side], SIDE_MARK[side]]),
);
const MISSING_LABEL: Record<Side, string> = { intern: "interns", startup: "startups", chapter: "chapters" };

export function HqDashboard({ client, where }: { client: HqClient; where: string }) {
  const [filters, setFilters] = useState<HqFilters>(EMPTY_FILTERS);
  // The filters actually asked of the server: the same, with the search debounced.
  const [applied, setApplied] = useState<HqFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<HqSort>("newest");
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [stats, setStats] = useState<HqStats | null>(null);
  const [rows, setRows] = useState<HqRow[]>([]);
  const [total, setTotal] = useState(0);
  const [fresh, setFresh] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<HqDetail | null>(null);
  const [detailProblem, setDetailProblem] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportProblem, setExportProblem] = useState<string | null>(null);

  // Only the latest load may write to the page; a slow earlier one is dropped.
  const loadSeq = useRef(0);
  const totalRef = useRef(0);
  totalRef.current = total;

  useEffect(() => {
    if (filters.query === applied.query) {
      setApplied(filters);
      return;
    }
    const timer = window.setTimeout(() => setApplied(filters), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [filters, applied.query]);

  const load = useCallback(async () => {
    const seq = ++loadSeq.current;
    try {
      const [nextStats, list] = await Promise.all([client.stats(applied), client.list(applied, { offset: 0, size: PAGE, sort })]);
      if (seq !== loadSeq.current) return;
      setStats(nextStats);
      setRows(list.rows);
      setTotal(list.total);
      setFresh(0);
      setPhase("ready");
    } catch {
      if (seq === loadSeq.current) setPhase("error");
    }
  }, [client, applied, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  // Polling. Counts refresh in place; new rows are only counted, never pushed
  // into the table under the cursor.
  useEffect(() => {
    if (phase !== "ready") return;
    const poll = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const [nextStats, head] = await Promise.all([client.stats(applied), client.list(applied, { offset: 0, size: 1, sort })]);
        setStats(nextStats);
        setFresh(Math.max(0, head.total - totalRef.current));
      } catch {
        // A failed poll leaves the last good numbers up; the next one retries.
      }
    };
    const timer = window.setInterval(poll, POLL_MS);
    const onFocus = () => void poll();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [client, applied, sort, phase]);

  const set = <K extends keyof HqFilters>(key: K, value: HqFilters[K]) => setFilters((prev) => ({ ...prev, [key]: value }));
  const pickDim = (dim: "chapter" | "org" | "grade" | "interest") => (value: string | null) => set(dim, value);

  async function more() {
    setLoadingMore(true);
    try {
      const list = await client.list(applied, { offset: rows.length, size: PAGE, sort });
      setRows((prev) => [...prev, ...list.rows.filter((row) => !prev.some((have) => have.id === row.id))]);
      setTotal(list.total);
    } finally {
      setLoadingMore(false);
    }
  }

  const openDetail = useCallback(
    async (id: string) => {
      setOpenId(id);
      setDetail(null);
      setDetailProblem(null);
      const found = await client.get(id).catch(() => null);
      if (found) setDetail(found);
      else setDetailProblem("We couldn't open that application right now.");
    },
    [client],
  );

  const onClose = useCallback(() => setOpenId(null), []);

  // After a write: the drawer, that row in the list, and the counts all catch up.
  async function refreshAfterWrite(id: string) {
    const [found, nextStats] = await Promise.all([client.get(id).catch(() => null), client.stats(applied).catch(() => null)]);
    if (found) {
      setDetail(found);
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...pickRow(found) } : row)));
    }
    if (nextStats) setStats(nextStats);
  }

  async function exportCsv() {
    setExporting(true);
    setExportProblem(null);
    try {
      const csv = await client.exportCsv(applied);
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `axiom-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportProblem("The export didn't run. Nothing was downloaded.");
    } finally {
      setExporting(false);
    }
  }

  const rangeLabel = filters.range === "all" ? "all time" : `last ${filters.range} days`;
  const sidesShown: Side[] = filters.side === "all" ? ["intern", "startup", "chapter"] : [filters.side];

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 pb-28 sm:px-[6.5%]">
      <div className="flex flex-wrap items-end justify-between gap-4 pt-4 sm:pt-8">
        <div>
          <p className="flex items-center gap-2 text-[13px] font-medium text-ms-muted">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inset-0 animate-ping rounded-full bg-ms-green opacity-60 motion-reduce:animate-none" />
              <span className="relative h-2 w-2 rounded-full bg-ms-green" />
            </span>
            Live · updates as applications arrive
          </p>
          <h1 className="ms-display mt-3 text-[clamp(2.8rem,6vw,5rem)] text-ms-ink">Applications</h1>
        </div>
        <p className="max-w-full truncate rounded-full bg-ms-mist px-3.5 py-2 font-mono text-[12px] text-ms-body">{where}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:w-[17rem]">
          <Track label="Date range" value={filters.range} options={RANGES} onChange={(value) => set("range", value)} />
        </div>
        <div className="overflow-x-auto sm:w-[26rem]">
          <Track label="Side" value={filters.side} options={SIDE_OPTIONS} dots={SIDE_MARK} onChange={(value) => set("side", value)} />
        </div>
      </div>

      {stats?.needsMigration || stats?.missing.length ? (
        <div role="status" className="mt-4 flex flex-col gap-1 rounded-[20px] bg-[#f1ead6] px-5 py-3 text-[14px] text-ms-ink">
          {stats.missing.length ? (
            <p>
              Couldn&rsquo;t load {stats.missing.map((side) => MISSING_LABEL[side]).join(" or ")} right now — everything else is here.
            </p>
          ) : null}
          {stats.needsMigration ? <p>Read and decisions can&rsquo;t be saved until 0020_hq.sql runs on the database.</p> : null}
        </div>
      ) : null}

      {phase === "loading" ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <SkeletonCard className="lg:col-span-3" lines={2} />
          <SkeletonCard className="lg:col-span-2" lines={5} />
          <SkeletonCard lines={4} />
        </div>
      ) : phase === "error" || !stats ? (
        <div className="mt-6 max-w-xl">
          <ErrorCard
            what="applications"
            onRetry={() => {
              setPhase("loading");
              void load();
            }}
          />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <KpiStrip kpis={stats.kpis} rangeLabel={rangeLabel} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <Kicker>Applications over time · {rangeLabel}</Kicker>
              <div className="mt-4">
                <TimeChart days={stats.daily} sides={sidesShown} />
              </div>
            </Card>
            <Card>
              <Kicker>Where they stand</Kicker>
              <div className="mt-5">
                <Funnel steps={stats.funnel} />
              </div>
            </Card>

            <Card>
              <Kicker>By side</Kicker>
              <div className="mt-3">
                <BarList
                  label="Applications by side"
                  bars={stats.by.side}
                  colors={SIDE_COLORS}
                  selected={filters.side === "all" ? null : SIDE_LABEL[filters.side]}
                  onSelect={(label) => set("side", sideFromLabel(label))}
                />
              </div>
            </Card>
            <Card>
              <Kicker>By chapter / city</Kicker>
              <div className="mt-3">
                <BarList label="Applications by chapter" bars={stats.by.chapter} selected={filters.chapter} onSelect={pickDim("chapter")} />
              </div>
            </Card>
            <Card>
              <Kicker>By interest · interns</Kicker>
              <div className="mt-3">
                <BarList label="Applications by interest" bars={stats.by.interest} selected={filters.interest} onSelect={pickDim("interest")} />
              </div>
            </Card>
            <Card className="lg:col-span-2">
              <Kicker>By school</Kicker>
              <div className="mt-3">
                <BarList label="Applications by school" bars={stats.by.org} selected={filters.org} onSelect={pickDim("org")} />
              </div>
            </Card>
            <Card>
              <Kicker>By grade</Kicker>
              <div className="mt-3">
                <BarList label="Applications by grade" bars={stats.by.grade} selected={filters.grade} onSelect={pickDim("grade")} limit={11} />
              </div>
            </Card>
          </div>

          <ListPanel
            rows={rows}
            total={total}
            filters={filters}
            sort={sort}
            chapters={stats.by.chapter.map((bar) => bar.label)}
            schools={stats.by.org.map((bar) => bar.label)}
            isEmptySite={stats.everything === 0}
            openId={openId}
            fresh={fresh}
            loadingMore={loadingMore}
            exporting={exporting}
            exportProblem={exportProblem}
            onFilter={set}
            onSort={setSort}
            onReset={() => setFilters({ ...EMPTY_FILTERS, range: filters.range })}
            onOpen={openDetail}
            onMore={more}
            onShowFresh={() => void load()}
            onExport={exportCsv}
          />
        </>
      )}

      {openId ? (
        <DetailDrawer
          id={openId}
          detail={detail?.id === openId ? detail : null}
          problem={detailProblem}
          onClose={onClose}
          onReveal={(id) => client.contact(id)}
          onDecide={async (id, decision) => {
            const result = await client.decide(id, decision);
            if (result.ok) await refreshAfterWrite(id);
            return result;
          }}
          onMarkRead={async (id) => {
            const result = await client.markRead(id);
            if (result.ok) await refreshAfterWrite(id);
            return result;
          }}
        />
      ) : null}
    </main>
  );
}

function pickRow(detail: HqDetail): Partial<HqRow> {
  const { status, readAt, reviewer, decidedAt, decidedVia } = detail;
  return { status, readAt, reviewer, decidedAt, decidedVia };
}

function sideFromLabel(label: string | null): Side | "all" {
  const match = (Object.keys(SIDE_LABEL) as Side[]).find((side) => SIDE_LABEL[side] === label);
  return match ?? "all";
}
