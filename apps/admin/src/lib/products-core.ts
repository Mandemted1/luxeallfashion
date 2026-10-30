// Trusted-internal product mutations — no permission guard of their own.
// Deliberately NOT in a "use server" file: Next.js only ever turns an
// export into a directly-callable server action when the file it lives
// in is marked "use server", so keeping these in a plain module means
// they can never become a reachable endpoint on their own, no matter
// what imports them later. The real callers are the guarded public
// wrappers in products/actions.ts (createProduct, toggleProductActive,
// addVariant) and approveInstagramDraftCore in instagram-drafts/actions.ts
// (gated on INSTAGRAM_DRAFTS_REVIEW, or running from the standalone
// Instagram sync script with no client reachable at all) — never call
// these directly from anywhere else.
import { prisma } from "@luxe/database";
import { toPrismaBrand, type Brand } from "@/lib/brands";
import { slugify } from "@/lib/categories";
import { MAX_PRODUCT_IMAGES } from "@/lib/products";
import { safeRevalidatePath } from "@/lib/safe-revalidate";

export interface CreateProductInput {
  name: string;
  brandName: string;
  brand: Brand;
  categoryId: string;
  description: string;
  material: string;
  images: string[];
  isNewIn: boolean;
  isActive?: boolean;
  variants?: {
    size: string;
    colorName: string;
    colorHex: string;
    priceGhs: number;
    quantity: number;
  }[];
}

export async function createProductCore(
  input: CreateProductInput,
): Promise<{ error?: string; slug?: string }> {
  const name = input.name.trim();
  if (!name) return { error: "Enter a product name." };

  const slug = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) return { error: "A product with this name already exists." };

  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category || category.brand !== toPrismaBrand(input.brand)) {
    return { error: "Select a valid category for this store." };
  }

  const images = input.images.filter((src) => src.trim().length > 0);
  if (images.length > MAX_PRODUCT_IMAGES) {
    return { error: `You can only upload up to ${MAX_PRODUCT_IMAGES} images per product.` };
  }

  const variantInputs = input.variants ?? [];
  const seenVariants = new Set<string>();
  for (const variant of variantInputs) {
    const size = variant.size.trim();
    const colorName = variant.colorName.trim();
    if (!size || !colorName) return { error: "Each variant needs a size and color." };
    if (!variant.priceGhs || variant.priceGhs <= 0) {
      return { error: "Enter a valid price for each variant." };
    }
    const key = `${size.toLowerCase()}-${colorName.toLowerCase()}`;
    if (seenVariants.has(key)) {
      return { error: `You've listed "${size} / ${colorName}" more than once.` };
    }
    seenVariants.add(key);
  }

  const variants = variantInputs.map((variant) => {
    const size = variant.size.trim();
    const colorName = variant.colorName.trim();
    const sku = `${slug}-${size}-${colorName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return {
      size,
      colorName,
      colorHex: variant.colorHex.trim() || "#151515",
      sku,
      quantity: Math.max(0, Math.round(variant.quantity)),
      priceGhs: Math.round(variant.priceGhs),
    };
  });

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      brandName: input.brandName.trim() || null,
      description: input.description.trim() || "No description yet.",
      material: input.material.trim() || null,
      brand: toPrismaBrand(input.brand),
      categoryId: input.categoryId,
      images,
      isNewIn: input.isNewIn,
      // Can only go live with stock on the shelf — only honor isActive
      // when at least one variant came in with it, same rule
      // toggleProductActiveCore enforces afterwards for every other path.
      isActive: Boolean(input.isActive) && variants.length > 0,
      variants: variants.length > 0 ? { create: variants } : undefined,
    },
  });

  safeRevalidatePath("/products");
  return { slug: product.slug };
}

export async function toggleProductActiveCore(
  productId: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  if (isActive) {
    const variantCount = await prisma.productVariant.count({ where: { productId } });
    if (variantCount === 0) {
      return { error: "Add at least one size/color before setting this product Active." };
    }
  }
  await prisma.product.update({ where: { id: productId }, data: { isActive } });
  safeRevalidatePath("/products");
  return {};
}

export interface AddVariantInput {
  productId: string;
  size: string;
  colorName: string;
  colorHex: string;
  priceGhs: number;
  quantity: number;
}

export async function addVariantCore(input: AddVariantInput): Promise<{ error?: string }> {
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

  safeRevalidatePath(`/products/${product.slug}`);
  return {};
}
