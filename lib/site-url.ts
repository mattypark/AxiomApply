import { headers } from "next/headers";

/**
 * The public origin of the current deployment.
 *
 * Why this exists: `new URL(request.url).origin` inside a Route Handler is the
 * origin the *server process* sees, not the one the browser used. Behind
 * Vercel's proxy that can resolve to an internal host — and on a cold local
 * build it resolves to `http://localhost:3000`. Redirecting to that value is
 * exactly the "sign in sends me to localhost" bug.
 *
 * Resolution order, most trustworthy first:
 *   1. NEXT_PUBLIC_SITE_URL — set it in Vercel and this is always right
 *   2. x-forwarded-host / x-forwarded-proto — what the proxy actually received
 *   3. host header
 *   4. the request's own origin, as a last resort
 *
 * Never returns a trailing slash.
 */
export async function getSiteUrl(fallbackOrigin?: string): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  try {
    const headerList = await headers();
    const forwardedHost =
      headerList.get("x-forwarded-host") ?? headerList.get("host");

    if (forwardedHost) {
      const proto =
        headerList.get("x-forwarded-proto") ??
        (forwardedHost.startsWith("localhost") ? "http" : "https");
      return `${proto}://${forwardedHost}`.replace(/\/+$/, "");
    }
  } catch {
    // headers() is unavailable outside a request scope — fall through.
  }

  return (fallbackOrigin ?? "").replace(/\/+$/, "");
}
