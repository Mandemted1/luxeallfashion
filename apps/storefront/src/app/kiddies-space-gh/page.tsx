import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { getCategoriesByBrand, getProductsByBrand } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Kiddies Space GH | Luxe All Fashion",
};

export default async function KiddiesSpaceGhPage() {
  const [products, categories] = await Promise.all([
    getProductsByBrand("KIDDIES_SPACE_GH"),
    getCategoriesByBrand("KIDDIES_SPACE_GH"),
  ]);
  return (
    <CatalogPage
      title="Kiddies Space GH"
      products={products}
      categories={categories}
    />
  );
}
