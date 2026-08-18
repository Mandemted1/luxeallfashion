"use client";

import { useState } from "react";
import { BrandTabs } from "@/components/brand-tabs";
import { StatusBadge } from "@/components/status-badge";
import { formatGhs } from "@/lib/currency";
import {
  brandLabel,
  getRecentOrders,
  getTopProducts,
  statsByBrand,
  type BrandFilter,
} from "@/lib/mock-dashboard-data";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [brand, setBrand] = useState<BrandFilter>("all");
  const stats = statsByBrand[brand];
  const topProducts = getTopProducts(brand);
  const recentOrders = getRecentOrders(brand);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <BrandTabs value={brand} onChange={setBrand} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Revenue"
          value={formatGhs(stats.totalRevenueGhs)}
        />
        <StatCard label="Orders Today" value={String(stats.ordersToday)} />
        <StatCard label="Total Orders" value={String(stats.totalOrders)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border border-black/10 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
            Top {brand === "all" ? "5" : topProducts.length} Products
          </p>
          {topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-black/40">No data yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-black/5">
              {topProducts.map((product) => (
                <li
                  key={product.name}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="mt-0.5 text-xs text-black/50">
                      {brandLabel(product.brand)} · {product.unitsSold} sold
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">
                    {formatGhs(product.revenueGhs)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-black/10 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
            Recent Orders
          </p>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-black/40">No data yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-black/5">
              {recentOrders.map((order) => (
                <li
                  key={order.orderNumber}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {order.orderNumber}{" "}
                      <span className="font-normal text-black/50">
                        · {order.customerName}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-black/50">
                      {brand === "all" ? `${brandLabel(order.brand)} · ` : ""}
                      {order.placedAt}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={order.status} />
                    <p className="text-sm font-semibold">
                      {formatGhs(order.totalGhs)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
