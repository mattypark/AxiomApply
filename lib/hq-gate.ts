import "server-only";

import { timingSafeEqual } from "node:crypto";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { HqActor } from "@/lib/data/hq/types";

/**
 * HQ's two locks, in order: a signed-in admin (profiles.is_admin plus the
 * ADMIN_EMAILS allowlist, the same gate /admin uses), then the secret path
 * segment. Either failure is the site's ordinary 404, so a stranger can't
 * tell a wrong code from a missing sign-in from a page that doesn't exist.
 *
 * The secret alone is not protection: HQ shows minors' contact details, and
 * a URL leaks through history, screenshots and shared screens. It only
 * keeps the page out of sight. Cloudflare Access on /hq/* comes later as a
 * third lock in front of both (docs/DESIGN-AFTER-SUBMIT.md, "Access").
 *
 * HQ_CODE lives in server env, never in the repo, and can be rotated by
 * changing it. Unset or short, HQ is closed to everyone.
 */

const MIN_CODE_LENGTH = 32;

function codeMatches(given: string): boolean {
  const expected = process.env.HQ_CODE ?? "";
  if (expected.length < MIN_CODE_LENGTH) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  // timingSafeEqual needs equal lengths; comparing against itself keeps the
  // time spent the same whether or not the lengths match.
  return a.length === b.length ? timingSafeEqual(a, b) : (timingSafeEqual(b, b), false);
}

/**
 * HQ's address, for sending an admin there after sign-in. Null while
 * HQ_CODE is unset or too short, so nobody is ever sent to a closed door.
 */
export function hqPath(): string | null {
  const code = process.env.HQ_CODE ?? "";
  return code.length >= MIN_CODE_LENGTH ? `/hq/${encodeURIComponent(code)}` : null;
}

/** The signed-in admin, or null. Checks the session first, then the code. */
export async function checkHq(code: string): Promise<HqActor | null> {
  const gate = await requireAdmin();
  if (!gate.ok) return null;
  if (!codeMatches(decodeURIComponent(code))) return null;
  const name = gate.profile.display_name?.trim().split(/\s+/)[0] || gate.email.split("@")[0];
  return { email: gate.email, name };
}

/** For pages: the admin, or the ordinary 404. */
export async function gateHq(code: string): Promise<HqActor> {
  const actor = await checkHq(code);
  if (!actor) notFound();
  return actor;
}
