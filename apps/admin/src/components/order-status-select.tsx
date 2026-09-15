"use client";

import { useState } from "react";
import { orderStatuses, orderStatusChangeSendsEmail, type OrderStatus } from "@/lib/order-status";

const selectClass =
  "border border-black/15 bg-white px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] focus:border-black focus:outline-none disabled:opacity-50";

// Picking a new status used to commit (and email the customer) the
// instant the <select> fired onChange — one misclick could tell a real
// customer their order was delivered or cancelled. This holds the pick as
// "pending" until explicitly confirmed, and says up front whether
// confirming will actually email them.
export function OrderStatusSelect({
  status,
  onConfirm,
}: {
  status: OrderStatus;
  onConfirm: (next: OrderStatus) => Promise<void>;
}) {
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    if (!pending) return;
    setSaving(true);
    setError("");
    try {
      await onConfirm(pending);
      setPending(null);
    } catch {
      // A thrown error (DB blip, etc.) shouldn't leave this stuck
      // disabled with no way to retry or even see that it failed.
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={pending ?? status}
        onChange={(event) => {
          setPending(event.target.value as OrderStatus);
          setError("");
        }}
        disabled={saving}
        aria-label="Update order status"
        className={selectClass}
      >
        {orderStatuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
      {pending && pending !== status && (
        <span className="flex items-center gap-2 text-xs">
          <span className="text-black/50">
            Change to {pending}
            {orderStatusChangeSendsEmail(pending) ? " and email customer?" : "?"}
          </span>
          <button
            type="button"
            onClick={confirm}
            disabled={saving}
            className="font-medium uppercase tracking-[0.06em] text-emerald-700 underline underline-offset-2 hover:text-emerald-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Confirm"}
          </button>
          <button
            type="button"
            onClick={() => setPending(null)}
            disabled={saving}
            className="font-medium uppercase tracking-[0.06em] text-black/40 underline underline-offset-2 hover:text-black disabled:opacity-50"
          >
            Cancel
          </button>
        </span>
      )}
    </div>
  );
}
