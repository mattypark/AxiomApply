"use client";

import { useMemo } from "react";
import { OutreachDashboard } from "@/components/hq/outreach/OutreachDashboard";
import type { OutreachRow } from "@/lib/data/outreach/types";
import { memoryOutreachClient } from "./outreachClient";

export function OutreachPreview({ rows }: { rows: OutreachRow[] }) {
  const client = useMemo(() => memoryOutreachClient(rows), [rows]);
  return <OutreachDashboard client={client} where="/preview/hq/outreach · local bundle, dev only" />;
}
