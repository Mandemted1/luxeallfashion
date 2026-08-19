import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { getCategoriesByBrand, getProductsByBrand } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Chicstyle | Luxe All Fashion",
};

export default async function ChicstylePage() {
  const [products, categories] = await Promise.all([
    getProductsByBrand("CHICSTYLE"),
    getCategoriesByBrand("CHICSTYLE"),
  ]);
  return (
    <CatalogPage title="Chicstyle" products={products} categories={categories} />
  );
}
