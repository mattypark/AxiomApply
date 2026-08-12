/**
 * The three sides of the picker.
 *
 * Lives in its own module rather than beside the picker component: that file is
 * "use client", and a Server Component cannot call a function exported from a
 * client module — /onboarding needs `isSide` to validate its `?side=` param
 * during the server render.
 */

export type Side = "intern" | "startup" | "chapter";

export function isSide(value: unknown): value is Side {
  return value === "intern" || value === "startup" || value === "chapter";
}
