import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailContent } from "@/components/product-detail-content";
import { mockCategories } from "@/lib/mock-categories";
import { findProduct } from "@/lib/mock-products";

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = findProduct(slug);
  return {
    title: product
      ? `${product.name} | Products | Luxe All Fashion Admin`
      : "Product | Luxe All Fashion Admin",
  };
}

export default async function ProductDetailPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = findProduct(slug);

  if (!product) {
    notFound();
  }

  const category = mockCategories.find((c) => c.id === product.categoryId);

  return (
    <div>
      <Link
        href="/products"
        className="text-xs font-medium uppercase tracking-[0.1em] text-black/50 hover:text-black"
      >
        ← Back to Products
      </Link>
      <div className="mt-4">
        <ProductDetailContent product={product} category={category} />
      </div>
    </div>
  );
}
