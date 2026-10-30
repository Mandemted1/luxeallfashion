"use server";

import { prisma } from "@luxe/database";
import type { CartItem } from "@/lib/cart-context";

// The bag's own cart state is client-side only (a cookie), so it has no
// idea what's actually left in stock — this is what lets the quantity
// stepper be capped to something real instead of unlimited. Same lookup
// shape as resolveCartItems in checkout/actions.ts, just read-only.
export async function getBagStock(items: CartItem[]): Promise<Record<string, number>> {
  const stockById: Record<string, number> = {};

  await Promise.all(
    items.map(async (item) => {
      const variant = await prisma.productVariant.findFirst({
        where: {
          size: item.size,
          colorName: item.colorName ?? "Default",
          product: { slug: item.slug },
        },
        select: { quantity: true },
      });
      stockById[item.id] = variant?.quantity ?? 0;
    }),
  );

  return stockById;
}
