"use client";

import { useState } from "react";
import type { MockApplication } from "@/components/preview/mock-data";
import { MOCK_CHAPTERS, MOCK_SCHOOLS } from "@/components/preview/mock-data";
import type { BoardStatus } from "@/components/preview/labels";
import { AppTable } from "@/components/preview/hq/AppTable";
import { toCsv, type Filters } from "@/components/preview/hq/stats";

/**
 * Search, filters, export, and the list itself. The list shows 25 at a time:
 * the real endpoint pages on the server, so the prototype behaves the same.
 */

const PAGE = 25;
const STATUSES: { value: BoardStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "accepted", label: "Accepted" },
  { value: "waitlist", label: "Waitlist" },
  { value: "rejected", label: "Not this cycle" },
  { value: "withdrawn", label: "Withdrawn" },
];

type Sort = "newest" | "oldest-unread";

export function ListPanel({
  rows,
  filters,
  onFilter,
  onReset,
  onOpen,
  openId,
  isEmptySite,
}: {
  rows: readonly MockApplication[];
  filters: Filters;
  onFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onReset: () => void;
  onOpen: (id: string) => void;
  openId: string | null;
  isEmptySite: boolean;
}) {
  const [shown, setShown] = useState(PAGE);
  const [sort, setSort] = useState<Sort>("newest");

  // "Oldest unread first" is the reviewing order: whoever has waited longest.
  const sorted =
    sort === "newest"
      ? rows
      : [...rows].sort((a, b) => Number(Boolean(a.readAt)) - Number(Boolean(b.readAt)) || a.submittedAt.localeCompare(b.submittedAt));

  const chips = (
    [
      ["chapter", filters.chapter],
      ["org", filters.org],
      ["grade", filters.grade],
      ["interest", filters.interest],
    ] as const
  ).filter(([, value]) => value);

  const exportCsv = () => {
    // Built in the browser from the rows already on screen; no request.
    const url = URL.createObjectURL(new Blob([toCsv(sorted)], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "axiom-applications-MOCK.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section aria-labelledby="hq-list" className="mt-4 overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgb(23_25_28_/_0.05)]">
      <div className="flex flex-col gap-4 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="hq-list" className="text-[22px] font-medium tracking-[-0.03em] text-ms-ink">
            Everyone <span className="text-ms-muted tabular-nums">{rows.length}</span>
          </h2>
          <button type="button" onClick={exportCsv} disabled={rows.length === 0} className="ms-pill h-10 cursor-pointer px-5 text-[14px] disabled:cursor-not-allowed disabled:opacity-40">
            Export CSV
          </button>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search applications</span>
            <input
              type="search"
              value={filters.query}
              onChange={(event) => onFilter("query", event.target.value)}
              placeholder="Search name, email, school, role…"
              className="h-11 w-full rounded-full bg-ms-mist px-5 text-[15px] text-ms-ink outline-none placeholder:text-ms-muted focus:ring-2 focus:ring-ms-green"
            />
          </label>
          <div className="grid grid-cols-3 gap-2 lg:flex">
            <Select label="Chapter" value={filters.chapter} options={MOCK_CHAPTERS} onChange={(value) => onFilter("chapter", value)} />
            <Select label="School" value={filters.org} options={MOCK_SCHOOLS} onChange={(value) => onFilter("org", value)} />
            <label>
              <span className="sr-only">Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="h-11 w-full cursor-pointer rounded-full bg-ms-mist px-4 text-[14px] text-ms-ink outline-none focus:ring-2 focus:ring-ms-green">
                <option value="newest">Newest</option>
                <option value="oldest-unread">Oldest unread</option>
              </select>
            </label>
          </div>
        </div>

        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Status">
          {STATUSES.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filters.status === option.value}
              onClick={() => onFilter("status", option.value)}
              className={`h-9 shrink-0 cursor-pointer rounded-full px-3.5 text-[13px] font-medium transition-colors ${
                filters.status === option.value ? "bg-ms-ink text-white" : "bg-ms-mist text-ms-body hover:bg-ms-sky"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {chips.length ? (
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="text-ms-muted">From the charts:</span>
            {chips.map(([key, value]) => (
              <button key={key} type="button" onClick={() => onFilter(key, null)} className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-ms-sky px-3 font-medium text-ms-ink">
                {value} <span aria-hidden="true">×</span>
                <span className="sr-only">remove filter</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="border-t border-ms-mist px-6 py-14 text-center">
          <p className="text-[20px] font-medium tracking-[-0.02em] text-ms-ink">
            {isEmptySite ? "No applications yet." : "Nobody matches that."}
          </p>
          <p className="mt-1 text-[15px] text-ms-muted">
            {isEmptySite ? "The first one shows up here the moment it's sent." : "Try a wider date range, or clear the filters."}
          </p>
          {!isEmptySite ? (
            <button type="button" onClick={onReset} className="ms-pill mt-5 h-11 cursor-pointer text-[15px]">
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="border-t border-ms-mist">
          <AppTable rows={sorted.slice(0, shown)} onOpen={onOpen} openId={openId} />
          {sorted.length > shown ? (
            <div className="border-t border-ms-mist p-4 text-center">
              <button type="button" onClick={() => setShown((n) => n + PAGE)} className="h-11 cursor-pointer rounded-full bg-ms-mist px-6 text-[14px] font-medium text-ms-ink hover:bg-ms-sky">
                Show {Math.min(PAGE, sorted.length - shown)} more · {sorted.length - shown} left
              </button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: readonly string[];
  onChange: (value: string | null) => void;
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
        className="h-11 w-full min-w-0 cursor-pointer rounded-full bg-ms-mist px-4 text-[14px] text-ms-ink outline-none focus:ring-2 focus:ring-ms-green lg:w-44"
      >
        <option value="">{`Any ${label.toLowerCase()}`}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
