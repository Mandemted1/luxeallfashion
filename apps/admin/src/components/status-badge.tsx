import { Badge } from "@/components/ui/badge";
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
    <Badge
      variant="outline"
      className={`border-transparent text-[10px] font-medium tracking-[0.08em] uppercase ${styles[status]}`}
    >
      {status}
    </Badge>
  );
}
