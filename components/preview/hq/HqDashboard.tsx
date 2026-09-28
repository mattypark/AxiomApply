"use client";

import { useCallback, useMemo, useState } from "react";
import type { Side } from "@/lib/apply-sides";
import { Card, ErrorCard, Kicker, SkeletonCard } from "@/components/preview/Card";
import { PreviewControls, writeQuery } from "@/components/preview/PreviewControls";
import { MOCK_APPLICATIONS, MOCK_GRADES, type MockApplication, type Outcome } from "@/components/preview/mock-data";
import { SIDE_LABEL } from "@/components/preview/labels";
import { BarList } from "@/components/preview/hq/BarList";
import { Funnel } from "@/components/preview/hq/Funnel";
import { KpiStrip } from "@/components/preview/hq/KpiStrip";
import { ListPanel } from "@/components/preview/hq/ListPanel";
import { SIDE_MARK, TimeChart } from "@/components/preview/hq/TimeChart";
import { Track } from "@/components/preview/hq/Track";
import { DetailDrawer } from "@/components/preview/hq/DetailDrawer";
import {
  EMPTY_FILTERS,
  applyFilters,
  countBy,
  daily,
  funnel,
  kpis,
  type Dimension,
  type Filters,
  type Range,
} from "@/components/preview/hq/stats";

/**
 * HQ — Matthew and Frank's live view of every application.
 *
 * One filter state drives everything on the page: the numbers, the charts
 * and the list are always the same slice. Clicking a bar filters by it
 * (cross-filtering), and each breakdown ignores its own filter so it keeps
 * showing the alternatives.
 */

export type HqState = "ready" | "loading" | "error" | "empty";

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
const STATES: { value: HqState; label: string }[] = [
  { value: "ready", label: "Live data" },
  { value: "empty", label: "No applications" },
  { value: "loading", label: "Loading" },
  { value: "error", label: "Error" },
];
const SIDE_COLORS: Record<string, string> = Object.fromEntries(
  (Object.keys(SIDE_MARK) as Side[]).map((side) => [SIDE_LABEL[side], SIDE_MARK[side]]),
);

export function HqDashboard({ initialState, secretPath }: { initialState: HqState; secretPath: string }) {
  const [state, setState] = useState<HqState>(initialState);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [decided, setDecided] = useState<Record<string, Outcome>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  // Decisions made in the drawer overlay the mock rows, in memory only.
  const rows = useMemo<MockApplication[]>(
    () =>
      state === "empty"
        ? []
        : MOCK_APPLICATIONS.map((app) =>
            decided[app.id] ? { ...app, outcome: decided[app.id], decidedAt: app.decidedAt ?? "2026-09-28", readAt: app.readAt ?? "2026-09-28", reviewer: app.reviewer ?? "Matthew" } : app,
          ),
    [decided, state],
  );

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((prev) => ({ ...prev, [key]: value }));
  const slice = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const except = (dim: Dimension) => applyFilters(rows, filters, [dim]);
  const bySide = applyFilters(rows, { ...filters, side: "all" });
  const weekRows = applyFilters(rows, { ...filters, range: "all" });
  const rangeLabel = filters.range === "all" ? "all time" : `last ${filters.range} days`;
  const sidesShown: Side[] = filters.side === "all" ? ["intern", "startup", "chapter"] : [filters.side];

  const onClose = useCallback(() => setOpenId(null), []);
  const open = openId ? rows.find((app) => app.id === openId) ?? null : null;
  const pickDim = (dim: Dimension) => (value: string | null) => set(dim, value);

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
        <p className="max-w-full truncate rounded-full bg-ms-mist px-3.5 py-2 font-mono text-[12px] text-ms-body" title="The real address is a long random path, behind a sign-in">
          {secretPath}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:w-[17rem]">
          <Track label="Date range" value={filters.range} options={RANGES} onChange={(value) => set("range", value)} />
        </div>
        <div className="overflow-x-auto sm:w-[26rem]">
          <Track
            label="Side"
            value={filters.side}
            options={SIDE_OPTIONS}
            dots={SIDE_MARK}
            onChange={(value) => set("side", value)}
          />
        </div>
      </div>

      {state === "loading" ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <SkeletonCard className="lg:col-span-3" lines={2} />
          <SkeletonCard className="lg:col-span-2" lines={5} />
          <SkeletonCard lines={4} />
        </div>
      ) : state === "error" ? (
        <div className="mt-6 max-w-xl">
          <ErrorCard what="applications" onRetry={() => setState("ready")} />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <KpiStrip kpis={kpis(slice, weekRows)} rangeLabel={rangeLabel} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <Kicker>Applications over time · {rangeLabel}</Kicker>
              <div className="mt-4">
                <TimeChart days={daily(slice, filters.range)} sides={sidesShown} />
              </div>
            </Card>
            <Card>
              <Kicker>Where they stand</Kicker>
              <div className="mt-5">
                <Funnel steps={funnel(slice)} />
              </div>
            </Card>

            <Card>
              <Kicker>By side</Kicker>
              <div className="mt-3">
                <BarList
                  label="Applications by side"
                  bars={countSides(bySide)}
                  colors={SIDE_COLORS}
                  selected={filters.side === "all" ? null : SIDE_LABEL[filters.side]}
                  onSelect={(label) => set("side", sideFromLabel(label))}
                />
              </div>
            </Card>
            <Card>
              <Kicker>By chapter / city</Kicker>
              <div className="mt-3">
                <BarList label="Applications by chapter" bars={countBy(except("chapter"), "chapter")} selected={filters.chapter} onSelect={pickDim("chapter")} />
              </div>
            </Card>
            <Card>
              <Kicker>By interest · interns</Kicker>
              <div className="mt-3">
                <BarList label="Applications by interest" bars={countBy(except("interest"), "interest")} selected={filters.interest} onSelect={pickDim("interest")} />
              </div>
            </Card>
            <Card className="lg:col-span-2">
              <Kicker>By school</Kicker>
              <div className="mt-3">
                <BarList
                  label="Applications by school"
                  bars={countBy(except("org").filter((app) => app.side !== "startup"), "org")}
                  selected={filters.org}
                  onSelect={pickDim("org")}
                />
              </div>
            </Card>
            <Card>
              <Kicker>By grade</Kicker>
              <div className="mt-3">
                <BarList label="Applications by grade" bars={countBy(except("grade"), "grade", MOCK_GRADES)} selected={filters.grade} onSelect={pickDim("grade")} limit={10} />
              </div>
            </Card>
          </div>

          <ListPanel
            rows={slice}
            filters={filters}
            onFilter={set}
            onReset={() => setFilters({ ...EMPTY_FILTERS, range: filters.range })}
            onOpen={setOpenId}
            openId={openId}
            isEmptySite={rows.length === 0}
          />
        </>
      )}

      {open ? (
        <DetailDrawer app={open} onClose={onClose} onDecide={(id, outcome) => setDecided((prev) => ({ ...prev, [id]: outcome }))} />
      ) : null}

      <PreviewControls
        groups={[
          {
            key: "state",
            label: "State",
            value: state,
            options: STATES,
            onChange: (value) => {
              setState(value as HqState);
              writeQuery("state", value === "ready" ? null : value);
            },
          },
        ]}
      />
    </main>
  );
}

function countSides(rows: readonly MockApplication[]) {
  return (["intern", "startup", "chapter"] as Side[])
    .map((side) => ({ label: SIDE_LABEL[side], value: rows.filter((app) => app.side === side).length }))
    .filter((bar) => bar.value > 0);
}

function sideFromLabel(label: string | null): Side | "all" {
  const match = (Object.keys(SIDE_LABEL) as Side[]).find((side) => SIDE_LABEL[side] === label);
  return match ?? "all";
}
