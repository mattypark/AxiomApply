"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

/**
 * Client-only, desktop-only mount point for the 3D object. three is a large
 * library and a WebGL canvas has nothing to render on the server, so the scene
 * arrives as its own chunk after the page is interactive — and on a phone or
 * a tablet it never arrives at all. The story section reads as plain chapters
 * there.
 */
const RocketScene = dynamic(() => import("@/components/rocket/RocketScene"), {
  ssr: false,
});

const DESKTOP = "(min-width: 1024px)";

export function RocketLayer() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP);
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return desktop ? <RocketScene /> : null;
}
