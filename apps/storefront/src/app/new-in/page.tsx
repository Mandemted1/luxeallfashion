import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { mockNewInProducts } from "@/lib/mock-products";

export const metadata: Metadata = {
  title: "New In | Luxe All Fashion",
};

export default function NewInPage() {
  return <CatalogPage title="New in" products={mockNewInProducts} />;
}
