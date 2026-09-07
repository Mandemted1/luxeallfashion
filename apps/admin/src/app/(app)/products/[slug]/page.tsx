import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@luxe/database";
import { BackToProductsLink } from "@/components/back-to-products-link";
import { ProductDetailContent } from "@/components/product-detail-content";
import { fromPrismaBrand } from "@/lib/brands";
import type { AdminProduct } from "@/lib/products";

// Without this, Next.js can serve a cached render of admin-mutated data.
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return {
    title: product
      ? `${product.name} | Products | Luxe All Fashion Admin`
      : "Product | Luxe All Fashion Admin",
  };
}

export default async function ProductDetailPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: { orderBy: [{ size: "asc" }, { colorName: "asc" }] },
      category: true,
      _count: { select: { orderItems: true } },
    },
  });

  if (!product) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    where: { brand: product.brand },
    orderBy: { name: "asc" },
  });

  const item: AdminProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
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

  return (
    <div>
      <BackToProductsLink />
      <div className="mt-4">
        <ProductDetailContent
          product={item}
          categories={categories.map((c) => ({ id: c.id, name: c.name, parentId: c.parentId }))}
        />
      </div>
    </div>
  );
}
