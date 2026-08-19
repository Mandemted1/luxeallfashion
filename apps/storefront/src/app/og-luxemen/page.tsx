import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { mockOgLuxemenProducts } from "@/lib/mock-products";

export const metadata: Metadata = {
  title: "OG Luxemen | Luxe All Fashion",
};

export default function OgLuxemenPage() {
  return <CatalogPage title="OG Luxemen" products={mockOgLuxemenProducts} />;
}
