"use client";

import { useState } from "react";
import { BrandCategoryCard } from "@/components/brand-category-card";
import { BrandTabs } from "@/components/brand-tabs";
import { brandFilters, type Brand, type BrandFilter } from "@/lib/brands";
import { mockCategories as initialCategories, slugify, type MockCategory } from "@/lib/mock-categories";

// Session-only React state, same as the Orders page — no backend yet, so
// adds/renames/deletes here don't persist across a reload.

const allBrands: Brand[] = brandFilters
  .map((filter) => filter.value)
  .filter((value): value is Brand => value !== "all");

export function CategoriesContent() {
  const [categories, setCategories] = useState<MockCategory[]>(initialCategories);
  const [brandFilter, setBrandFilter] = useState<BrandFilter>("all");

  function addCategory(brand: Brand, name: string) {
    setCategories((current) => [
      ...current,
      {
        id: `cat-${Date.now()}`,
        brand,
        name,
        slug: slugify(name),
        productCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ]);
  }

  function renameCategory(id: string, name: string) {
    setCategories((current) =>
      current.map((category) =>
        category.id === id ? { ...category, name, slug: slugify(name) } : category,
      ),
    );
  }

  function deleteCategory(id: string) {
    setCategories((current) => current.filter((category) => category.id !== id));
  }

  const brandsToShow = brandFilter === "all" ? allBrands : [brandFilter];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Categories</h1>
        <BrandTabs value={brandFilter} onChange={setBrandFilter} />
      </div>

      <p className="mt-2 text-sm text-black/50">
        Categories belong to one store: creating one under OG Luxemen won&apos;t
        make it available on Chicstyle or Kiddies Space GH.
      </p>

      <div
        className={`mt-8 grid grid-cols-1 gap-6 ${
          brandFilter === "all" ? "lg:grid-cols-3" : "max-w-xl"
        }`}
      >
        {brandsToShow.map((brand) => (
          <BrandCategoryCard
            key={brand}
            brand={brand}
            categories={categories.filter((category) => category.brand === brand)}
            onAdd={addCategory}
            onRename={renameCategory}
            onDelete={deleteCategory}
          />
        ))}
      </div>
    </div>
  );
}
