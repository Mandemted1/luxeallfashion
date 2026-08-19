import type { OrderStatus } from "@/lib/order-status";

const styles: Record<OrderStatus, string> = {
  Placed: "bg-stone-100 text-stone-700",
  Processing: "bg-amber-50 text-amber-700",
  "Out for Delivery": "bg-blue-50 text-blue-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ${styles[status]}`}
    >
      {status}
    </span>
  );
}
