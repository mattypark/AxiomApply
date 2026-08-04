"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const MAX_MB = 8;

/**
 * The centre target: "Drop in your resume."
 *
 * It does not upload from here. The apply form owns submission (and its wire
 * contract is frozen), so a dropped file is stashed in sessionStorage and the
 * user is sent straight to /apply — one gesture instead of a form field.
 */
export function ResumeDrop() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`That file is over ${MAX_MB}MB — try a smaller one.`);
      return;
    }
    setError(null);
    try {
      sessionStorage.setItem("ax_resume_name", file.name);
    } catch {
      /* private mode — the apply form just asks again */
    }
    router.push("/apply");
  };

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-3">
      <motion.button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Drop in your resume"
        className={`glass glass-deep grid h-[104px] w-[104px] place-items-center rounded-[26px] transition-[transform,box-shadow] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-hover)] sm:h-[124px] sm:w-[124px] ${
          over ? "-translate-y-1 shadow-[var(--shadow-hover)] ring-2 ring-forest/40" : ""
        }`}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted"
          aria-hidden="true"
        >
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      </motion.button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf"
        className="sr-only"
        onChange={(e) => accept(e.target.files?.[0])}
      />

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="wel-fg text-[0.9rem]"
      >
        Drop in your resume.
      </motion.p>

      {error && <p className="text-[0.8rem] text-error">{error}</p>}
    </div>
  );
}
