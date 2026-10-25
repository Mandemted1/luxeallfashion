import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@luxe/database";
import { ProductDetailContent } from "@/components/product-detail-content";
import { getProductDetail } from "../get-product-detail";
import { requirePageAccess } from "@/lib/permissions";

// Without this, Next.js can serve a cached render of admin-mutated data.
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return {
    title: product && !product.deletedAt
      ? `${product.name} | Products | Luxe All Fashion Admin`
      : "Product | Luxe All Fashion Admin",
  };
}

export default async function ProductDetailPage(props: PageProps<"/products/[slug]">) {
  await requirePageAccess("PRODUCTS");

  const { slug } = await props.params;
  const detail = await getProductDetail(slug);

  if (!detail) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/products"
        className="text-xs font-medium uppercase tracking-[0.1em] text-black/50 hover:text-black"
      >
        ← Back to Products
      </Link>
      <div className="mt-4">
        <ProductDetailContent product={detail.item} categories={detail.categories} />
      </div>
    </div>
  );
}
