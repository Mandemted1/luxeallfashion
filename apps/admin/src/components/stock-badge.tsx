export function StockBadge({ quantity }: { quantity: number }) {
  const { label, className } =
    quantity === 0
      ? { label: "Out of Stock", className: "bg-red-50 text-red-700" }
      : quantity < 10
        ? { label: "Low Stock", className: "bg-amber-50 text-amber-700" }
        : { label: "In Stock", className: "bg-emerald-50 text-emerald-700" };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium uppercase tracking-[0.06em] ${className}`}
    >
      {label}
    </span>
  );
}
