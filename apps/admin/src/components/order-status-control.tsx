"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderStatus } from "@/app/(app)/orders/actions";
import { OrderStatusSelect } from "@/components/order-status-select";
import { StatusBadge } from "@/components/status-badge";
import type { OrderStatus } from "@/lib/order-status";

export function OrderStatusControl({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: OrderStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);

  async function handleConfirm(next: OrderStatus) {
    await updateOrderStatus(orderId, next);
    setStatus(next);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <OrderStatusSelect status={status} onConfirm={handleConfirm} />
      <StatusBadge status={status} />
    </div>
  );
}
