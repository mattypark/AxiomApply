import type { ReactNode } from "react";
import Link from "next/link";

export { Card, ErrorCard, Kicker, SkeletonCard } from "@/components/hq/Card";

export function PillLink({ href, children, tone = "dark" }: { href: string; children: ReactNode; tone?: "dark" | "light" }) {
  return (
    <Link
      href={href}
      className={
        tone === "dark"
          ? "ms-pill h-12 text-[15px]"
          : "inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[15px] font-medium text-ms-ink shadow-[0_0_0_1px_rgb(23_25_28_/_0.1)] transition-opacity hover:opacity-70"
      }
    >
      {children}
    </Link>
  );
}
