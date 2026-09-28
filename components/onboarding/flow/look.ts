"use client";

import { createContext, useContext } from "react";

/**
 * Which clothes the flow is wearing. "full" is the welcome page's light
 * system (Hanken, soft tracks, white cards, black pills, the path colour);
 * "embedded" is the dark workspace, which keeps the look it was built with.
 *
 * QuestionFlow provides it once, so every input, card and screen can pick
 * its classes without the chrome prop being threaded through each of them.
 */
export type FlowLook = "full" | "embedded";

export const FlowLookContext = createContext<FlowLook>("embedded");

/** True on the full-page flow, the one that matches the welcome page. */
export function useFullLook() {
  return useContext(FlowLookContext) === "full";
}
