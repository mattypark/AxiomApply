"use client";

import { SIDES } from "@/components/home/PathPicker";
import type { HqRow, HqStatus, Side } from "@/lib/data/hq/types";
import { STATUS_TONE, SIDE_LABEL, shortDay, statusLabel } from "@/components/hq/labels";

/**
 * The applications list. A dense table on a desk, a stack of two-line rows
 * on a phone — the same rows, the same order, the same click target. Each
 * row opens the detail drawer; the name is the real button so keyboard and
 * screen-reader users get one stop per applicant instead of seven cells.
 */

const DOT = Object.fromEntries(SIDES.map((option) => [option.side, option.dot]));

export function StatusPill({ status, side }: { status: HqStatus; side: Side }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-medium whitespace-nowrap ${STATUS_TONE[status]}`}>
      {statusLabel(status, side)}
    </span>
  );
}

const orDash = (value: string | null) => value ?? "—";

export function AppTable({
  rows,
  onOpen,
  openId,
}: {
  rows: readonly HqRow[];
  onOpen: (id: string) => void;
  openId: string | null;
}) {
  return (
    <>
      <table className="hidden w-full text-left text-[14px] md:table">
        <thead>
          <tr className="border-b border-ms-mist text-[12px] text-ms-muted">
            <th scope="col" className="py-3 pr-3 pl-6 font-medium">Name</th>
            <th scope="col" className="px-3 py-3 font-medium">Side</th>
            <th scope="col" className="px-3 py-3 font-medium">School / company</th>
            <th scope="col" className="px-3 py-3 font-medium">Chapter</th>
            <th scope="col" className="px-3 py-3 font-medium">Status</th>
            <th scope="col" className="py-3 pr-6 pl-3 text-right font-medium">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((app) => (
            <tr
              key={app.id}
              onClick={() => onOpen(app.id)}
              className={`cursor-pointer border-b border-ms-mist transition-colors last:border-b-0 hover:bg-ms-mist/70 ${
                openId === app.id ? "bg-ms-sky-soft" : ""
              }`}
            >
              <td className="py-3 pr-3 pl-6">
                <button type="button" onClick={(event) => { event.stopPropagation(); onOpen(app.id); }} className="cursor-pointer text-left">
                  <span className="block font-medium text-ms-ink">{app.name}</span>
                  <span className="block text-[12px] text-ms-muted">{app.email}</span>
                </button>
              </td>
              <td className="px-3 py-3">
                <span className="flex items-center gap-2 text-ms-body">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: DOT[app.side] }} aria-hidden="true" />
                  {SIDE_LABEL[app.side]}
                </span>
              </td>
              <td className="max-w-[14rem] truncate px-3 py-3 text-ms-body">{orDash(app.org)}</td>
              <td className="max-w-[10rem] truncate px-3 py-3 text-ms-body">{orDash(app.chapter)}</td>
              <td className="px-3 py-3">
                <StatusPill status={app.status} side={app.side} />
              </td>
              <td className="py-3 pr-6 pl-3 text-right text-ms-body tabular-nums">{shortDay(app.submittedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="md:hidden">
        {rows.map((app) => (
          <li key={app.id} className="border-b border-ms-mist last:border-b-0">
            <button
              type="button"
              onClick={() => onOpen(app.id)}
              className="flex w-full cursor-pointer items-center gap-3 px-5 py-3.5 text-left"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: DOT[app.side] }} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ms-ink">{app.name}</span>
                <span className="block truncate text-[13px] text-ms-muted">
                  {[app.org, app.chapter, shortDay(app.submittedAt)].filter(Boolean).join(" · ")}
                </span>
              </span>
              <StatusPill status={app.status} side={app.side} />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
