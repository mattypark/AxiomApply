"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SIDES } from "@/components/home/PathPicker";
import { setPath, usePath } from "@/lib/path-theme";

/**
 * "View as…" — the prototype's own switchboard, bottom-right. It lets
 * Matthew flip the path, the application's status and the empty / loading /
 * error states without a real account behind any of them.
 *
 * Choices are mirrored into the query string with replaceState (no
 * navigation, so the page transition doesn't fire on every tap) and a
 * refreshed or shared link opens on the same view.
 */

export type ControlGroup = {
  key: string;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
};

export function writeQuery(key: string, value: string | null) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  window.history.replaceState(null, "", url);
}

export function PreviewControls({ groups, withPath = true }: { groups: ControlGroup[]; withPath?: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const side = usePath();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2">
      {open ? (
        <div
          id={panelId}
          className="w-[min(20rem,calc(100vw-2rem))] rounded-[24px] bg-white p-4 shadow-[0_0_0_1px_rgb(23_25_28_/_0.06),0_24px_48px_-20px_rgb(23_25_28_/_0.35)]"
        >
          {withPath ? (
            <Segment
              label="Path"
              value={side}
              options={SIDES.map((option) => ({ value: option.side, label: option.label }))}
              onChange={(value) => {
                const match = SIDES.find((option) => option.side === value);
                if (match) setPath(match.side);
              }}
            />
          ) : null}
          {groups.map(({ key, ...group }) => (
            <Segment key={key} {...group} />
          ))}
        </div>
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-[14px] font-medium text-ms-ink shadow-[0_0_0_1px_rgb(23_25_28_/_0.08),0_10px_24px_-12px_rgb(23_25_28_/_0.4)]"
      >
        <span className="h-2 w-2 rounded-full bg-ms-green" aria-hidden="true" />
        {open ? "Close" : "View as…"}
      </button>
    </div>
  );
}

function Segment({
  label,
  value,
  options,
  onChange,
}: Omit<ControlGroup, "key">) {
  return (
    <fieldset className="mb-3 last:mb-0">
      <legend className="mb-1.5 text-[12px] font-medium text-ms-muted">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
              option.value === value ? "bg-ms-ink text-white" : "bg-ms-mist text-ms-body hover:bg-ms-sky"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
