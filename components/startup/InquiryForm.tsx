"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryResult } from "@/lib/actions/inquiries";
import { GlassInput, GlassTextarea } from "@/components/glass/GlassInput";
import { GlassButton } from "@/components/glass/GlassButton";

export function InquiryForm({
  defaultEmail,
  compact = false,
}: {
  defaultEmail?: string;
  compact?: boolean;
}) {
  const [result, action, pending] = useActionState<InquiryResult | null, FormData>(
    submitInquiry,
    null,
  );

  if (result?.ok) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-lg text-white shadow-[0_8px_24px_rgba(47,107,61,0.35)]">
          ✓
        </span>
        <p className="font-medium text-ink">Got it — we&apos;ll reach out fast.</p>
        <p className="max-w-[36ch] text-[0.88rem] text-muted">
          Usually same-day. Watch your inbox.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <GlassInput name="company" placeholder="Startup name" required />
        <GlassInput name="name" placeholder="Your name" required />
      </div>
      <GlassInput
        name="email"
        type="email"
        placeholder="you@startup.com"
        defaultValue={defaultEmail}
        required
      />
      <GlassInput
        name="role_interest"
        placeholder="Role you need (e.g. growth intern, AI engineer)"
      />
      {!compact && (
        <GlassTextarea
          name="message"
          placeholder="What are you building, and what should they ship first?"
        />
      )}
      <GlassButton tone="forest" type="submit" disabled={pending} className="self-start">
        {pending ? "Sending…" : "Send →"}
      </GlassButton>
      {result?.error && <p className="text-[0.85rem] text-error">{result.error}</p>}
    </form>
  );
}
