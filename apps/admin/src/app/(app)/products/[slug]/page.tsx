import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@luxe/database";
import { ProductDetailContent } from "@/components/product-detail-content";
import { fromPrismaBrand } from "@/lib/brands";
import type { AdminProduct } from "@/lib/products";

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
    include: { variants: { orderBy: [{ size: "asc" }, { colorName: "asc" }] }, category: true },
  });

  if (!product) {
    notFound();
  }

  const item: AdminProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: fromPrismaBrand(product.brand),
    categoryId: product.categoryId,
    description: product.description,
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
  };

  return (
    <div>
      <Link
        href="/products"
        className="text-xs font-medium uppercase tracking-[0.1em] text-black/50 hover:text-black"
      >
        ← Back to Products
      </Link>
      <div className="mt-4">
        <ProductDetailContent product={item} categoryName={product.category.name} />
      </div>
    </div>
  );
}
