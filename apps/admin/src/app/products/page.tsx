import type { Metadata } from "next";
import { ProductsContent } from "@/components/products-content";

export const metadata: Metadata = {
  title: "Products | Luxe All Fashion Admin",
};

export default function ProductsPage() {
  return <ProductsContent />;
}
