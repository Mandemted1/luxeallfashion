import { prisma } from "@luxe/database";
import { fromPrismaBrand, type Brand, type BrandFilter } from "@/lib/brands";
import { orderStatuses, type OrderStatus } from "@/lib/order-status";
import {
  formatPlacedAt,
  mapAdminOrder,
  orderBrandPortionGhs,
  orderBrands,
  orderTotalGhs,
  type AdminOrder,
} from "@/lib/orders";

const ALL_BRANDS: Brand[] = ["og-luxemen", "chicstyle", "kiddies-space-gh"];
const RECENT_ORDERS_LIMIT = 6;
const TOP_PRODUCTS_LIMIT = 5;
const REGION_LIMIT = 5;
const STOCK_ALERT_LIMIT = 5;
// Matches StockBadge's own threshold, so a product reads the same way
// here as it does everywhere else in the admin.
const LOW_STOCK_THRESHOLD = 10;

interface DashboardStats {
  totalRevenueGhs: number;
  ordersToday: number;
  totalOrders: number;
}

export interface StorePerformance {
  brand: Brand;
  revenueGhs: number;
  orders: number;
  shareOfRevenue: number; // 0-1
}

export interface TopProduct {
  name: string;
  slug: string;
  image: string | null;
  brand: Brand;
  unitsSold: number;
  revenueGhs: number;
}

export interface DisplayOrder {
  orderNumber: number;
  customerName: string;
  status: OrderStatus;
  placedAt: string;
  displayGhs: number;
  hasOtherStoreItems: boolean;
}

export interface RevenueDay {
  label: string; // e.g. "Mon"
  revenueGhs: number;
  // Same weekday, one week earlier — the comparison line on the chart.
  priorRevenueGhs: number;
}

export interface OrderStatusSlice {
  status: OrderStatus;
  count: number;
}

export interface MonthlyRevenue {
  label: string; // e.g. "May"
  revenueGhs: number;
}

export interface StoreOverview {
  totalRevenueGhs: number;
  totalOrders: number;
  avgOrderGhs: number;
  refundCount: number;
  refundGhs: number;
}

export interface VisitorStats {
  uniqueVisitors: number;
  pageViews: number;
  deltaPct: number | null;
}

// null deltaPct means there's nothing from the prior period to compare
// against (e.g. a brand new store) — shown as "new" rather than a
// fabricated 0% or an infinite percentage.
export interface WeeklyStats {
  revenueGhs: number;
  revenueDeltaPct: number | null;
  orderCount: number;
  orderDeltaPct: number | null;
  avgOrderGhs: number;
  avgOrderDeltaPct: number | null;
}

export interface RegionPerformance {
  region: string;
  revenueGhs: number;
  orders: number;
}

export interface StockAlertItem {
  name: string;
  slug: string;
  brand: Brand;
  totalStock: number;
}

export interface StockAlerts {
  outOfStockCount: number;
  lowStockCount: number;
  items: StockAlertItem[];
}

export interface DashboardData {
  statsByBrand: Record<BrandFilter, DashboardStats>;
  weeklyStatsByBrand: Record<BrandFilter, WeeklyStats>;
  storePerformance: StorePerformance[];
  topProductsByBrand: Record<BrandFilter, TopProduct[]>;
  recentOrdersByBrand: Record<BrandFilter, DisplayOrder[]>;
  awaitingActionByBrand: Record<BrandFilter, number>;
  revenueTrendByBrand: Record<BrandFilter, RevenueDay[]>;
  regionPerformanceByBrand: Record<BrandFilter, RegionPerformance[]>;
  stockAlertsByBrand: Record<BrandFilter, StockAlerts>;
  orderStatusBreakdownByBrand: Record<BrandFilter, OrderStatusSlice[]>;
  monthlyRevenueByBrand: Record<BrandFilter, MonthlyRevenue[]>;
  storeOverviewByBrand: Record<BrandFilter, StoreOverview>;
  visitorStatsByBrand: Record<BrandFilter, VisitorStats>;
}

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TREND_DAYS = 7;

function revenueOnDay(forBrand: AdminOrder[], brand: BrandFilter, dayStart: Date): number {
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return forBrand
    .filter((order) => order.placedAt >= dayStart && order.placedAt < dayEnd)
    .reduce((sum, order) => sum + revenueForBrand(order, brand), 0);
}

function revenueTrendFor(paidOrders: AdminOrder[], brand: BrandFilter, todayStart: Date): RevenueDay[] {
  const forBrand = ordersForBrand(paidOrders, brand);
  const days: RevenueDay[] = [];

  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const dayStart = new Date(todayStart);
    dayStart.setDate(dayStart.getDate() - i);
    const priorWeekStart = new Date(dayStart);
    priorWeekStart.setDate(priorWeekStart.getDate() - 7);

    days.push({
      label: DAY_LABELS[dayStart.getDay()],
      revenueGhs: revenueOnDay(forBrand, brand, dayStart),
      priorRevenueGhs: revenueOnDay(forBrand, brand, priorWeekStart),
    });
  }

  return days;
}

function ordersForBrand(orders: AdminOrder[], brand: BrandFilter): AdminOrder[] {
  return brand === "all" ? orders : orders.filter((order) => orderBrands(order).includes(brand));
}

function revenueForBrand(order: AdminOrder, brand: BrandFilter): number {
  return brand === "all" ? orderTotalGhs(order) : orderBrandPortionGhs(order, brand);
}

function statsFor(
  allOrders: AdminOrder[],
  paidOrders: AdminOrder[],
  brand: BrandFilter,
  todayStart: Date,
): DashboardStats {
  const allForBrand = ordersForBrand(allOrders, brand);
  const paidForBrand = ordersForBrand(paidOrders, brand);

  return {
    totalRevenueGhs: paidForBrand.reduce((sum, order) => sum + revenueForBrand(order, brand), 0),
    ordersToday: allForBrand.filter((order) => order.placedAt >= todayStart).length,
    totalOrders: allForBrand.length,
  };
}

function topProductsFor(paidOrders: AdminOrder[], brand: BrandFilter): TopProduct[] {
  const byProduct = new Map<string, TopProduct>();

  for (const order of ordersForBrand(paidOrders, brand)) {
    for (const item of order.items) {
      if (brand !== "all" && item.brand !== brand) continue;

      const key = `${item.brand}:${item.productName}`;
      const revenueGhs = item.unitPriceGhs * item.quantity;
      const existing = byProduct.get(key);
      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenueGhs += revenueGhs;
      } else {
        byProduct.set(key, {
          name: item.productName,
          slug: item.productSlug,
          image: item.productImage,
          brand: item.brand,
          unitsSold: item.quantity,
          revenueGhs,
        });
      }
    }
  }

  return Array.from(byProduct.values())
    .sort((a, b) => b.revenueGhs - a.revenueGhs)
    .slice(0, TOP_PRODUCTS_LIMIT);
}

function pctDelta(current: number, prior: number): number | null {
  if (prior === 0) return current === 0 ? 0 : null;
  return ((current - prior) / prior) * 100;
}

function paidWindowStats(
  paidOrders: AdminOrder[],
  brand: BrandFilter,
  start: Date,
  end: Date,
): { revenueGhs: number; orderCount: number } {
  const inWindow = ordersForBrand(paidOrders, brand).filter(
    (order) => order.placedAt >= start && order.placedAt < end,
  );
  return {
    revenueGhs: inWindow.reduce((sum, order) => sum + revenueForBrand(order, brand), 0),
    orderCount: inWindow.length,
  };
}

function orderCountWindow(allOrders: AdminOrder[], brand: BrandFilter, start: Date, end: Date): number {
  return ordersForBrand(allOrders, brand).filter(
    (order) => order.placedAt >= start && order.placedAt < end,
  ).length;
}

// Compares the trailing 7 days against the 7 days before that, so every
// stat card can show a real "vs last week" instead of an all-time total
// that can only ever go up.
function weeklyStatsFor(
  allOrders: AdminOrder[],
  paidOrders: AdminOrder[],
  brand: BrandFilter,
  now: Date,
  weekAgo: Date,
  twoWeeksAgo: Date,
): WeeklyStats {
  const current = paidWindowStats(paidOrders, brand, weekAgo, now);
  const prior = paidWindowStats(paidOrders, brand, twoWeeksAgo, weekAgo);
  const currentOrderCount = orderCountWindow(allOrders, brand, weekAgo, now);
  const priorOrderCount = orderCountWindow(allOrders, brand, twoWeeksAgo, weekAgo);
  const currentAvg = current.orderCount === 0 ? 0 : current.revenueGhs / current.orderCount;
  const priorAvg = prior.orderCount === 0 ? 0 : prior.revenueGhs / prior.orderCount;

  return {
    revenueGhs: current.revenueGhs,
    revenueDeltaPct: pctDelta(current.revenueGhs, prior.revenueGhs),
    orderCount: currentOrderCount,
    orderDeltaPct: pctDelta(currentOrderCount, priorOrderCount),
    avgOrderGhs: Math.round(currentAvg),
    avgOrderDeltaPct: pctDelta(currentAvg, priorAvg),
  };
}

function regionPerformanceFor(paidOrders: AdminOrder[], brand: BrandFilter): RegionPerformance[] {
  const byRegion = new Map<string, RegionPerformance>();

  for (const order of ordersForBrand(paidOrders, brand)) {
    const revenueGhs = revenueForBrand(order, brand);
    const existing = byRegion.get(order.deliveryRegion);
    if (existing) {
      existing.revenueGhs += revenueGhs;
      existing.orders += 1;
    } else {
      byRegion.set(order.deliveryRegion, { region: order.deliveryRegion, revenueGhs, orders: 1 });
    }
  }

  return Array.from(byRegion.values())
    .sort((a, b) => b.revenueGhs - a.revenueGhs)
    .slice(0, REGION_LIMIT);
}

function stockAlertsFor(
  products: { name: string; slug: string; brand: Brand; totalStock: number }[],
  brand: BrandFilter,
): StockAlerts {
  const forBrand = brand === "all" ? products : products.filter((p) => p.brand === brand);
  const outOfStockCount = forBrand.filter((p) => p.totalStock === 0).length;
  const lowStockCount = forBrand.filter(
    (p) => p.totalStock > 0 && p.totalStock < LOW_STOCK_THRESHOLD,
  ).length;
  const items = forBrand
    .filter((p) => p.totalStock < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.totalStock - b.totalStock)
    .slice(0, STOCK_ALERT_LIMIT);

  return { outOfStockCount, lowStockCount, items };
}

function orderStatusBreakdownFor(paidOrders: AdminOrder[], brand: BrandFilter): OrderStatusSlice[] {
  const counts = new Map<OrderStatus, number>(orderStatuses.map((status) => [status, 0]));
  for (const order of ordersForBrand(paidOrders, brand)) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }
  return orderStatuses.map((status) => ({ status, count: counts.get(status) ?? 0 }));
}

const MONTHLY_REVENUE_MONTHS = 6;
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthlyRevenueFor(paidOrders: AdminOrder[], brand: BrandFilter, now: Date): MonthlyRevenue[] {
  const forBrand = ordersForBrand(paidOrders, brand);
  const months: MonthlyRevenue[] = [];

  for (let i = MONTHLY_REVENUE_MONTHS - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const revenueGhs = forBrand
      .filter((order) => order.placedAt >= monthStart && order.placedAt < monthEnd)
      .reduce((sum, order) => sum + revenueForBrand(order, brand), 0);

    months.push({ label: MONTH_LABELS[monthStart.getMonth()], revenueGhs });
  }

  return months;
}

// Real substitutes for the reference dashboard's "Store Overview" widget —
// it tracks store sales/visits/earnings/refunds; we don't have visitor
// analytics, so this swaps in the Luxe metrics that are actually real:
// all-time revenue, order volume, average order value, and refunds.
function storeOverviewFor(
  allOrders: AdminOrder[],
  paidOrders: AdminOrder[],
  brand: BrandFilter,
): StoreOverview {
  const paidForBrand = ordersForBrand(paidOrders, brand);
  const totalRevenueGhs = paidForBrand.reduce((sum, order) => sum + revenueForBrand(order, brand), 0);
  const totalOrders = paidForBrand.length;

  const refundedForBrand = ordersForBrand(allOrders, brand).filter(
    (order) => order.paymentStatus === "REFUNDED",
  );

  return {
    totalRevenueGhs,
    totalOrders,
    avgOrderGhs: totalOrders === 0 ? 0 : Math.round(totalRevenueGhs / totalOrders),
    refundCount: refundedForBrand.length,
    refundGhs: refundedForBrand.reduce((sum, order) => sum + revenueForBrand(order, brand), 0),
  };
}

const VISITOR_WINDOW_DAYS = 28;

// Last 28 days vs the 28 before that — same window the shadcnadmin
// reference labels "Last 28 days" on its own visitor widget. brand is
// resolved and stored at write time (see the storefront's track-brand.ts,
// which reads the subdomain a visit actually arrived on) rather than
// re-derived from the path here — a subdomain visit to "/" wouldn't
// otherwise be attributable to a brand at all. Shared pages (home on the
// apex domain, search, checkout) have no brand and count toward "all"
// only, the same way a mixed-brand order's revenue only counts toward
// "all" rather than being attributed to one store.
async function visitorStatsByBrandFor(now: Date): Promise<Record<BrandFilter, VisitorStats>> {
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - VISITOR_WINDOW_DAYS);
  const priorStart = new Date(now);
  priorStart.setDate(priorStart.getDate() - VISITOR_WINDOW_DAYS * 2);

  const views = await prisma.pageView.findMany({
    where: { createdAt: { gte: priorStart } },
    select: { brand: true, visitorId: true, createdAt: true },
  });

  function windowStats(brand: BrandFilter, start: Date, end: Date) {
    const inWindow = views.filter((view) => {
      if (view.createdAt < start || view.createdAt >= end) return false;
      return brand === "all" || (view.brand !== null && fromPrismaBrand(view.brand) === brand);
    });
    return {
      uniqueVisitors: new Set(inWindow.map((view) => view.visitorId)).size,
      pageViews: inWindow.length,
    };
  }

  const brandFilters: BrandFilter[] = ["all", ...ALL_BRANDS];
  return Object.fromEntries(
    brandFilters.map((brand) => {
      const current = windowStats(brand, periodStart, now);
      const prior = windowStats(brand, priorStart, periodStart);
      return [
        brand,
        {
          uniqueVisitors: current.uniqueVisitors,
          pageViews: current.pageViews,
          deltaPct: pctDelta(current.uniqueVisitors, prior.uniqueVisitors),
        },
      ];
    }),
  ) as Record<BrandFilter, VisitorStats>;
}

function recentOrdersFor(allOrders: AdminOrder[], brand: BrandFilter): DisplayOrder[] {
  return ordersForBrand(allOrders, brand)
    .slice(0, RECENT_ORDERS_LIMIT)
    .map((order) => ({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      status: order.status,
      placedAt: formatPlacedAt(order.placedAt),
      displayGhs: revenueForBrand(order, brand),
      hasOtherStoreItems: brand !== "all" && orderBrands(order).length > 1,
    }));
}

export async function getDashboardData(): Promise<DashboardData> {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      deliveryRegion: true,
      items: { include: { product: true, variant: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const allOrders = orders.map(mapAdminOrder);
  const paidOrders = allOrders.filter((order) => order.paymentStatus === "PAID");
  const todayStart = startOfToday();

  const brandFilters: BrandFilter[] = ["all", ...ALL_BRANDS];

  const statsByBrand = Object.fromEntries(
    brandFilters.map((brand) => [brand, statsFor(allOrders, paidOrders, brand, todayStart)]),
  ) as Record<BrandFilter, DashboardStats>;

  const topProductsByBrand = Object.fromEntries(
    brandFilters.map((brand) => [brand, topProductsFor(paidOrders, brand)]),
  ) as Record<BrandFilter, TopProduct[]>;

  const recentOrdersByBrand = Object.fromEntries(
    brandFilters.map((brand) => [brand, recentOrdersFor(allOrders, brand)]),
  ) as Record<BrandFilter, DisplayOrder[]>;

  // "Placed" alone isn't enough — an Order row is created the moment
  // checkout starts, before Paystack confirms anything, so a customer who
  // closes the tab or whose payment fails leaves a "Placed" order behind
  // that never needed any action from us. Only a paid one is actually
  // awaiting confirmation/fulfillment.
  const awaitingActionByBrand = Object.fromEntries(
    brandFilters.map((brand) => [
      brand,
      ordersForBrand(allOrders, brand).filter(
        (order) => order.status === "Placed" && order.paymentStatus === "PAID",
      ).length,
    ]),
  ) as Record<BrandFilter, number>;

  const storePerformance: StorePerformance[] = ALL_BRANDS.map((brand) => {
    const paidForBrand = ordersForBrand(paidOrders, brand);
    const revenueGhs = paidForBrand.reduce((sum, order) => sum + revenueForBrand(order, brand), 0);
    return { brand, revenueGhs, orders: paidForBrand.length, shareOfRevenue: 0 };
  }).sort((a, b) => b.revenueGhs - a.revenueGhs);

  const totalStoreRevenueGhs = storePerformance.reduce((sum, store) => sum + store.revenueGhs, 0);
  for (const store of storePerformance) {
    store.shareOfRevenue = totalStoreRevenueGhs === 0 ? 0 : store.revenueGhs / totalStoreRevenueGhs;
  }

  const revenueTrendByBrand = Object.fromEntries(
    brandFilters.map((brand) => [brand, revenueTrendFor(paidOrders, brand, todayStart)]),
  ) as Record<BrandFilter, RevenueDay[]>;

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const weeklyStatsByBrand = Object.fromEntries(
    brandFilters.map((brand) => [
      brand,
      weeklyStatsFor(allOrders, paidOrders, brand, now, weekAgo, twoWeeksAgo),
    ]),
  ) as Record<BrandFilter, WeeklyStats>;

  const regionPerformanceByBrand = Object.fromEntries(
    brandFilters.map((brand) => [brand, regionPerformanceFor(paidOrders, brand)]),
  ) as Record<BrandFilter, RegionPerformance[]>;

  // A product only has the business-level "isActive" flag flipped on once
  // it has at least one variant (enforced in toggleProductActive/
  // createProduct), so this query can't be polluted by the catalog's
  // variant-less draft/placeholder rows — only real, live stock shows up
  // here.
  const activeProducts = await prisma.product.findMany({
    where: { deletedAt: null, isActive: true },
    select: { name: true, slug: true, brand: true, variants: { select: { quantity: true } } },
  });
  const productsWithStock = activeProducts.map((product) => ({
    name: product.name,
    slug: product.slug,
    brand: fromPrismaBrand(product.brand),
    totalStock: product.variants.reduce((sum, variant) => sum + variant.quantity, 0),
  }));
  const stockAlertsByBrand = Object.fromEntries(
    brandFilters.map((brand) => [brand, stockAlertsFor(productsWithStock, brand)]),
  ) as Record<BrandFilter, StockAlerts>;

  const orderStatusBreakdownByBrand = Object.fromEntries(
    brandFilters.map((brand) => [brand, orderStatusBreakdownFor(paidOrders, brand)]),
  ) as Record<BrandFilter, OrderStatusSlice[]>;

  const monthlyRevenueByBrand = Object.fromEntries(
    brandFilters.map((brand) => [brand, monthlyRevenueFor(paidOrders, brand, now)]),
  ) as Record<BrandFilter, MonthlyRevenue[]>;

  const storeOverviewByBrand = Object.fromEntries(
    brandFilters.map((brand) => [brand, storeOverviewFor(allOrders, paidOrders, brand)]),
  ) as Record<BrandFilter, StoreOverview>;

  const visitorStatsByBrand = await visitorStatsByBrandFor(now);

  return {
    statsByBrand,
    weeklyStatsByBrand,
    storePerformance,
    topProductsByBrand,
    recentOrdersByBrand,
    awaitingActionByBrand,
    revenueTrendByBrand,
    regionPerformanceByBrand,
    stockAlertsByBrand,
    orderStatusBreakdownByBrand,
    monthlyRevenueByBrand,
    storeOverviewByBrand,
    visitorStatsByBrand,
  };
}
