"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderStatus } from "@/app/(app)/orders/actions";
import { BrandTabs } from "@/components/brand-tabs";
import { brandLabel, type Brand, type BrandFilter } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import { orderStatuses, type OrderStatus } from "@/lib/order-status";
import {
  formatPlacedAt,
  orderBrandPortionGhs,
  orderBrands,
  orderDisplayNumber,
  orderTotalGhs,
  type AdminOrder,
} from "@/lib/orders";

const statusFilters: (OrderStatus | "all")[] = ["all", ...orderStatuses];

export function OrdersContent({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [brand, setBrand] = useState<BrandFilter>("all");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    await updateOrderStatus(orderId, status);
    router.refresh();
  }

  const term = search.trim().toLowerCase();
  const filtered = orders.filter((order) => {
    if (brand !== "all" && !order.items.some((item) => item.brand === brand)) {
      return false;
    }
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }
    if (
      term &&
      !orderDisplayNumber(order).toLowerCase().includes(term) &&
      !order.customerName.toLowerCase().includes(term)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Orders</h1>
        <BrandTabs value={brand} onChange={setBrand} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order # or customer"
          className="w-full border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none sm:w-64"
        />
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
              className={`px-3 py-1.5 text-xs font-medium uppercase tracking-[0.08em] transition-colors ${
                statusFilter === status
                  ? "bg-black text-white"
                  : "border border-black/15 bg-white text-black/60 hover:border-black/40 hover:text-black"
              }`}
            >
              {status === "all" ? "All Statuses" : status}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto border border-black/10 bg-white">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs font-medium uppercase tracking-[0.08em] text-black/50">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Store</th>
              <th className="px-5 py-3 font-medium">Placed</th>
              <th className="px-5 py-3 font-medium">Payment</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-black/40">
                  No orders match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const brands = orderBrands(order);
                const displayGhs =
                  brand === "all"
                    ? orderTotalGhs(order)
                    : orderBrandPortionGhs(order, brand as Brand);
                return (
                  <tr
                    key={order.id}
                    className="border-b border-black/5 last:border-b-0 hover:bg-stone-50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/orders/${order.orderNumber}`}
                        className="font-medium hover:underline"
                      >
                        #{orderDisplayNumber(order)}
                      </Link>
                    </td>
                    <td className="px-5 py-4">{order.customerName}</td>
                    <td className="px-5 py-4 text-black/60">
                      {brands.map(brandLabel).join(" + ")}
                    </td>
                    <td className="px-5 py-4 text-black/60">
                      {formatPlacedAt(order.placedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-medium uppercase tracking-[0.06em] ${
                          order.paymentStatus === "PAID"
                            ? "text-emerald-700"
                            : order.paymentStatus === "PENDING"
                              ? "text-amber-700"
                              : "text-red-700"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onChange={(event) =>
                          handleStatusChange(order.id, event.target.value as OrderStatus)
                        }
                        aria-label={`Update status for order ${orderDisplayNumber(order)}`}
                        className="border border-black/15 bg-white px-2 py-1.5 text-xs font-medium uppercase tracking-[0.08em] focus:border-black focus:outline-none"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {formatGhs(displayGhs)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
