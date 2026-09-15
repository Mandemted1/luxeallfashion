"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { brandLabel } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import { MAX_PRODUCT_IMAGES, type AdminProduct, type AdminProductVariant } from "@/lib/products";

const inputClass =
  "border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none";

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
    <input
      type="number"
      min={0}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
      aria-label={`Stock for ${variant.size} ${variant.colorName}`}
      className="w-16 border border-black/15 bg-white px-2 py-1 text-right text-sm focus:border-black focus:outline-none"
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
      <tr className="border-b border-black/5 last:border-b-0 bg-stone-50">
        <td className="px-5 py-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorHex}
              onChange={(event) => setColorHex(event.target.value)}
              aria-label="Color"
              className="h-8 w-8 shrink-0 border border-black/15 p-0"
            />
            <input
              type="text"
              value={size}
              onChange={(event) => setSize(event.target.value)}
              placeholder="Size"
              className="w-16 border border-black/15 bg-white px-2 py-1 text-sm focus:border-black focus:outline-none"
            />
            <input
              type="text"
              value={colorName}
              onChange={(event) => setColorName(event.target.value)}
              placeholder="Color"
              className="w-24 border border-black/15 bg-white px-2 py-1 text-sm focus:border-black focus:outline-none"
            />
          </div>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </td>
        <td className="px-5 py-3 text-black/50">{variant.sku}</td>
        <td className="px-5 py-3 text-right">
          <input
            type="number"
            min={0}
            step="0.01"
            value={priceCedis}
            onChange={(event) => setPriceCedis(event.target.value)}
            aria-label="Price (GHS)"
            className="w-20 border border-black/15 bg-white px-2 py-1 text-right text-sm focus:border-black focus:outline-none"
          />
        </td>
        <td className="px-5 py-3 text-right">
          <StockCell variant={variant} onCommit={onCommitStock} />
        </td>
        <td className="px-5 py-3 text-right">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="text-xs font-medium uppercase tracking-[0.06em] text-emerald-700 hover:text-emerald-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="text-xs font-medium uppercase tracking-[0.06em] text-black/40 hover:text-black disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-black/5 last:border-b-0">
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 shrink-0 rounded-full border border-black/10"
            style={{ backgroundColor: variant.colorHex }}
          />
          {variant.size} · {variant.colorName}
        </div>
      </td>
      <td className="px-5 py-3 text-black/50">{variant.sku}</td>
      <td className="px-5 py-3 text-right">{formatGhs(variant.priceGhs)}</td>
      <td className="px-5 py-3 text-right">
        <StockCell variant={variant} onCommit={onCommitStock} />
      </td>
      <td className="px-5 py-3 text-right">
        <div className="flex justify-end items-center gap-1">
          {confirmingDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              onBlur={() => setConfirmingDelete(false)}
              className="text-xs font-medium uppercase tracking-[0.06em] text-red-600 hover:text-red-700"
            >
              Confirm?
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={startEdit}
                aria-label={`Edit ${variant.size} ${variant.colorName}`}
                className="p-1.5 text-black/40 hover:text-black"
              >
                <PencilIcon />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteError("");
                  setConfirmingDelete(true);
                }}
                aria-label={`Delete ${variant.size} ${variant.colorName}`}
                className="p-1.5 text-black/40 hover:text-red-600"
              >
                <TrashIcon />
              </button>
            </>
          )}
        </div>
        {deleteError && <p className="mt-1 text-right text-xs text-red-600">{deleteError}</p>}
      </td>
    </tr>
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
        <input
          value={size}
          onChange={(event) => setSize(event.target.value)}
          placeholder="M"
          className={`w-20 ${inputClass}`}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-black/50">
        Color Name
        <input
          value={colorName}
          onChange={(event) => setColorName(event.target.value)}
          placeholder="Black"
          className={`w-28 ${inputClass}`}
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
        <input
          type="number"
          min={0}
          step="0.01"
          value={priceCedis}
          onChange={(event) => setPriceCedis(event.target.value)}
          placeholder="160"
          className={`w-24 ${inputClass}`}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-black/50">
        Stock
        <input
          type="number"
          min={0}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className={`w-20 ${inputClass}`}
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="bg-black px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
      >
        Add Variant
      </button>
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
  const [togglingActive, setTogglingActive] = useState(false);
  const [activeToggleError, setActiveToggleError] = useState("");
  const [togglingNewIn, setTogglingNewIn] = useState(false);
  const [imageError, setImageError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [material, setMaterial] = useState(product.material ?? "");
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [detailsError, setDetailsError] = useState("");

  async function saveField(patch: {
    name?: string;
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

  async function handleToggleActive() {
    const next = !isActive;
    setTogglingActive(true);
    setActiveToggleError("");
    try {
      const result = await toggleProductActive(product.id, next);
      if (result.error) {
        setActiveToggleError(result.error);
        return;
      }
      setIsActive(next);
      router.refresh();
    } catch {
      setActiveToggleError("Couldn't save. Try again.");
    } finally {
      setTogglingActive(false);
    }
  }

  async function handleToggleNewIn() {
    const next = !isNewIn;
    setTogglingNewIn(true);
    try {
      await toggleProductNewIn(product.id, next);
      setIsNewIn(next);
      router.refresh();
    } catch {
      // Nothing else surfaces errors for this toggle — reverting the
      // optimistic label back is at least an honest reflection of state.
    } finally {
      setTogglingNewIn(false);
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
    if (!window.confirm(`Permanently delete "${product.name}"? This can't be undone.`)) return;
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
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-black/50">
        <span>{brandLabel(product.brand)}</span>
        <span>·</span>
        <select
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            saveField({ categoryId: event.target.value });
          }}
          className="border-none bg-transparent p-0 text-xs font-medium uppercase tracking-[0.1em] text-black/50 focus:outline-none"
        >
          {hasCategoryGroups
            ? topLevelCategories.map((category) => {
                const children = childCategoriesByParent[category.id] ?? [];
                if (children.length === 0) {
                  return (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  );
                }
                return (
                  <optgroup key={category.id} label={category.name}>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })
            : categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
        </select>
      </div>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => name.trim() && name !== product.name && saveField({ name })}
          aria-label="Product name"
          className="min-w-0 flex-1 border-none bg-transparent p-0 text-3xl font-semibold focus:outline-none focus:ring-1 focus:ring-black/20"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleToggleNewIn}
            disabled={togglingNewIn}
            className={`px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] transition-colors disabled:opacity-50 ${
              isNewIn
                ? "bg-black text-white hover:bg-stone-800"
                : "border border-black/15 bg-white text-black/60 hover:border-black/40 hover:text-black"
            }`}
          >
            {isNewIn ? "Showing in New In" : "Show in New In"}
          </button>
          <button
            type="button"
            onClick={handleToggleActive}
            disabled={togglingActive || (!isActive && product.variants.length === 0)}
            title={
              !isActive && product.variants.length === 0
                ? "Add at least one size/color before setting this product Active."
                : undefined
            }
            className={`px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? "border border-black/15 bg-white text-black/60 hover:border-black/40 hover:text-black"
                : "bg-black text-white hover:bg-stone-800"
            }`}
          >
            {isActive ? "Set Inactive" : "Set Active"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || product.orderCount > 0}
            title={
              product.orderCount > 0
                ? "This product has order history and can't be deleted — use Set Inactive instead."
                : undefined
            }
            className="border border-red-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-red-600 transition-colors hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-red-200 disabled:hover:bg-white"
          >
            Delete
          </button>
        </div>
      </div>
      {deleteError && <p className="mt-2 text-right text-xs text-red-600">{deleteError}</p>}
      {activeToggleError && (
        <p className="mt-2 text-right text-xs text-red-600">{activeToggleError}</p>
      )}

      {product.variants.length === 0 && (
        <div className="mt-4 border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          {isActive ? (
            <>
              This product has no sizes/colors added yet, but it&apos;s{" "}
              <strong className="font-semibold">live on the storefront right now</strong> —
              customers will see it with no way to buy it. Add at least one variant below,
              or set it Inactive until it&apos;s ready.
            </>
          ) : (
            <>This product has no sizes/colors added yet — add at least one variant below before setting it Active.</>
          )}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-black/10 bg-stone-100">
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
                  className={`absolute inset-0 overflow-hidden border transition-colors ${
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
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white opacity-100 shadow transition-opacity hover:bg-red-600 lg:opacity-0 lg:group-hover:opacity-100"
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

          <div className="mt-6 border border-black/10 bg-white p-6">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
              Description
            </p>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onBlur={() => description !== product.description && saveField({ description })}
              rows={3}
              className="mt-3 w-full resize-none border border-black/10 bg-transparent p-2 text-sm text-black/70 focus:border-black/30 focus:outline-none"
            />

            <p className="mt-4 text-xs font-medium uppercase tracking-[0.1em] text-black/50">
              Material
            </p>
            <input
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
              onBlur={() => material !== (product.material ?? "") && saveField({ material })}
              placeholder="e.g. 100% Cotton"
              className="mt-3 w-full border border-black/10 bg-transparent p-2 text-sm text-black/70 focus:border-black/30 focus:outline-none"
            />
            {detailsError && <p className="mt-2 text-xs text-red-600">{detailsError}</p>}

            <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-sm">
              <span className="text-black/60">Total Stock</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{totalStock} units</span>
                <StockBadge quantity={totalStock} />
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black/10 bg-white">
          <div className="border-b border-black/10 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
              Variants
            </p>
          </div>
          {product.variants.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-left text-xs font-medium uppercase tracking-[0.08em] text-black/50">
                    <th className="px-5 py-3 font-medium">Size / Color</th>
                    <th className="px-5 py-3 font-medium">SKU</th>
                    <th className="px-5 py-3 text-right font-medium">Price</th>
                    <th className="px-5 py-3 text-right font-medium">Stock</th>
                    <th className="px-5 py-3 text-right font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => (
                    <VariantRow
                      key={variant.id}
                      variant={variant}
                      onCommitStock={handleStockCommit}
                      onUpdate={handleVariantUpdate}
                      onRemove={handleVariantRemove}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <AddVariantForm productId={product.id} onAdded={() => router.refresh()} />
        </div>
      </div>
    </div>
  );
}
