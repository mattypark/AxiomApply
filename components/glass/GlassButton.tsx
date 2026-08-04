import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Common = {
  children: ReactNode;
  /** forest = filled accent, glass = translucent, ghost = text only */
  tone?: "forest" | "glass" | "ghost" | "night";
  className?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "px-6 py-3 text-[0.95rem] transition-[transform,box-shadow,background-color,color] " +
  "duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] cursor-pointer";

const tones: Record<NonNullable<Common["tone"]>, string> = {
  forest:
    "bg-forest text-white shadow-[0_10px_30px_rgba(47,107,61,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] " +
    "hover:bg-forest-deep hover:-translate-y-0.5",
  glass:
    "glass text-ink hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]",
  ghost: "text-muted hover:text-ink",
  night:
    "bg-night-text text-night shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] " +
    "hover:-translate-y-0.5 hover:bg-white",
};

export function GlassButton({
  children,
  tone = "glass",
  className = "",
  href,
  ...rest
}: Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: string }) {
  const cls = `${base} ${tones[tone]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button {...rest} className={cls}>
      {children}
    </button>
  );
}
