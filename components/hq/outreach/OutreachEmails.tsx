"use client";

import { claimsAboutMatthew, contactFor, metaLine, safeUrl, shortTitle } from "@/lib/data/outreach/logic";
import type { OutreachRow, OutreachStatus } from "@/lib/data/outreach/types";
import { Icon, IconLink, Initials, LINK_LABEL, Logo, Raised, SourcePill, StatusSelect, linksOf } from "./bits";

/**
 * Every drafted email in full, with who it's going to beside it: the company,
 * each founder and their LinkedIn, the website and the raise. Reading and
 * approving happen in one place, the way a review pass actually goes.
 */

interface EmailsProps {
  rows: readonly OutreachRow[];
  onOpen: (slug: string) => void;
  onStatus: (slug: string, status: OutreachStatus) => void;
  onCopy: (text: string) => void;
}

const PILL_KEYS = new Set(["site", "linkedin", "x", "careers", "calendar", "yc"]);

function Who({ row, onStatus }: { row: OutreachRow; onStatus: EmailsProps["onStatus"] }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Logo row={row} size={44} />
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold text-ms-ink">
            <span className="truncate">{row.company.name}</span>
            <span className="shrink-0 rounded-md bg-ms-mist px-1.5 font-mono text-[11px] font-medium text-ms-body">{row.company.batchShort}</span>
          </p>
          <p className="line-clamp-2 text-[13px] text-ms-muted">{row.company.oneLiner}</p>
        </div>
      </div>
      <div className="flex items-end gap-3">
        <Raised row={row} />
        <span className="text-[12px] text-ms-muted">{metaLine(row)}</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {row.company.founders.map((founder) => {
          const linkedin = safeUrl(founder.linkedin);
          const x = safeUrl(founder.x);
          return (
            <li key={founder.name} className="flex min-w-0 items-center gap-2">
              <Initials name={founder.name} />
              <span className="truncate font-medium text-ms-ink">
                {founder.name} <span className="text-[12px] font-normal text-ms-muted/70">{shortTitle(founder.title) || founder.title}</span>
              </span>
              <span className="ml-auto flex">
                {linkedin && <IconLink name="linkedin" url={linkedin} label={`${founder.name} on LinkedIn`} />}
                {x && <IconLink name="x" url={x} label={`${founder.name} on X`} />}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap gap-1.5">
        {linksOf(row)
          .filter((link) => PILL_KEYS.has(link.key))
          .map((link) => (
            <a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 items-center gap-1.5 rounded-full border border-ms-mist px-2.5 text-[12.5px] font-medium text-ms-body transition-colors hover:bg-ms-mist"
            >
              <Icon name={link.key} className="h-3.5 w-3.5" />
              {LINK_LABEL[link.key]}
            </a>
          ))}
      </div>
      <div>
        <StatusSelect row={row} onChange={(status) => onStatus(row.slug, status)} />
      </div>
    </div>
  );
}

function Message({ row, onOpen, onStatus, onCopy }: { row: OutreachRow } & Omit<EmailsProps, "rows">) {
  const contact = contactFor(row);
  const button = "h-9 cursor-pointer rounded-full px-4 text-[13px] font-semibold transition-transform active:scale-[0.97]";
  if (!row.draft) {
    return (
      <div className="flex flex-col items-start gap-3 text-[14px] text-ms-muted">
        <p>No draft{contact ? "" : ", no email address found"}.</p>
        <button type="button" onClick={() => onOpen(row.slug)} className={`${button} border border-ms-mist bg-white text-ms-body`}>
          Details
        </button>
      </div>
    );
  }
  const approved = row.status === "approved";
  return (
    <div className="flex max-w-[40rem] min-w-0 flex-col">
      {claimsAboutMatthew(row) && (
        <p className="mb-2 rounded-xl bg-[#fbf1dc] px-3 py-2 text-[13px] font-medium text-[#7a4f00]">The opener says something about you. Only approve it if it&apos;s true.</p>
      )}
      {contact && (
        <p className="flex min-w-0 items-center gap-3 border-b border-dashed border-ms-mist py-1.5">
          <span className="w-14 shrink-0 font-mono text-[11px] uppercase tracking-wide text-ms-muted/70">to</span>
          <span className="truncate font-mono text-[12.5px] text-ms-ink">{contact.email}</span>
          <SourcePill source={contact.source} />
        </p>
      )}
      <p className="flex min-w-0 items-center gap-3 border-b border-dashed border-ms-mist py-1.5 font-semibold text-ms-ink">
        <span className="w-14 shrink-0 font-mono text-[11px] font-normal uppercase tracking-wide text-ms-muted/70">subject</span>
        <span className="truncate">{row.draft.subject}</span>
      </p>
      <pre className="my-3 font-[inherit] text-[15px] leading-relaxed whitespace-pre-wrap text-ms-ink">{row.draft.body}</pre>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={approved}
          onClick={() => onStatus(row.slug, "approved")}
          className={`${button} ${approved ? "cursor-default bg-ms-green text-white" : "bg-ms-ink text-white hover:bg-black"}`}
        >
          {approved ? "Approved" : "Approve"}
        </button>
        <button type="button" onClick={() => onCopy(`${row.draft?.subject}\n\n${row.draft?.body}`)} className={`${button} border border-ms-mist bg-white text-ms-body hover:bg-ms-mist`}>
          Copy
        </button>
        <button type="button" onClick={() => onStatus(row.slug, "pass")} className={`${button} border border-ms-mist bg-white text-ms-body hover:bg-ms-mist`}>
          Pass
        </button>
        <button type="button" onClick={() => onOpen(row.slug)} className={`${button} border border-ms-mist bg-white text-ms-body hover:bg-ms-mist`}>
          Details
        </button>
        {row.draft.style && <span className="ml-auto font-mono text-[11px] text-ms-muted/70">{row.draft.style}</span>}
      </div>
    </div>
  );
}

export function OutreachEmails({ rows, onOpen, onStatus, onCopy }: EmailsProps) {
  return (
    <div className="border-t border-ms-mist">
      {rows.map((row) => (
        <article
          key={row.slug}
          className={`grid gap-6 border-b border-ms-mist py-6 md:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] ${
            row.status === "approved" ? "bg-gradient-to-r from-ms-sky-soft to-transparent" : ""
          } ${row.status === "pass" ? "opacity-55" : ""}`}
        >
          <Who row={row} onStatus={onStatus} />
          <Message row={row} onOpen={onOpen} onStatus={onStatus} onCopy={onCopy} />
        </article>
      ))}
    </div>
  );
}
