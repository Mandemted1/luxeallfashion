"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/product-grid";
import type { MockProduct } from "@/lib/mock-products";

interface ProductGridLoadMoreProps {
  products: MockProduct[];
  initialCount?: number;
  batchSize?: number;
}

export function ProductGridLoadMore({
  products,
  initialCount = 6,
  batchSize = 3,
}: ProductGridLoadMoreProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const hasMore = visibleCount < products.length;

  return (
    <>
      <ProductGrid products={products.slice(0, visibleCount)} />
      {hasMore && (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + batchSize, products.length),
              )
            }
            className="border border-black px-10 py-3 text-xs font-medium uppercase tracking-[0.2em] transition-colors hover:bg-black hover:text-white"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}
