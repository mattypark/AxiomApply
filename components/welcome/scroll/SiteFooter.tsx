import Image from "next/image";
import Link from "next/link";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { DISCORD_INVITE_URL, einLine } from "@/lib/org";

/**
 * The closing band and footer, klinn's ending.
 *
 * One inset card that surfaces out of the page as a pale green, deepens
 * through the brand green behind the last ask and the footer, and goes almost
 * black at the foot, where an oversized wordmark bleeds off the bottom edge.
 * It is the hero's sky run backwards, so the page opens and closes on the same
 * light.
 *
 * Column labels are in the display serif's italic, the one place the footer
 * uses it — klinn does the same, and it is what keeps the footer from reading
 * as a sitemap.
 */

const EXPLORE = [
  { label: "how it works", href: "/#how-it-works" },
  { label: "what you get", href: "/#what-you-get" },
  { label: "faq", href: "/#faq" },
  { label: "internship feed", href: "/internships" },
  { label: "for startups", href: "/for-startups" },
] as const;

const CONNECT = [
  { label: "say hello", href: "/contact", external: false },
  { label: "discord", href: DISCORD_INVITE_URL, external: true },
  { label: "instagram", href: "https://www.instagram.com/axiompathways/", external: true },
  { label: "linkedin", href: "https://www.linkedin.com/company/axiom-pathways/", external: true },
] as const;

const LEGAL = [
  { label: "terms", href: "/terms" },
  { label: "privacy", href: "/privacy" },
  { label: "cookies", href: "/cookies" },
] as const;

function Column({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <p className="font-display text-[14px] text-white/60 italic">{title}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-white transition-opacity duration-200 hover:opacity-75"
              >
                {link.label} <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-[13px] text-white transition-opacity duration-200 hover:opacity-75"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const ein = einLine();

  return (
    <footer
      className="relative mt-16 overflow-hidden"
      style={{ marginInline: "var(--hero-inset)", marginBottom: "var(--hero-inset)" }}
    >
      <div
        className="relative overflow-hidden rounded-b-[var(--radius-hero)] pt-40 sm:pt-56"
        style={{
          background:
            "linear-gradient(180deg, rgb(247 249 248 / 0) 0%, #d6f2de 5%, #7fcf95 10%, #2a9447 16%, #1b7a3a 30%, #13692f 60%, #0a4a24 78%, #000a04 100%)",
        }}
      >
        <ClosingCta />

        <div className="mx-auto mt-28 grid w-full max-w-[49.5rem] gap-12 px-6 sm:mt-40 sm:grid-cols-[1fr_auto_auto] sm:gap-20">
          <div>
            <Link href="/" className="flex items-center gap-2" aria-label="Axiom home">
              <Image
                src="/axiom-mark-256.png"
                alt=""
                width={256}
                height={256}
                className="h-7 w-7 object-contain brightness-0 invert"
              />
              <span className="text-[22px] font-semibold tracking-[-0.03em] text-white">
                axiom
              </span>
            </Link>
            <p className="mt-4 text-[13px] leading-[18px] text-white/80">
              one application. real introductions.
              <br />
              your next chapter starts here.
            </p>
          </div>
          <Column title="explore" links={EXPLORE} />
          <Column title="connect" links={CONNECT} />
        </div>

        <div className="mx-auto mt-16 flex w-full max-w-[49.5rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 text-[12px] text-white/70">
          <p>
            © 2026 axiom pathways{ein ? ` · ${ein}` : ""}
          </p>
          <div className="flex gap-5">
            {LEGAL.map((link) => (
              <Link key={link.href} href={link.href} className="transition-opacity hover:opacity-75">
                {link.label}
              </Link>
            ))}
            <span>free for everyone</span>
          </div>
        </div>

        {/* The wordmark. Sized to the container and pushed a fifth of its own
            height past the bottom edge so it reads as cut off by the card. */}
        <div
          aria-hidden="true"
          className="mx-auto mt-16 flex w-full max-w-[49.5rem] items-end gap-[3%] px-6 select-none"
        >
          <Image
            src="/axiom-mark-256.png"
            alt=""
            width={256}
            height={256}
            className="w-[27%] translate-y-[12%] object-contain opacity-90 brightness-0 invert"
          />
          <span className="translate-y-[20%] text-[clamp(4.5rem,21vw,12.5rem)] leading-[0.8] font-semibold tracking-[-0.06em] text-[#e6eee8]">
            axiom
          </span>
        </div>
      </div>
    </footer>
  );
}
