"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, FilterIcon } from "@/components/icons";
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
  sort,
  onSortChange,
}: CatalogToolbarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtersOpen && !sortOpen) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        filtersOpen &&
        filtersRef.current &&
        !filtersRef.current.contains(target)
      ) {
        setFiltersOpen(false);
      }
      if (sortOpen && sortRef.current && !sortRef.current.contains(target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [filtersOpen, sortOpen]);

  const activeFilterCount = selectedSizes.size + selectedColors.size;

  return (
    <div className="mt-10 flex items-center justify-between border-y border-black/10 py-4 text-sm sm:mt-14">
      <div ref={filtersRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setFiltersOpen((v) => !v);
            setSortOpen(false);
          }}
          aria-expanded={filtersOpen}
          className="flex items-center gap-2 hover:opacity-70"
        >
          <FilterIcon />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {filtersOpen && (
          <div className="absolute left-0 top-full z-20 mt-3 w-72 border border-black/10 bg-white p-5 shadow-sm">
            {sizes.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
                  Size
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onToggleSize(size)}
                      aria-pressed={selectedSizes.has(size)}
                      className={`border px-3 py-1.5 text-xs transition-colors ${
                        selectedSizes.has(size)
                          ? "border-black bg-black text-white"
                          : "border-black/20 hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
                  Color
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      title={color.name}
                      onClick={() => onToggleColor(color.name)}
                      aria-pressed={selectedColors.has(color.name)}
                      className={`flex items-center gap-1.5 border px-2 py-1.5 text-xs transition-colors ${
                        selectedColors.has(color.name)
                          ? "border-black"
                          : "border-black/20 hover:border-black"
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onClearFilters}
                className="mt-6 text-xs underline underline-offset-2 hover:opacity-70"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      <div ref={sortRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setSortOpen((v) => !v);
            setFiltersOpen(false);
          }}
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
