import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { ProductsContent } from "@/components/products-content";
import { fromPrismaBrand } from "@/lib/brands";
import type { AdminProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products | Luxe All Fashion Admin",
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { variants: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: [{ brand: "asc" }, { name: "asc" }] }),
  ]);

  const items: AdminProduct[] = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: fromPrismaBrand(product.brand),
    categoryId: product.categoryId,
    description: product.description,
    images: product.images,
    isActive: product.isActive,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      sku: variant.sku,
      quantity: variant.quantity,
      priceGhs: variant.priceGhs,
    })),
  }));

  const categoryItems = categories.map((category) => ({
    id: category.id,
    brand: fromPrismaBrand(category.brand),
    name: category.name,
    slug: category.slug,
  }));

  return <ProductsContent products={items} categories={categoryItems} />;
}
