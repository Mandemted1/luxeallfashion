import type { NextConfig } from "next";

// Paystack's Inline JS (checkout) needs its own script/frame/connect
// sources allowed — CSP is shipped as Content-Security-Policy-Report-Only
// rather than enforcing, deliberately: a wrong domain in an enforcing
// policy would silently break real payments, and there's no safe way to
// browser-test the actual checkout flow from here first. Report-only logs
// violations in the browser console without blocking anything, so once a
// real checkout has been run with this live and the console shows no CSP
// warnings, this can be promoted to a real Content-Security-Policy header.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' https://js.paystack.co",
  "frame-src 'self' https://checkout.paystack.com https://standard.paystack.co",
  "connect-src 'self' https://api.paystack.co https://checkout.paystack.com",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
].join("; ");

const nextConfig: NextConfig = {
  // Vercel's built-in image optimizer meters and caps requests separately
  // from regular hosting — once that monthly quota is exceeded, any image
  // it hasn't already optimized and cached comes back 402'd instead of
  // rendering, which is why product photos start breaking unpredictably.
  // R2 already serves these at a reasonable size over its own CDN, so
  // there's nothing to gain from routing them through Vercel's optimizer
  // too — this serves them as-is instead.
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // No clickjacking protection existed at all before this — a site
          // that redirects to/from a payment provider is exactly the kind
          // that shouldn't be embeddable in someone else's frame.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
        ],
      },
    ];
  },
};

export default nextConfig;
