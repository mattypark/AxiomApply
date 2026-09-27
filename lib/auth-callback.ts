/**
 * Absolute callback URL for Supabase auth, for use in the browser.
 *
 * Prefers NEXT_PUBLIC_SITE_URL: Supabase only honours a `redirect_to` that
 * matches its Redirect URLs allowlist, and silently falls back to the
 * dashboard's Site URL otherwise — which is how people ended up on localhost.
 * Pinning the origin keeps the value predictable and easy to allowlist.
 */
export function authCallbackUrl(next: string): string {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    window.location.origin;
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
