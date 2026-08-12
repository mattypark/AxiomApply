"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ApplicationStatus } from "@/lib/applications";

/**
 * Intern-side workspace rail.
 *
 * Shape follows the dashboards this product actually competes with —
 * ElevenLabs, Linear, Vercel: a persistent left rail with the primary
 * surfaces grouped at the top, saved/secondary items beneath, and account
 * state pinned to the bottom. It replaces the floating dock, which could
 * only ever hold five flat items and gave the home page nowhere to grow.
 *
 * Collapses to icons under `lg` so the dashboard grid keeps its width on
 * laptops; the mobile dock (TabBar) still handles small screens.
 */

type Item = {
  href: string;
  label: string;
  icon: string;
};

const PRIMARY: Item[] = [
  { href: "/home", label: "Home", icon: "◇" },
  { href: "/internships", label: "Internships", icon: "◈" },
  { href: "/learn", label: "Learn", icon: "▤" },
  { href: "/articles", label: "Articles", icon: "❐" },
];

const SECONDARY: Item[] = [
  { href: "/internships?saved=1", label: "Saved", icon: "★" },
  { href: "/contact", label: "Talk to founders", icon: "✦" },
];

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: "In review",
  waitlist: "Waitlisted",
  accepted: "Accepted",
  rejected: "Not this cycle",
  withdrawn: "Withdrawn",
};

export function Sidebar({
  displayName,
  email,
  avatarUrl,
  applicationStatus,
  hasChapter = false,
}: {
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  applicationStatus: ApplicationStatus | null;
  /**
   * True when this person also runs a chapter. Chapters are additive, so the
   * rail has to carry a way across to Chapter HQ — the layout fetches it,
   * because this component fetches nothing itself.
   */
  hasChapter?: boolean;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  return (
    <aside
      aria-label="Workspace"
      className="fixed inset-y-0 left-0 z-40 hidden w-[68px] flex-col justify-between border-r border-r-ink/8 bg-white/70 px-3 py-6 backdrop-blur-xl md:flex xl:w-[248px] xl:px-5"
    >
      <div>
        <Link
          href="/"
          aria-label="Axiom Pathways home"
          className="flex items-center px-1 transition-opacity duration-300 hover:opacity-70"
        >
          <Image
            src="/axiom-mark.png"
            alt="Axiom Pathways"
            width={52}
            height={52}
            className="h-11 w-11 shrink-0 object-contain"
          />
        </Link>

        <Link
          href="/apply"
          className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-forest px-3 py-3 text-white shadow-[0_8px_24px_rgba(47,107,61,0.28)] transition-transform duration-300 hover:-translate-y-0.5 xl:justify-start xl:px-4"
        >
          <span aria-hidden className="text-[0.95rem]">
            ✎
          </span>
          <span className="hidden text-[0.9rem] font-medium xl:block">
            {applicationStatus ? STATUS_LABEL[applicationStatus] : "Apply"}
          </span>
        </Link>

        <nav className="mt-7 flex flex-col gap-1">
          {PRIMARY.map((item) => (
            <RailLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </nav>

        <p className="mt-8 hidden px-3 font-mono text-[0.6rem] tracking-[0.18em] text-faint uppercase xl:block">
          Yours
        </p>
        <nav className="mt-2 flex flex-col gap-1">
          {SECONDARY.map((item) => (
            <RailLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
          {hasChapter && (
            <RailLink
              item={{ href: "/chapter/home", label: "Chapter HQ", icon: "▲" }}
              active={isActive("/chapter/home")}
            />
          )}
        </nav>
      </div>

      <Link
        href="/account"
        className="flex items-center gap-2.5 rounded-xl px-2 py-2.5 transition-colors duration-300 hover:bg-ink/[0.04]"
      >
        <span
          aria-hidden
          className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-ink text-[0.72rem] font-semibold text-white"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              fill
              sizes="32px"
              className="object-cover"
              unoptimized
            />
          ) : (
            (displayName ?? email ?? "A").trim().charAt(0).toUpperCase()
          )}
        </span>
        <span className="hidden min-w-0 flex-1 xl:block">
          <span className="block truncate text-[0.85rem] font-medium text-ink">
            {displayName ?? "Your account"}
          </span>
          <span className="block truncate text-[0.72rem] text-faint">
            {email ?? "Not signed in"}
          </span>
        </span>
      </Link>
    </aside>
  );
}

function RailLink({ item, active }: { item: Item; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={item.label}
      className={`flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-[0.9rem] transition-colors duration-300 xl:justify-start ${
        active
          ? "bg-ink/[0.06] font-medium text-ink"
          : "text-muted hover:bg-ink/[0.03] hover:text-ink"
      }`}
    >
      <span aria-hidden className="text-[0.95rem]">
        {item.icon}
      </span>
      <span className="hidden xl:block">{item.label}</span>
    </Link>
  );
}
