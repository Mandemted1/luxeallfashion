import type { Metadata } from "next";
import { CatalogToolbar } from "@/components/catalog-toolbar";
import { ProductGridLoadMore } from "@/components/product-grid-load-more";
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
        <div className="inline-block">
          <h1 className="text-4xl font-normal sm:text-5xl">New in</h1>
          <div className="mt-2 h-0.5 w-28 bg-black sm:w-32" />
        </div>

        <CatalogToolbar />
        <ProductGridLoadMore
          products={mockNewInProducts}
          initialCount={6}
          batchSize={3}
        />
      </div>
    </>
  );
}
