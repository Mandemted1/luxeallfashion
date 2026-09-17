import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Same reasoning as the storefront's next.config.ts: Vercel's image
  // optimizer has a shared monthly quota across both apps on this account,
  // and admin's own product-image previews were contributing to it too.
  // Serving R2 images as-is here keeps that quota free for what actually
  // needs it, and admin doesn't need responsive/format-converted images
  // for internal use anyway.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
