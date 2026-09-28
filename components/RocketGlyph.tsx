import type { Ref } from "react";
import {
  GLYPH_BODY,
  GLYPH_FLAME,
  GLYPH_PORTHOLE,
  GLYPH_VIEWBOX,
} from "@/components/rocket-glyph";

/**
 * The flat rocket (components/rocket-glyph.ts) as an element: nose up in a
 * 60×120 box. `flameRef` lets an animation flicker the flame; `flame={false}`
 * draws it parked, engine off.
 */
export function RocketGlyph({
  flameRef,
  flame = true,
  className,
  width = 60,
  height = 120,
}: {
  flameRef?: Ref<SVGGElement>;
  flame?: boolean;
  className?: string;
  width?: number | string;
  height?: number | string;
}) {
  return (
    <svg
      viewBox={GLYPH_VIEWBOX}
      width={width}
      height={height}
      overflow="visible"
      aria-hidden="true"
      className={className}
    >
      <g ref={flameRef} style={{ opacity: flame ? 1 : 0 }}>
        {GLYPH_FLAME.map((part) => (
          <path key={part.d} d={part.d} style={{ fill: part.fill }} opacity={part.opacity} />
        ))}
      </g>
      {GLYPH_BODY.slice(0, 5).map((part) => (
        <path key={part.d} d={part.d} style={{ fill: part.fill }} />
      ))}
      <circle
        cx={GLYPH_PORTHOLE.cx}
        cy={GLYPH_PORTHOLE.cy}
        r={GLYPH_PORTHOLE.r}
        fill={GLYPH_PORTHOLE.fill}
        stroke={GLYPH_PORTHOLE.stroke}
        strokeWidth={GLYPH_PORTHOLE.strokeWidth}
      />
      <path d={GLYPH_BODY[5].d} style={{ fill: GLYPH_BODY[5].fill }} />
    </svg>
  );
}
