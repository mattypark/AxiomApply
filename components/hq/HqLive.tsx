"use client";

import { useMemo } from "react";
import { HqDashboard } from "@/components/hq/HqDashboard";
import { liveHqClient } from "@/components/hq/liveClient";

/** HQ on real data. The page has already checked both locks before this renders. */
export function HqLive({ code, viewer }: { code: string; viewer: string }) {
  const client = useMemo(() => liveHqClient(code), [code]);
  // The secret never goes on screen: screenshots and shared screens are how it would leak.
  return <HqDashboard client={client} where={`/hq/•••• · signed in as ${viewer}`} />;
}
