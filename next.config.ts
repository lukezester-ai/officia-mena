import type { NextConfig } from "next";

const cspHeader = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''} https://accounts.google.com https://js.stripe.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://*.clerk.accounts.dev",
  "font-src 'self'",
  "frame-src https://accounts.google.com https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
  "connect-src 'self' https://api.stripe.com https://*.supabase.co https://api.anthropic.com https://generativelanguage.googleapis.com",
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
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  ...(process.env.NODE_ENV === "production" ? { poweredByHeader: false } : {}),
};

export default nextConfig;
