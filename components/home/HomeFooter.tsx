import Image from "next/image";
import Link from "next/link";
import { DISCORD_INVITE_URL, einLine } from "@/lib/org";

/** Moonshot's footer: small, quiet, everything on two lines. */

const LINKS = [
  { label: "Internship feed", href: "/internships" },
  { label: "Articles", href: "/articles" },
  // Straight to both founders' inboxes rather than a form.
  { label: "Contact", href: "mailto:matthew@axiompathways.org,frank@axiompathways.org" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/axiompathways/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/axiom-pathways/" },
  { label: "Discord", href: DISCORD_INVITE_URL },
] as const;

export function HomeFooter() {
  const ein = einLine();
  return (
    <footer className="bg-white px-5 pt-6 pb-10 sm:px-[6.5%] sm:pt-10 sm:pb-12">
      <div className="mx-auto flex w-full max-w-[90rem] flex-wrap items-center justify-between gap-4 border-t border-ms-ink/10 pt-6 sm:gap-6 sm:pt-10">
        <Link href="/" className="flex items-center gap-2" aria-label="Axiom home">
          <Image src="/axiom-mark-256.png" alt="" width={256} height={256} className="h-7 w-7 object-contain" />
          <span className="text-[20px] font-semibold tracking-[-0.04em] text-ms-ink">axiom</span>
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13.5px] font-medium text-ms-body sm:gap-x-7 sm:gap-y-2 sm:text-[15px]">
          {LINKS.map((link) =>
            link.href.startsWith("mailto:") ? (
              <a key={link.href} href={link.href} className="transition-colors hover:text-ms-ink">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-ms-ink">
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>
      <div className="mx-auto mt-4 flex w-full max-w-[90rem] flex-wrap items-center justify-between gap-3 text-[12.5px] text-ms-muted sm:mt-6 sm:gap-4 sm:text-[14px]">
        <p>
          © 2026 Axiom Pathways{ein ? ` · ${ein}` : ""} · A nonprofit placing students into real startup work.
        </p>
        <div className="flex gap-5">
          {SOCIAL.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ms-ink"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
