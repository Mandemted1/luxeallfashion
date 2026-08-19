import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { getCategoriesByBrand, getProductsByBrand } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "OG Luxemen | Luxe All Fashion",
};

export default async function OgLuxemenPage() {
  const [products, categories] = await Promise.all([
    getProductsByBrand("OG_LUXEMEN"),
    getCategoriesByBrand("OG_LUXEMEN"),
  ]);
  return (
    <CatalogPage title="OG Luxemen" products={products} categories={categories} />
  );
}
