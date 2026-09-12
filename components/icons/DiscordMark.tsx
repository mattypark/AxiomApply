/**
 * Discord's glyph, drawn once.
 *
 * It used to live inside the welcome page's Discord band, which meant the
 * intern dashboard imported a landing-page section to get an icon. The band is
 * gone; the glyph outlives it.
 */
export function DiscordMark({ className = "h-[22px] w-[22px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.3 5.34A16.1 16.1 0 0 0 15.4 4.1a11.6 11.6 0 0 0-.51 1.05 15 15 0 0 0-4.49 0A11.4 11.4 0 0 0 9.88 4.1 16 16 0 0 0 6 5.35C3.52 9.04 2.85 12.64 3.18 16.18a16.2 16.2 0 0 0 4.92 2.5c.4-.54.75-1.11 1.05-1.71a10.5 10.5 0 0 1-1.65-.8c.14-.1.28-.21.41-.32a11.6 11.6 0 0 0 9.88 0c.13.11.27.22.41.32-.53.31-1.08.58-1.66.8.3.6.65 1.17 1.05 1.71a16.1 16.1 0 0 0 4.93-2.5c.39-4.1-.68-7.67-2.82-10.84ZM9.68 14.01c-.94 0-1.72-.87-1.72-1.94s.76-1.94 1.72-1.94 1.74.87 1.72 1.94c0 1.07-.77 1.94-1.72 1.94Zm4.64 0c-.95 0-1.72-.87-1.72-1.94s.76-1.94 1.72-1.94 1.73.87 1.72 1.94c0 1.07-.76 1.94-1.72 1.94Z" />
    </svg>
  );
}
