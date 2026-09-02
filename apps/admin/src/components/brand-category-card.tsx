"use client";

import { useState } from "react";
import { CategoryRow } from "@/components/category-row";
import { PlusIcon } from "@/components/icons";
import { brandLabel, type Brand } from "@/lib/brands";
import type { AdminCategoryItem } from "@/components/categories-content";

export function BrandCategoryCard({
  brand,
  categories,
  productCounts,
  onAdd,
  onRename,
  onDelete,
}: {
  brand: Brand;
  categories: AdminCategoryItem[];
  productCounts: Record<string, number>;
  onAdd: (brand: Brand, name: string, parentId?: string | null) => Promise<{ error?: string }>;
  onRename: (id: string, name: string) => Promise<{ error?: string }>;
  onDelete: (id: string) => Promise<{ error?: string }>;
}) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const topLevel = categories.filter((category) => !category.parentId);
  const childrenByParent = categories.reduce<Record<string, AdminCategoryItem[]>>((acc, category) => {
    if (!category.parentId) return acc;
    (acc[category.parentId] ??= []).push(category);
    return acc;
  }, {});

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSubmitting(true);
    const result = await onAdd(brand, trimmed, parentId || null);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
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

      {topLevel.length === 0 ? (
        <p className="mt-4 text-sm text-black/40">No categories yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-black/5">
          {topLevel.map((category) => {
            const children = childrenByParent[category.id] ?? [];
            return (
              <li key={category.id} className="py-3 first:pt-0 last:pb-0">
                <CategoryRow
                  category={category}
                  productCount={productCounts[category.id] ?? 0}
                  onRename={onRename}
                  onDelete={onDelete}
                />
                {children.length > 0 && (
                  <ul className="mt-2 ml-4 flex flex-col divide-y divide-black/5 border-l border-black/10 pl-4">
                    {children.map((child) => (
                      <li key={child.id} className="py-2 first:pt-0 last:pb-0">
                        <CategoryRow
                          category={child}
                          productCount={productCounts[child.id] ?? 0}
                          onRename={onRename}
                          onDelete={onDelete}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <form
        onSubmit={submit}
        className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-4"
      >
        <div className="flex items-center gap-2">
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
            disabled={submitting}
            aria-label={`Add category to ${brandLabel(brand)}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center bg-black text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
          >
            <PlusIcon />
          </button>
        </div>
        {topLevel.length > 0 && (
          <select
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            className="border border-black/15 bg-white px-3 py-2 text-xs normal-case tracking-normal text-black/60 focus:border-black focus:outline-none"
          >
            <option value="">Top-level category</option>
            {topLevel.map((category) => (
              <option key={category.id} value={category.id}>
                Subcategory of {category.name}
              </option>
            ))}
          </select>
        )}
      </form>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
