"use client";

/**
 * PathPicker's soft track and sliding white thumb, for any small set of
 * choices (date range, side). PathPicker itself also repaints the site's
 * path colour, which a dashboard filter must not do — hence a sibling, not
 * a reuse.
 */
export function Track<T extends string>({
  label,
  value,
  options,
  onChange,
  dots,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  dots?: Partial<Record<T, string>>;
}) {
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="relative grid rounded-full bg-ms-mist p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1 rounded-full bg-white shadow-[0_6px_18px_-8px_rgb(23_25_28_/_0.35)] transition-transform duration-500 ease-ms motion-reduce:transition-none"
        style={{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className="relative flex h-10 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-1.5 text-[14px] sm:px-3 font-medium whitespace-nowrap text-ms-ink"
        >
          {dots?.[option.value] ? (
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: dots[option.value] }} aria-hidden="true" />
          ) : null}
          {option.label}
        </button>
      ))}
    </div>
  );
}
