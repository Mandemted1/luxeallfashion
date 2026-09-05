import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { CategoriesContent } from "@/components/categories-content";
import { fromPrismaBrand } from "@/lib/brands";

export const metadata: Metadata = {
  title: "Categories | Luxe All Fashion Admin",
};

// Without this, Next.js can serve a cached render of admin-mutated data.
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ brand: "asc" }, { name: "asc" }] }),
    prisma.product.groupBy({ by: ["categoryId"], _count: { categoryId: true } }),
  ]);

  const productCounts = Object.fromEntries(
    counts.map((c) => [c.categoryId, c._count.categoryId]),
  );

  const items = categories.map((category) => ({
    id: category.id,
    brand: fromPrismaBrand(category.brand),
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
  }));

  return <CategoriesContent categories={items} productCounts={productCounts} />;
}
