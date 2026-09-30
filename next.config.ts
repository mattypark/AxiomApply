import type { NextConfig } from "next";

/**
 * Profile photos live in Supabase Storage, so next/image has to be told the
 * project host is allowed. It is derived from the same public env the client
 * uses — no second place to keep in sync — and simply absent when Supabase
 * isn't configured, which is the state the app already builds fine in.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  // HQ holds applicants' personal details: never cached anywhere, never
  // indexed, and its secret path never leaves in a Referer header.
  async headers() {
    return [
      {
        source: "/hq/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Old Astro paths → new equivalents. The startup pitch page is gone
      // (2026-09-30), so old links to it land on the home page instead of a
      // 404. Temporary, so a future startup page can take the path back.
      { source: "/startups", destination: "/", permanent: false },
      { source: "/for-startups", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
