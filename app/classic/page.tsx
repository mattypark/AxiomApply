import Image from "next/image";
import Link from "next/link";
import { CenterReveal } from "@/components/motion/CenterReveal";

export default function ClassicLandingPage() {
  return (
    <div className="flex min-h-dvh flex-col px-5 sm:px-8">
      {/* top nav — GitHub-style: brand left, browse links, auth right */}
      <CenterReveal order={3}>
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/axiom-mark.png" alt="" width={30} height={30} priority />
            <span className="hidden font-mono text-[0.7rem] tracking-[0.22em] text-muted uppercase sm:block">
              Axiom Pathways
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/auth"
              className="rounded-full px-4 py-2 text-[0.88rem] font-medium text-ink transition-colors hover:text-forest"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="glass rounded-full px-5 py-2 text-[0.88rem] font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              Sign up
            </Link>
          </div>
        </header>
      </CenterReveal>

      {/* hero — the centre of the middle-out reveal */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-7 py-16 text-center">
        <CenterReveal order={1}>
          <Image
            src="/axiom-logo.png"
            alt="Axiom Pathways"
            width={190}
            height={58}
            priority
            className="h-auto w-[150px] sm:w-[190px]"
          />
        </CenterReveal>

        <CenterReveal order={0}>
          <h1 className="max-w-[16ch] text-balance text-[clamp(2.6rem,7vw,4.8rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink">
            Drop into a real startup.
          </h1>
        </CenterReveal>

        <CenterReveal order={1}>
          <p className="max-w-[52ch] text-pretty text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed text-muted">
            Build what ships — picked for passion, not credentials. Students
            land real internships; startups get hungry builders.
          </p>
        </CenterReveal>

        <CenterReveal order={2} className="flex w-full flex-col items-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-forest px-9 py-4 text-[1.02rem] font-medium text-white shadow-[0_10px_30px_rgba(47,107,61,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
          >
            Sign up for Axiom →
          </Link>
          <p className="text-[0.9rem] text-muted">
            Just browsing?{" "}
            <Link
              href="/home"
              className="font-medium text-forest transition-colors hover:text-forest-deep"
            >
              Explore without an account →
            </Link>
          </p>
        </CenterReveal>
      </main>

      {/* network scale — numbers only, no company names */}
      <CenterReveal order={4}>
        <section aria-label="Network scale" className="pb-4">
          <p className="kicker text-center">600+ interns · 10+ startups</p>
        </section>
      </CenterReveal>

      {/* footer */}
      <CenterReveal order={5}>
        <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 py-6 text-[0.85rem] text-muted">
          <div className="flex items-center gap-5">
            <Link href="/contact" className="transition-colors hover:text-ink">
              Contact
            </Link>
            <a
              href="https://www.linkedin.com/company/axiom-pathways"
              target="_blank"
              rel="noopener"
              className="transition-colors hover:text-ink"
            >
              LinkedIn
            </a>
            <Link href="/social" className="transition-colors hover:text-ink">
              Social media ↗
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-ink">
              Terms
            </Link>
          </div>
          <span className="font-mono text-[0.68rem] tracking-[0.18em] uppercase">
            Axiom Pathways
          </span>
        </footer>
      </CenterReveal>
    </div>
  );
}
