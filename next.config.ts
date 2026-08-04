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
  async redirects() {
    return [
      // Old Astro paths → new equivalents
      { source: "/startups", destination: "/for-startups", permanent: true },
    ];
  },
};

export default nextConfig;
