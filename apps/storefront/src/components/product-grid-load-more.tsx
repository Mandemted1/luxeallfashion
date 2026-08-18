"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/product-grid";
import type { MockProduct } from "@/lib/mock-products";
import { useIsDesktop } from "@/lib/use-is-desktop";

// Matches ProductGrid's own breakpoint: 3 columns below lg, 4 at lg+.
const MOBILE_COLUMNS = 3;
const DESKTOP_COLUMNS = 4;

interface ProductGridLoadMoreProps {
  products: MockProduct[];
  initialRows?: number;
}

export function ProductGridLoadMore({
  products,
  initialRows = 2,
}: ProductGridLoadMoreProps) {
  const isDesktop = useIsDesktop();
  const columns = isDesktop ? DESKTOP_COLUMNS : MOBILE_COLUMNS;

  // Track rows loaded beyond the initial set (not an absolute item count)
  // so the visible count is always re-derived from the *current* column
  // count on every render — including right after hydration resolves the
  // real breakpoint (getServerSnapshot assumes mobile), and if the window
  // is resized across the lg breakpoint. That keeps "Load More" landing on
  // a row boundary instead of freezing at a stale, mismatched count.
  const [extraRowsLoaded, setExtraRowsLoaded] = useState(0);
  const visibleCount = Math.min(
    (initialRows + extraRowsLoaded) * columns,
    products.length,
  );
  const hasMore = visibleCount < products.length;

  return (
    <>
      <ProductGrid products={products.slice(0, visibleCount)} />
      {hasMore && (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={() => setExtraRowsLoaded((n) => n + 1)}
            className="border border-black px-10 py-3 text-xs font-medium uppercase tracking-[0.2em] transition-colors hover:bg-black hover:text-white"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}
