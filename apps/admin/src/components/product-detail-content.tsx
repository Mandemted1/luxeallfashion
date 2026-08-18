"use client";

import Image from "next/image";
import { useState } from "react";
import { StockBadge } from "@/components/stock-badge";
import { brandLabel } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import type { MockCategory } from "@/lib/mock-categories";
import type { MockAdminProduct, MockProductVariant } from "@/lib/mock-products";

// Session-only React state, same as the Orders page — no backend yet, so
// stock/status edits here don't persist across a reload and won't reflect
// on the Products list, which reads the static mockProducts import
// separately, until a real API/DB backs both.

export function ProductDetailContent({
  product: initialProduct,
  category,
}: {
  product: MockAdminProduct;
  category: MockCategory | undefined;
}) {
  const [isActive, setIsActive] = useState(initialProduct.isActive);
  const [variants, setVariants] = useState<MockProductVariant[]>(initialProduct.variants);
  const [activeImage, setActiveImage] = useState(0);

  function updateQuantity(variantId: string, quantity: number) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === variantId
          ? { ...variant, quantity: Math.max(0, quantity) }
          : variant,
      ),
    );
  }

  const totalStock = variants.reduce((sum, variant) => sum + variant.quantity, 0);

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
        {brandLabel(initialProduct.brand)} · {category?.name ?? "Uncategorized"}
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">{initialProduct.name}</h1>
        <button
          type="button"
          onClick={() => setIsActive((current) => !current)}
          className={`px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] transition-colors ${
            isActive
              ? "border border-black/15 bg-white text-black/60 hover:border-black/40 hover:text-black"
              : "bg-black text-white hover:bg-stone-800"
          }`}
        >
          {isActive ? "Set Inactive" : "Set Active"}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-black/10 bg-stone-100">
            <Image
              src={initialProduct.images[activeImage]}
              alt={initialProduct.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          {initialProduct.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {initialProduct.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`relative h-16 w-16 overflow-hidden border transition-colors ${
                    index === activeImage ? "border-black" : "border-black/10 hover:border-black/30"
                  }`}
                >
                  <Image src={image} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 border border-black/10 bg-white p-6">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
              Description
            </p>
            <p className="mt-3 text-sm text-black/70">{initialProduct.description}</p>
            <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-sm">
              <span className="text-black/60">Total Stock</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{totalStock} units</span>
                <StockBadge quantity={totalStock} />
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black/10 bg-white">
          <div className="border-b border-black/10 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
              Variants
            </p>
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs font-medium uppercase tracking-[0.08em] text-black/50">
                <th className="px-5 py-3 font-medium">Size / Color</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 text-right font-medium">Price</th>
                <th className="px-5 py-3 text-right font-medium">Stock</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id} className="border-b border-black/5 last:border-b-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: variant.colorHex }}
                      />
                      {variant.size} · {variant.colorName}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-black/50">{variant.sku}</td>
                  <td className="px-5 py-3 text-right">{formatGhs(variant.priceGhs)}</td>
                  <td className="px-5 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      value={variant.quantity}
                      onChange={(event) =>
                        updateQuantity(variant.id, Number(event.target.value))
                      }
                      aria-label={`Stock for ${variant.size} ${variant.colorName}`}
                      className="w-16 border border-black/15 bg-white px-2 py-1 text-right text-sm focus:border-black focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
