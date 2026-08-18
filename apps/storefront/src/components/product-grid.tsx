import { ProductCard } from "@/components/product-card";
import type { MockProduct } from "@/lib/mock-products";

export function ProductGrid({ products }: { products: MockProduct[] }) {
  return (
    <div className="mt-8 grid grid-cols-2 border-t border-l border-black lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
