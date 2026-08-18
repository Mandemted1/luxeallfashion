"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { FilterDrawer } from "@/components/filter-drawer";
import { SORT_OPTIONS, type SortOption } from "@/lib/catalog-filters";
import type { MockProductColor } from "@/lib/mock-products";

interface CatalogToolbarProps {
  sizes: string[];
  colors: MockProductColor[];
  selectedSizes: Set<string>;
  selectedColors: Set<string>;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onClearFilters: () => void;
  resultCount: number;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function CatalogToolbar({
  sizes,
  colors,
  selectedSizes,
  selectedColors,
  onToggleSize,
  onToggleColor,
  onClearFilters,
  resultCount,
  sort,
  onSortChange,
}: CatalogToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (sortRef.current && !sortRef.current.contains(target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [sortOpen]);

  return (
    <div className="mt-10 flex items-center justify-between border-y border-black/10 py-4 text-sm sm:mt-14">
      <FilterDrawer
        sizes={sizes}
        colors={colors}
        selectedSizes={selectedSizes}
        selectedColors={selectedColors}
        onToggleSize={onToggleSize}
        onToggleColor={onToggleColor}
        onClearFilters={onClearFilters}
        resultCount={resultCount}
      />

      <div ref={sortRef} className="relative">
        <button
          type="button"
          onClick={() => setSortOpen((v) => !v)}
          aria-expanded={sortOpen}
          className="flex items-center gap-2 hover:opacity-70"
        >
          Sort by
          <ChevronDownIcon />
        </button>

        {sortOpen && (
          <div className="absolute right-0 top-full z-20 mt-3 w-56 border border-black/10 bg-white py-2 shadow-sm">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSortChange(option.value);
                  setSortOpen(false);
                }}
                aria-pressed={sort === option.value}
                className={`block w-full px-4 py-2 text-left text-sm hover:bg-stone-50 ${
                  sort === option.value ? "font-semibold" : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
