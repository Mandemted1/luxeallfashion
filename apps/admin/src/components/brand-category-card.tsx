"use client";

import { useState } from "react";
import { CategoryRow } from "@/components/category-row";
import { PlusIcon } from "@/components/icons";
import { brandLabel, type Brand } from "@/lib/brands";
import { slugify, type MockCategory } from "@/lib/mock-categories";
import { categoryProductCounts } from "@/lib/mock-products";

export function BrandCategoryCard({
  brand,
  categories,
  onAdd,
  onRename,
  onDelete,
}: {
  brand: Brand;
  categories: MockCategory[];
  onAdd: (brand: Brand, name: string, slug: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const productCounts = categoryProductCounts();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const slug = slugify(trimmed);
    const isDuplicate = categories.some((category) => category.slug === slug);
    if (isDuplicate) {
      setError("A category with this name already exists under this store.");
      return;
    }

    onAdd(brand, trimmed, slug);
    setName("");
    setError("");
  }

  return (
    <div className="border border-black/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
          {brandLabel(brand)}
        </p>
        <p className="text-xs text-black/40">
          {categories.length} {categories.length === 1 ? "category" : "categories"}
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="mt-4 text-sm text-black/40">No categories yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-black/5">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              productCount={productCounts[category.id] ?? 0}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}

      <form
        onSubmit={submit}
        className="mt-4 flex items-center gap-2 border-t border-black/10 pt-4"
      >
        <input
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          placeholder="New category name"
          className="flex-1 border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
        <button
          type="submit"
          aria-label={`Add category to ${brandLabel(brand)}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center bg-black text-white transition-colors hover:bg-stone-800"
        >
          <PlusIcon />
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
