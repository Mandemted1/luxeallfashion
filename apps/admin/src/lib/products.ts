import type { Brand } from "@/lib/brands";

// Product listing is designed around 4 images per product — capped here so
// the admin can't upload more than the storefront is meant to show.
export const MAX_PRODUCT_IMAGES = 4;

export interface AdminProductVariant {
  id: string;
  size: string;
  colorName: string;
  colorHex: string;
  sku: string;
  quantity: number;
  priceGhs: number;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  brand: Brand;
  categoryId: string;
  description: string;
  images: string[];
  isActive: boolean;
  isNewIn: boolean;
  variants: AdminProductVariant[];
  // Number of OrderItem rows referencing this product -- deleting a product
  // with order history would break those orders' records, so the admin only
  // allows a hard delete when this is 0 (otherwise Set Inactive is the way).
  orderCount: number;
}

export function productStockTotal(product: AdminProduct): number {
  return product.variants.reduce((sum, variant) => sum + variant.quantity, 0);
}

export function productPriceRangeGhs(product: AdminProduct): { min: number; max: number } {
  const prices = product.variants.map((variant) => variant.priceGhs);
  if (prices.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
