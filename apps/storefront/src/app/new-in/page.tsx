import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { getNewInProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "New In | Luxe All Fashion",
};

export default async function NewInPage() {
  const products = await getNewInProducts();
  return <CatalogPage title="New in" products={products} />;
}
