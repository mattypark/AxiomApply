"use client";

import { useCallback, type HTMLAttributes, type PointerEvent } from "react";

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  /** Material: light cream glass (default), deeper white, or ink glass */
  variant?: "light" | "deep" | "dark";
  /** Enable the pointer-tracked specular highlight */
  specular?: boolean;
};

export function GlassPanel({
  variant = "light",
  specular = false,
  className = "",
  children,
  ...rest
}: GlassPanelProps) {
  const onPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spec-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spec-y", `${e.clientY - rect.top}px`);
  }, []);

  const material =
    variant === "dark" ? "glass-dark" : variant === "deep" ? "glass glass-deep" : "glass";

  return (
    <div
      {...rest}
      onPointerMove={specular ? onPointerMove : undefined}
      className={`${material} ${specular ? "glass-spec" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
