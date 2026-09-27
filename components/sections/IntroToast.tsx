"use client";

import { useEffect, useState } from "react";

/**
 * The little "intro sent to …" pill under 04. It walks the roster one name at
 * a time. The first name is rendered on the server so the pill is never empty,
 * and with reduced motion it simply stays on that name.
 */
export function IntroToast({ names }: { names: readonly string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (names.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % names.length),
      2600,
    );
    return () => window.clearInterval(timer);
  }, [names.length]);

  const name = names[index] ?? "";

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white py-1 pr-3 pl-1 shadow-[0_0_0_1px_var(--color-border-faint),0_4px_12px_-6px_rgba(4,36,16,0.12)]">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] font-semibold text-white">
        {name[0]}
      </span>
      <span key={name} className="ax-toast-in text-[13px] text-loud">
        intro sent to {name.toLowerCase()}
      </span>
    </span>
  );
}
