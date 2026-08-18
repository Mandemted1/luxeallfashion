"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BrandTabs } from "@/components/brand-tabs";
import { StockBadge } from "@/components/stock-badge";
import { brandLabel, type Brand, type BrandFilter } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import { mockCategories } from "@/lib/mock-categories";
import {
  mockProducts,
  productPriceRangeGhs,
  productStockTotal,
} from "@/lib/mock-products";

function priceLabel(min: number, max: number): string {
  return min === max ? formatGhs(min) : `${formatGhs(min)} – ${formatGhs(max)}`;
}

export function ProductsContent() {
  const [brand, setBrand] = useState<BrandFilter>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [search, setSearch] = useState("");

  function handleBrandChange(next: BrandFilter) {
    setBrand(next);
    setCategoryId("all");
  }

  const categoriesForBrand =
    brand === "all" ? [] : mockCategories.filter((category) => category.brand === brand);

  const term = search.trim().toLowerCase();
  const filtered = mockProducts.filter((product) => {
    if (brand !== "all" && product.brand !== (brand as Brand)) return false;
    if (categoryId !== "all" && product.categoryId !== categoryId) return false;
    if (term && !product.name.toLowerCase().includes(term)) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Products</h1>
        <BrandTabs value={brand} onChange={handleBrandChange} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products"
          className="w-64 border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
        {brand !== "all" && (
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categoriesForBrand.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-black/40">
          No products match these filters.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => {
            const category = mockCategories.find((c) => c.id === product.categoryId);
            const stock = productStockTotal(product);
            const { min, max } = productPriceRangeGhs(product);
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group border border-black/10 bg-white transition-colors hover:border-black/30"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform group-hover:scale-[1.02]"
                  />
                  {!product.isActive && (
                    <span className="absolute left-2 top-2 bg-black/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-black/40">
                    {brand === "all" && `${brandLabel(product.brand)} · `}
                    {category?.name ?? "Uncategorized"}
                  </p>
                  <p className="mt-1 text-sm font-medium">{product.name}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{priceLabel(min, max)}</p>
                    <StockBadge quantity={stock} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
