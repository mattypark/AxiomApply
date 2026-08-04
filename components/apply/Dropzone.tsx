"use client";

import { useRef, useState, type DragEvent } from "react";
import { MAX_FILE, type ApplyField } from "@/lib/apply-contract";

type DropzoneProps = {
  field: ApplyField;
  file: File | null;
  onFile: (file: File | null, error?: string) => void;
};

export function Dropzone({ field, file, onFile }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const take = (f: File | undefined | null) => {
    if (!f) return;
    if (f.size > MAX_FILE) {
      setError("That file's over 8MB — pick a smaller one.");
      onFile(null);
      return;
    }
    setError(null);
    onFile(f);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    take(e.dataTransfer.files?.[0]);
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl px-6 py-8 text-center transition-[background-color,box-shadow] duration-300 ${
        dragging
          ? "bg-forest/10 shadow-[0_0_0_2px_rgba(47,107,61,0.45)]"
          : "bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] hover:bg-white/55"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        name={field.name}
        accept={field.accept}
        aria-label={field.label}
        hidden
        onChange={(e) => take(e.target.files?.[0])}
      />
      <span aria-hidden className="text-xl text-forest">
        ↥
      </span>
      <span className="text-[0.9rem] font-medium text-ink">
        Click to upload or drag and drop
      </span>
      {field.hint && (
        <span className="font-mono text-[0.66rem] tracking-[0.08em] text-muted">
          {field.hint}
        </span>
      )}
      {file && !error && (
        <span className="mt-1 font-mono text-[0.72rem] text-forest-deep">
          ✓ {file.name}
        </span>
      )}
      {error && (
        <span className="mt-1 font-mono text-[0.72rem] text-error">{error}</span>
      )}
    </label>
  );
}
