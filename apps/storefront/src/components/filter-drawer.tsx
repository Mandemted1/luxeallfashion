"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon, CloseIcon, FilterIcon } from "@/components/icons";
import type { StorefrontCategory } from "@/lib/catalog";
import type { StorefrontProductColor } from "@/lib/catalog";

interface FilterDrawerProps {
  sizes: string[];
  colors: StorefrontProductColor[];
  categories: StorefrontCategory[];
  selectedSizes: Set<string>;
  selectedColors: Set<string>;
  selectedCategoryIds: Set<string>;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onToggleCategory: (categoryId: string) => void;
  onClearFilters: () => void;
  resultCount: number;
  newInOnly: boolean;
  onToggleNewIn: () => void;
}

type Section = "size" | "color" | "category";

export function FilterDrawer({
  sizes,
  colors,
  categories,
  selectedSizes,
  selectedColors,
  selectedCategoryIds,
  onToggleSize,
  onToggleColor,
  onToggleCategory,
  onClearFilters,
  resultCount,
  newInOnly,
  onToggleNewIn,
}: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Set<Section>>(
    new Set(["category", "size", "color"]),
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function toggleSection(section: Section) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  const activeFilterCount =
    selectedSizes.size + selectedColors.size + selectedCategoryIds.size + (newInOnly ? 1 : 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
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

      {/* Backdrop and panel are always mounted so the panel can genuinely
          slide in/out via transform, rather than popping in on mount. */}
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="All Filters"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col bg-white transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <h2 className="text-xl font-semibold">All Filters</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
            className="hover:opacity-60"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="border-b border-black/10 py-5">
            <button
              type="button"
              onClick={onToggleNewIn}
              aria-pressed={newInOnly}
              className={`border px-3 py-1.5 text-xs transition-colors ${
                newInOnly
                  ? "border-black bg-black text-white"
                  : "border-black/20 hover:border-black"
              }`}
            >
              New In
            </button>
          </div>

          {categories.length > 0 && (
            <div className="border-b border-black/10 py-5">
              <button
                type="button"
                onClick={() => toggleSection("category")}
                aria-expanded={openSections.has("category")}
                className="flex w-full items-center justify-between text-left text-xs font-medium uppercase tracking-[0.1em]"
              >
                Category
                <ChevronDownIcon
                  className={`h-3.5 w-3.5 transition-transform ${
                    openSections.has("category") ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSections.has("category") && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => onToggleCategory(category.id)}
                      aria-pressed={selectedCategoryIds.has(category.id)}
                      className={`border px-3 py-1.5 text-xs transition-colors ${
                        selectedCategoryIds.has(category.id)
                          ? "border-black bg-black text-white"
                          : "border-black/20 hover:border-black"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {sizes.length > 0 && (
            <div className="border-b border-black/10 py-5">
              <button
                type="button"
                onClick={() => toggleSection("size")}
                aria-expanded={openSections.has("size")}
                className="flex w-full items-center justify-between text-left text-xs font-medium uppercase tracking-[0.1em]"
              >
                Size
                <ChevronDownIcon
                  className={`h-3.5 w-3.5 transition-transform ${
                    openSections.has("size") ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSections.has("size") && (
                <div className="mt-4 flex flex-wrap gap-2">
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
              )}
            </div>
          )}

          {colors.length > 0 && (
            <div className="border-b border-black/10 py-5">
              <button
                type="button"
                onClick={() => toggleSection("color")}
                aria-expanded={openSections.has("color")}
                className="flex w-full items-center justify-between text-left text-xs font-medium uppercase tracking-[0.1em]"
              >
                Color
                <ChevronDownIcon
                  className={`h-3.5 w-3.5 transition-transform ${
                    openSections.has("color") ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSections.has("color") && (
                <div className="mt-4 flex flex-col gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => onToggleColor(color.name)}
                      aria-pressed={selectedColors.has(color.name)}
                      className={`flex items-center gap-3 border px-4 py-3 text-left text-sm transition-colors ${
                        selectedColors.has(color.name)
                          ? "border-black"
                          : "border-black/20 hover:border-black"
                      }`}
                    >
                      <span
                        className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-5 text-xs underline underline-offset-2 hover:opacity-70"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="border-t border-black/10 p-6">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full bg-black py-4 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800"
          >
            Show {resultCount} {resultCount === 1 ? "Result" : "Results"}
          </button>
        </div>
      </div>
    </>
  );
}
