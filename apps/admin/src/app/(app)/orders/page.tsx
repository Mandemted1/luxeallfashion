import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { OrdersContent } from "@/components/orders-content";
import { mapAdminOrder } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Orders | Luxe All Fashion Admin",
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      deliveryRegion: true,
      items: { include: { product: true, variant: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <OrdersContent orders={orders.map(mapAdminOrder)} />;
}
