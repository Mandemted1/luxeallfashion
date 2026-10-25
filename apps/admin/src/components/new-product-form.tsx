"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { createProduct } from "@/app/(app)/products/actions";
import { FileUploadInput } from "@/components/file-upload-input";
import { TrashIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { brandFilters, type Brand } from "@/lib/brands";
import { MAX_PRODUCT_IMAGES } from "@/lib/products";

const labelClass = "flex flex-col gap-1.5 text-xs font-medium tracking-[0.1em] text-black/50 uppercase";

const brands: Brand[] = brandFilters
  .map((filter) => filter.value)
  .filter((value): value is Brand => value !== "all");

interface VariantRow {
  size: string;
  colorName: string;
  colorHex: string;
  priceCedis: string;
  quantity: string;
}

function emptyVariantRow(): VariantRow {
  return { size: "", colorName: "", colorHex: "#151515", priceCedis: "", quantity: "0" };
}

function isRowEmpty(row: VariantRow): boolean {
  return !row.size.trim() && !row.colorName.trim() && !row.priceCedis.trim();
}

function isRowComplete(row: VariantRow): boolean {
  return Boolean(row.size.trim() && row.colorName.trim() && row.priceCedis.trim());
}

// Lives inside a Sheet (see ProductsContent) rather than its own page —
// filling out a form this short shouldn't require navigating away from
// the list you're about to come straight back to. Sizes/colors are
// entered right here too, so creating a product is one pass: fill it in,
// create it, it's already sellable, instead of a detail-page detour to
// add stock before it can go Active.
export function NewProductForm({
  categories,
  onCreated,
}: {
  categories: { id: string; brand: Brand; name: string; parentId: string | null }[];
  onCreated: (slug: string) => void;
}) {
  const [name, setName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brand, setBrand] = useState<Brand>(brands[0]);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isNewIn, setIsNewIn] = useState(false);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([emptyVariantRow()]);
  const [setActiveNow, setSetActiveNow] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasValidVariant = variantRows.some((row) => !isRowEmpty(row) && isRowComplete(row));

  function updateVariantRow(index: number, patch: Partial<VariantRow>) {
    setVariantRows((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addVariantRow() {
    setVariantRows((rows) => [...rows, emptyVariantRow()]);
  }

  function removeVariantRow(index: number) {
    setVariantRows((rows) => rows.filter((_, i) => i !== index));
  }

  const categoriesForBrand = categories.filter((category) => category.brand === brand);
  const childIds = new Set(categoriesForBrand.map((c) => c.parentId).filter(Boolean));
  // Top-level entries: standalone categories (no children, selectable directly)
  // plus parent categories (have children -- selecting one just drills down).
  const topLevelOptions = categoriesForBrand.filter((c) => !c.parentId);
  const selectedParent = topLevelOptions.find((c) => c.id === parentCategoryId);
  const isParentSelection = selectedParent ? childIds.has(selectedParent.id) : false;
  const childOptions = parentCategoryId
    ? categoriesForBrand.filter((c) => c.parentId === parentCategoryId)
    : [];

  function handleTopLevelChange(id: string) {
    setParentCategoryId(id);
    const selected = topLevelOptions.find((c) => c.id === id);
    const hasChildren = selected ? childIds.has(selected.id) : false;
    setCategoryId(hasChildren ? "" : id);
  }

  function handleBrandChange(next: Brand) {
    setBrand(next);
    setParentCategoryId("");
    setCategoryId("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryId) {
      setError("Select a category.");
      return;
    }

    const filledRows = variantRows.filter((row) => !isRowEmpty(row));
    if (filledRows.some((row) => !isRowComplete(row))) {
      setError("Fill in size, color, and price for each variant row, or remove it.");
      return;
    }

    setSubmitting(true);
    setError("");

    const result = await createProduct({
      name,
      brandName,
      brand,
      categoryId,
      description,
      material,
      images,
      isNewIn,
      isActive: setActiveNow,
      variants: filledRows.map((row) => ({
        size: row.size.trim(),
        colorName: row.colorName.trim(),
        colorHex: row.colorHex,
        priceGhs: Math.round(Number(row.priceCedis) * 100),
        quantity: Math.max(0, Math.round(Number(row.quantity) || 0)),
      })),
    });

    if (result.error || !result.slug) {
      setError(result.error ?? "Couldn't create the product. Try again.");
      setSubmitting(false);
      return;
    }

    onCreated(result.slug);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className={labelClass}>
              Name
              <Input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>

            <label className={labelClass}>
              Brand Name (optional)
              <Input
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                placeholder="ZARA, Nike, Reiss..."
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Store
                <Select value={brand} onValueChange={(next) => handleBrandChange(next as Brand)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b} value={b}>
                        {brandFilters.find((f) => f.value === b)?.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className={labelClass}>
                Category
                <Select value={parentCategoryId} onValueChange={handleTopLevelChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {topLevelOptions.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {topLevelOptions.length === 0 && (
                  <span className="text-red-600 normal-case tracking-normal">
                    This store has no categories yet, create one first.
                  </span>
                )}
              </label>

              {isParentSelection && (
                <label className={labelClass}>
                  Subcategory
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {childOptions.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              )}
            </div>

            <label className={labelClass}>
              Description
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
              />
            </label>

            <label className={labelClass}>
              Material (optional)
              <Input value={material} onChange={(event) => setMaterial(event.target.value)} />
            </label>

            <div className="flex flex-col gap-2">
              <p className={labelClass}>Images</p>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {images.map((src) => (
                    <div key={src} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-black/10">
                      <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((current) => current.filter((url) => url !== src))}
                        aria-label="Remove image"
                        className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length < MAX_PRODUCT_IMAGES && (
                <FileUploadInput
                  folder="products"
                  label="Upload Image"
                  onUploaded={(url) => setImages((current) => [...current, url])}
                />
              )}
              <p className="text-xs text-black/40 normal-case tracking-normal">
                {images.length} / {MAX_PRODUCT_IMAGES} images
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <p className={labelClass}>Sizes &amp; Colors</p>
              <div className="flex flex-col gap-2">
                {variantRows.map((row, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-end gap-2 border border-black/10 p-3"
                  >
                    <label className="flex flex-col gap-1 text-xs text-black/50">
                      Size
                      <Input
                        value={row.size}
                        onChange={(event) => updateVariantRow(index, { size: event.target.value })}
                        placeholder="M"
                        className="w-16"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-black/50">
                      Color Name
                      <Input
                        value={row.colorName}
                        onChange={(event) => updateVariantRow(index, { colorName: event.target.value })}
                        placeholder="Black"
                        className="w-24"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-black/50">
                      Color
                      <input
                        type="color"
                        value={row.colorHex}
                        onChange={(event) => updateVariantRow(index, { colorHex: event.target.value })}
                        className="h-9 w-10 border border-black/15 bg-white p-1"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-black/50">
                      Price (GHS)
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.priceCedis}
                        onChange={(event) => updateVariantRow(index, { priceCedis: event.target.value })}
                        placeholder="160"
                        className="w-20"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-black/50">
                      Stock
                      <Input
                        type="number"
                        min={0}
                        value={row.quantity}
                        onChange={(event) => updateVariantRow(index, { quantity: event.target.value })}
                        className="w-16"
                      />
                    </label>
                    {variantRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariantRow(index)}
                        aria-label="Remove variant"
                        className="mb-0.5 text-black/40 transition-colors hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariantRow}
                className="w-fit gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add another size or color
              </Button>
              <p className="text-xs text-black/40 normal-case tracking-normal">
                Add at least one size and color so this product has stock to sell. You can add
                more later from the product page too.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm text-black normal-case tracking-normal">
              <Checkbox checked={isNewIn} onCheckedChange={(checked) => setIsNewIn(checked === true)} />
              Show in New In
            </label>

            <label
              className={`flex items-center gap-2 text-sm normal-case tracking-normal ${
                hasValidVariant ? "text-black" : "text-black/30"
              }`}
            >
              <Checkbox
                checked={setActiveNow}
                disabled={!hasValidVariant}
                onCheckedChange={(checked) => setSetActiveNow(checked === true)}
              />
              Set active immediately
            </label>
            {!hasValidVariant && (
              <p className="text-xs text-black/40 normal-case tracking-normal">
                Add a size and color above to activate this product right away, or save it
                inactive and finish it later.
              </p>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? "Creating..." : "Create Product"}
      </Button>
    </form>
  );
}
