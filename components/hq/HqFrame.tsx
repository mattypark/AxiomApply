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

export function HqFrame({ children }: { children: ReactNode }) {
  return (
    <div className="ms flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between gap-3 px-4 sm:h-20 sm:px-[6.5%]">
        <span className="flex shrink-0 items-center gap-2">
          <Image src="/axiom-mark-256.png" alt="" width={256} height={256} className="h-8 w-8 object-contain" />
          <span className="hidden text-[22px] font-semibold tracking-[-0.04em] text-ms-ink sm:inline">axiom</span>
          <span className="ml-1 rounded-full bg-ms-mist px-2.5 py-1 text-[12px] font-medium text-ms-body">HQ</span>
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
      <div className="flex-1">{children}</div>
    </div>
  );
}
