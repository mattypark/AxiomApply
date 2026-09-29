"use client";

import type { Paint } from "@/components/product/model";
import type { Side } from "@/lib/apply-sides";
import { PATH_PAINT, setPath } from "@/lib/path-theme";

/**
 * Moonshot's colour picker, used here to pick an application: three options
 * in a soft track, a white thumb that slides to the chosen one. Each side has
 * its own colour, and the product rocket wears it (see `paint`). Picking one
 * also makes it the whole site's secondary colour (lib/path-theme.ts).
 *
 * Shared by the home's apply block and the welcome page so the choice looks
 * and moves the same in both places.
 */

export const SIDES: { side: Side; label: string; dot: string; paint: Paint }[] = [
  { side: "intern", label: "Intern", dot: "#366645", paint: PATH_PAINT.intern },
  { side: "startup", label: "Startup", dot: "#4f6fc9", paint: PATH_PAINT.startup },
  { side: "chapter", label: "Chapter", dot: "#26292d", paint: PATH_PAINT.chapter },
];

export function PathPicker({
  active,
  onChange,
  label = "Choose your path",
  className = "",
  compact = false,
}: {
  active: number;
  onChange?: (index: number) => void;
  label?: string;
  className?: string;
  /** Smaller on phones (the home's apply block); full size from `sm` up. */
  compact?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`relative grid w-full max-w-[32rem] grid-cols-3 rounded-full bg-white/55 p-1.5 ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute top-1.5 bottom-1.5 left-1.5 rounded-full bg-white shadow-[0_6px_18px_-8px_rgb(23_25_28_/_0.35)] transition-transform duration-500 ease-ms"
        style={{ width: "calc((100% - 12px) / 3)", transform: `translateX(${active * 100}%)` }}
      />
      {SIDES.map((option, index) => (
        <button
          key={option.side}
          type="button"
          role="radio"
          aria-checked={index === active}
          onClick={() => {
            setPath(option.side);
            onChange?.(index);
          }}
          className={`relative flex cursor-pointer items-center justify-center rounded-full font-medium text-ms-ink ${compact ? "h-10 gap-1.5 text-[14px] sm:h-12 sm:gap-2 sm:text-[16px]" : "h-12 gap-2 text-[16px]"}`}
        >
          <span className={`rounded-full ${compact ? "h-2.5 w-2.5 sm:h-3 sm:w-3" : "h-3 w-3"}`} style={{ background: option.dot }} />
          {option.label}
        </button>
      ))}
    </div>
  );
}
