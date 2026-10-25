import { Badge } from "@/components/ui/badge";

export function StockBadge({ quantity }: { quantity: number }) {
  const { label, className } =
    quantity === 0
      ? { label: "Out of Stock", className: "bg-red-50 text-red-700" }
      : quantity < 10
        ? { label: "Low Stock", className: "bg-amber-50 text-amber-700" }
        : { label: "In Stock", className: "bg-emerald-50 text-emerald-700" };

  return (
    <Badge
      variant="outline"
      className={`border-transparent text-[10px] font-medium tracking-[0.06em] uppercase ${className}`}
    >
      {label}
    </Badge>
  );
}
