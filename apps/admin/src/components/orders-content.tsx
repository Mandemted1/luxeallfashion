"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { updateOrderStatus } from "@/app/(app)/orders/actions";
import { BrandTabs } from "@/components/brand-tabs";
import { FacetedFilter } from "@/components/faceted-filter";
import { OrderStatusSelect } from "@/components/order-status-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

type PaymentStatus = AdminOrder["paymentStatus"];
const paymentStatuses: PaymentStatus[] = ["PAID", "PENDING", "FAILED", "REFUNDED"];

const paymentBadgeClass: Record<PaymentStatus, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-700",
  REFUNDED: "bg-stone-100 text-stone-700",
};

export function OrdersContent({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [brand, setBrand] = useState<BrandFilter>("all");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [paymentFilter, setPaymentFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    const result = await updateOrderStatus(orderId, status);
    router.refresh();
    return result;
  }

  const term = search.trim().toLowerCase();

  // Brand/search applied first, then counted per status/payment option, so
  // each facet's counts reflect "how many if I also picked this" rather
  // than collapsing to 0 once another facet is already narrowed down.
  const byBrandAndSearch = orders.filter((order) => {
    if (brand !== "all" && !order.items.some((item) => item.brand === brand)) return false;
    if (
      term &&
      !orderDisplayNumber(order).toLowerCase().includes(term) &&
      !order.customerName.toLowerCase().includes(term)
    ) {
      return false;
    }
    return true;
  });

  const filtered = byBrandAndSearch.filter((order) => {
    if (statusFilter.size > 0 && !statusFilter.has(order.status)) return false;
    if (paymentFilter.size > 0 && !paymentFilter.has(order.paymentStatus)) return false;
    return true;
  });

  const statusOptions = orderStatuses.map((status) => ({
    value: status,
    label: status,
    count: byBrandAndSearch.filter((order) => order.status === status).length,
  }));
  const paymentOptions = paymentStatuses.map((payment) => ({
    value: payment,
    label: payment,
    count: byBrandAndSearch.filter((order) => order.paymentStatus === payment).length,
  }));

  const hasActiveFilters = statusFilter.size > 0 || paymentFilter.size > 0 || term.length > 0;

  function resetFilters() {
    setStatusFilter(new Set());
    setPaymentFilter(new Set());
    setSearch("");
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Orders</h1>
          <p className="mt-1 text-sm text-black/50">
            Track every order, update its status, and see who it&apos;s for.
          </p>
        </div>
        <BrandTabs value={brand} onChange={setBrand} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-black/30" />
          <Input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order # or customer"
            className="pl-8"
          />
        </div>
        <FacetedFilter
          title="Status"
          options={statusOptions}
          selected={statusFilter}
          onChange={setStatusFilter}
        />
        <FacetedFilter
          title="Payment"
          options={paymentOptions}
          selected={paymentFilter}
          onChange={setPaymentFilter}
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset
            <X />
          </Button>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_8px_rgba(0,0,0,0.03)] ring-1 ring-foreground/8">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-black/40">
                  No orders match these filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => {
                const brands = orderBrands(order);
                const displayGhs =
                  brand === "all"
                    ? orderTotalGhs(order)
                    : orderBrandPortionGhs(order, brand as Brand);
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/orders/${order.orderNumber}`}
                        className="font-medium hover:underline"
                      >
                        #{orderDisplayNumber(order)}
                      </Link>
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="text-black/60">
                      {brands.map(brandLabel).join(" + ")}
                    </TableCell>
                    <TableCell className="text-black/60">
                      {formatPlacedAt(order.placedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-transparent text-[10px] font-medium tracking-[0.06em] uppercase ${paymentBadgeClass[order.paymentStatus]}`}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <OrderStatusSelect
                        orderId={order.id}
                        status={order.status}
                        onConfirm={(next) => handleStatusChange(order.id, next)}
                      />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatGhs(displayGhs)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
