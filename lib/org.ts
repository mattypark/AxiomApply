/**
 * Legal identity of the organisation.
 *
 * The EIN is the nonprofit's federal tax ID. It belongs in the footer, on both
 * legal documents, and in the CAN-SPAM email footer — donors and schools look
 * for it, and its absence reads as "not really a nonprofit".
 *
 * Read from env so it is set once. The fallback is deliberately obvious rather
 * than a plausible-looking fake: a wrong EIN on a legal page is worse than a
 * visibly missing one.
 */
export const ORG_LEGAL_NAME = "Axiom Pathways";

export const ORG_EIN = process.env.NEXT_PUBLIC_ORG_EIN?.trim() ?? "";

/** "EIN 12-3456789", or an empty string when unset so callers can omit it. */
export function einLine(): string {
  return ORG_EIN ? `EIN ${ORG_EIN}` : "";
}
