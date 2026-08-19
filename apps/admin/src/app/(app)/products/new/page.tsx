import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@luxe/database";
import { NewProductForm } from "@/components/new-product-form";
import { fromPrismaBrand } from "@/lib/brands";

export const metadata: Metadata = {
  title: "New Product | Luxe All Fashion Admin",
};

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ brand: "asc" }, { name: "asc" }],
  });

  const categoryItems = categories.map((category) => ({
    id: category.id,
    brand: fromPrismaBrand(category.brand),
    name: category.name,
  }));

  return (
    <div>
      <Link
        href="/products"
        className="text-xs font-medium uppercase tracking-[0.1em] text-black/50 hover:text-black"
      >
        ← Back to Products
      </Link>
      <div className="mt-4">
        <NewProductForm categories={categoryItems} />
      </div>
    </div>
  );
}
