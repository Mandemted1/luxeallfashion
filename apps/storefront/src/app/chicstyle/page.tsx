import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { mockChicstyleProducts } from "@/lib/mock-products";

export const metadata: Metadata = {
  title: "Chicstyle | Luxe All Fashion",
};

export default function ChicstylePage() {
  return <CatalogPage title="Chicstyle" products={mockChicstyleProducts} />;
}
