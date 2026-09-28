"use client";

import dynamic from "next/dynamic";
import type { Paint } from "@/components/product/model";
import { PATH_PAINT, usePath } from "@/lib/path-theme";

/**
 * Client-only mount for the product. three arrives as its own chunk after the
 * page is interactive; until then (and without WebGL) the box shows a soft
 * shadow where the rocket will stand, so nothing jumps when it appears.
 */
const ProductRocket = dynamic(() => import("@/components/product/ProductRocket"), {
  ssr: false,
  loading: () => null,
});

export function Product({
  className = "",
  scale,
  turn,
  paint,
  label = "the axiom rocket, turning slowly",
}: {
  className?: string;
  scale?: number;
  turn?: number;
  paint?: Paint;
  label?: string;
}) {
  // Without an explicit paint the rocket wears the visitor's path colour.
  const path = usePath();
  const worn = paint ?? PATH_PAINT[path];
  return (
    <div role="img" aria-label={label} className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className="absolute bottom-[6%] left-1/2 h-[7%] w-[34%] -translate-x-1/2 rounded-[50%] bg-ms-ink/15 blur-xl"
      />
      <ProductRocket scale={scale} turn={turn} paint={worn} />
    </div>
  );
}
