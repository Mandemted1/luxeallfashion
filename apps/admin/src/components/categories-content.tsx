"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCategory, deleteCategory, renameCategory } from "@/app/(app)/categories/actions";
import { BrandCategoryCard } from "@/components/brand-category-card";
import { BrandTabs } from "@/components/brand-tabs";
import { brandFilters, type Brand, type BrandFilter } from "@/lib/brands";

export interface AdminCategoryItem {
  id: string;
  brand: Brand;
  name: string;
  slug: string;
  parentId: string | null;
}

const allBrands: Brand[] = brandFilters
  .map((filter) => filter.value)
  .filter((value): value is Brand => value !== "all");

export function CategoriesContent({
  categories,
  productCounts,
}: {
  categories: AdminCategoryItem[];
  productCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [brandFilter, setBrandFilter] = useState<BrandFilter>("all");

  async function handleAdd(
    brand: Brand,
    name: string,
    parentId: string | null = null,
  ): Promise<{ error?: string }> {
    const result = await createCategory(brand, name, parentId);
    if (!result.error) router.refresh();
    return result;
  }

  async function handleRename(id: string, name: string): Promise<{ error?: string }> {
    const result = await renameCategory(id, name);
    if (!result.error) router.refresh();
    return result;
  }

  async function handleDelete(id: string): Promise<{ error?: string }> {
    const result = await deleteCategory(id);
    if (!result.error) router.refresh();
    return result;
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
            productCounts={productCounts}
            onAdd={handleAdd}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
