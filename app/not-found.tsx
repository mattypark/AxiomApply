import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center px-5 text-center">
      <GlassPanel specular className="flex flex-col items-center gap-4 p-10">
        <span className="font-mono text-[0.7rem] tracking-[0.22em] text-muted uppercase">
          404
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          This page didn&apos;t ship.
        </h1>
        <p className="max-w-[36ch] text-[0.95rem] leading-relaxed text-muted">
          The link is old or the page moved. Everything worth finding is one
          tap away.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-forest px-6 py-3 text-[0.9rem] font-medium text-white shadow-[0_8px_24px_rgba(47,107,61,0.3)] transition-transform duration-300 hover:-translate-y-0.5"
        >
          ← Back to Axiom
        </Link>
      </GlassPanel>
    </main>
  );
}
