"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandTabs } from "@/components/brand-tabs";
import { StatusBadge } from "@/components/status-badge";
import { formatGhs } from "@/lib/currency";
import {
  brandLabel,
  getOrdersAwaitingAction,
  getRecentOrders,
  getStorePerformance,
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

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-black/10 bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
        {title}
      </p>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [brand, setBrand] = useState<BrandFilter>("all");
  const stats = statsByBrand[brand];
  const topProducts = getTopProducts(brand);
  const recentOrders = getRecentOrders(brand);
  const awaitingAction = getOrdersAwaitingAction(brand);
  const storePerformance = getStorePerformance();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <BrandTabs value={brand} onChange={setBrand} />
      </div>

      {awaitingAction > 0 && (
        <div className="mt-6 flex items-center justify-between border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          <span>
            <strong className="font-semibold">{awaitingAction}</strong>{" "}
            {awaitingAction === 1 ? "order" : "orders"} awaiting confirmation
          </span>
          <Link
            href="/orders"
            className="text-xs font-medium uppercase tracking-[0.1em] underline underline-offset-2 hover:text-amber-900"
          >
            Review Orders
          </Link>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Revenue"
          value={formatGhs(stats.totalRevenueGhs)}
        />
        <StatCard label="Orders Today" value={String(stats.ordersToday)} />
        <StatCard label="Total Orders" value={String(stats.totalOrders)} />
      </div>

      <div
        className={`mt-6 grid grid-cols-1 gap-4 ${
          brand === "all" ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}
      >
        {brand === "all" && (
          <Panel title="Store Performance">
            <ul className="mt-4 flex flex-col gap-4">
              {storePerformance.map((store, index) => (
                <li key={store.brand}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      <span className="mr-2 text-black/30">{index + 1}</span>
                      {brandLabel(store.brand)}
                    </p>
                    <p className="text-sm font-semibold">
                      {formatGhs(store.revenueGhs)}
                    </p>
                  </div>
                  <div className="mt-2 h-1 w-full bg-black/5">
                    <div
                      className="h-1 bg-black"
                      style={{ width: `${store.shareOfRevenue * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-black/50">
                    {Math.round(store.shareOfRevenue * 100)}% of revenue ·{" "}
                    {store.orders} orders
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <Panel title={`Top ${brand === "all" ? "5" : topProducts.length} Products`}>
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
        </Panel>

        <Panel title="Recent Orders">
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
                      <Link
                        href={`/orders/${order.orderNumber.slice(1)}`}
                        className="hover:underline"
                      >
                        {order.orderNumber}
                      </Link>{" "}
                      <span className="font-normal text-black/50">
                        · {order.customerName}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-black/50">
                      {order.placedAt}
                      {order.hasOtherStoreItems && " · + items from another store"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={order.status} />
                    <p className="text-sm font-semibold">
                      {formatGhs(order.displayGhs)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
