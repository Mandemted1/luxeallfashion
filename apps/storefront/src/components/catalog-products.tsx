"use client";

import { useMemo, useState } from "react";
import { CatalogToolbar } from "@/components/catalog-toolbar";
import { ProductGridLoadMore } from "@/components/product-grid-load-more";
import type { StorefrontCategory, StorefrontProduct } from "@/lib/catalog";
import {
  applyFiltersAndSort,
  getAvailableColors,
  getAvailableSizes,
  type SortOption,
} from "@/lib/catalog-filters";

interface CatalogProductsProps {
  products: StorefrontProduct[];
  categories?: StorefrontCategory[];
  initialCategoryId?: string;
}

export function CatalogProducts({
  products,
  categories = [],
  initialCategoryId,
}: CatalogProductsProps) {
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(
    new Set(),
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    () => (initialCategoryId ? new Set([initialCategoryId]) : new Set()),
  );
  const [sort, setSort] = useState<SortOption>("newest");
  const [newInOnly, setNewInOnly] = useState(false);

  const availableSizes = useMemo(
    () => getAvailableSizes(products),
    [products],
  );
  const availableColors = useMemo(
    () => getAvailableColors(products),
    [products],
  );

  const filteredSorted = useMemo(
    () =>
      applyFiltersAndSort(
        products,
        selectedSizes,
        selectedColors,
        selectedCategoryIds,
        sort,
        newInOnly,
      ),
    [products, selectedSizes, selectedColors, selectedCategoryIds, sort, newInOnly],
  );

  function toggleSize(size: string) {
    setSelectedSizes((current) => {
      const next = new Set(current);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  }

  function toggleColor(color: string) {
    setSelectedColors((current) => {
      const next = new Set(current);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
  }

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  function clearFilters() {
    setSelectedSizes(new Set());
    setSelectedColors(new Set());
    setSelectedCategoryIds(new Set());
    setNewInOnly(false);
  }

  return (
    <>
      <CatalogToolbar
        sizes={availableSizes}
        colors={availableColors}
        categories={categories}
        selectedSizes={selectedSizes}
        selectedColors={selectedColors}
        selectedCategoryIds={selectedCategoryIds}
        onToggleSize={toggleSize}
        onToggleColor={toggleColor}
        onToggleCategory={toggleCategory}
        onClearFilters={clearFilters}
        resultCount={filteredSorted.length}
        sort={sort}
        onSortChange={setSort}
        newInOnly={newInOnly}
        onToggleNewIn={() => setNewInOnly((current) => !current)}
      />

      {filteredSorted.length === 0 ? (
        <p className="mt-14 text-center text-sm text-black/50">
          {products.length === 0
            ? "No products found."
            : "No products match the selected filters."}
        </p>
      ) : (
        <ProductGridLoadMore products={filteredSorted} initialRows={2} />
      )}
    </>
  );
}
