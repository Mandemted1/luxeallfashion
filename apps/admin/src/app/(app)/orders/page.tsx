import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { OrdersContent } from "@/components/orders-content";
import { mapAdminOrder, ORDERS_PAGE_SIZE } from "@/lib/orders";
import { requirePageAccess } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Orders | Luxe All Fashion Admin",
};

// Without this, Next.js can serve a cached render of admin-mutated data.
export const dynamic = "force-dynamic";

// This page loads the first page server-side; loadMoreOrders fetches the
// rest on demand instead of this query pulling every order ever placed
// (with its full item/product/variant joins) on every single page load.

export default async function OrdersPage() {
  await requirePageAccess("ORDERS");

  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      deliveryRegion: true,
      items: { include: { product: true, variant: true } },
    },
    orderBy: { createdAt: "desc" },
    take: ORDERS_PAGE_SIZE,
  });

  return (
    <OrdersContent
      orders={orders.map(mapAdminOrder)}
      hasMore={orders.length === ORDERS_PAGE_SIZE}
    />
  );
}
