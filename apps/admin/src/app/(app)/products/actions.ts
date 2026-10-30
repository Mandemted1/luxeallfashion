"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@luxe/database";
import { requireAction } from "@/lib/permissions";
import { MAX_PRODUCT_IMAGES } from "@/lib/products";
import {
  addVariantCore,
  createProductCore,
  toggleProductActiveCore,
  type AddVariantInput,
  type CreateProductInput,
} from "@/lib/products-core";
import { deleteR2Object } from "@/lib/r2";
import { safeRevalidatePath } from "@/lib/safe-revalidate";

export async function createProduct(
  input: CreateProductInput,
): Promise<{ error?: string; slug?: string }> {
  const guard = await requireAction("PRODUCTS_CREATE");
  if (guard.error) return guard;
  return createProductCore(input);
}

// Trusted-internal only — see products-core.ts for why this is safe to
// export unguarded (it can never become a client-callable server action
// on its own, regardless of what imports it).
export { createProductCore as createProductInternal };

export async function updateProduct(
  productId: string,
  patch: {
    name?: string;
    brandName?: string;
    description?: string;
    material?: string;
    categoryId?: string;
  },
): Promise<{ error?: string }> {
  const guard = await requireAction("PRODUCTS_EDIT");
  if (guard.error) return guard;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Product not found." };

  const data: {
    name?: string;
    slug?: string;
    brandName?: string | null;
    description?: string;
    material?: string | null;
    categoryId?: string;
  } = {};

  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (!name) return { error: "Enter a product name." };
    data.name = name;
  }

  if (patch.brandName !== undefined) {
    data.brandName = patch.brandName.trim() || null;
  }

  if (patch.description !== undefined) {
    data.description = patch.description.trim() || "No description yet.";
  }

  if (patch.material !== undefined) {
    data.material = patch.material.trim() || null;
  }

  if (patch.categoryId !== undefined) {
    const category = await prisma.category.findUnique({ where: { id: patch.categoryId } });
    if (!category || category.brand !== product.brand) {
      return { error: "Select a valid category for this store." };
    }
    data.categoryId = patch.categoryId;
  }

  const updated = await prisma.product.update({ where: { id: productId }, data });

  revalidatePath("/products");
  revalidatePath(`/products/${updated.slug}`);
  return {};
}

export async function deleteProduct(productId: string): Promise<{ error?: string }> {
  const guard = await requireAction("PRODUCTS_DELETE");
  if (guard.error) return guard;

  const orderCount = await prisma.orderItem.count({ where: { productId } });

  if (orderCount > 0) {
    // OrderItem.productId is a required FK — a real row delete would break
    // that order's history. Soft-delete instead: hidden everywhere (forced
    // inactive too) but the row itself stays so old orders keep resolving
    // exactly what was bought, images included.
    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date(), isActive: false },
    });
    revalidatePath("/products");
    return {};
  }

  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  await prisma.product.delete({ where: { id: productId } }); // variants cascade automatically

  // Best-effort — an image URL that was never an R2 object (e.g. a seeded
  // /mock/products/... path) shouldn't block the product delete, which has
  // already committed at this point.
  await Promise.all(
    product.images.map((url) =>
      deleteR2Object(url).catch((error) => console.error("[R2 delete error]", error)),
    ),
  );

  revalidatePath("/products");
  return {};
}

export async function toggleProductActive(
  productId: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  const guard = await requireAction("PRODUCTS_TOGGLE_ACTIVE");
  if (guard.error) return guard;
  return toggleProductActiveCore(productId, isActive);
}

// Trusted-internal only — see products-core.ts.
export { toggleProductActiveCore as toggleProductActiveInternal };

export async function toggleProductNewIn(
  productId: string,
  isNewIn: boolean,
): Promise<{ error?: string }> {
  const guard = await requireAction("PRODUCTS_EDIT");
  if (guard.error) return guard;

  await prisma.product.update({ where: { id: productId }, data: { isNewIn } });
  revalidatePath("/products");
  return {};
}

export async function bulkSetProductActive(
  productIds: string[],
  isActive: boolean,
): Promise<{ error?: string; skippedNames?: string[] }> {
  const guard = await requireAction("PRODUCTS_TOGGLE_ACTIVE");
  if (guard.error) return guard;

  if (productIds.length === 0) return {};

  if (!isActive) {
    await prisma.product.updateMany({ where: { id: { in: productIds } }, data: { isActive: false } });
    revalidatePath("/products");
    return {};
  }

  // Same rule as the single-product toggle: a product with no variants
  // has nothing to sell, so it's skipped rather than blocking the whole
  // batch — the admin still gets everything else activated at once.
  const variantCounts = await prisma.productVariant.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _count: true,
  });
  const idsWithVariants = new Set(variantCounts.map((row) => row.productId));
  const activatableIds = productIds.filter((id) => idsWithVariants.has(id));
  const skippedIds = productIds.filter((id) => !idsWithVariants.has(id));

  if (activatableIds.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: activatableIds } },
      data: { isActive: true },
    });
  }

  let skippedNames: string[] | undefined;
  if (skippedIds.length > 0) {
    const skippedProducts = await prisma.product.findMany({
      where: { id: { in: skippedIds } },
      select: { name: true },
    });
    skippedNames = skippedProducts.map((p) => p.name);
  }

  revalidatePath("/products");
  return { skippedNames };
}

export async function updateVariantStock(
  variantId: string,
  quantity: number,
): Promise<{ error?: string }> {
  const guard = await requireAction("PRODUCTS_MANAGE_VARIANTS");
  if (guard.error) return guard;

  if (quantity < 0) return { error: "Stock can't be negative." };
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { quantity: Math.round(quantity) },
  });
  revalidatePath("/products");
  return {};
}

export async function updateVariant(
  variantId: string,
  patch: {
    size?: string;
    colorName?: string;
    colorHex?: string;
    priceGhs?: number;
  },
): Promise<{ error?: string }> {
  const guard = await requireAction("PRODUCTS_MANAGE_VARIANTS");
  if (guard.error) return guard;

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) return { error: "Variant not found." };

  const data: { size?: string; colorName?: string; colorHex?: string; priceGhs?: number } = {};

  const nextSize = patch.size !== undefined ? patch.size.trim() : variant.size;
  const nextColorName =
    patch.colorName !== undefined ? patch.colorName.trim() || "Default" : variant.colorName;

  if (patch.size !== undefined || patch.colorName !== undefined) {
    if (!nextSize) return { error: "Enter a size." };
    if (nextSize !== variant.size || nextColorName !== variant.colorName) {
      const existing = await prisma.productVariant.findUnique({
        where: {
          productId_size_colorName: {
            productId: variant.productId,
            size: nextSize,
            colorName: nextColorName,
          },
        },
      });
      if (existing && existing.id !== variantId) {
        return { error: "A variant with this size and color already exists." };
      }
    }
    data.size = nextSize;
    data.colorName = nextColorName;
  }

  if (patch.colorHex !== undefined) {
    data.colorHex = patch.colorHex.trim() || "#151515";
  }

  if (patch.priceGhs !== undefined) {
    if (!patch.priceGhs || patch.priceGhs <= 0) return { error: "Enter a valid price." };
    data.priceGhs = Math.round(patch.priceGhs);
  }

  const updated = await prisma.productVariant.update({ where: { id: variantId }, data });
  const product = await prisma.product.findUniqueOrThrow({ where: { id: updated.productId } });

  revalidatePath(`/products/${product.slug}`);
  return {};
}

export async function removeVariant(variantId: string): Promise<{ error?: string }> {
  const guard = await requireAction("PRODUCTS_MANAGE_VARIANTS");
  if (guard.error) return guard;

  const orderItemCount = await prisma.orderItem.count({ where: { variantId } });
  if (orderItemCount > 0) {
    return { error: "Can't delete: this variant has been ordered. Set its stock to 0 instead." };
  }

  const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
  const product = await prisma.product.findUniqueOrThrow({ where: { id: variant.productId } });

  await prisma.productVariant.delete({ where: { id: variantId } });

  safeRevalidatePath(`/products/${product.slug}`);
  return {};
}

export async function addVariant(input: AddVariantInput): Promise<{ error?: string }> {
  const guard = await requireAction("PRODUCTS_MANAGE_VARIANTS");
  if (guard.error) return guard;
  return addVariantCore(input);
}

// Trusted-internal only — see products-core.ts.
export { addVariantCore as addVariantInternal };

export async function addProductImage(
  productId: string,
  url: string,
): Promise<{ error?: string }> {
  const guard = await requireAction("PRODUCTS_EDIT");
  if (guard.error) return guard;

  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  if (product.images.length >= MAX_PRODUCT_IMAGES) {
    return { error: `You can only upload up to ${MAX_PRODUCT_IMAGES} images per product.` };
  }
  await prisma.product.update({
    where: { id: productId },
    data: { images: [...product.images, url] },
  });
  revalidatePath(`/products/${product.slug}`);
  return {};
}

export async function removeProductImage(
  productId: string,
  url: string,
): Promise<{ error?: string }> {
  const guard = await requireAction("PRODUCTS_EDIT");
  if (guard.error) return guard;

  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  await prisma.product.update({
    where: { id: productId },
    data: { images: product.images.filter((image) => image !== url) },
  });
  // Best-effort — if this fails (e.g. the file was never an R2 object,
  // like the seeded /mock/products/... paths), the DB update above still
  // stands, no need to surface an error for that.
  try {
    await deleteR2Object(url);
  } catch (error) {
    console.error("[R2 delete error]", error);
  }
  revalidatePath(`/products/${product.slug}`);
  return {};
}
