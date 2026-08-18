"use client";

import { useMemo, useState } from "react";
import { CatalogToolbar } from "@/components/catalog-toolbar";
import { ProductGridLoadMore } from "@/components/product-grid-load-more";
import {
  applyFiltersAndSort,
  getAvailableColors,
  getAvailableSizes,
  type SortOption,
} from "@/lib/catalog-filters";
import type { MockProduct } from "@/lib/mock-products";

export function CatalogProducts({ products }: { products: MockProduct[] }) {
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(
    new Set(),
  );
  const [sort, setSort] = useState<SortOption>("newest");

  const availableSizes = useMemo(
    () => getAvailableSizes(products),
    [products],
  );
  const availableColors = useMemo(
    () => getAvailableColors(products),
    [products],
  );

  const filteredSorted = useMemo(
    () => applyFiltersAndSort(products, selectedSizes, selectedColors, sort),
    [products, selectedSizes, selectedColors, sort],
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

  function clearFilters() {
    setSelectedSizes(new Set());
    setSelectedColors(new Set());
  }

  return (
    <>
      <CatalogToolbar
        sizes={availableSizes}
        colors={availableColors}
        selectedSizes={selectedSizes}
        selectedColors={selectedColors}
        onToggleSize={toggleSize}
        onToggleColor={toggleColor}
        onClearFilters={clearFilters}
        sort={sort}
        onSortChange={setSort}
      />

      {filteredSorted.length === 0 ? (
        <p className="mt-14 text-center text-sm text-black/50">
          No products match the selected filters.
        </p>
      ) : (
        <ProductGridLoadMore products={filteredSorted} initialRows={2} />
      )}
    </>
  );
}
