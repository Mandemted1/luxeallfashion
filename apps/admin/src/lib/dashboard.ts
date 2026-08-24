import { prisma } from "@luxe/database";
import { type Brand, type BrandFilter } from "@/lib/brands";
import type { OrderStatus } from "@/lib/order-status";
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

export interface DashboardData {
  statsByBrand: Record<BrandFilter, DashboardStats>;
  storePerformance: StorePerformance[];
  topProductsByBrand: Record<BrandFilter, TopProduct[]>;
  recentOrdersByBrand: Record<BrandFilter, DisplayOrder[]>;
  awaitingActionByBrand: Record<BrandFilter, number>;
}

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
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

  const awaitingActionByBrand = Object.fromEntries(
    brandFilters.map((brand) => [
      brand,
      ordersForBrand(allOrders, brand).filter((order) => order.status === "Placed").length,
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

  return { statsByBrand, storePerformance, topProductsByBrand, recentOrdersByBrand, awaitingActionByBrand };
}
