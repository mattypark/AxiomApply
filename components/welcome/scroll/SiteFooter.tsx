import Link from "next/link";
import { DotsField } from "@/components/welcome/scroll/DotsField";
import { DISCORD_INVITE_URL, einLine } from "@/lib/org";

/**
 * The closing section.
 *
 * Ends the page on the one thing worth saying: a gradient line, the two ways
 * in, then a thin bar carrying the mark, the links and the socials. The dot
 * field sits behind it all as texture.
 *
 * Light, on the same paper as the rest of the site — the page never goes dark,
 * so the footer should not either. The gradient runs strictly left to right
 * through the brand's greens, dark to bright, so it reads as one sweep rather
 * than a colour wash.
 */

const FOOTER_LINKS = [
  { label: "Internships", href: "/about/internships" },
  { label: "Learn", href: "/about/learn" },
  { label: "For startups", href: "/for-startups" },
  { label: "Contact", href: "/contact" },
] as const;

const LEGAL_LINKS = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
] as const;

const SOCIAL_LINKS = [
  {
    label: "Discord",
    href: DISCORD_INVITE_URL,
    path: "M19.3 5.34A16.1 16.1 0 0 0 15.4 4.1a11.6 11.6 0 0 0-.51 1.05 15 15 0 0 0-4.49 0A11.4 11.4 0 0 0 9.88 4.1 16 16 0 0 0 6 5.35C3.52 9.04 2.85 12.64 3.18 16.18a16.2 16.2 0 0 0 4.92 2.5c.4-.54.75-1.11 1.05-1.71a10.5 10.5 0 0 1-1.65-.8c.14-.1.28-.21.41-.32a11.6 11.6 0 0 0 9.88 0c.13.11.27.22.41.32-.53.31-1.08.58-1.66.8.3.6.65 1.17 1.05 1.71a16.1 16.1 0 0 0 4.93-2.5c.39-4.1-.68-7.67-2.82-10.84ZM9.68 14.01c-.94 0-1.72-.87-1.72-1.94s.76-1.94 1.72-1.94 1.74.87 1.72 1.94c0 1.07-.77 1.94-1.72 1.94Zm4.64 0c-.95 0-1.72-.87-1.72-1.94s.76-1.94 1.72-1.94 1.73.87 1.72 1.94c0 1.07-.76 1.94-1.72 1.94Z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/axiompathways/",
    path: "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.17.4.37 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.05 1.2-.25 1.8-.42 2.2a3.9 3.9 0 0 1-.9 1.4c-.4.4-.8.7-1.4.9-.4.17-1 .37-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.05-1.8-.25-2.2-.42a3.9 3.9 0 0 1-1.4-.9 3.9 3.9 0 0 1-.9-1.4c-.17-.4-.37-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.05-1.2.25-1.8.42-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.17 1-.37 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.07-1.1.05-1.7.24-2.1.4-.5.2-.9.44-1.3.83-.4.4-.63.8-.83 1.3-.16.4-.35 1-.4 2.1C2.6 8.5 2.6 8.9 2.6 12s0 3.5.07 4.7c.05 1.1.24 1.7.4 2.1.2.5.44.9.83 1.3.4.4.8.63 1.3.83.4.16 1 .35 2.1.4 1.2.07 1.6.07 4.7.07s3.5 0 4.7-.07c1.1-.05 1.7-.24 2.1-.4.5-.2.9-.44 1.3-.83.4-.4.63-.8.83-1.3.16-.4.35-1 .4-2.1.07-1.2.07-1.6.07-4.7s0-3.5-.07-4.7c-.05-1.1-.24-1.7-.4-2.1a3.5 3.5 0 0 0-.83-1.3 3.5 3.5 0 0 0-1.3-.83c-.4-.16-1-.35-2.1-.4C15.5 4 15.1 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Zm6.3-8.2a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/axiom-pathways/",
    path: "M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.2 8.4h3.6V21H3.2V8.4Zm5.9 0h3.45v1.72h.05c.48-.9 1.65-1.86 3.4-1.86 3.63 0 4.3 2.36 4.3 5.43V21h-3.6v-6.4c0-1.53-.03-3.5-2.15-3.5-2.15 0-2.48 1.66-2.48 3.38V21H9.1V8.4Z",
  },
] as const;

export function SiteFooter() {
  return (
    <section className="relative overflow-hidden bg-paper text-ink">
      {/* the dot field, as texture behind everything */}
      {/* Texture, not content: knocked back and masked out of the middle so
          the gradient line and the buttons sit on clean ground. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          maskImage:
            "radial-gradient(70% 55% at 50% 42%, transparent 30%, #000 78%)",
          WebkitMaskImage:
            "radial-gradient(70% 55% at 50% 42%, transparent 30%, #000 78%)",
        }}
      >
        <DotsField />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1180px] flex-col px-6 pt-28 pb-10 sm:px-10 sm:pt-40">
        {/* the line */}
        <h2 className="mx-auto max-w-[16ch] text-center font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.06] font-normal tracking-[-0.02em]">
          <span
            style={{
              backgroundImage:
                "linear-gradient(90deg, #1d4527 0%, #2f6b3d 34%, #3f8f52 67%, #6cc47f 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Your first real startup job starts here.
          </span>
        </h2>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/onboarding?side=intern"
            className="rounded-full bg-ink px-7 py-3.5 text-[0.95rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
          >
            Get started
          </Link>
          <Link
            href="/onboarding?side=startup"
            className="rounded-full bg-ink/[0.06] px-7 py-3.5 text-[0.95rem] font-medium text-muted transition-[transform,color] duration-300 hover:-translate-y-0.5 hover:text-ink"
          >
            Hire an intern
          </Link>
        </div>

        {/* the bar */}
        <div
          className="mt-24 flex flex-wrap items-center justify-between gap-6 pt-7 sm:mt-32"
          style={{ borderTop: "1px solid var(--lines)" }}
        >
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-70"
            >
              <img
                src="/axiom-mark.png"
                alt=""
                width={26}
                height={26}
                className="h-[26px] w-[26px] object-contain"
              />
              <span className="text-[0.95rem] font-semibold tracking-tight">
                Axiom
              </span>
            </Link>

            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.92rem] text-muted transition-colors duration-200 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-muted transition-colors duration-200 hover:text-ink"
              >
                <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor" aria-hidden>
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
          <div className="flex flex-wrap gap-x-5">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.82rem] text-faint transition-colors duration-200 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-[0.82rem] text-faint">
            © 2026 Axiom Pathways{einLine() ? ` · ${einLine()}` : ""} · A
            nonprofit placing students into real startup work.
          </p>
        </div>
      </div>
    </section>
  );
}
