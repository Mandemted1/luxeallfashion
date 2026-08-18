// Placeholder data for building the admin layout before the backend/API
// and real orders exist. Shape mirrors what the real Order/Product models
// (packages/database) will eventually supply.

export type BrandFilter = "all" | "og-luxemen" | "chicstyle" | "kiddies-space-gh";

export const brandFilters: { value: BrandFilter; label: string }[] = [
  { value: "all", label: "All Stores" },
  { value: "og-luxemen", label: "OG Luxemen" },
  { value: "chicstyle", label: "Chicstyle" },
  { value: "kiddies-space-gh", label: "Kiddies Space GH" },
];

export function brandLabel(brand: Exclude<BrandFilter, "all">): string {
  return brandFilters.find((b) => b.value === brand)!.label;
}

interface DashboardStats {
  totalRevenueGhs: number;
  ordersToday: number;
  totalOrders: number;
}

// "all" is the sum of the three stores — kept internally consistent here
// since it's mock data, but the real query will just aggregate across all
// orders/order-items rather than needing the numbers to be pre-summed.
export const statsByBrand: Record<BrandFilter, DashboardStats> = {
  all: { totalRevenueGhs: 4825000, ordersToday: 6, totalOrders: 184 },
  "og-luxemen": { totalRevenueGhs: 2380000, ordersToday: 3, totalOrders: 96 },
  chicstyle: { totalRevenueGhs: 1750000, ordersToday: 2, totalOrders: 62 },
  "kiddies-space-gh": { totalRevenueGhs: 695000, ordersToday: 1, totalOrders: 26 },
};

export interface MockTopProduct {
  name: string;
  brand: Exclude<BrandFilter, "all">;
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

export interface MockRecentOrder {
  orderNumber: string;
  brand: Exclude<BrandFilter, "all">;
  customerName: string;
  totalGhs: number;
  status: OrderStatus;
  placedAt: string;
}

// Real orders can mix items from multiple stores in one cart/checkout (the
// storefront shares one cart across all three brands) — each mock order
// here is simplified to a single dominant brand for the per-store view.
// The real query will need to aggregate at the OrderItem level when
// filtering "recent orders" by brand, not assume one brand per order.
const allRecentOrders: MockRecentOrder[] = [
  { orderNumber: "#OG-1030", brand: "chicstyle", customerName: "Efua Mensah", totalGhs: 928000, status: "Placed", placedAt: "8 minutes ago" },
  { orderNumber: "#OG-1029", brand: "kiddies-space-gh", customerName: "Yaw Boateng", totalGhs: 144500, status: "Placed", placedAt: "40 minutes ago" },
  { orderNumber: "#OG-1028", brand: "og-luxemen", customerName: "Ama Serwaa", totalGhs: 258000, status: "Placed", placedAt: "12 minutes ago" },
  { orderNumber: "#OG-1027", brand: "og-luxemen", customerName: "Kwabena Asante", totalGhs: 480000, status: "Processing", placedAt: "1 hour ago" },
  { orderNumber: "#OG-1026", brand: "chicstyle", customerName: "Efua Mensah", totalGhs: 160000, status: "Out for Delivery", placedAt: "3 hours ago" },
  { orderNumber: "#OG-1025", brand: "og-luxemen", customerName: "Yaw Boateng", totalGhs: 320000, status: "Delivered", placedAt: "Yesterday" },
  { orderNumber: "#OG-1024", brand: "kiddies-space-gh", customerName: "Abena Owusu", totalGhs: 90000, status: "Delivered", placedAt: "Yesterday" },
  { orderNumber: "#OG-1023", brand: "chicstyle", customerName: "Adjoa Boateng", totalGhs: 312000, status: "Delivered", placedAt: "2 days ago" },
];

export function getRecentOrders(brand: BrandFilter): MockRecentOrder[] {
  if (brand === "all") return allRecentOrders;
  return allRecentOrders.filter((order) => order.brand === brand);
}
