import type { StorefrontProduct, StorefrontProductColor } from "@/lib/catalog";

export type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
];

export function getAvailableSizes(products: StorefrontProduct[]): string[] {
  const sizes = new Set<string>();
  for (const product of products) {
    for (const size of product.sizes) sizes.add(size);
  }
  return Array.from(sizes);
}

export function getAvailableColors(
  products: StorefrontProduct[],
): StorefrontProductColor[] {
  const colors = new Map<string, StorefrontProductColor>();
  for (const product of products) {
    for (const color of product.colors) {
      if (!colors.has(color.name)) colors.set(color.name, color);
    }
  }
  return Array.from(colors.values());
}

export function applyFiltersAndSort(
  products: StorefrontProduct[],
  selectedSizes: Set<string>,
  selectedColors: Set<string>,
  selectedCategoryIds: Set<string>,
  sort: SortOption,
): StorefrontProduct[] {
  let result = products;

  if (selectedSizes.size > 0) {
    result = result.filter((product) =>
      product.sizes.some((size) => selectedSizes.has(size)),
    );
  }

  if (selectedColors.size > 0) {
    result = result.filter((product) =>
      product.colors.some((color) => selectedColors.has(color.name)),
    );
  }

  if (selectedCategoryIds.size > 0) {
    result = result.filter((product) =>
      selectedCategoryIds.has(product.categoryId),
    );
  }

  const sorted = [...result];
  switch (sort) {
    case "price-asc":
      sorted.sort((a, b) => a.priceGhs - b.priceGhs);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.priceGhs - a.priceGhs);
      break;
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      // "newest" — keep the catalog's original order.
      break;
  }
  return sorted;
}
