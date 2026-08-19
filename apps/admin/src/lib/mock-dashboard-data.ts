// Real orders/products/categories exist now (see lib/orders.ts,
// lib/products.ts, lib/categories.ts, used by the real Orders/Products/
// Categories/Customers pages) — the Dashboard just hasn't been migrated
// to query them yet, so it still shows these illustrative numbers rather
// than real revenue/stock.

import type { Brand, BrandFilter } from "@/lib/brands";

export { brandFilters, brandLabel, type Brand, type BrandFilter } from "@/lib/brands";

interface DashboardStats {
  totalRevenueGhs: number;
  ordersToday: number;
  totalOrders: number;
}

// Illustrative business-scale totals (not derived from the small "recent
// orders" sample below, which is just a preview of the last few orders) —
// the real query is SUM(OrderItem revenue) / COUNT(DISTINCT Order) grouped
// by product.brand, correctly handling mixed-brand orders by construction
// since it aggregates at the line-item level rather than assuming a whole
// order belongs to one store.
export const statsByBrand: Record<BrandFilter, DashboardStats> = {
  all: { totalRevenueGhs: 4825000, ordersToday: 6, totalOrders: 184 },
  "og-luxemen": { totalRevenueGhs: 2380000, ordersToday: 3, totalOrders: 96 },
  chicstyle: { totalRevenueGhs: 1750000, ordersToday: 2, totalOrders: 62 },
  "kiddies-space-gh": { totalRevenueGhs: 695000, ordersToday: 1, totalOrders: 26 },
};

export interface StorePerformance {
  brand: Brand;
  revenueGhs: number;
  orders: number;
  shareOfRevenue: number; // 0-1
}

// Ranked for the "All Stores" leaderboard. Derived from statsByBrand so it
// can never drift out of sync with the stat cards above it.
export function getStorePerformance(): StorePerformance[] {
  const totalRevenueGhs = statsByBrand.all.totalRevenueGhs;
  const brands: Brand[] = ["og-luxemen", "chicstyle", "kiddies-space-gh"];
  return brands
    .map((brand) => ({
      brand,
      revenueGhs: statsByBrand[brand].totalRevenueGhs,
      orders: statsByBrand[brand].totalOrders,
      shareOfRevenue: statsByBrand[brand].totalRevenueGhs / totalRevenueGhs,
    }))
    .sort((a, b) => b.revenueGhs - a.revenueGhs);
}

export interface MockTopProduct {
  name: string;
  brand: Brand;
  unitsSold: number;
  revenueGhs: number;
}

// "All Stores" shows overall best-sellers (a different ranking than any
// single store's top 5, which is expected/normal) — the other three are
// each store's own top products.
const topProductsByBrand: Record<BrandFilter, MockTopProduct[]> = {
  all: [
    { name: "Suede Woven Loafers", brand: "og-luxemen", unitsSold: 34, revenueGhs: 850000 },
    { name: "Satin Slip Midi Dress", brand: "chicstyle", unitsSold: 29, revenueGhs: 928000 },
    { name: "Tropical Print Camp Shirt", brand: "og-luxemen", unitsSold: 26, revenueGhs: 416000 },
    { name: "Denim Dungaree Overalls", brand: "kiddies-space-gh", unitsSold: 21, revenueGhs: 189000 },
    { name: "Cotton Oxford Shirt", brand: "og-luxemen", unitsSold: 18, revenueGhs: 252000 },
  ],
  "og-luxemen": [
    { name: "Suede Woven Loafers", brand: "og-luxemen", unitsSold: 34, revenueGhs: 850000 },
    { name: "Tropical Print Camp Shirt", brand: "og-luxemen", unitsSold: 26, revenueGhs: 416000 },
    { name: "Cotton Oxford Shirt", brand: "og-luxemen", unitsSold: 18, revenueGhs: 252000 },
    { name: "Wool Blend Overcoat", brand: "og-luxemen", unitsSold: 9, revenueGhs: 495000 },
  ],
  chicstyle: [
    { name: "Satin Slip Midi Dress", brand: "chicstyle", unitsSold: 29, revenueGhs: 928000 },
    { name: "Leather Shoulder Bag", brand: "chicstyle", unitsSold: 15, revenueGhs: 510000 },
    { name: "Pointed Toe Stiletto Heels", brand: "chicstyle", unitsSold: 12, revenueGhs: 312000 },
    { name: "Cashmere Knit Cardigan", brand: "chicstyle", unitsSold: 8, revenueGhs: 232000 },
  ],
  "kiddies-space-gh": [
    { name: "Denim Dungaree Overalls", brand: "kiddies-space-gh", unitsSold: 21, revenueGhs: 189000 },
    { name: "Floral Print Cotton Dress", brand: "kiddies-space-gh", unitsSold: 17, revenueGhs: 144500 },
    { name: "Canvas High-Top Sneakers", brand: "kiddies-space-gh", unitsSold: 14, revenueGhs: 98000 },
    { name: "Fair Isle Knit Cardigan", brand: "kiddies-space-gh", unitsSold: 6, revenueGhs: 57000 },
  ],
};

export function getTopProducts(brand: BrandFilter): MockTopProduct[] {
  return topProductsByBrand[brand];
}

// Order data itself lives in mock-orders.ts (single source of truth, also
// used by the full Orders page) — the functions below just derive
// Dashboard-shaped summaries from it, so the two can't drift apart.
import {
  mockOrders,
  orderBrandPortionGhs,
  orderTotalGhs,
  type OrderStatus,
} from "@/lib/mock-orders";

export type { OrderStatus };

export interface DisplayOrder {
  orderNumber: string; // with leading "#", display-only
  customerName: string;
  status: OrderStatus;
  placedAt: string;
  displayGhs: number; // whole order total in "all" view, this store's portion otherwise
  hasOtherStoreItems: boolean; // true when viewing one store but the order also has items from another
}

export function getRecentOrders(brand: BrandFilter): DisplayOrder[] {
  if (brand === "all") {
    return mockOrders.map((order) => ({
      orderNumber: `#${order.orderNumber}`,
      customerName: order.customerName,
      status: order.status,
      placedAt: order.placedAt,
      displayGhs: orderTotalGhs(order),
      hasOtherStoreItems: false,
    }));
  }

  return mockOrders
    .filter((order) => order.items.some((item) => item.brand === brand))
    .map((order) => ({
      orderNumber: `#${order.orderNumber}`,
      customerName: order.customerName,
      status: order.status,
      placedAt: order.placedAt,
      displayGhs: orderBrandPortionGhs(order, brand),
      hasOtherStoreItems: order.items.some((item) => item.brand !== brand),
    }));
}

// Orders sitting in "Placed" haven't been acknowledged yet — this is the
// count that should actually pull at her attention on login.
export function getOrdersAwaitingAction(brand: BrandFilter): number {
  return getRecentOrders(brand).filter((o) => o.status === "Placed").length;
}
