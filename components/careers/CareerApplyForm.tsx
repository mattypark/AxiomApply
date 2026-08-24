"use client";

import { useActionState } from "react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassInput, GlassTextarea } from "@/components/glass/GlassInput";
import { GlassPanel } from "@/components/glass/GlassPanel";
import {
  submitCareerApplication,
  type CareerResult,
} from "@/lib/actions/careers";

/**
 * Applying to work at Axiom.
 *
 * One screen, not the multi-step flow the intern application uses — that form
 * is frozen against a Sheet contract and is asking a very different set of
 * questions. This one is short on purpose: the links field is the real filter,
 * so nothing above it should cost enough effort to stop someone reaching it.
 */
export function CareerApplyForm({
  roleSlug,
  roleTitle,
}: {
  roleSlug: string;
  roleTitle: string;
}) {
  const [result, action, pending] = useActionState<CareerResult | null, FormData>(
    submitCareerApplication,
    null,
  );

  if (result?.ok) {
    return (
      <GlassPanel className="flex flex-col items-center gap-2 px-7 py-12 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-lg text-white shadow-[0_8px_24px_rgba(47,107,61,0.35)]">
          ✓
        </span>
        <p className="font-medium text-ink">
          In. We read every one of these ourselves.
        </p>
        <p className="max-w-[38ch] text-[0.88rem] text-muted">
          If it is a fit you will hear from a founder within a week — and if it
          is not, you will still hear back.
        </p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="p-6 sm:p-8">
      <form action={action} className="flex flex-col gap-3">
        {/* The role travels with the submission; the action re-checks it
            against lib/careers.ts rather than trusting the post. */}
        <input type="hidden" name="role_slug" value={roleSlug} />

        <div className="grid gap-3 sm:grid-cols-2">
          <GlassInput name="name" placeholder="Your name" autoComplete="name" required />
          <GlassInput
            name="email"
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <GlassInput name="phone" type="tel" placeholder="Phone (optional)" autoComplete="tel" />
          <GlassInput name="location" placeholder="School / city" />
        </div>

        <GlassInput
          name="links"
          placeholder="Links — GitHub, portfolio, the thing you shipped"
          required
        />

        <GlassTextarea
          name="shipped"
          placeholder="What did you build, and what part was yours?"
        />

        <GlassTextarea
          name="why"
          placeholder={`Why this role, and what would you own first as ${roleTitle}?`}
          required
        />

        <GlassInput
          name="availability"
          placeholder="Hours a week, and when you could start"
        />

        <GlassButton
          tone="forest"
          type="submit"
          disabled={pending}
          className="mt-1 self-start"
        >
          {pending ? "Sending…" : "Send application →"}
        </GlassButton>

        {result?.error && (
          <p className="text-[0.85rem] text-error">{result.error}</p>
        )}
      </form>
    </GlassPanel>
  );
}
