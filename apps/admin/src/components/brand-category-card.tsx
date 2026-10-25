"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CategoryRow } from "@/components/category-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brandLabel, type Brand } from "@/lib/brands";
import type { AdminCategoryItem } from "@/components/categories-content";

const TOP_LEVEL_VALUE = "__top_level__";

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
  const [parentId, setParentId] = useState(TOP_LEVEL_VALUE);
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
    const result = await onAdd(brand, trimmed, parentId === TOP_LEVEL_VALUE ? null : parentId);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    setError("");
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
          {brandLabel(brand)}
        </CardTitle>
        <Badge variant="outline" className="text-black/50">
          {categories.length} {categories.length === 1 ? "category" : "categories"}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {topLevel.length === 0 ? (
          <p className="text-sm text-black/40">No categories yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-black/5">
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

        <form onSubmit={submit} className="flex flex-col gap-2 border-t border-black/10 pt-4">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="New category name"
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={submitting}
              size="icon"
              aria-label={`Add category to ${brandLabel(brand)}`}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          {topLevel.length > 0 && (
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TOP_LEVEL_VALUE}>Top-level category</SelectItem>
                {topLevel.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    Subcategory of {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </form>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
