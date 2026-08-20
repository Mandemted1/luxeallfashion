import { CatalogProducts } from "@/components/catalog-products";
import { SiteHeader } from "@/components/site-header";
import type { StorefrontCategory, StorefrontProduct } from "@/lib/catalog";

interface CatalogPageProps {
  title: string;
  products: StorefrontProduct[];
  categories?: StorefrontCategory[];
  promoBanner?: string | null;
  initialCategoryId?: string;
}

// Shared layout for New In / OG Luxemen / Chicstyle / Kiddies Space GH:
// heading with a short underline accent, filter/sort toolbar, product grid
// with load-more. The underline is sized as a percentage of the heading's
// own rendered width (via the relative/inline-block + absolute + % width
// trick) so it scales correctly whether the title is "New in" or the much
// longer "Kiddies Space GH", instead of a fixed pixel value tuned for one.
export function CatalogPage({
  title,
  products,
  categories = [],
  promoBanner,
  initialCategoryId,
}: CatalogPageProps) {
  return (
    <>
      <SiteHeader topBanner={promoBanner} />
      <div
        className={`px-4 pb-20 sm:px-6 lg:px-10 ${
          promoBanner ? "pt-[156px] sm:pt-[172px]" : "pt-28 sm:pt-32"
        }`}
      >
        <div className="relative inline-block pb-2">
          <h1 className="text-4xl font-normal sm:text-5xl">{title}</h1>
          <span
            className="absolute bottom-0 left-0 h-0.5 bg-black"
            style={{ width: "85%" }}
          />
        </div>

        {/* Keyed by the category param: a client-side nav from one category
            link to another only changes searchParams, not the route, so
            CatalogProducts wouldn't otherwise remount — and without a
            remount, its filter state's useState initializer never re-runs,
            silently ignoring the new initialCategoryId. */}
        <CatalogProducts
          key={initialCategoryId ?? "all"}
          products={products}
          categories={categories}
          initialCategoryId={initialCategoryId}
        />
      </div>
    </>
  );
}
