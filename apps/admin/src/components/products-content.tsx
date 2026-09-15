"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { bulkSetProductActive } from "@/app/(app)/products/actions";
import { BrandTabs } from "@/components/brand-tabs";
import { StockBadge } from "@/components/stock-badge";
import type { AdminCategoryItem } from "@/components/categories-content";
import { brandFilters, brandLabel, type BrandFilter } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import { productPriceRangeGhs, productStockTotal, type AdminProduct } from "@/lib/products";

function priceLabel(min: number, max: number): string {
  return min === max ? formatGhs(min) : `${formatGhs(min)} – ${formatGhs(max)}`;
}

function readBrandParam(value: string | null): BrandFilter {
  return value && brandFilters.some((b) => b.value === value) ? (value as BrandFilter) : "all";
}

interface ProductsContentProps {
  products: AdminProduct[];
  categories: AdminCategoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Bulk selection is scoped to "whatever's currently on screen" — without
// this remount-on-navigation, changing the search/filter/page would hide
// the selection toolbar (it only reflects the current page's products)
// while a selection from a now-invisible page silently lingered
// underneath. Remounting on every query-string change resets it cleanly
// instead, the same trick used by HomepageContentEditor.
export function ProductsContent(props: ProductsContentProps) {
  const searchParams = useSearchParams();
  return <ProductsGrid key={searchParams.toString()} {...props} />;
}

function ProductsGrid({
  products,
  categories,
  totalCount,
  page,
  pageSize,
}: ProductsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const brand = readBrandParam(searchParams.get("brand"));
  const categoryId = searchParams.get("category") ?? "all";
  const urlSearch = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(urlSearch);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkError, setBulkError] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  function updateFilters(next: { brand?: BrandFilter; category?: string; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const nextBrand = next.brand ?? brand;
    const nextCategory = next.category ?? categoryId;
    const nextQ = next.q ?? urlSearch;

    if (nextBrand === "all") params.delete("brand");
    else params.set("brand", nextBrand);

    if (nextCategory === "all") params.delete("category");
    else params.set("category", nextCategory);

    if (!nextQ) params.delete("q");
    else params.set("q", nextQ);

    // Any filter change invalidates whatever page you were on.
    params.delete("page");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  // Debounced so typing doesn't fire a navigation (and a fresh DB query)
  // on every keystroke — only once typing pauses.
  useEffect(() => {
    if (search === urlSearch) return;
    const timeout = setTimeout(() => updateFilters({ q: search }), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleBrandChange(next: BrandFilter) {
    updateFilters({ brand: next, category: "all" });
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
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

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const selectedOnPage = products.filter((p) => selected.has(p.id));

  function toggleSelected(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelected((current) => {
      const allSelected = products.every((p) => current.has(p.id));
      if (allSelected) {
        const next = new Set(current);
        for (const p of products) next.delete(p.id);
        return next;
      }
      const next = new Set(current);
      for (const p of products) next.add(p.id);
      return next;
    });
  }

  async function handleBulkSetActive(isActive: boolean) {
    setBulkSubmitting(true);
    setBulkError("");
    try {
      const result = await bulkSetProductActive(Array.from(selected), isActive);
      if (result.skippedNames?.length) {
        setBulkError(
          `Activated everything else — skipped (no variants yet): ${result.skippedNames.join(", ")}.`,
        );
      }
      setSelected(new Set());
      router.refresh();
    } catch {
      setBulkError("Couldn't update those products. Try again.");
    } finally {
      setBulkSubmitting(false);
    }
  }

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
        {products.length > 0 && (
          <label className="ml-auto flex items-center gap-2 text-xs text-black/50">
            <input
              type="checkbox"
              checked={products.length > 0 && products.every((p) => selected.has(p.id))}
              onChange={toggleSelectAllOnPage}
              className="h-4 w-4"
            />
            Select all on this page
          </label>
        )}
      </div>

      {selectedOnPage.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border border-black/10 bg-stone-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-black/60">
            {selectedOnPage.length} selected
          </p>
          <button
            type="button"
            onClick={() => handleBulkSetActive(true)}
            disabled={bulkSubmitting}
            className="bg-black px-3 py-1.5 text-xs font-medium uppercase tracking-[0.06em] text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
          >
            Set Active
          </button>
          <button
            type="button"
            onClick={() => handleBulkSetActive(false)}
            disabled={bulkSubmitting}
            className="border border-black/15 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.06em] text-black/70 transition-colors hover:border-black/40 hover:text-black disabled:opacity-50"
          >
            Set Inactive
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            disabled={bulkSubmitting}
            className="text-xs text-black/40 underline underline-offset-2 hover:text-black disabled:opacity-50"
          >
            Clear selection
          </button>
          {bulkError && <p className="w-full text-xs text-red-600">{bulkError}</p>}
        </div>
      )}

      {products.length === 0 ? (
        <p className="mt-10 text-center text-sm text-black/40">
          No products match these filters.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const category = categories.find((c) => c.id === product.categoryId);
            const parentCategory = category?.parentId
              ? categories.find((c) => c.id === category.parentId)
              : null;
            const stock = productStockTotal(product);
            const { min, max } = productPriceRangeGhs(product);
            return (
              <div
                key={product.id}
                className="group relative border border-black/10 bg-white transition-colors hover:border-black/30"
              >
                <label
                  className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center bg-white/90"
                  onClick={(event) => event.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleSelected(product.id)}
                    aria-label={`Select ${product.name}`}
                    className="h-4 w-4"
                  />
                </label>
                <Link href={`/products/${product.slug}`} className="block">
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
                      <span className="absolute right-2 top-2 bg-black/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white">
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
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="border border-black/15 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-black/70 transition-colors hover:border-black/40 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <p className="text-xs text-black/50">
            Page {page} of {totalPages} · {totalCount} products
          </p>
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="border border-black/15 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-black/70 transition-colors hover:border-black/40 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
