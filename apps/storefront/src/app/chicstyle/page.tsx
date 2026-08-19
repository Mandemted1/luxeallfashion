import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { getCategoriesByBrand, getProductsByBrand } from "@/lib/catalog";
import { getActivePromoBanner } from "@/lib/homepage-content";

export const metadata: Metadata = {
  title: "Chicstyle | Luxe All Fashion",
};

// The promo banner is admin-editable and should reflect live — without
// this, it'd be baked in at build/first-render time.
export const dynamic = "force-dynamic";

export default async function ChicstylePage() {
  const [products, categories, promoBanner] = await Promise.all([
    getProductsByBrand("CHICSTYLE"),
    getCategoriesByBrand("CHICSTYLE"),
    getActivePromoBanner("CHICSTYLE"),
  ]);
  return (
    <CatalogPage
      title="Chicstyle"
      products={products}
      categories={categories}
      promoBanner={promoBanner}
    />
  );
}
