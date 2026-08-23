"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

export interface HeroSlide {
  title: string;
  ctaLabel: string;
  href: string;
  imageUrl: string;
  // CSS object-position, e.g. "center 20%" to keep more headroom above a
  // subject that's getting cropped close to the top. Defaults to centered.
  imagePosition?: string;
}

const AUTO_ADVANCE_MS = 6000;

// Full-bleed, auto-advancing hero — one slide per brand. imageUrl is
// admin-editable (HomepageTile.heroImageUrl); title/ctaLabel/href come
// straight from the same brand tile data used further down the page, so
// they can't drift out of sync with it.
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [reducedMotion, slides.length]);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-stone-500">
      {slides.map((slide, index) => (
        <div
          key={slide.href}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={index !== activeIndex}
        >
          {slide.imageUrl ? (
            <Image
              src={slide.imageUrl}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: slide.imagePosition ?? "center" }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-stone-400 via-stone-500 to-stone-700" />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/15" />

          <div className="absolute inset-x-0 bottom-[14%] flex flex-col items-center gap-5 px-4 text-center">
            <h2 className="text-2xl font-medium uppercase tracking-[0.25em] text-white sm:text-3xl">
              {slide.title}
            </h2>
            <Link
              href={slide.href}
              className="border border-white px-10 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black"
            >
              {slide.ctaLabel}
            </Link>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.href}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${slide.title}`}
              aria-current={index === activeIndex}
              className={`h-[2px] w-8 transition-colors ${
                index === activeIndex ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
