import { DISCORD_INVITE_URL } from "@/lib/org";

/**
 * Section 11 — the community invite, between the FAQs and the footer.
 *
 * Deliberately quieter than the sections above it: someone reaching this far
 * has already read the pitch, so this is one line, three concrete reasons, and
 * a button. Built in Tailwind against the shared tokens rather than
 * scroll-sections.css, matching the footer it sits directly above.
 */

const REASONS = [
  {
    title: "New listings first",
    body: "Roles from the feed get posted as they land, before the weekly digest goes out.",
  },
  {
    title: "Application help",
    body: "Ask what makes an application strong and get an answer from someone who reads them.",
  },
  {
    title: "The other interns",
    body: "The people already placed are in there. Ask them what the work is actually like.",
  },
] as const;

export function DiscordSection() {
  return (
    <section className="relative bg-paper text-ink">
      <div className="mx-auto w-full max-w-[1180px] px-6 py-24 sm:px-10 sm:py-32">
        <div
          className="rounded-[1.5rem] px-7 py-12 sm:px-14 sm:py-16"
          style={{ border: "1px solid var(--lines)" }}
        >
          <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[34rem]">
              <div className="flex items-center gap-3">
                <DiscordMark />
                <p className="font-mono text-[0.66rem] tracking-[0.2em] text-muted uppercase">
                  Community
                </p>
              </div>

              <h2 className="mt-5 font-display text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.06] font-normal tracking-[-0.02em]">
                Join the Discord for updates.
              </h2>

              <p className="mt-4 text-[1rem] leading-relaxed text-muted">
                Where new roles, application deadlines and everything else gets
                announced first. Free, open to everyone, no application needed.
              </p>

              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 text-[0.95rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
              >
                <DiscordMark className="h-[18px] w-[18px]" />
                Join the Discord
              </a>
            </div>

            <ul className="grid w-full gap-6 sm:grid-cols-3 lg:max-w-[30rem]">
              {REASONS.map((reason) => (
                <li key={reason.title}>
                  <p className="text-[0.95rem] font-semibold tracking-tight">
                    {reason.title}
                  </p>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
                    {reason.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DiscordMark({ className = "h-[22px] w-[22px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.3 5.34A16.1 16.1 0 0 0 15.4 4.1a11.6 11.6 0 0 0-.51 1.05 15 15 0 0 0-4.49 0A11.4 11.4 0 0 0 9.88 4.1 16 16 0 0 0 6 5.35C3.52 9.04 2.85 12.64 3.18 16.18a16.2 16.2 0 0 0 4.92 2.5c.4-.54.75-1.11 1.05-1.71a10.5 10.5 0 0 1-1.65-.8c.14-.1.28-.21.41-.32a11.6 11.6 0 0 0 9.88 0c.13.11.27.22.41.32-.53.31-1.08.58-1.66.8.3.6.65 1.17 1.05 1.71a16.1 16.1 0 0 0 4.93-2.5c.39-4.1-.68-7.67-2.82-10.84ZM9.68 14.01c-.94 0-1.72-.87-1.72-1.94s.76-1.94 1.72-1.94 1.74.87 1.72 1.94c0 1.07-.77 1.94-1.72 1.94Zm4.64 0c-.95 0-1.72-.87-1.72-1.94s.76-1.94 1.72-1.94 1.73.87 1.72 1.94c0 1.07-.76 1.94-1.72 1.94Z" />
    </svg>
  );
}
