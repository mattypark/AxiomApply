"use client";

import { useState } from "react";

/**
 * Company mark for a listing.
 *
 * The icon is fetched from the employer's OWN domain (derived from the listing
 * URL), never from a third-party logo or favicon service — these pages are read
 * by minors and a shared logo CDN would see every one of their requests.
 *
 * Anything that fails to load falls back to a monogram tile tinted with the
 * season colour, so a card never renders a broken image.
 */
export function CompanyLogo({
  company,
  url,
}: {
  company: string;
  url: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const src = faviconFor(url);

  const initials = company
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  if (!src || failed) {
    return (
      <span className="logo-tile" aria-hidden="true">
        {initials || "•"}
      </span>
    );
  }

  return (
    // Not next/image: these are arbitrary third-party hosts, so the optimizer
    // would need every employer domain allowlisted in next.config.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={44}
      height={44}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-11 w-11 flex-shrink-0 rounded-xl bg-white/70 object-contain p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
    />
  );
}

/** `https://amazon.jobs/en/jobs/123` → `https://amazon.jobs/favicon.ico` */
function faviconFor(url: string | null): string | null {
  if (!url) return null;
  try {
    const { protocol, host } = new URL(url);
    if (protocol !== "https:" && protocol !== "http:") return null;
    return `https://${host}/favicon.ico`;
  } catch {
    return null;
  }
}
