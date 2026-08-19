import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { getCategoriesByBrand, getProductsByBrand } from "@/lib/catalog";
import { getActivePromoBanner } from "@/lib/homepage-content";

export const metadata: Metadata = {
  title: "OG Luxemen | Luxe All Fashion",
};

// The promo banner is admin-editable and should reflect live — without
// this, it'd be baked in at build/first-render time.
export const dynamic = "force-dynamic";

export default async function OgLuxemenPage() {
  const [products, categories, promoBanner] = await Promise.all([
    getProductsByBrand("OG_LUXEMEN"),
    getCategoriesByBrand("OG_LUXEMEN"),
    getActivePromoBanner("OG_LUXEMEN"),
  ]);
  return (
    <CatalogPage
      title="OG Luxemen"
      products={products}
      categories={categories}
      promoBanner={promoBanner}
    />
  );
}
