"use client";

import { useSyncExternalStore } from "react";
import type { Paint } from "@/components/product/model";
import type { Side } from "@/lib/apply-sides";
import { PATH_KEY as KEY } from "@/lib/path-boot";

/**
 * The path someone picked — intern, startup or chapter — is also the site's
 * secondary colour: green, blue, or black and white. It lives on
 * `<html data-path>`, where app/globals.css re-points the colour tokens, and
 * in localStorage so the choice follows them from page to page.
 *
 * lib/path-boot.ts applies the stored path in <head> before first paint, so
 * a returning startup never sees a flash of green.
 */

const EVENT = "axiom:path";
const SIDES: readonly Side[] = ["intern", "startup", "chapter"];

/** The product rocket's paint for each path. */
export const PATH_PAINT: Record<Side, Paint> = { intern: "green", startup: "blue", chapter: "black" };

const isSide = (value: unknown): value is Side => SIDES.includes(value as Side);

export function getPath(): Side {
  if (typeof document === "undefined") return "intern";
  const current = document.documentElement.dataset.path;
  return isSide(current) ? current : "intern";
}

export function setPath(side: Side) {
  if (side === "intern") delete document.documentElement.dataset.path;
  else document.documentElement.dataset.path = side;
  try {
    localStorage.setItem(KEY, side);
  } catch {
    // Private windows can refuse storage; the colour still changes for this page.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/** The current path; re-renders when anyone picks another one. */
export function usePath(): Side {
  return useSyncExternalStore(subscribe, getPath, () => "intern");
}
