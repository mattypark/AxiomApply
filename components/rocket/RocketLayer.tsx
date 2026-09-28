"use client";

import dynamic from "next/dynamic";

/**
 * Client-only mount point for the rocket. three is a large library and a
 * WebGL canvas has nothing to render on the server, so the scene and its
 * dependency arrive as their own chunk after the page is already interactive.
 */
const RocketScene = dynamic(() => import("@/components/rocket/RocketScene"), {
  ssr: false,
});

export function RocketLayer() {
  return <RocketScene />;
}
