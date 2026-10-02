import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * HQ's frame: the welcome page's mark and wordmark, the `.ms` type system,
 * a plain white ground (tables read better on white). Nothing public links
 * here; from here, the other admin tools are one click away (they sit behind
 * the same admin gate).
 */
const ADMIN_LINKS = [
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/applications", label: "Decisions desk" },
] as const;

/** HQ's own pages, reachable only with the code already in the URL. */
const HQ_TABS = [
  { key: "applications", label: "Applications", path: "" },
  { key: "outreach", label: "YC outreach", path: "/outreach" },
] as const;

export function HqFrame({
  children,
  code,
  current,
}: {
  children: ReactNode;
  /** The HQ code from the URL; with it, the frame shows HQ's tabs. */
  code?: string;
  current?: (typeof HQ_TABS)[number]["key"];
}) {
  const base = code ? `/hq/${encodeURIComponent(code)}` : null;
  return (
    <div className="ms flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between gap-3 px-4 sm:h-20 sm:px-[6.5%]">
        <span className="flex shrink-0 items-center gap-2">
          <Image src="/axiom-mark-256.png" alt="" width={256} height={256} className="h-8 w-8 object-contain" />
          <span className="hidden text-[22px] font-semibold tracking-[-0.04em] text-ms-ink sm:inline">axiom</span>
          <span className="ml-1 rounded-full bg-ms-mist px-2.5 py-1 text-[12px] font-medium text-ms-body">HQ</span>
          {base && (
            <nav aria-label="HQ" className="ml-2 hidden items-center gap-1 sm:flex">
              {HQ_TABS.map((tab) => (
                <Link
                  key={tab.key}
                  href={`${base}${tab.path}`}
                  aria-current={current === tab.key ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 text-[14px] font-medium transition-colors ${
                    current === tab.key ? "bg-ms-ink text-white" : "text-ms-body hover:bg-ms-mist hover:text-ms-ink"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          )}
        </span>
        <nav aria-label="Admin tools" className="flex items-center gap-1 rounded-full bg-ms-mist p-1">
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-[13px] font-medium text-ms-body transition-colors hover:bg-white hover:text-ms-ink sm:px-4 sm:text-[14px]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      {base && (
        <nav aria-label="HQ" className="mx-4 mb-2 flex gap-1 sm:hidden">
          {HQ_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`${base}${tab.path}`}
              aria-current={current === tab.key ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${current === tab.key ? "bg-ms-ink text-white" : "bg-ms-mist text-ms-body"}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}
