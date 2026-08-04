"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const TABS = [
  { href: "/startup/home", label: "Home" },
  { href: "/startup/interns", label: "Potential interns" },
  { href: "/startup/how-to-pick", label: "How to pick" },
  { href: "/startup/demo-call", label: "Demo call" },
] as const;

/** Startup-side dock — same glass pill as the intern side, its own tabs. */
export function StartupTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Startup navigation"
      className="fixed left-1/2 z-50 -translate-x-1/2"
      style={{ bottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 0.5rem))" }}
    >
      <div className="glass glass-deep flex max-w-[calc(100vw-1.5rem)] items-center gap-0.5 overflow-x-auto rounded-full p-1 sm:gap-1 sm:p-1.5">
        {TABS.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`relative shrink-0 rounded-full px-3 py-2 text-[0.78rem] font-medium transition-colors duration-300 sm:px-5 sm:text-[0.85rem] ${
                active ? "text-white" : "text-muted hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="startup-tab-blob"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-forest shadow-[0_8px_24px_rgba(47,107,61,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]"
                />
              )}
              <span className="relative">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
