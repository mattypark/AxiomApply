"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { ApplicationStatus } from "@/lib/applications";

const TABS = [
  { href: "/home", label: "Home" },
  { href: "/internships", label: "Internships" },
  { href: "/learn", label: "Learn" },
  { href: "/articles", label: "Articles" },
  { href: "/account", label: "Account" },
] as const;

/**
 * The intern-side dock: one continuous glass pill, fixed to the bottom
 * on every screen size. The active indicator is a forest blob that
 * stretches between tabs (shared layoutId). On phones it slims down and
 * respects the home-indicator safe area.
 *
 * Apply sits first, left of Home, and changes with the user's application:
 * a call to action before they apply, a status once they have.
 */
export function TabBar({
  applicationStatus = null,
  hasChapter = false,
}: {
  applicationStatus?: ApplicationStatus | null;
  /** Adds the Chapter HQ tab — chapters are additive to being an intern. */
  hasChapter?: boolean;
}) {
  const pathname = usePathname();

  const tabs = hasChapter
    ? [...TABS, { href: "/chapter/home", label: "Chapter" } as const]
    : TABS;

  return (
    <nav
      aria-label="Intern navigation"
      className="fixed left-1/2 z-50 -translate-x-1/2"
      style={{ bottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 0.5rem))" }}
    >
      <div className="glass glass-deep flex max-w-[calc(100vw-1.5rem)] items-center gap-0.5 overflow-x-auto rounded-full p-1 sm:gap-1 sm:p-1.5">
        <ApplyTab status={applicationStatus} active={pathname.startsWith("/apply")} />

        <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-ink/10" />

        {tabs.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`relative shrink-0 rounded-full px-3 py-2 text-[0.78rem] font-medium transition-colors duration-300 sm:px-5 sm:text-[0.85rem] ${
                active ? "text-white" : "text-muted hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="tab-blob"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-forest shadow-[0_8px_24px_rgba(47,107,61,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]"
                />
              )}
              <span className="relative">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Copy + treatment for each state the Apply tab can be in. */
const APPLY_STATE: Record<
  string,
  { label: string; marks: boolean; tone: string; title: string }
> = {
  none: {
    label: "Apply",
    marks: true,
    tone: "text-forest hover:text-forest-deep",
    title: "Apply to the Axiom network",
  },
  applied: {
    label: "Pending",
    marks: false,
    tone: "text-muted",
    title: "Application submitted — we read every one, 14 days either way",
  },
  waitlist: {
    label: "Waitlist",
    marks: false,
    tone: "text-muted",
    title: "You're on the waitlist for this cycle",
  },
  accepted: {
    label: "Accepted",
    marks: true,
    tone: "text-forest hover:text-forest-deep",
    title: "You're in — check your email",
  },
  rejected: {
    label: "Apply",
    marks: true,
    tone: "text-forest hover:text-forest-deep",
    title: "Applications reopen each cycle — you can apply again",
  },
  withdrawn: {
    label: "Apply",
    marks: true,
    tone: "text-forest hover:text-forest-deep",
    title: "Apply to the Axiom network",
  },
};

function ApplyTab({
  status,
  active,
}: {
  status: ApplicationStatus | null;
  active: boolean;
}) {
  const state = APPLY_STATE[status ?? "none"] ?? APPLY_STATE.none;

  return (
    <Link
      href="/apply"
      title={state.title}
      aria-current={active ? "page" : undefined}
      className={`relative shrink-0 rounded-full px-3.5 py-2 text-[0.92rem] font-semibold transition-colors duration-300 sm:px-5 sm:text-[1rem] ${
        active ? "text-white" : state.tone
      }`}
    >
      {active && (
        <motion.span
          layoutId="tab-blob"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="absolute inset-0 rounded-full bg-forest shadow-[0_8px_24px_rgba(47,107,61,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]"
        />
      )}
      <span className="relative inline-flex items-baseline gap-[0.12em]">
        {state.marks && <Bang active={active} />}
        {state.label}
        {state.marks && <Bang active={active} />}
      </span>
    </Link>
  );
}

/** Plain bold exclamation mark, same glyph both sides — never rotated. */
function Bang({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="font-extrabold"
      style={{ color: active ? "#fff" : "var(--color-forest-bright)" }}
    >
      !
    </span>
  );
}
