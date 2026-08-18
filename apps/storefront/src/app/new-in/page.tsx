import type { Metadata } from "next";
import { CatalogToolbar } from "@/components/catalog-toolbar";
import { ProductGrid } from "@/components/product-grid";
import { SiteHeader } from "@/components/site-header";
import { mockNewInProducts } from "@/lib/mock-products";

export const metadata: Metadata = {
  title: "New In — Luxe All Fashion",
};

export default function NewInPage() {
  return (
    <>
      <SiteHeader />
      <div className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-10">
        <h1 className="inline-block border-b-2 border-black pb-2 text-4xl font-normal sm:text-5xl">
          New in
        </h1>

        <CatalogToolbar />
        <ProductGrid products={mockNewInProducts} />
      </div>
    </>
  );
}
