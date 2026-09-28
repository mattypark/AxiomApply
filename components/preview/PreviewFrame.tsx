import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * The prototype's frame: the welcome page's header (mark + wordmark on the
 * left) with the three prototype screens on the right, the `.ms` type
 * system, and a badge that never lets anyone mistake this for the live site.
 *
 * `ground` paints the path-coloured gradient the welcome page stands on; HQ
 * leaves it off, because a table reads better on plain white.
 */

const SCREENS = [
  { key: "home", href: "/preview/after-submit/home", label: "Home" },
  { key: "application", href: "/preview/after-submit/application", label: "Application" },
  { key: "hq", href: "/preview/hq", label: "HQ" },
] as const;

export type PreviewScreen = (typeof SCREENS)[number]["key"] | "index";

export function PreviewFrame({
  current,
  ground = true,
  children,
}: {
  current: PreviewScreen;
  ground?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`ms flex min-h-dvh flex-col ${ground ? "ms-ground" : ""}`}>
      <header className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between gap-4 px-4 sm:h-20 sm:px-[6.5%]">
        <Link href="/preview/after-submit" className="flex shrink-0 items-center gap-2" aria-label="Prototype index">
          <Image src="/axiom-mark-256.png" alt="" width={256} height={256} className="h-8 w-8 object-contain" />
          <span className="hidden text-[22px] font-semibold tracking-[-0.04em] text-ms-ink sm:inline">axiom</span>
        </Link>
        <nav aria-label="Prototype screens" className="flex items-center gap-1 rounded-full bg-white/55 p-1">
          {SCREENS.map((screen) => (
            <Link
              key={screen.key}
              href={screen.href}
              aria-current={current === screen.key ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-[14px] font-medium transition-colors duration-300 sm:px-4 sm:text-[15px] ${
                current === screen.key
                  ? "bg-white text-ms-ink shadow-[0_6px_18px_-8px_rgb(23_25_28_/_0.35)]"
                  : "text-ms-body hover:text-ms-ink"
              }`}
            >
              {screen.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="flex-1">{children}</div>

      <PreviewBadge />
    </div>
  );
}

/** Pinned bottom-left on every prototype screen, clear of Next's dev indicator. */
export function PreviewBadge() {
  return (
    <p
      role="note"
      className="pointer-events-none fixed bottom-4 left-16 z-40 flex items-center gap-2 rounded-full bg-ms-ink px-3.5 py-2 text-[12px] font-medium text-white shadow-[0_10px_24px_-12px_rgb(23_25_28_/_0.6)]"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#f5c86a]" aria-hidden="true" />
      Prototype — mock data
    </p>
  );
}
