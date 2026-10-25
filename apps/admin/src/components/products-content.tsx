"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageOff, Search } from "lucide-react";
import { bulkSetProductActive } from "@/app/(app)/products/actions";
import { BrandTabs } from "@/components/brand-tabs";
import { NewProductForm } from "@/components/new-product-form";
import { StockBadge } from "@/components/stock-badge";
import type { AdminCategoryItem } from "@/components/categories-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { brandFilters, brandLabel, type BrandFilter } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import { productPriceRangeGhs, productStockTotal, type AdminProduct } from "@/lib/products";

function priceLabel(min: number, max: number): string {
  return min === max ? formatGhs(min) : `${formatGhs(min)} – ${formatGhs(max)}`;
}

function readBrandParam(value: string | null): BrandFilter {
  return value && brandFilters.some((b) => b.value === value) ? (value as BrandFilter) : "all";
}

interface ProductsContentProps {
  products: AdminProduct[];
  categories: AdminCategoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Bulk selection is scoped to "whatever's currently on screen" — without
// this remount-on-navigation, changing the search/filter/page would hide
// the selection toolbar (it only reflects the current page's products)
// while a selection from a now-invisible page silently lingered
// underneath. Remounting on every query-string change resets it cleanly
// instead, the same trick used by HomepageContentEditor.
export function ProductsContent(props: ProductsContentProps) {
  const searchParams = useSearchParams();
  return <ProductsGrid key={searchParams.toString()} {...props} />;
}

function ProductsGrid({
  products,
  categories,
  totalCount,
  page,
  pageSize,
}: ProductsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const brand = readBrandParam(searchParams.get("brand"));
  const categoryId = searchParams.get("category") ?? "all";
  const urlSearch = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(urlSearch);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkError, setBulkError] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [newProductOpen, setNewProductOpen] = useState(false);

  function updateFilters(next: { brand?: BrandFilter; category?: string; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const nextBrand = next.brand ?? brand;
    const nextCategory = next.category ?? categoryId;
    const nextQ = next.q ?? urlSearch;

    if (nextBrand === "all") params.delete("brand");
    else params.set("brand", nextBrand);

    if (nextCategory === "all") params.delete("category");
    else params.set("category", nextCategory);

    if (!nextQ) params.delete("q");
    else params.set("q", nextQ);

    // Any filter change invalidates whatever page you were on.
    params.delete("page");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  // Debounced so typing doesn't fire a navigation (and a fresh DB query)
  // on every keystroke — only once typing pauses.
  useEffect(() => {
    if (search === urlSearch) return;
    const timeout = setTimeout(() => updateFilters({ q: search }), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleBrandChange(next: BrandFilter) {
    updateFilters({ brand: next, category: "all" });
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const categoriesForBrand =
    brand === "all" ? [] : categories.filter((category) => category.brand === brand);
  const topLevelCategories = categoriesForBrand.filter((category) => !category.parentId);
  const childCategoriesByParent = categoriesForBrand.reduce<Record<string, AdminCategoryItem[]>>(
    (acc, category) => {
      if (!category.parentId) return acc;
      (acc[category.parentId] ??= []).push(category);
      return acc;
    },
    {},
  );
  const hasCategoryGroups = topLevelCategories.length > 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const selectedOnPage = products.filter((p) => selected.has(p.id));
  const allOnPageSelected = products.length > 0 && products.every((p) => selected.has(p.id));

  function toggleSelected(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelected((current) => {
      if (allOnPageSelected) {
        const next = new Set(current);
        for (const p of products) next.delete(p.id);
        return next;
      }
      const next = new Set(current);
      for (const p of products) next.add(p.id);
      return next;
    });
  }

  async function handleBulkSetActive(isActive: boolean) {
    setBulkSubmitting(true);
    setBulkError("");
    try {
      const result = await bulkSetProductActive(Array.from(selected), isActive);
      if (result.skippedNames?.length) {
        setBulkError(
          `Activated everything else. Skipped (no variants yet): ${result.skippedNames.join(", ")}.`,
        );
      }
      setSelected(new Set());
      router.refresh();
    } catch {
      setBulkError("Couldn't update those products. Try again.");
    } finally {
      setBulkSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-black/50">Your catalogue across all three stores.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <BrandTabs value={brand} onChange={handleBrandChange} />
          <Button variant="outline" asChild>
            <Link href="/categories">Manage Categories</Link>
          </Button>
          <Sheet open={newProductOpen} onOpenChange={setNewProductOpen}>
            <SheetTrigger asChild>
              <Button>+ New Product</Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>New Product</SheetTitle>
                <SheetDescription>Add a product to your catalogue.</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-4">
                <NewProductForm
                  categories={categories}
                  onCreated={(slug) => {
                    setNewProductOpen(false);
                    router.push(`/products/${slug}`);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-black/30" />
          <Input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            className="pl-8"
          />
        </div>
        {brand !== "all" && (
          <Select
            value={categoryId}
            onValueChange={(next) => updateFilters({ category: next })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {hasCategoryGroups &&
                topLevelCategories.map((category) => {
                  const children = childCategoriesByParent[category.id] ?? [];
                  if (children.length === 0) {
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    );
                  }
                  return (
                    <SelectGroup key={category.id}>
                      <SelectLabel>{category.name}</SelectLabel>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
            </SelectContent>
          </Select>
        )}
        {products.length > 0 && (
          <label className="ml-auto flex items-center gap-2 text-xs text-black/50">
            <Checkbox checked={allOnPageSelected} onCheckedChange={toggleSelectAllOnPage} />
            Select all on this page
          </label>
        )}
      </div>

      {selectedOnPage.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 ring-1 ring-foreground/8">
          <p className="text-xs font-medium tracking-[0.08em] text-black/60 uppercase">
            {selectedOnPage.length} selected
          </p>
          <Button size="sm" onClick={() => handleBulkSetActive(true)} disabled={bulkSubmitting}>
            Set Active
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkSetActive(false)}
            disabled={bulkSubmitting}
          >
            Set Inactive
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
            disabled={bulkSubmitting}
          >
            Clear selection
          </Button>
          {bulkError && <p className="w-full text-xs text-red-600">{bulkError}</p>}
        </div>
      )}

      {products.length === 0 ? (
        <p className="mt-10 text-center text-sm text-black/40">
          No products match these filters.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const category = categories.find((c) => c.id === product.categoryId);
            const parentCategory = category?.parentId
              ? categories.find((c) => c.id === category.parentId)
              : null;
            const stock = productStockTotal(product);
            const { min, max } = productPriceRangeGhs(product);
            return (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_8px_rgba(0,0,0,0.03)] ring-1 ring-foreground/8 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]"
              >
                <label
                  className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-white/90 shadow-sm"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    checked={selected.has(product.id)}
                    onCheckedChange={() => toggleSelected(product.id)}
                    aria-label={`Select ${product.name}`}
                  />
                </label>
                <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1.5 text-black/20">
                        <ImageOff className="size-6" strokeWidth={1.5} />
                        <p className="text-[10px] font-medium tracking-[0.1em] uppercase">
                          No image
                        </p>
                      </div>
                    )}
                    {!product.isActive && (
                      <Badge className="absolute top-2 right-2 bg-black/85 text-white">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs text-black/40">
                      {brand === "all" && `${brandLabel(product.brand)} · `}
                      {parentCategory ? `${parentCategory.name} · ` : ""}
                      {category?.name ?? "Uncategorized"}
                    </p>
                    {product.brandName && (
                      <p className="mt-1 text-sm font-semibold">{product.brandName}</p>
                    )}
                    <p className={product.brandName ? "text-sm text-black/60" : "mt-1 text-sm font-medium"}>
                      {product.name}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <p className="text-sm font-semibold">{priceLabel(min, max)}</p>
                      <StockBadge quantity={stock} />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <p className="text-xs text-black/50">
            Page {page} of {totalPages} · {totalCount} products
          </p>
          <Button
            variant="outline"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
