import { prisma } from "@luxe/database";
import { fromPrismaBrand } from "@/lib/brands";
import type { AdminProduct } from "@/lib/products";

export interface ProductDetailData {
  item: AdminProduct;
  categories: { id: string; name: string; parentId: string | null }[];
}

// Shared by the full /products/[slug] page (direct links, hard reloads)
// and the intercepted @modal route (clicking a card from the list) so
// both render the exact same data from one query, never two copies that
// can drift.
export async function getProductDetail(slug: string): Promise<ProductDetailData | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: { orderBy: [{ size: "asc" }, { colorName: "asc" }] },
      category: true,
      _count: { select: { orderItems: true } },
    },
  });

  if (!product || product.deletedAt) {
    return null;
  }

  const categories = await prisma.category.findMany({
    where: { brand: product.brand },
    orderBy: { name: "asc" },
  });

  const item: AdminProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brandName: product.brandName,
    brand: fromPrismaBrand(product.brand),
    categoryId: product.categoryId,
    description: product.description,
    material: product.material,
    images: product.images,
    isActive: product.isActive,
    isNewIn: product.isNewIn,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      sku: variant.sku,
      quantity: variant.quantity,
      priceGhs: variant.priceGhs,
    })),
    orderCount: product._count.orderItems,
  };

  return {
    item,
    categories: categories.map((c) => ({ id: c.id, name: c.name, parentId: c.parentId })),
  };
}
