import Image from "next/image";
import Link from "next/link";
import { DISCORD_INVITE_URL, einLine } from "@/lib/org";

/** Moonshot's footer: small, quiet, everything on two lines. */

const LINKS = [
  { label: "Internship feed", href: "/internships" },
  { label: "For startups", href: "/for-startups" },
  { label: "Contact", href: "/contact" },
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
    <footer className="bg-white px-6 pt-10 pb-12 sm:px-[6.5%]">
      <div className="mx-auto flex w-full max-w-[90rem] flex-wrap items-center justify-between gap-6 border-t border-ms-ink/10 pt-10">
        <Link href="/" className="flex items-center gap-2" aria-label="Axiom home">
          <Image src="/axiom-mark-256.png" alt="" width={256} height={256} className="h-7 w-7 object-contain" />
          <span className="text-[20px] font-semibold tracking-[-0.04em] text-ms-ink">axiom</span>
        </Link>
        <nav className="flex flex-wrap gap-x-7 gap-y-2 text-[15px] font-medium text-ms-body">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-ms-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto mt-6 flex w-full max-w-[90rem] flex-wrap items-center justify-between gap-4 text-[14px] text-ms-muted">
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
