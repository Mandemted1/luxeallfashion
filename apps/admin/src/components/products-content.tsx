"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BrandTabs } from "@/components/brand-tabs";
import { StockBadge } from "@/components/stock-badge";
import type { AdminCategoryItem } from "@/components/categories-content";
import { brandFilters, brandLabel, type Brand, type BrandFilter } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import { productPriceRangeGhs, productStockTotal, type AdminProduct } from "@/lib/products";

function priceLabel(min: number, max: number): string {
  return min === max ? formatGhs(min) : `${formatGhs(min)} – ${formatGhs(max)}`;
}

function readBrandParam(value: string | null): BrandFilter {
  return value && brandFilters.some((b) => b.value === value) ? (value as BrandFilter) : "all";
}

export function ProductsContent({
  products,
  categories,
}: {
  products: AdminProduct[];
  categories: AdminCategoryItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const brand = readBrandParam(searchParams.get("brand"));
  const categoryId = searchParams.get("category") ?? "all";
  const [search, setSearch] = useState("");

  function updateFilters(next: { brand?: BrandFilter; category?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const nextBrand = next.brand ?? brand;
    const nextCategory = next.category ?? categoryId;

    if (nextBrand === "all") params.delete("brand");
    else params.set("brand", nextBrand);

    if (nextCategory === "all") params.delete("category");
    else params.set("category", nextCategory);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function handleBrandChange(next: BrandFilter) {
    updateFilters({ brand: next, category: "all" });
  }

  const categoriesForBrand =
    brand === "all" ? [] : categories.filter((category) => category.brand === brand);
  const topLevelCategories = categoriesForBrand.filter((category) => !category.parentId);
  const childCategoriesByParent = categoriesForBrand.reduce<Record<string, AdminCategoryItem[]>>(
    (acc, category) => {
      if (!category.parentId) return acc;
      (acc[category.parentId] ??= []).push(category);
      return acc;
    },
    {},
  );
  const hasCategoryGroups = topLevelCategories.length > 0;

  const term = search.trim().toLowerCase();
  const filtered = products.filter((product) => {
    if (brand !== "all" && product.brand !== (brand as Brand)) return false;
    if (categoryId !== "all" && product.categoryId !== categoryId) return false;
    if (term && !product.name.toLowerCase().includes(term)) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Products</h1>
        <div className="flex flex-wrap items-center gap-3">
          <BrandTabs value={brand} onChange={handleBrandChange} />
          <Link
            href="/products/new"
            className="bg-black px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-stone-800"
          >
            + New Product
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products"
          className="w-full border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none sm:w-64"
        />
        {brand !== "all" && (
          <select
            value={categoryId}
            onChange={(event) => updateFilters({ category: event.target.value })}
            className="border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="all">All Categories</option>
            {hasCategoryGroups
              ? topLevelCategories.map((category) => {
                  const children = childCategoriesByParent[category.id] ?? [];
                  if (children.length === 0) {
                    return (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    );
                  }
                  return (
                    <optgroup key={category.id} label={category.name}>
                      {children.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })
              : null}
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
            const category = categories.find((c) => c.id === product.categoryId);
            const parentCategory = category?.parentId
              ? categories.find((c) => c.id === category.parentId)
              : null;
            const stock = productStockTotal(product);
            const { min, max } = productPriceRangeGhs(product);
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group border border-black/10 bg-white transition-colors hover:border-black/30"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  )}
                  {!product.isActive && (
                    <span className="absolute left-2 top-2 bg-black/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-black/40">
                    {brand === "all" && `${brandLabel(product.brand)} · `}
                    {parentCategory ? `${parentCategory.name} · ` : ""}
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
