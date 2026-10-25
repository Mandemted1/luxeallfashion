"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ElementType } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  Receipt,
  RotateCcw,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { BrandTabs } from "@/components/brand-tabs";
import { StatusBadge } from "@/components/status-badge";
import { StockBadge } from "@/components/stock-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { brandLabel, type BrandFilter } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import type { DashboardData } from "@/lib/dashboard";
import type { OrderStatus } from "@/lib/order-status";

// Same semantic colors StatusBadge already uses elsewhere in the admin —
// the donut below reuses them rather than inventing a new palette, so
// "Processing" means the same amber everywhere you see it.
const STATUS_COLORS: Record<OrderStatus, string> = {
  Placed: "#a8a29e",
  Processing: "#f59e0b",
  "Out for Delivery": "#3b82f6",
  Delivered: "#10b981",
  Cancelled: "#ef4444",
};

function TrendTag({ deltaPct }: { deltaPct: number | null }) {
  if (deltaPct === null) {
    return <span className="text-xs font-medium text-black/40">New</span>;
  }
  if (deltaPct === 0) {
    return <span className="text-xs font-medium text-black/40">No change</span>;
  }
  const isUp = deltaPct > 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isUp ? "text-emerald-600" : "text-red-600"
      }`}
    >
      <Icon className="size-3" />
      {Math.abs(Math.round(deltaPct))}%
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  deltaPct,
  hint,
}: {
  label: string;
  value: string;
  icon: ElementType;
  deltaPct?: number | null;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-black/50" />
          <p className="text-sm text-black/60">{label}</p>
        </div>
        <p className="text-3xl font-semibold">{value}</p>
        <div className="flex items-center gap-2">
          {deltaPct !== undefined && <TrendTag deltaPct={deltaPct} />}
          <span className="text-xs text-black/40">{hint}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0]?.slice(0, 2);
  return (initials ?? "?").toUpperCase();
}

const revenueChartConfig = {
  revenueGhs: { label: "This week" },
  priorRevenueGhs: { label: "Last week" },
} satisfies ChartConfig;

const monthlyChartConfig = {
  revenueGhs: { label: "Revenue" },
} satisfies ChartConfig;

function currencyFormatter(value: unknown, name: unknown) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <span className="text-muted-foreground">{String(name)}</span>
      <span className="font-mono font-medium tabular-nums">{formatGhs(Number(value))}</span>
    </div>
  );
}

export function DashboardContent({ data }: { data: DashboardData }) {
  const [brand, setBrand] = useState<BrandFilter>("all");
  const weekly = data.weeklyStatsByBrand[brand];
  const topProducts = data.topProductsByBrand[brand];
  const recentOrders = data.recentOrdersByBrand[brand];
  const awaitingAction = data.awaitingActionByBrand[brand];
  const storePerformance = data.storePerformance;
  const revenueTrend = data.revenueTrendByBrand[brand];
  const regionPerformance = data.regionPerformanceByBrand[brand];
  const stockAlerts = data.stockAlertsByBrand[brand];
  const orderStatusBreakdown = data.orderStatusBreakdownByBrand[brand];
  const monthlyRevenue = data.monthlyRevenueByBrand[brand];
  const storeOverview = data.storeOverviewByBrand[brand];
  const visitorStats = data.visitorStatsByBrand[brand];
  const trendTotal = revenueTrend.reduce((sum, day) => sum + day.revenueGhs, 0);
  const openOrdersCount = orderStatusBreakdown
    .filter((slice) => slice.status !== "Delivered" && slice.status !== "Cancelled")
    .reduce((sum, slice) => sum + slice.count, 0);

  const overviewItems: {
    label: string;
    value: string;
    icon: ElementType;
    chip: string;
    href: string;
  }[] = [
    {
      label: "Store Sales",
      value: formatGhs(storeOverview.totalRevenueGhs),
      icon: Wallet,
      chip: "bg-amber-50 text-amber-700",
      href: "/orders",
    },
    {
      label: "Orders",
      value: String(storeOverview.totalOrders),
      icon: ShoppingBag,
      chip: "bg-stone-100 text-stone-700",
      href: "/orders",
    },
    {
      label: "Avg Order Value",
      value: formatGhs(storeOverview.avgOrderGhs),
      icon: Receipt,
      chip: "bg-emerald-50 text-emerald-700",
      href: "/orders",
    },
    {
      label: "Refunds",
      value:
        storeOverview.refundCount === 0
          ? "None yet"
          : `${storeOverview.refundCount} · ${formatGhs(storeOverview.refundGhs)}`,
      icon: RotateCcw,
      chip: "bg-red-50 text-red-700",
      href: "/orders",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-black/50">
            A quick look at revenue, orders, and how each store is doing.
          </p>
        </div>
        <BrandTabs value={brand} onChange={setBrand} />
      </div>

      {awaitingAction > 0 && (
        <div className="mt-6 flex items-center justify-between border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          <span>
            <strong className="font-semibold">{awaitingAction}</strong>{" "}
            {awaitingAction === 1 ? "order is" : "orders are"} waiting for you to confirm.
          </span>
          <Link
            href="/orders"
            className="flex items-center gap-1 text-xs font-medium tracking-[0.1em] uppercase underline underline-offset-2 hover:text-amber-900"
          >
            Review orders
            <ArrowRight className="size-3" />
          </Link>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Visitors"
          value={visitorStats.uniqueVisitors.toLocaleString()}
          icon={Eye}
          deltaPct={visitorStats.deltaPct}
          hint="last 28 days"
        />
        <StatCard
          label="Revenue"
          value={formatGhs(weekly.revenueGhs)}
          icon={Wallet}
          deltaPct={weekly.revenueDeltaPct}
          hint="vs prior 7 days"
        />
        <StatCard
          label="Orders"
          value={String(weekly.orderCount)}
          icon={ShoppingBag}
          deltaPct={weekly.orderDeltaPct}
          hint="vs prior 7 days"
        />
        <StatCard
          label="Avg Order Value"
          value={formatGhs(weekly.avgOrderGhs)}
          icon={Receipt}
          deltaPct={weekly.avgOrderDeltaPct}
          hint="vs prior 7 days"
        />
        <StatCard
          label="Out of Stock"
          value={String(stockAlerts.outOfStockCount)}
          icon={AlertTriangle}
          hint={`${stockAlerts.lowStockCount} more running low`}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>{openOrdersCount} orders currently open.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="mx-auto aspect-square max-h-48">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel formatter={currencyFormatter} />} />
                <Pie
                  data={orderStatusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={50}
                  outerRadius={75}
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {orderStatusBreakdown.map((slice) => (
                    <Cell key={slice.status} fill={STATUS_COLORS[slice.status]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="mt-2 flex flex-col gap-1.5">
              {orderStatusBreakdown.map((slice) => (
                <li key={slice.status} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-black/60">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[slice.status] }}
                    />
                    {slice.status}
                  </span>
                  <span className="font-medium">{slice.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
            <CardDescription>Last {monthlyRevenue.length} months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyChartConfig} className="h-48 w-full">
              <BarChart data={monthlyRevenue} layout="vertical" margin={{ left: 0, right: 24 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="label"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel formatter={currencyFormatter} />} />
                <Bar dataKey="revenueGhs" fill="var(--foreground)" radius={999}>
                  <LabelList
                    dataKey="revenueGhs"
                    position="right"
                    className="fill-foreground text-xs"
                    formatter={(value: string | number | boolean | null | undefined) =>
                      typeof value === "number" && value > 0 ? formatGhs(value) : ""
                    }
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Region</CardTitle>
            <CardDescription>Where orders are being delivered to.</CardDescription>
          </CardHeader>
          <CardContent>
            {regionPerformance.length === 0 ? (
              <p className="mt-4 text-sm text-black/40">No data yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-black/5">
                {regionPerformance.map((region) => (
                  <li
                    key={region.region}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{region.region}</p>
                      <p className="mt-0.5 text-xs text-black/50">
                        {region.orders} order{region.orders === 1 ? "" : "s"}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold">{formatGhs(region.revenueGhs)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue, Last 7 Days</CardTitle>
            <CardDescription>{formatGhs(trendTotal)} across the last week, dashed line is the week before.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-64 w-full">
              <AreaChart data={revenueTrend} margin={{ left: 0, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <ChartTooltip content={<ChartTooltipContent formatter={currencyFormatter} />} />
                <Area
                  dataKey="priorRevenueGhs"
                  type="monotone"
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                  fill="none"
                  strokeWidth={1.5}
                />
                <Area
                  dataKey="revenueGhs"
                  type="monotone"
                  stroke="var(--foreground)"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Overview</CardTitle>
            <CardDescription>All-time, this store.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y divide-black/5">
              {overviewItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-70"
                  >
                    <span className={`flex size-9 items-center justify-center rounded-full ${item.chip}`}>
                      <item.icon className="size-4" />
                    </span>
                    <span className="flex-1">
                      <p className="text-sm font-semibold">{item.value}</p>
                      <p className="text-xs text-black/50">{item.label}</p>
                    </span>
                    <ArrowRight className="size-3.5 text-black/30" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div
        className={`mt-4 grid grid-cols-1 gap-4 ${
          brand === "all" ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}
      >
        {brand === "all" && (
          <Card>
            <CardHeader>
              <CardTitle>Store Performance</CardTitle>
              <CardDescription>How revenue splits across your three stores.</CardDescription>
            </CardHeader>
            <CardContent>
              {storePerformance.length === 0 ? (
                <p className="mt-4 text-sm text-black/40">No data yet.</p>
              ) : (
                <ul className="mt-4 flex flex-col gap-4">
                  {storePerformance.map((store, index) => (
                    <li key={store.brand}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">
                          <span className="mr-2 text-black/30">{index + 1}</span>
                          {brandLabel(store.brand)}
                        </p>
                        <p className="text-sm font-semibold">{formatGhs(store.revenueGhs)}</p>
                      </div>
                      <Progress value={store.shareOfRevenue * 100} className="mt-2 h-1" />
                      <p className="mt-1 text-xs text-black/50">
                        {Math.round(store.shareOfRevenue * 100)}% of revenue, {store.orders} orders
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Top {brand === "all" ? "5" : topProducts.length} Products</CardTitle>
            <CardDescription>Your best sellers by revenue.</CardDescription>
            <CardAction>
              <Link
                href="/products"
                className="flex items-center gap-1 text-xs font-medium tracking-[0.08em] text-black/50 uppercase hover:text-black"
              >
                View all
                <ArrowRight className="size-3" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="mt-4 text-sm text-black/40">No data yet.</p>
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-black/5">
                {topProducts.map((product) => (
                  <li
                    key={`${product.brand}:${product.name}`}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-stone-100"
                    >
                      {product.image && (
                        <Image src={product.image} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        <Link href={`/products/${product.slug}`} className="hover:underline">
                          {product.name}
                        </Link>
                      </p>
                      <p className="mt-0.5 text-xs text-black/50">
                        {brandLabel(product.brand)}, {product.unitsSold} sold
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold">
                      {formatGhs(product.revenueGhs)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>The latest orders coming in.</CardDescription>
            <CardAction>
              <Link
                href="/orders"
                className="flex items-center gap-1 text-xs font-medium tracking-[0.08em] text-black/50 uppercase hover:text-black"
              >
                View all
                <ArrowRight className="size-3" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="mt-4 text-sm text-black/40">No data yet.</p>
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-black/5">
                {recentOrders.map((order) => (
                  <li
                    key={order.orderNumber}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback className="bg-black/5 text-[10px] text-black/60">
                          {initialsFor(order.customerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          <Link href={`/orders/${order.orderNumber}`} className="hover:underline">
                            #LUX-{order.orderNumber}
                          </Link>{" "}
                          <span className="font-normal text-black/50">{order.customerName}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-black/50">
                          {order.placedAt}
                          {order.hasOtherStoreItems && " plus items from another store"}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={order.status} />
                      <p className="text-sm font-semibold">{formatGhs(order.displayGhs)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Stock Alerts</CardTitle>
          <CardDescription>
            {stockAlerts.outOfStockCount} out of stock, {stockAlerts.lowStockCount} running low.
          </CardDescription>
          <CardAction>
            <Link
              href="/products"
              className="flex items-center gap-1 text-xs font-medium tracking-[0.08em] text-black/50 uppercase hover:text-black"
            >
              View all
              <ArrowRight className="size-3" />
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          {stockAlerts.items.length === 0 ? (
            <p className="mt-4 text-sm text-black/40">Everything&apos;s well stocked.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {stockAlerts.items.map((item) => (
                <li
                  key={item.slug}
                  className="flex items-center justify-between gap-3 border-b border-black/5 py-3 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      <Link href={`/products/${item.slug}`} className="hover:underline">
                        {item.name}
                      </Link>
                    </p>
                    {brand === "all" && (
                      <p className="mt-0.5 text-xs text-black/50">{brandLabel(item.brand)}</p>
                    )}
                  </div>
                  <StockBadge quantity={item.totalStock} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
