import type { NextConfig } from "next";

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://*.clerk.accounts.dev",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://*.clerk.accounts.dev",
  "font-src 'self'",
  "frame-src https://accounts.google.com https://*.clerk.accounts.dev",
  "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://generativelanguage.googleapis.com",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: cspHeader },
        ],
      },
    ];
  },
  ...(process.env.NODE_ENV === "production" && {
    poweredByHeader: false,
  }),
};

export default nextConfig;
