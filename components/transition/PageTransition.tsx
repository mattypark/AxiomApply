"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createLiquid, type Liquid } from "@/components/transition/liquid";

/**
 * Page transitions for the whole site: click an internal link, green liquid
 * pours up over the page, the next page loads underneath it, and it drains
 * away. The Axiom mark surfaces in the middle while the screen is covered.
 *
 * One provider in the root layout; no special link component needed. A
 * capture-phase click listener picks up every same-origin <a> — Next <Link>s
 * included — and leaves alone anything that should behave normally: new tabs,
 * modified clicks, downloads, hash jumps on the same page, and any link
 * marked `data-no-transition`. Reduced motion turns it off entirely.
 *
 * Browser back/forward is never intercepted; if one lands mid-pour, the
 * liquid simply drains.
 */

const FRONT = "#295337";
const BACK = "#1a3a27";
/** If a navigation never lands (error, same URL), the liquid drains anyway. */
const SAFETY_MS = 4500;

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
  const svgRef = useRef<SVGSVGElement>(null);
  const backRef = useRef<SVGPathElement>(null);
  const frontRef = useRef<SVGPathElement>(null);
  const liquid = useRef<Liquid | null>(null);
  const covering = useRef(false);
  const routeKey = useRef("");
  const safety = useRef<number | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [covered, setCovered] = useState(false);

  const finish = useCallback(() => {
    window.clearTimeout(safety.current);
    if (!covering.current) return;
    covering.current = false;
    setCovered(false);
    // One frame for the new page to paint under the liquid before it drains.
    requestAnimationFrame(() =>
      window.setTimeout(() => liquid.current?.drain(() => setBusy(false)), 90),
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
    if (!svgRef.current || !backRef.current || !frontRef.current) return;
    liquid.current = createLiquid(svgRef.current, backRef.current, frontRef.current);
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
      liquid.current?.fill(() => {
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
      liquid.current?.destroy();
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
        <svg ref={svgRef} className="absolute inset-0 h-full w-full" style={{ visibility: "hidden" }}>
          <path ref={backRef} fill={BACK} />
          <path ref={frontRef} fill={FRONT} />
        </svg>
        <div
          className={`absolute inset-0 grid place-items-center transition-opacity duration-300 ${
            covered ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="flex items-center gap-2.5 text-white">
            <Image
              src="/axiom-mark-256.png"
              alt=""
              width={256}
              height={256}
              className="h-9 w-9 object-contain brightness-0 invert"
            />
            <span className="text-[28px] font-semibold tracking-[-0.04em]">axiom</span>
          </span>
        </div>
      </div>
    </>
  );
}
