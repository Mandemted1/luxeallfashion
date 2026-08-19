"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createProduct } from "@/app/(app)/products/actions";
import { brandFilters, type Brand } from "@/lib/brands";

const labelClass = "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-black/50";
const inputClass =
  "border border-black/20 bg-white px-4 py-3 text-sm text-black normal-case tracking-normal focus:border-black focus:outline-none";

const brands: Brand[] = brandFilters
  .map((filter) => filter.value)
  .filter((value): value is Brand => value !== "all");

export function NewProductForm({
  categories,
}: {
  categories: { id: string; brand: Brand; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState<Brand>(brands[0]);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [imageLines, setImageLines] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categoriesForBrand = categories.filter((category) => category.brand === brand);

  function handleBrandChange(next: Brand) {
    setBrand(next);
    setCategoryId("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryId) {
      setError("Select a category.");
      return;
    }

    setSubmitting(true);
    setError("");

    const result = await createProduct({
      name,
      brand,
      categoryId,
      description,
      material,
      images: imageLines.split("\n").map((line) => line.trim()),
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push(`/products/${result.slug}`);
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold">New Product</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <label className={labelClass}>
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Store
            <select
              value={brand}
              onChange={(event) => handleBrandChange(event.target.value as Brand)}
              className={inputClass}
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {brandFilters.find((f) => f.value === b)?.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Category
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className={inputClass}
            >
              <option value="">Select category</option>
              {categoriesForBrand.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoriesForBrand.length === 0 && (
              <span className="normal-case tracking-normal text-red-600">
                This store has no categories yet, create one first.
              </span>
            )}
          </label>
        </div>

        <label className={labelClass}>
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Material (optional)
          <input
            value={material}
            onChange={(event) => setMaterial(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Image URLs (one per line)
          <textarea
            value={imageLines}
            onChange={(event) => setImageLines(event.target.value)}
            rows={3}
            placeholder="/mock/products/example.jpg"
            className={inputClass}
          />
          <span className="normal-case tracking-normal text-black/40">
            Direct image upload isn&apos;t wired up yet, paste a URL for now.
          </span>
        </label>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 bg-black py-3 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
