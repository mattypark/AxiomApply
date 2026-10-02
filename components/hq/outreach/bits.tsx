"use client";

import type { ReactNode } from "react";
import { initials, raiseOf, safeUrl } from "@/lib/data/outreach/logic";
import { OUTREACH_STATUSES, STATUS_LABEL, type EmailSource, type OutreachRow, type OutreachStatus } from "@/lib/data/outreach/types";

/** Small shared pieces of the outreach desk: icons, logo, pills, the status select. */

const PATHS: Record<string, ReactNode> = {
  site: (
    <>
      <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.5 10h15M10 2.5c2.2 2.3 2.2 12.7 0 15M10 2.5c-2.2 2.3-2.2 12.7 0 15" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  linkedin: <path fill="currentColor" d="M4.2 7.2h2.6V16H4.2zM5.5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM8.6 7.2h2.5v1.2c.4-.7 1.3-1.4 2.6-1.4 2.8 0 3.3 1.8 3.3 4.2V16h-2.6v-4.2c0-1 0-2.3-1.4-2.3s-1.7 1.1-1.7 2.2V16H8.6z" />,
  x: <path fill="currentColor" d="M14.6 3h2.5l-5.4 6.2L18 17h-5l-3.9-5.1L4.6 17H2.1l5.8-6.6L2 3h5.1l3.5 4.7zm-.9 12.6h1.4L6.4 4.3H4.9z" />,
  github: <path fill="currentColor" d="M10 2a8 8 0 0 0-2.5 15.6c.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.4.7 0-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-3.9 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.5 7.5 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.6 3.9.3.2.5.7.5 1.4v2.1c0 .2.1.5.6.4A8 8 0 0 0 10 2z" />,
  careers: (
    <>
      <rect x="2.5" y="6" width="15" height="10.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 6V4.5A1.5 1.5 0 0 1 8.5 3h3A1.5 1.5 0 0 1 13 4.5V6M2.5 10.5h15" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  calendar: (
    <>
      <rect x="2.5" y="4" width="15" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.5 8h15M6.5 2.5v3M13.5 2.5v3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  yc: (
    <>
      <rect x="2" y="2" width="16" height="16" rx="3" fill="#f26522" />
      <path d="M6.5 5.5 10 11v4M13.5 5.5 10 11" stroke="#fff" strokeWidth="1.7" fill="none" />
    </>
  ),
  copy: (
    <>
      <rect x="6.5" y="6.5" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.5 6.5V5A1.5 1.5 0 0 0 12 3.5H5A1.5 1.5 0 0 0 3.5 5v7A1.5 1.5 0 0 0 5 13.5h1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
};

export function Icon({ name, className = "h-[15px] w-[15px]" }: { name: keyof typeof PATHS; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

export const LINK_LABEL = { site: "Website", linkedin: "LinkedIn", x: "X", github: "GitHub", careers: "Careers", calendar: "Book a call", yc: "YC profile" } as const;
export type LinkKey = keyof typeof LINK_LABEL;

export function linksOf(row: OutreachRow): { key: LinkKey; url: string }[] {
  const { company } = row;
  const raw: Record<LinkKey, string | null> = {
    site: company.website,
    linkedin: company.links.linkedin,
    x: company.links.x,
    github: company.links.github,
    careers: company.links.careers,
    calendar: company.links.calendar,
    yc: company.ycUrl,
  };
  return (Object.keys(raw) as LinkKey[]).flatMap((key) => {
    const url = safeUrl(raw[key]);
    return url ? [{ key, url }] : [];
  });
}

export function IconLink({ name, url, label }: { name: LinkKey; url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={LINK_LABEL[name]}
      aria-label={label}
      onClick={(event) => event.stopPropagation()}
      className="inline-grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ms-muted transition-colors hover:bg-ms-mist hover:text-ms-ink"
    >
      <Icon name={name} />
    </a>
  );
}

export function Logo({ row, size = 40 }: { row: OutreachRow; size?: number }) {
  const src = safeUrl(row.company.logoUrl);
  const box = { width: size, height: size };
  if (!src) {
    return (
      <span style={box} className="grid shrink-0 place-items-center rounded-xl bg-ms-sky-soft text-[13px] font-semibold text-ms-green" aria-hidden="true">
        {initials(row.company.name)}
      </span>
    );
  }
  // Plain img: logos come from YC's public image host, not something next/image is configured for.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" style={box} className="shrink-0 rounded-xl border border-ms-mist bg-white object-contain" />;
}

export function Initials({ name, size = 26 }: { name: string; size?: number }) {
  return (
    <span style={{ width: size, height: size }} className="grid shrink-0 place-items-center rounded-full bg-ms-mist text-[11px] font-semibold text-ms-muted" aria-hidden="true">
      {initials(name)}
    </span>
  );
}

const SOURCE_TONE: Record<EmailSource, string> = {
  found: "bg-ms-sky text-ms-green",
  inbox: "bg-[#e5ecf9] text-[#2c4a94]",
  guess: "bg-[#fbf1dc] text-[#7a4f00]",
  manual: "bg-ms-ink text-white",
};

const SOURCE_HINT: Record<EmailSource, string> = {
  found: "Seen on the company's own site",
  inbox: "A shared inbox seen on the site",
  guess: "Pattern guess (first@domain), unverified",
  manual: "Set by hand",
};

export function SourcePill({ source }: { source: EmailSource }) {
  return (
    <span title={SOURCE_HINT[source]} className={`shrink-0 rounded-full px-2 py-px font-mono text-[10.5px] font-medium uppercase tracking-wide ${SOURCE_TONE[source]}`}>
      {source}
    </span>
  );
}

const STATUS_TONE: Partial<Record<OutreachStatus, string>> = {
  shortlist: "bg-[#e5ecf9] text-[#2c4a94] border-transparent",
  drafted: "bg-[#fbf1dc] text-[#7a4f00] border-transparent",
  approved: "bg-ms-sky text-ms-green border-transparent",
  sent: "bg-ms-sky text-ms-green border-transparent",
  replied: "bg-ms-sky text-ms-green border-transparent",
  call: "bg-ms-green text-white border-transparent",
  pass: "bg-ms-mist text-ms-muted",
};

export function StatusSelect({ row, onChange }: { row: OutreachRow; onChange: (status: OutreachStatus) => void }) {
  return (
    <select
      value={row.status}
      aria-label={`Status for ${row.company.name}`}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => onChange(event.target.value as OutreachStatus)}
      className={`h-8 min-w-[7.5rem] cursor-pointer rounded-full border border-ms-mist px-3 text-[13px] font-medium ${STATUS_TONE[row.status] ?? "bg-white text-ms-body"}`}
    >
      {OUTREACH_STATUSES.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABEL[status]}
        </option>
      ))}
    </select>
  );
}

export function Raised({ row }: { row: OutreachRow }) {
  const round = raiseOf(row);
  if (round) {
    return (
      <span className="flex flex-col" title={[round.sourceTitle, round.date].filter(Boolean).join(" · ")}>
        <span className="font-mono text-[14px] font-medium tabular-nums text-ms-ink">{round.amountLabel}</span>
        <span className="text-[12px] lowercase text-ms-muted">{round.round ?? "announced"}</span>
      </span>
    );
  }
  const why = row.funding?.status === "unchecked" ? "Not searched yet" : "No announced round found in a quick web search";
  return (
    <span className="flex flex-col text-ms-muted/70" title={`${why}. Every company in these batches took YC's standard $500K.`}>
      <span className="font-mono text-[14px] tabular-nums">$500K</span>
      <span className="text-[12px]">yc deal</span>
    </span>
  );
}
