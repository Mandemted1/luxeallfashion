"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { StorefrontProduct } from "@/lib/catalog";
import { formatGhs } from "@/lib/currency";

const COLLAPSE_DELAY_MS = 4500;

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const href = `/products/${product.slug}`;
  const { items, addItem, setQuantity } = useCart();
  const [expanded, setExpanded] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlRef = useRef<HTMLDivElement>(null);

  const [defaultSize] = product.sizes;
  const defaultColor = product.colors?.[0]?.name;
  const variantId = `${product.slug}-${defaultSize}-${defaultColor ?? "none"}`;
  const quantity = items.find((i) => i.id === variantId)?.quantity ?? 0;

  useEffect(() => {
    return () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    };
  }, []);

  // Click anywhere outside the control collapses it immediately (only
  // matters while still expanded — once the timer's already fired there's
  // nothing listening).
  useEffect(() => {
    if (!expanded) return;
    function handlePointerDown(event: MouseEvent) {
      if (
        controlRef.current &&
        !controlRef.current.contains(event.target as Node)
      ) {
        if (collapseTimer.current) clearTimeout(collapseTimer.current);
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [expanded]);

  function scheduleCollapse() {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(
      () => setExpanded(false),
      COLLAPSE_DELAY_MS,
    );
  }

  function handleQuickAdd() {
    addItem({
      id: variantId,
      slug: product.slug,
      name: product.name,
      priceGhs: product.priceGhs,
      imageSrc: product.images[0],
      size: defaultSize,
      colorName: defaultColor,
    });
    setExpanded(true);
    scheduleCollapse();
  }

  function handleIncrease() {
    setQuantity(variantId, quantity + 1);
    scheduleCollapse();
  }

  function handleDecrease() {
    const next = quantity - 1;
    setQuantity(variantId, next);
    if (next <= 0) {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
      setExpanded(false);
    } else {
      scheduleCollapse();
    }
  }

  const showStepper = expanded && quantity > 0;

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
          <Link href={href} className="block hover:opacity-70">
            {product.brandName && (
              <span className="block text-sm font-semibold text-black">{product.brandName}</span>
            )}
            <span className={product.brandName ? "text-sm text-black/60" : "text-sm text-black"}>
              {product.name}
            </span>
          </Link>

          <div
            ref={controlRef}
            className={`relative h-6 shrink-0 overflow-hidden transition-[width] duration-300 ease-out ${
              showStepper ? "w-[70px]" : "w-5"
            }`}
          >
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Quick add ${product.name} to bag`}
              className={`absolute right-0 text-xl leading-none text-black transition-all duration-200 hover:opacity-60 ${
                showStepper
                  ? "pointer-events-none scale-75 opacity-0"
                  : "scale-100 opacity-100"
              }`}
            >
              +
            </button>

            <div
              className={`absolute right-0 flex items-center gap-1.5 transition-all duration-200 ${
                showStepper
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-75 opacity-0"
              }`}
            >
              <button
                type="button"
                onClick={handleDecrease}
                aria-label={`Decrease ${product.name} quantity`}
                className="flex h-5 w-5 items-center justify-center text-sm leading-none text-black hover:opacity-60"
              >
                −
              </button>
              <span className="w-3 text-center text-xs">{quantity}</span>
              <button
                type="button"
                onClick={handleIncrease}
                aria-label={`Increase ${product.name} quantity`}
                className="flex h-5 w-5 items-center justify-center text-sm leading-none text-black hover:opacity-60"
              >
                +
              </button>
            </div>
          </div>
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
