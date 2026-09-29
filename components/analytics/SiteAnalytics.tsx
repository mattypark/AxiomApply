"use client";

import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";

/**
 * Vercel Analytics everywhere except HQ. HQ carries applicants' personal
 * details and its address is itself a secret, so no third-party script
 * runs there and no page view with its path is ever sent anywhere.
 */
export function SiteAnalytics() {
  const pathname = usePathname();
  if (pathname?.startsWith("/hq")) return null;
  return <Analytics />;
}
