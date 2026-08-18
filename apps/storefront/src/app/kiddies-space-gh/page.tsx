import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { mockKiddiesSpaceProducts } from "@/lib/mock-products";

export const metadata: Metadata = {
  title: "Kiddies Space GH — Luxe All Fashion",
};

export default function KiddiesSpaceGhPage() {
  return (
    <CatalogPage title="Kiddies Space GH" products={mockKiddiesSpaceProducts} />
  );
}
