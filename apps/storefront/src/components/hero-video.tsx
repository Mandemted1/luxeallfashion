"use client";

import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

interface HeroVideoProps {
  videoSrc?: string;
  posterSrc?: string;
  children?: ReactNode;
}

// Full-bleed hero background. Pass videoSrc/posterSrc once the real assets
// land in /public — until then this renders a neutral placeholder so the
// layout is verifiable without fabricated photography.
export function HeroVideo({ videoSrc, posterSrc, children }: HeroVideoProps) {
  const reducedMotion = usePrefersReducedMotion();
  const showVideo = Boolean(videoSrc) && !reducedMotion;

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-stone-500">
      {showVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : posterSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-stone-400 via-stone-500 to-stone-700" />
      )}

      {/* Legibility gradient for the header/CTA sitting on top */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/15" />

      {children}
    </section>
  );
}
