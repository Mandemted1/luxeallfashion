import { ProductCard } from "@/components/product-card";
import type { StorefrontProduct } from "@/lib/catalog";

export function ProductGrid({ products }: { products: StorefrontProduct[] }) {
  return (
    <div className="mt-8 grid grid-cols-3 gap-x-3 gap-y-10 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
