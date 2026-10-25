"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  addProductImage,
  addVariant,
  deleteProduct,
  removeProductImage,
  removeVariant,
  toggleProductActive,
  toggleProductNewIn,
  updateProduct,
  updateVariant,
  updateVariantStock,
} from "@/app/(app)/products/actions";
import { FileUploadInput } from "@/components/file-upload-input";
import { PencilIcon, TrashIcon } from "@/components/icons";
import { StockBadge } from "@/components/stock-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { brandLabel } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import { MAX_PRODUCT_IMAGES, type AdminProduct, type AdminProductVariant } from "@/lib/products";

function StockCell({
  variant,
  onCommit,
}: {
  variant: AdminProductVariant;
  onCommit: (variantId: string, quantity: number) => Promise<void>;
}) {
  const [value, setValue] = useState(String(variant.quantity));

  async function commit() {
    const quantity = Math.max(0, Number(value) || 0);
    setValue(String(quantity));
    if (quantity !== variant.quantity) await onCommit(variant.id, quantity);
  }

  return (
    <Input
      type="number"
      min={0}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
      aria-label={`Stock for ${variant.size} ${variant.colorName}`}
      className="w-16 text-right"
    />
  );
}

function VariantRow({
  variant,
  onCommitStock,
  onUpdate,
  onRemove,
}: {
  variant: AdminProductVariant;
  onCommitStock: (variantId: string, quantity: number) => Promise<void>;
  onUpdate: (
    variantId: string,
    patch: { size: string; colorName: string; colorHex: string; priceGhs: number },
  ) => Promise<{ error?: string }>;
  onRemove: (variantId: string) => Promise<{ error?: string }>;
}) {
  const [editing, setEditing] = useState(false);
  const [size, setSize] = useState(variant.size);
  const [colorName, setColorName] = useState(variant.colorName);
  const [colorHex, setColorHex] = useState(variant.colorHex);
  const [priceCedis, setPriceCedis] = useState(String(variant.priceGhs / 100));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function startEdit() {
    setSize(variant.size);
    setColorName(variant.colorName);
    setColorHex(variant.colorHex);
    setPriceCedis(String(variant.priceGhs / 100));
    setError("");
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const result = await onUpdate(variant.id, {
        size,
        colorName,
        colorHex,
        priceGhs: Math.round(Number(priceCedis) * 100),
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
    } catch {
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const result = await onRemove(variant.id);
    if (result.error) {
      setDeleteError(result.error);
      setConfirmingDelete(false);
      return;
    }
  }

  if (editing) {
    return (
      <TableRow className="bg-stone-50">
        <TableCell>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorHex}
              onChange={(event) => setColorHex(event.target.value)}
              aria-label="Color"
              className="h-8 w-8 shrink-0 border border-black/15 p-0"
            />
            <Input
              type="text"
              value={size}
              onChange={(event) => setSize(event.target.value)}
              placeholder="Size"
              className="w-16"
            />
            <Input
              type="text"
              value={colorName}
              onChange={(event) => setColorName(event.target.value)}
              placeholder="Color"
              className="w-24"
            />
          </div>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </TableCell>
        <TableCell className="text-black/50">{variant.sku}</TableCell>
        <TableCell className="text-right">
          <Input
            type="number"
            min={0}
            step="0.01"
            value={priceCedis}
            onChange={(event) => setPriceCedis(event.target.value)}
            aria-label="Price (GHS)"
            className="w-20 text-right"
          />
        </TableCell>
        <TableCell className="text-right">
          <StockCell variant={variant} onCommit={onCommitStock} />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button size="xs" onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 shrink-0 rounded-full border border-black/10"
            style={{ backgroundColor: variant.colorHex }}
          />
          {variant.size} · {variant.colorName}
        </div>
      </TableCell>
      <TableCell className="text-black/50">{variant.sku}</TableCell>
      <TableCell className="text-right">{formatGhs(variant.priceGhs)}</TableCell>
      <TableCell className="text-right">
        <StockCell variant={variant} onCommit={onCommitStock} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {confirmingDelete ? (
            <Button
              size="xs"
              variant="ghost"
              onClick={handleDelete}
              onBlur={() => setConfirmingDelete(false)}
              className="text-red-600 hover:text-red-700"
            >
              Confirm?
            </Button>
          ) : (
            <>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={startEdit}
                aria-label={`Edit ${variant.size} ${variant.colorName}`}
                className="text-black/40 hover:text-black"
              >
                <PencilIcon />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => {
                  setDeleteError("");
                  setConfirmingDelete(true);
                }}
                aria-label={`Delete ${variant.size} ${variant.colorName}`}
                className="text-black/40 hover:text-red-600"
              >
                <TrashIcon />
              </Button>
            </>
          )}
        </div>
        {deleteError && <p className="mt-1 text-right text-xs text-red-600">{deleteError}</p>}
      </TableCell>
    </TableRow>
  );
}

function AddVariantForm({
  productId,
  onAdded,
}: {
  productId: string;
  onAdded: () => void;
}) {
  const [size, setSize] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#151515");
  const [priceCedis, setPriceCedis] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await addVariant({
      productId,
      size,
      colorName,
      colorHex,
      priceGhs: Math.round(Number(priceCedis) * 100),
      quantity: Number(quantity),
    });

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSize("");
    setColorName("");
    setPriceCedis("");
    setQuantity("0");
    onAdded();
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-end gap-3 border-t border-black/10 px-5 py-4"
    >
      <label className="flex flex-col gap-1 text-xs text-black/50">
        Size
        <Input
          value={size}
          onChange={(event) => setSize(event.target.value)}
          placeholder="M"
          className="w-20"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-black/50">
        Color Name
        <Input
          value={colorName}
          onChange={(event) => setColorName(event.target.value)}
          placeholder="Black"
          className="w-28"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-black/50">
        Color
        <input
          type="color"
          value={colorHex}
          onChange={(event) => setColorHex(event.target.value)}
          className="h-9 w-12 border border-black/15 bg-white p-1"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-black/50">
        Price (GHS)
        <Input
          type="number"
          min={0}
          step="0.01"
          value={priceCedis}
          onChange={(event) => setPriceCedis(event.target.value)}
          placeholder="160"
          className="w-24"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-black/50">
        Stock
        <Input
          type="number"
          min={0}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="w-20"
        />
      </label>
      <Button type="submit" disabled={submitting}>
        Add Variant
      </Button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </form>
  );
}

export function ProductDetailContent({
  product,
  categories,
}: {
  product: AdminProduct;
  categories: { id: string; name: string; parentId: string | null }[];
}) {
  const topLevelCategories = categories.filter((category) => !category.parentId);
  const childCategoriesByParent = categories.reduce<Record<string, typeof categories>>(
    (acc, category) => {
      if (!category.parentId) return acc;
      (acc[category.parentId] ??= []).push(category);
      return acc;
    },
    {},
  );
  const hasCategoryGroups = childCategoriesByParent && Object.keys(childCategoriesByParent).length > 0;
  const router = useRouter();
  const [isActive, setIsActive] = useState(product.isActive);
  const [isNewIn, setIsNewIn] = useState(product.isNewIn);
  const [activeImage, setActiveImage] = useState(0);
  const [activeToggleError, setActiveToggleError] = useState("");
  const [imageError, setImageError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [name, setName] = useState(product.name);
  const [brandName, setBrandName] = useState(product.brandName ?? "");
  const [description, setDescription] = useState(product.description);
  const [material, setMaterial] = useState(product.material ?? "");
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [detailsError, setDetailsError] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Name, brand, description, and material are edited freely and only
  // committed via the explicit Save bar below — category is a dropdown
  // selection, which already reads as a deliberate, immediate action, so
  // it keeps saving straight through saveField on change.
  const detailsDirty =
    name !== product.name ||
    brandName !== (product.brandName ?? "") ||
    description !== product.description ||
    material !== (product.material ?? "");

  useEffect(() => {
    if (!savedFlash) return;
    const timeout = setTimeout(() => setSavedFlash(false), 2500);
    return () => clearTimeout(timeout);
  }, [savedFlash]);

  async function saveField(patch: {
    name?: string;
    brandName?: string;
    description?: string;
    material?: string;
    categoryId?: string;
  }) {
    const result = await updateProduct(product.id, patch);
    if (result.error) {
      setDetailsError(result.error);
      return;
    }
    setDetailsError("");
    router.refresh();
  }

  async function handleSaveDetails() {
    setSavingDetails(true);
    setDetailsError("");
    try {
      const result = await updateProduct(product.id, { name, brandName, description, material });
      if (result.error) {
        setDetailsError(result.error);
        return;
      }
      setSavedFlash(true);
      router.refresh();
    } catch {
      setDetailsError("Couldn't save. Try again.");
    } finally {
      setSavingDetails(false);
    }
  }

  function handleDiscardDetails() {
    setName(product.name);
    setBrandName(product.brandName ?? "");
    setDescription(product.description);
    setMaterial(product.material ?? "");
    setDetailsError("");
  }

  // Flips the button instantly instead of waiting on a database round trip
  // first — the guard disabling this button already ruled out the one
  // way this call can fail (no variants yet), so the common case is safe
  // to assume and only unwind if the server disagrees.
  async function handleToggleActive() {
    const next = !isActive;
    setIsActive(next);
    setActiveToggleError("");
    try {
      const result = await toggleProductActive(product.id, next);
      if (result.error) {
        setIsActive(!next);
        setActiveToggleError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setIsActive(!next);
      setActiveToggleError("Couldn't save. Try again.");
    }
  }

  async function handleToggleNewIn() {
    const next = !isNewIn;
    setIsNewIn(next);
    try {
      const result = await toggleProductNewIn(product.id, next);
      if (result.error) {
        setIsNewIn(!next);
        return;
      }
      router.refresh();
    } catch {
      setIsNewIn(!next);
    }
  }

  async function handleStockCommit(variantId: string, quantity: number) {
    await updateVariantStock(variantId, quantity);
    router.refresh();
  }

  async function handleVariantUpdate(
    variantId: string,
    patch: { size: string; colorName: string; colorHex: string; priceGhs: number },
  ) {
    const result = await updateVariant(variantId, patch);
    if (!result.error) router.refresh();
    return result;
  }

  async function handleVariantRemove(variantId: string) {
    const result = await removeVariant(variantId);
    if (!result.error) router.refresh();
    return result;
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const result = await deleteProduct(product.id);
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      router.push("/products");
    } catch {
      setDeleteError("Couldn't delete. Try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleImageUploaded(url: string) {
    const result = await addProductImage(product.id, url);
    if (result.error) {
      setImageError(result.error);
      return;
    }
    setImageError("");
    router.refresh();
  }

  async function handleRemoveImage(url: string) {
    if (activeImage === product.images.length - 1) {
      setActiveImage(Math.max(0, product.images.length - 2));
    }
    await removeProductImage(product.id, url);
    router.refresh();
  }

  const totalStock = product.variants.reduce((sum, variant) => sum + variant.quantity, 0);

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
              Photos
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-black/10 bg-stone-100">
              {product.images[activeImage] && (
                <Image
                  src={product.images[activeImage]}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {product.images.map((image, index) => (
                <div key={image} className="group relative h-16 w-16 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`absolute inset-0 overflow-hidden rounded-lg border transition-colors ${
                      index === activeImage ? "border-black" : "border-black/10 hover:border-black/30"
                    }`}
                  >
                    <Image src={image} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveImage(image);
                    }}
                    aria-label="Remove image"
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white opacity-100 shadow transition-opacity hover:bg-red-600 lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {product.images.length < MAX_PRODUCT_IMAGES && (
                <FileUploadInput folder="products" label="Add Image" onUploaded={handleImageUploaded} />
              )}
            </div>
            <p className="mt-1 text-xs text-black/40">
              {product.images.length} / {MAX_PRODUCT_IMAGES} images
            </p>
            {imageError && <p className="mt-1 text-xs text-red-600">{imageError}</p>}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
                Product Info
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
                    Store
                  </p>
                  <p className="text-sm font-medium">{brandLabel(product.brand)}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
                    Category
                  </p>
                  <Select
                    value={categoryId}
                    onValueChange={(next) => {
                      setCategoryId(next);
                      saveField({ categoryId: next });
                    }}
                  >
                    <SelectTrigger size="sm" className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hasCategoryGroups
                        ? topLevelCategories.map((category) => {
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
                          })
                        : categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
                  Brand Name <span className="text-black/30">(optional)</span>
                </p>
                <Input
                  value={brandName}
                  onChange={(event) => setBrandName(event.target.value)}
                  placeholder="ZARA, Nike, Reiss..."
                  className="max-w-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
                  Product Name
                </p>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-label="Product name"
                  className="w-full border-b border-transparent bg-transparent p-0 pb-1 text-3xl font-semibold transition-colors hover:border-black/15 focus:border-black/30 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-black/10 pt-5">
                <Button
                  variant={isNewIn ? "default" : "outline"}
                  onClick={handleToggleNewIn}
                >
                  {isNewIn ? "Showing in New In" : "Show in New In"}
                </Button>
                <Button
                  variant={isActive ? "outline" : "default"}
                  onClick={handleToggleActive}
                  disabled={!isActive && product.variants.length === 0}
                  title={
                    !isActive && product.variants.length === 0
                      ? "Add at least one size/color before setting this product Active."
                      : undefined
                  }
                >
                  {isActive ? "Set Inactive" : "Set Active"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="ml-auto"
                  title={
                    product.orderCount > 0
                      ? "This product has order history. It'll be hidden everywhere but kept internally so past orders still resolve."
                      : undefined
                  }
                >
                  Delete
                </Button>
              </div>
              {deleteError && <p className="text-right text-xs text-red-600">{deleteError}</p>}
              {activeToggleError && (
                <p className="text-right text-xs text-red-600">{activeToggleError}</p>
              )}
            </CardContent>
          </Card>

          {product.variants.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
              {isActive ? (
                <>
                  This product has no sizes/colors added yet, but it&apos;s{" "}
                  <strong className="font-semibold">live on the storefront right now</strong>,
                  customers will see it with no way to buy it. Add at least one variant below,
                  or set it Inactive until it&apos;s ready.
                </>
              ) : (
                <>This product has no sizes/colors added yet, add at least one variant below before setting it Active.</>
              )}
            </div>
          )}

          <Card className="gap-0 py-0">
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
              <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
                Variants
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-black/50">{totalStock} units</span>
                <StockBadge quantity={totalStock} />
              </div>
            </div>
            {product.variants.length > 0 && (
              <div className="overflow-x-auto">
                <Table className="min-w-[480px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Size / Color</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map((variant) => (
                      <VariantRow
                        key={variant.id}
                        variant={variant}
                        onCommitStock={handleStockCommit}
                        onUpdate={handleVariantUpdate}
                        onRemove={handleVariantRemove}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <AddVariantForm productId={product.id} onAdded={() => router.refresh()} />
          </Card>

          <Card>
            <CardHeader>
              <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
                Description
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
              />

              <p className="mt-4 text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
                Material
              </p>
              <Input
                value={material}
                onChange={(event) => setMaterial(event.target.value)}
                placeholder="e.g. 100% Cotton"
                className="mt-3"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {detailsDirty && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-3 border-t border-black/10 bg-white px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
          <p className="text-xs font-medium tracking-[0.08em] text-black/60 uppercase">
            Unsaved changes to name, brand, description, or material
          </p>
          <Button onClick={handleSaveDetails} disabled={savingDetails}>
            {savingDetails ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="ghost" onClick={handleDiscardDetails} disabled={savingDetails}>
            Discard
          </Button>
          {detailsError && <p className="w-full text-center text-xs text-red-600">{detailsError}</p>}
        </div>
      )}
      {savedFlash && !detailsDirty && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 border-t border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-medium tracking-[0.08em] text-emerald-700 uppercase">✓ Saved</p>
        </div>
      )}
    </div>
  );
}
