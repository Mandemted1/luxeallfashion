"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@luxe/database";
import { toPrismaBrand, type Brand } from "@/lib/brands";
import { slugify } from "@/lib/categories";

export async function createCategory(
  brand: Brand,
  name: string,
): Promise<{ error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Enter a category name." };

  const prismaBrand = toPrismaBrand(brand);
  const slug = slugify(trimmed);

  const existing = await prisma.category.findUnique({
    where: { brand_slug: { brand: prismaBrand, slug } },
  });
  if (existing) {
    return { error: "A category with this name already exists under this store." };
  }

  await prisma.category.create({ data: { brand: prismaBrand, name: trimmed, slug } });
  revalidatePath("/categories");
  return {};
}

export async function renameCategory(
  id: string,
  name: string,
): Promise<{ error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Enter a category name." };

  const category = await prisma.category.findUniqueOrThrow({ where: { id } });
  const slug = slugify(trimmed);

  const existing = await prisma.category.findUnique({
    where: { brand_slug: { brand: category.brand, slug } },
  });
  if (existing && existing.id !== id) {
    return { error: "A category with this name already exists under this store." };
  }

  await prisma.category.update({ where: { id }, data: { name: trimmed, slug } });
  revalidatePath("/categories");
  return {};
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return {
      error: `Can't delete: ${productCount} product${productCount === 1 ? "" : "s"} still use this category.`,
    };
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
  return {};
}
