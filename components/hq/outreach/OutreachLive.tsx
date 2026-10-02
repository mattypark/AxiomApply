"use client";

import { useMemo } from "react";
import { OutreachDashboard } from "./OutreachDashboard";
import { liveOutreachClient } from "./liveClient";

/** The outreach desk over the gated API, for a signed-in admin holding the HQ code. */
export function OutreachLive({ code }: { code: string }) {
  const client = useMemo(() => liveOutreachClient(code), [code]);
  return <OutreachDashboard client={client} where="/hq/<code>/outreach · admins only" />;
}
