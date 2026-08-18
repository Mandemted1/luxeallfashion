"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { formatGhs } from "@/lib/currency";
import type { MockProduct } from "@/lib/mock-products";

interface ProductInfoPanelProps {
  product: MockProduct;
  description: string;
  sizeOptions: string[];
}

export function ProductInfoPanel({
  product,
  description,
  sizeOptions,
}: ProductInfoPanelProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name);
  const [selectedSize, setSelectedSize] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  function handleAddToBag() {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-normal sm:text-3xl">{product.name}</h1>
      <p className="mt-3 text-lg font-semibold">{formatGhs(product.priceGhs)}</p>

      {product.colors && product.colors.length > 0 && (
        <>
          <div className="mt-8 border-t border-black/10" />
          <div className="pt-6">
            <p className="text-sm font-medium">Colors</p>
            <div className="mt-3 flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  title={color.name}
                  aria-label={color.name}
                  aria-pressed={selectedColor === color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`h-7 w-7 rounded-full border transition-shadow ${
                    selectedColor === color.name
                      ? "border-black ring-2 ring-black ring-offset-2"
                      : "border-black/10"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-6 border-t border-black/10" />
      <div className="py-2">
        <button
          type="button"
          onClick={() => setDetailsOpen((open) => !open)}
          aria-expanded={detailsOpen}
          className="flex w-full items-center justify-between py-4 text-left text-sm font-medium"
        >
          Product details
          <span className="text-xl leading-none">{detailsOpen ? "−" : "+"}</span>
        </button>
        {detailsOpen && (
          <p className="pb-4 text-sm leading-relaxed text-black/70">
            {description}
          </p>
        )}
      </div>
      <div className="border-t border-black/10" />

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-medium">Select size</span>
        <button type="button" className="text-xs underline underline-offset-2">
          Size guide
        </button>
      </div>

      <div className="relative mt-3">
        <select
          value={selectedSize}
          onChange={(event) => {
            setSelectedSize(event.target.value);
            setSizeError(false);
          }}
          aria-label="Select size"
          className="w-full appearance-none border border-black/20 bg-white px-4 py-3 text-sm focus:border-black focus:outline-none"
        >
          <option value="">Select Size</option>
          {sizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
      </div>

      {sizeError && (
        <p className="mt-2 text-xs text-red-600">Please select a size.</p>
      )}

      <button
        type="button"
        onClick={handleAddToBag}
        className="mt-4 bg-black py-4 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800"
      >
        Add To Bag
      </button>
    </div>
  );
}
