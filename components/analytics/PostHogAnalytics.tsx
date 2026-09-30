"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/** Same key the cookie banner writes ("all" | "essential"). */
const CONSENT_KEY = "ax_cookie_choice";
/** Fired by the cookie banner when someone picks, so no reload is needed. */
export const CONSENT_EVENT = "ax:cookie-choice";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const UI_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_REGION === "eu" ? "https://eu.posthog.com" : "https://us.posthog.com";

const isHq = (url: string | undefined) => {
  if (!url) return false;
  try {
    return new URL(url, window.location.origin).pathname.startsWith("/hq");
  } catch {
    return false;
  }
};

const consented = () => {
  try {
    return localStorage.getItem(CONSENT_KEY) === "all";
  } catch {
    return false;
  }
};

/**
 * PostHog page analytics: visitors, page views, referrers, time on page.
 *
 * Most people on Axiom are minors, so this is deliberately the narrowest
 * setup that still answers "how many people came and what did they look at":
 * - no session replay, no click autocapture, no surveys, no person profiles
 *   unless someone is explicitly identified (nobody is);
 * - nothing is stored in the browser until the visitor picks "Accept all" —
 *   before that PostHog keeps its id in memory only, like Vercel Analytics;
 * - HQ never sends anything: its path is a secret and it shows applicant data.
 *
 * Events go through /ingest (a rewrite in next.config.ts) so ad blockers
 * don't silently drop the counts. No key set → this renders nothing.
 */
export function PostHogAnalytics() {
  useEffect(() => {
    if (!KEY || posthog.__loaded) return;

    posthog.init(KEY, {
      api_host: "/ingest",
      ui_host: UI_HOST,
      capture_pageview: "history_change",
      capture_pageleave: true,
      autocapture: false,
      disable_session_recording: true,
      disable_surveys: true,
      person_profiles: "identified_only",
      persistence: consented() ? "localStorage+cookie" : "memory",
      before_send: (event) => {
        if (!event) return null;
        const url = event.properties?.$current_url as string | undefined;
        return isHq(url) ? null : event;
      },
    });

    const onChoice = (e: Event) => {
      const choice = (e as CustomEvent<string>).detail;
      posthog.set_config({ persistence: choice === "all" ? "localStorage+cookie" : "memory" });
    };
    window.addEventListener(CONSENT_EVENT, onChoice);
    return () => window.removeEventListener(CONSENT_EVENT, onChoice);
  }, []);

  return null;
}
