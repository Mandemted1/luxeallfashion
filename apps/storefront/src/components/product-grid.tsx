import { ProductCard } from "@/components/product-card";
import type { MockProduct } from "@/lib/mock-products";

export function ProductGrid({ products }: { products: MockProduct[] }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-x-2 gap-y-10 sm:gap-x-3 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
