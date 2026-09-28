"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createLaunch, type Launch } from "@/components/transition/rocket";

/**
 * Page transitions for the whole site: click an internal link and a green
 * rocket launches, its exhaust cloud covering the page; the next page loads
 * under the smoke, and the smoke clears. The Axiom mark surfaces in the
 * middle while the screen is covered.
 *
 * One provider in the root layout; no special link component needed. A
 * capture-phase click listener picks up every same-origin <a> — Next <Link>s
 * included — and leaves alone anything that should behave normally: new tabs,
 * modified clicks, downloads, hash jumps on the same page, and any link
 * marked `data-no-transition`. Reduced motion turns it off entirely.
 *
 * Browser back/forward is never intercepted; if one lands mid-launch, the
 * smoke simply clears.
 */

/** If a navigation never lands (error, same URL), the smoke clears anyway. */
const SAFETY_MS = 4500;
/** The mark stays up at least this long, even when the next page is instant. */
const MARK_HOLD_MS = 650;

function RouteWatcher({ onRoute }: { onRoute: (key: string) => void }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const key = `${pathname}?${search.toString()}`;
  useEffect(() => {
    onRoute(key);
  }, [key, onRoute]);
  return null;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);
  const launch = useRef<Launch | null>(null);
  const covering = useRef(false);
  const routeKey = useRef("");
  const safety = useRef<number | undefined>(undefined);
  const coveredAt = useRef(0);
  const [busy, setBusy] = useState(false);
  const [covered, setCovered] = useState(false);

  const finish = useCallback(() => {
    window.clearTimeout(safety.current);
    if (!covering.current) return;
    covering.current = false;
    // One frame for the new page to paint under the smoke, and the mark its
    // moment on screen, before the smoke clears.
    const hold = Math.max(90, MARK_HOLD_MS - (performance.now() - coveredAt.current));
    requestAnimationFrame(() =>
      window.setTimeout(() => {
        setCovered(false);
        launch.current?.drain(() => setBusy(false));
      }, hold),
    );
  }, []);

  const onRoute = useCallback(
    (key: string) => {
      if (key !== routeKey.current) {
        routeKey.current = key;
        finish();
      }
    },
    [finish],
  );

  useEffect(() => {
    if (!stageRef.current) return;
    launch.current = createLaunch(stageRef.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onClick = (event: MouseEvent) => {
      if (reduce || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || anchor.hasAttribute("download") || anchor.dataset.noTransition !== undefined) return;
      if (anchor.target && anchor.target !== "_self") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const same = url.pathname === window.location.pathname && url.search === window.location.search;
      if (same) return; // a hash jump, or this page again

      event.preventDefault();
      if (covering.current) return;
      covering.current = true;
      setBusy(true);
      launch.current?.fill(() => {
        coveredAt.current = performance.now();
        setCovered(true);
        router.push(`${url.pathname}${url.search}${url.hash}`);
        safety.current = window.setTimeout(finish, SAFETY_MS);
      });
    };

    const onPop = () => finish();

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      window.clearTimeout(safety.current);
      launch.current?.destroy();
    };
  }, [router, finish]);

  return (
    <>
      {children}
      <Suspense fallback={null}>
        <RouteWatcher onRoute={onRoute} />
      </Suspense>
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[200] ${busy ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div ref={stageRef} className="absolute inset-0 overflow-hidden" style={{ visibility: "hidden" }} />
        <div
          className={`absolute inset-0 grid place-items-center transition-[opacity,transform] duration-500 ease-ms ${
            covered ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
        >
          <span className="flex items-center gap-4 text-white sm:gap-7">
            <Image
              src="/axiom-mark-256.png"
              alt=""
              width={256}
              height={256}
              // The mark's file has wide margins; scale past them so it matches the word.
              className="h-20 w-20 scale-[1.7] object-contain brightness-0 invert sm:h-32 sm:w-32"
            />
            <span className="text-[44px] font-semibold tracking-[-0.04em] sm:text-[80px]">axiom</span>
          </span>
        </div>
      </div>
    </>
  );
}
