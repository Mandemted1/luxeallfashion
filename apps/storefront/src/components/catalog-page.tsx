import { CatalogProducts } from "@/components/catalog-products";
import { SiteHeader } from "@/components/site-header";
import type { MockProduct } from "@/lib/mock-products";

interface CatalogPageProps {
  title: string;
  products: MockProduct[];
}

// Shared layout for New In / OG Luxemen / Chicstyle / Kiddies Space GH:
// heading with a short underline accent, filter/sort toolbar, product grid
// with load-more. The underline is sized as a percentage of the heading's
// own rendered width (via the relative/inline-block + absolute + % width
// trick) so it scales correctly whether the title is "New in" or the much
// longer "Kiddies Space GH", instead of a fixed pixel value tuned for one.
export function CatalogPage({ title, products }: CatalogPageProps) {
  return (
    <>
      <SiteHeader />
      <div className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-10">
        <div className="relative inline-block pb-2">
          <h1 className="text-4xl font-normal sm:text-5xl">{title}</h1>
          <span
            className="absolute bottom-0 left-0 h-0.5 bg-black"
            style={{ width: "85%" }}
          />
        </div>

        <CatalogProducts products={products} />
      </div>
    </>
  );
}
