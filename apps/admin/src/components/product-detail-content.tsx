"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  addProductImage,
  addVariant,
  removeProductImage,
  toggleProductActive,
  updateVariantStock,
} from "@/app/(app)/products/actions";
import { FileUploadInput } from "@/components/file-upload-input";
import { TrashIcon } from "@/components/icons";
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
  categoryName,
}: {
  product: AdminProduct;
  categoryName: string;
}) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(product.isActive);
  const [activeImage, setActiveImage] = useState(0);
  const [togglingActive, setTogglingActive] = useState(false);
  const [imageError, setImageError] = useState("");

  async function handleToggleActive() {
    const next = !isActive;
    setTogglingActive(true);
    setIsActive(next);
    await toggleProductActive(product.id, next);
    setTogglingActive(false);
    router.refresh();
  }

  async function handleStockCommit(variantId: string, quantity: number) {
    await updateVariantStock(variantId, quantity);
    router.refresh();
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
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
        {brandLabel(product.brand)} · {categoryName}
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={togglingActive}
          className={`px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] transition-colors disabled:opacity-50 ${
            isActive
              ? "border border-black/15 bg-white text-black/60 hover:border-black/40 hover:text-black"
              : "bg-black text-white hover:bg-stone-800"
          }`}
        >
          {isActive ? "Set Inactive" : "Set Active"}
        </button>
      </div>

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
                  className={`absolute inset-0 overflow-hidden border transition-colors ${
                    index === activeImage ? "border-black" : "border-black/10 hover:border-black/30"
                  }`}
                >
                  <Image src={image} alt="" fill sizes="64px" className="object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image)}
                  aria-label="Remove image"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <TrashIcon className="h-5 w-5" />
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
            <p className="mt-3 text-sm text-black/70">{product.description}</p>
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
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => (
                    <tr key={variant.id} className="border-b border-black/5 last:border-b-0">
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
                        <StockCell variant={variant} onCommit={handleStockCommit} />
                      </td>
                    </tr>
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
