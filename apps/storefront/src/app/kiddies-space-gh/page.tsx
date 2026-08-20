import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { getCategoriesByBrand, getProductsByBrand } from "@/lib/catalog";
import { getActivePromoBanner } from "@/lib/homepage-content";

export const metadata: Metadata = {
  title: "Kiddies Space GH | Luxe All Fashion",
};

// The promo banner is admin-editable and should reflect live — without
// this, it'd be baked in at build/first-render time.
export const dynamic = "force-dynamic";

export default async function KiddiesSpaceGhPage(
  props: PageProps<"/kiddies-space-gh">,
) {
  const searchParams = await props.searchParams;
  const initialCategoryId =
    typeof searchParams.category === "string" ? searchParams.category : undefined;

  const [products, categories, promoBanner] = await Promise.all([
    getProductsByBrand("KIDDIES_SPACE_GH"),
    getCategoriesByBrand("KIDDIES_SPACE_GH"),
    getActivePromoBanner("KIDDIES_SPACE_GH"),
  ]);
  return (
    <CatalogPage
      title="Kiddies Space GH"
      products={products}
      categories={categories}
      promoBanner={promoBanner}
      initialCategoryId={initialCategoryId}
    />
  );
}
