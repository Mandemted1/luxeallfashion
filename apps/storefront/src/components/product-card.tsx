"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { StorefrontProduct } from "@/lib/catalog";
import { formatGhs } from "@/lib/currency";

const CONFIRM_DURATION_MS = 900;

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const href = `/products/${product.slug}`;
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [defaultSize] = product.sizes;
  const defaultColor = product.colors?.[0]?.name;

  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    };
  }, []);

  // Quantity adjustments happen on the Bag page, not here — this button
  // only ever adds one unit at a time. The "+" briefly crossfades to a
  // checkmark for feedback, inside a box that never changes size, so
  // tapping it never reflows the product name next to it (it used to,
  // back when this control animated its own width to make room for an
  // inline +/- stepper).
  function handleQuickAdd() {
    addItem({
      id: `${product.slug}-${defaultSize}-${defaultColor ?? "none"}`,
      slug: product.slug,
      name: product.name,
      priceGhs: product.priceGhs,
      imageSrc: product.images[0],
      size: defaultSize,
      colorName: defaultColor,
    });
    setJustAdded(true);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setJustAdded(false), CONFIRM_DURATION_MS);
  }

  return (
    <div>
      <Link
        href={href}
        aria-label={product.name}
        className="group relative block aspect-[4/5] overflow-hidden bg-stone-200"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105 sm:p-6"
          sizes="(min-width: 1024px) 25vw, 33vw"
        />
      </Link>

      <div className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="block min-w-0 flex-1 break-words hover:opacity-70">
            {product.brandName && (
              <span className="block text-sm font-semibold text-black">{product.brandName}</span>
            )}
            <span className={product.brandName ? "text-sm text-black/60" : "text-sm text-black"}>
              {product.name}
            </span>
          </Link>

          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`Quick add ${product.name} to bag`}
            className="relative h-6 w-5 shrink-0 text-black hover:opacity-60"
          >
            <span
              className={`absolute inset-0 flex items-center justify-center text-xl leading-none transition-opacity duration-200 ${
                justAdded ? "opacity-0" : "opacity-100"
              }`}
            >
              +
            </span>
            <span
              className={`absolute inset-0 flex items-center justify-center text-sm leading-none transition-opacity duration-200 ${
                justAdded ? "opacity-100" : "opacity-0"
              }`}
            >
              ✓
            </span>
          </button>
        </div>

        <p className="mt-1 text-sm font-semibold text-black">
          {formatGhs(product.priceGhs)}
        </p>

        {product.colors && product.colors.length > 0 && (
          <div className="mt-3 flex gap-1.5">
            {product.colors.map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="h-3.5 w-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
