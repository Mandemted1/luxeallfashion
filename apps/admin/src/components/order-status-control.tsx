"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderStatus } from "@/app/(app)/orders/actions";
import { StatusBadge } from "@/components/status-badge";
import { orderStatuses, type OrderStatus } from "@/lib/order-status";

export function OrderStatusControl({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: OrderStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: OrderStatus) {
    setStatus(next);
    setSaving(true);
    await updateOrderStatus(orderId, next);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(event) => handleChange(event.target.value as OrderStatus)}
        disabled={saving}
        aria-label="Update order status"
        className="border border-black/15 bg-white px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] focus:border-black focus:outline-none disabled:opacity-50"
      >
        {orderStatuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <StatusBadge status={status} />
    </div>
  );
}
