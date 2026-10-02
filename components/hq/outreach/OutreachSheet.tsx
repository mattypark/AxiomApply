"use client";

import { contactFor, metaLine, safeUrl, shortTitle } from "@/lib/data/outreach/logic";
import type { OutreachRow, OutreachStatus } from "@/lib/data/outreach/types";
import { IconLink, Initials, Logo, Raised, SourcePill, StatusSelect, linksOf } from "./bits";

/**
 * The spreadsheet view: one row per company on a desk, a two-line stack on a
 * phone. The company name is the real button, so keyboard users get one stop
 * per company; the rest of the row opens the drawer too.
 */

interface SheetProps {
  rows: readonly OutreachRow[];
  openSlug: string | null;
  onOpen: (slug: string) => void;
  onStatus: (slug: string, status: OutreachStatus) => void;
  onCopy: (text: string) => void;
}

function EmailCell({ row, onCopy }: { row: OutreachRow; onCopy: (text: string) => void }) {
  const contact = contactFor(row);
  if (!contact) return <span className="text-ms-muted">—</span>;
  return (
    <div className="flex w-[17rem] flex-col gap-1">
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate font-mono text-[12.5px] text-ms-ink" title={contact.email}>
          {contact.email}
        </span>
        <SourcePill source={contact.source} />
        {contact.offDomain && (
          <span title="Not on the company's current domain. Check before sending." className="shrink-0 rounded-full bg-[#fbe7e5] px-2 py-px text-[10.5px] text-[#8f2a22]">
            ≠ site
          </span>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onCopy(contact.email);
          }}
          aria-label={`Copy ${contact.email}`}
          className="shrink-0 cursor-pointer rounded-md p-1 text-ms-muted/70 hover:bg-ms-mist hover:text-ms-ink"
        >
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
            <rect x="6.5" y="6.5" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M13.5 6.5V5A1.5 1.5 0 0 0 12 3.5H5A1.5 1.5 0 0 0 3.5 5v7A1.5 1.5 0 0 0 5 13.5h1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </span>
      {row.draft && (
        <span className="flex min-w-0 items-center gap-1.5 text-[12px] text-ms-muted" title={row.draft.hook}>
          <span className="font-bold text-ms-green" aria-hidden="true">
            ✓
          </span>
          <span className="truncate">{row.draft.subject}</span>
        </span>
      )}
    </div>
  );
}

function Founders({ row }: { row: OutreachRow }) {
  if (!row.company.founders.length) return <span className="text-ms-muted">—</span>;
  return (
    <ul className="flex w-[14rem] flex-col gap-1.5">
      {row.company.founders.slice(0, 3).map((founder) => {
        const linkedin = safeUrl(founder.linkedin);
        return (
          <li key={founder.name} className="flex min-w-0 items-center gap-2">
            <Initials name={founder.name} />
            <span className="truncate font-medium text-ms-ink">{founder.name}</span>
            <span className="shrink-0 text-[12px] text-ms-muted/70">{shortTitle(founder.title)}</span>
            {linkedin && <IconLink name="linkedin" url={linkedin} label={`${founder.name} on LinkedIn`} />}
          </li>
        );
      })}
    </ul>
  );
}

function CompanyCell({ row, onOpen }: { row: OutreachRow; onOpen: (slug: string) => void }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Logo row={row} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpen(row.slug);
            }}
            className="cursor-pointer truncate text-left font-semibold text-ms-ink hover:underline"
          >
            {row.company.name}
          </button>
          <span className="shrink-0 rounded-md bg-ms-mist px-1.5 font-mono text-[11px] font-medium text-ms-body">{row.company.batchShort}</span>
        </div>
        <p className="line-clamp-2 text-[13px] text-ms-muted">{row.company.oneLiner}</p>
        <p className="truncate text-[12px] text-ms-muted/70">{metaLine(row)}</p>
      </div>
    </div>
  );
}

export function OutreachSheet({ rows, openSlug, onOpen, onStatus, onCopy }: SheetProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-[20px] border border-ms-mist md:block">
        <table className="w-full min-w-[68rem] text-left text-[14px]">
          <thead>
            <tr className="bg-ms-mist/60 text-[12px] text-ms-muted">
              <th scope="col" className="py-3 pr-3 pl-5 font-medium">Company</th>
              <th scope="col" className="px-3 py-3 font-medium">Founders</th>
              <th scope="col" className="px-3 py-3 font-medium">Email · draft</th>
              <th scope="col" className="px-3 py-3 font-medium">Raised</th>
              <th scope="col" className="px-3 py-3 font-medium">Links</th>
              <th scope="col" className="py-3 pr-5 pl-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.slug}
                onClick={() => onOpen(row.slug)}
                className={`cursor-pointer border-t border-ms-mist align-middle transition-colors hover:bg-ms-mist/40 ${openSlug === row.slug ? "bg-ms-sky-soft" : ""}`}
              >
                <td className="max-w-[20rem] py-3 pr-3 pl-5">
                  <CompanyCell row={row} onOpen={onOpen} />
                </td>
                <td className="px-3 py-3">
                  <Founders row={row} />
                </td>
                <td className="px-3 py-3">
                  <EmailCell row={row} onCopy={onCopy} />
                </td>
                <td className="px-3 py-3">
                  <Raised row={row} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex w-[7.5rem] flex-wrap gap-0.5">
                    {linksOf(row).map((link) => (
                      <IconLink key={link.key} name={link.key} url={link.url} label={`${row.company.name} ${link.key}`} />
                    ))}
                  </div>
                </td>
                <td className="py-3 pr-5 pl-3">
                  <StatusSelect row={row} onChange={(status) => onStatus(row.slug, status)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden">
        {rows.map((row) => (
          <li key={row.slug} onClick={() => onOpen(row.slug)} className="flex cursor-pointer flex-col gap-2 border-b border-ms-mist py-4">
            <CompanyCell row={row} onOpen={onOpen} />
            <EmailCell row={row} onCopy={onCopy} />
            <div className="flex items-center justify-between gap-2">
              <Raised row={row} />
              <StatusSelect row={row} onChange={(status) => onStatus(row.slug, status)} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
