"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@luxe/database";
import { toPrismaBrand, type Brand } from "@/lib/brands";
import { slugify } from "@/lib/categories";

export async function createCategory(
  brand: Brand,
  name: string,
  parentId: string | null = null,
): Promise<{ error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Enter a category name." };

  const prismaBrand = toPrismaBrand(brand);
  const slug = slugify(trimmed);

  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent || parent.brand !== prismaBrand) {
      return { error: "Parent category not found for this store." };
    }
    if (parent.parentId) {
      return { error: "Categories can only be nested one level deep." };
    }
  }

  const existing = await prisma.category.findFirst({
    where: { brand: prismaBrand, parentId, slug },
  });
  if (existing) {
    return { error: "A category with this name already exists here." };
  }

  await prisma.category.create({ data: { brand: prismaBrand, name: trimmed, slug, parentId } });
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

  const existing = await prisma.category.findFirst({
    where: { brand: category.brand, parentId: category.parentId, slug },
  });
  if (existing && existing.id !== id) {
    return { error: "A category with this name already exists here." };
  }

  await prisma.category.update({ where: { id }, data: { name: trimmed, slug } });
  revalidatePath("/categories");
  return {};
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  const [productCount, childCount] = await Promise.all([
    prisma.product.count({ where: { categoryId: id } }),
    prisma.category.count({ where: { parentId: id } }),
  ]);
  if (productCount > 0) {
    return {
      error: `Can't delete: ${productCount} product${productCount === 1 ? "" : "s"} still use this category.`,
    };
  }
  if (childCount > 0) {
    return {
      error: `Can't delete: ${childCount} subcategor${childCount === 1 ? "y" : "ies"} still under this one. Delete those first.`,
    };
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
  return {};
}
