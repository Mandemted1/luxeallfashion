import { prisma, type Brand as PrismaBrand } from "@luxe/database";

export const FALLBACK_IMAGE_SRC = "/mock/products/tropical-print-camp-shirt.jpg";

export interface StorefrontProductColor {
  name: string;
  hex: string;
}

export interface StorefrontProduct {
  id: string;
  slug: string;
  name: string;
  brandName: string | null;
  priceGhs: number; // lowest variant price
  images: string[];
  colors: StorefrontProductColor[];
  sizes: string[];
  description: string;
  categoryId: string;
  categoryName: string;
  isNewIn: boolean;
}

export interface StorefrontCategory {
  id: string;
  name: string;
  parentId: string | null;
}

function mapProduct(product: {
  id: string;
  slug: string;
  name: string;
  brandName: string | null;
  description: string;
  images: string[];
  categoryId: string;
  category: { name: string };
  variants: { size: string; colorName: string; colorHex: string; priceGhs: number }[];
  isNewIn: boolean;
}): StorefrontProduct {
  const colorsMap = new Map<string, StorefrontProductColor>();
  const sizesSet = new Set<string>();
  const prices: number[] = [];

  for (const variant of product.variants) {
    sizesSet.add(variant.size);
    prices.push(variant.priceGhs);
    if (variant.colorName !== "Default" && !colorsMap.has(variant.colorName)) {
      colorsMap.set(variant.colorName, { name: variant.colorName, hex: variant.colorHex });
    }
  }

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brandName: product.brandName,
    priceGhs: prices.length > 0 ? Math.min(...prices) : 0,
    images: product.images.length > 0 ? product.images : [FALLBACK_IMAGE_SRC],
    colors: Array.from(colorsMap.values()),
    sizes: Array.from(sizesSet),
    description: product.description,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    isNewIn: product.isNewIn,
  };
}

const productInclude = {
  category: { select: { name: true } },
  variants: {
    select: { size: true, colorName: true, colorHex: true, priceGhs: true },
  },
} as const;

export async function getProductsByBrand(brand: PrismaBrand): Promise<StorefrontProduct[]> {
  const products = await prisma.product.findMany({
    where: { brand, isActive: true },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
}

export async function getCategoriesByBrand(brand: PrismaBrand): Promise<StorefrontCategory[]> {
  const categories = await prisma.category.findMany({
    where: { brand },
    orderBy: { name: "asc" },
  });
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    parentId: category.parentId,
  }));
}

export async function getProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: productInclude,
  });
  return product ? mapProduct(product) : null;
}

export async function getNewInProducts(): Promise<StorefrontProduct[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, isNewIn: true },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
}

export async function searchProducts(query: string): Promise<StorefrontProduct[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { brandName: { contains: query, mode: "insensitive" } },
      ],
    },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
}

export async function getRelatedProducts(
  categoryId: string,
  excludeSlug: string,
  limit = 4,
): Promise<StorefrontProduct[]> {
  const products = await prisma.product.findMany({
    where: { categoryId, isActive: true, slug: { not: excludeSlug } },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(mapProduct);
}
