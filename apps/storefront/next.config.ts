import type { NextConfig } from "next";

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
};

export default nextConfig;
