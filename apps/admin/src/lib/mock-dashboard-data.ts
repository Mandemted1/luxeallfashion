// Placeholder data for building the admin layout before the backend/API
// and real orders exist. Shape mirrors what the real Order/OrderItem/
// Product models (packages/database) will eventually supply.

export type BrandFilter = "all" | "og-luxemen" | "chicstyle" | "kiddies-space-gh";
export type Brand = Exclude<BrandFilter, "all">;

export const brandFilters: { value: BrandFilter; label: string }[] = [
  { value: "all", label: "All Stores" },
  { value: "og-luxemen", label: "OG Luxemen" },
  { value: "chicstyle", label: "Chicstyle" },
  { value: "kiddies-space-gh", label: "Kiddies Space GH" },
];

export function brandLabel(brand: Brand): string {
  return brandFilters.find((b) => b.value === brand)!.label;
}

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

export type OrderStatus = "Placed" | "Processing" | "Out for Delivery" | "Delivered";

interface MockOrderLineItem {
  brand: Brand;
  subtotalGhs: number;
}

interface MockOrder {
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  placedAt: string;
  items: MockOrderLineItem[];
}

// The storefront shares one cart/checkout across all three brands, so a
// real order can (and does, e.g. #OG-1028 below) contain items from more
// than one store. Modeling orders as line items — not a single order-level
// brand — is the actual fix: it's what makes per-store filtering correct
// by construction instead of by assumption.
const allOrders: MockOrder[] = [
  {
    orderNumber: "#OG-1030",
    customerName: "Efua Mensah",
    status: "Placed",
    placedAt: "8 minutes ago",
    items: [{ brand: "chicstyle", subtotalGhs: 928000 }],
  },
  {
    orderNumber: "#OG-1029",
    customerName: "Yaw Boateng",
    status: "Placed",
    placedAt: "40 minutes ago",
    items: [{ brand: "kiddies-space-gh", subtotalGhs: 144500 }],
  },
  {
    orderNumber: "#OG-1028",
    customerName: "Ama Serwaa",
    status: "Placed",
    placedAt: "12 minutes ago",
    items: [
      { brand: "og-luxemen", subtotalGhs: 168000 },
      { brand: "kiddies-space-gh", subtotalGhs: 90000 },
    ],
  },
  {
    orderNumber: "#OG-1027",
    customerName: "Kwabena Asante",
    status: "Processing",
    placedAt: "1 hour ago",
    items: [{ brand: "og-luxemen", subtotalGhs: 480000 }],
  },
  {
    orderNumber: "#OG-1026",
    customerName: "Efua Mensah",
    status: "Out for Delivery",
    placedAt: "3 hours ago",
    items: [{ brand: "chicstyle", subtotalGhs: 160000 }],
  },
  {
    orderNumber: "#OG-1025",
    customerName: "Yaw Boateng",
    status: "Delivered",
    placedAt: "Yesterday",
    items: [{ brand: "og-luxemen", subtotalGhs: 320000 }],
  },
  {
    orderNumber: "#OG-1024",
    customerName: "Abena Owusu",
    status: "Delivered",
    placedAt: "Yesterday",
    items: [{ brand: "kiddies-space-gh", subtotalGhs: 90000 }],
  },
  {
    orderNumber: "#OG-1023",
    customerName: "Adjoa Boateng",
    status: "Delivered",
    placedAt: "2 days ago",
    items: [{ brand: "chicstyle", subtotalGhs: 312000 }],
  },
];

export interface DisplayOrder {
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  placedAt: string;
  displayGhs: number; // whole order total in "all" view, this store's portion otherwise
  hasOtherStoreItems: boolean; // true when viewing one store but the order also has items from another
}

export function getRecentOrders(brand: BrandFilter): DisplayOrder[] {
  if (brand === "all") {
    return allOrders.map((order) => ({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      status: order.status,
      placedAt: order.placedAt,
      displayGhs: order.items.reduce((sum, item) => sum + item.subtotalGhs, 0),
      hasOtherStoreItems: false,
    }));
  }

  return allOrders
    .filter((order) => order.items.some((item) => item.brand === brand))
    .map((order) => ({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      status: order.status,
      placedAt: order.placedAt,
      displayGhs: order.items
        .filter((item) => item.brand === brand)
        .reduce((sum, item) => sum + item.subtotalGhs, 0),
      hasOtherStoreItems: order.items.some((item) => item.brand !== brand),
    }));
}

// Orders sitting in "Placed" haven't been acknowledged yet — this is the
// count that should actually pull at her attention on login.
export function getOrdersAwaitingAction(brand: BrandFilter): number {
  return getRecentOrders(brand).filter((o) => o.status === "Placed").length;
}
