"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@luxe/database";
import { toPrismaBrand, type Brand } from "@/lib/brands";
import { slugify } from "@/lib/categories";

export async function createProduct(input: {
  name: string;
  brand: Brand;
  categoryId: string;
  description: string;
  material: string;
  images: string[];
}): Promise<{ error?: string; slug?: string }> {
  const name = input.name.trim();
  if (!name) return { error: "Enter a product name." };

  const slug = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) return { error: "A product with this name already exists." };

  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category || category.brand !== toPrismaBrand(input.brand)) {
    return { error: "Select a valid category for this store." };
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: input.description.trim() || "No description yet.",
      material: input.material.trim() || null,
      brand: toPrismaBrand(input.brand),
      categoryId: input.categoryId,
      images: input.images.filter((src) => src.trim().length > 0),
    },
  });

  revalidatePath("/products");
  return { slug: product.slug };
}

export async function toggleProductActive(
  productId: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  await prisma.product.update({ where: { id: productId }, data: { isActive } });
  revalidatePath("/products");
  return {};
}

export async function updateVariantStock(
  variantId: string,
  quantity: number,
): Promise<{ error?: string }> {
  if (quantity < 0) return { error: "Stock can't be negative." };
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { quantity: Math.round(quantity) },
  });
  revalidatePath("/products");
  return {};
}

export async function addVariant(input: {
  productId: string;
  size: string;
  colorName: string;
  colorHex: string;
  priceGhs: number;
  quantity: number;
}): Promise<{ error?: string }> {
  const size = input.size.trim();
  const colorName = input.colorName.trim() || "Default";
  if (!size) return { error: "Enter a size." };
  if (!input.priceGhs || input.priceGhs <= 0) return { error: "Enter a valid price." };

  const existing = await prisma.productVariant.findUnique({
    where: {
      productId_size_colorName: { productId: input.productId, size, colorName },
    },
  });
  if (existing) return { error: "A variant with this size and color already exists." };

  const product = await prisma.product.findUniqueOrThrow({
    where: { id: input.productId },
  });
  const sku = `${product.slug}-${size}-${colorName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  await prisma.productVariant.create({
    data: {
      productId: input.productId,
      size,
      colorName,
      colorHex: input.colorHex.trim() || "#151515",
      sku,
      quantity: Math.max(0, Math.round(input.quantity)),
      priceGhs: Math.round(input.priceGhs),
    },
  });

  revalidatePath(`/products/${product.slug}`);
  return {};
}
