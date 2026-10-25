"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderStatus } from "@/app/(app)/orders/actions";
import { OrderStatusSelect } from "@/components/order-status-select";
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
    const result = await updateOrderStatus(orderId, next);
    // Only reflect the new status locally if it actually took — this was
    // previously unconditional, which would show the attempted status
    // even when the write failed (e.g. a rejected backward change).
    if (!result.error) setStatus(next);
    router.refresh();
    return result;
  }

  return (
    <div className="flex items-center gap-3">
      <OrderStatusSelect orderId={orderId} status={status} onConfirm={handleConfirm} />
    </div>
  );
}
