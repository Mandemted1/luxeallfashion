import type { Metadata } from "next";
import { OrdersContent } from "@/components/orders-content";

export const metadata: Metadata = {
  title: "Orders — Luxe All Fashion Admin",
};

export default function OrdersPage() {
  return <OrdersContent />;
}
