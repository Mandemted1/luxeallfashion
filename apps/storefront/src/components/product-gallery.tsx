"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div className="flex gap-3">
      {images.length > 1 && (
        <div className="flex w-16 shrink-0 flex-col gap-3 sm:w-20">
          {images.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${alt}`}
              aria-current={index === activeIndex}
              className={`relative aspect-[4/5] overflow-hidden bg-stone-200 transition-opacity ${
                index === activeIndex
                  ? "opacity-100 ring-1 ring-black"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                className="object-contain p-1"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-stone-200">
        {activeImage && (
          <Image
            src={activeImage}
            alt={alt}
            fill
            priority
            className="object-contain p-8 sm:p-12"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        )}
      </div>
    </div>
  );
}
