"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { orderStatuses, type OrderStatus } from "@/lib/mock-orders";

// Session-only, like the list page's inline editor — no backend to persist
// to yet, and this local state isn't shared with the Orders list or
// Dashboard (each reads/holds its own copy of the mock data for now).
export function OrderStatusControl({
  initialStatus,
}: {
  initialStatus: OrderStatus;
}) {
  const [status, setStatus] = useState(initialStatus);

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value as OrderStatus)}
        aria-label="Update order status"
        className="border border-black/15 bg-white px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] focus:border-black focus:outline-none"
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
