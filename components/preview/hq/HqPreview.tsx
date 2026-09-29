"use client";

import { useMemo, useState } from "react";
import { HqDashboard } from "@/components/hq/HqDashboard";
import { PreviewControls, writeQuery } from "@/components/preview/PreviewControls";
import { mockHqClient, type MockMode } from "@/components/preview/hq/mockClient";

/**
 * The live HQ dashboard over mock rows. The state switch builds a fresh
 * mock client, and the key remounts the dashboard so it loads from scratch,
 * the way a real reload would.
 */

const STATES: { value: MockMode; label: string }[] = [
  { value: "ready", label: "Live data" },
  { value: "empty", label: "No applications" },
  { value: "loading", label: "Loading" },
  { value: "error", label: "Error" },
];

export function HqPreview({ initialState, where }: { initialState: MockMode; where: string }) {
  const [mode, setMode] = useState<MockMode>(initialState);
  const client = useMemo(() => mockHqClient(mode), [mode]);
  return (
    <>
      <HqDashboard key={mode} client={client} where={where} />
      <PreviewControls
        groups={[
          {
            key: "state",
            label: "State",
            value: mode,
            options: STATES,
            onChange: (value) => {
              setMode(value as MockMode);
              writeQuery("state", value === "ready" ? null : value);
            },
          },
        ]}
      />
    </>
  );
}
