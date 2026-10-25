import type { Customer, DeliveryRegion, Order, OrderItem, Product, ProductVariant } from "@luxe/database";
import { fromPrismaBrand, type Brand } from "@/lib/brands";
import type { AdminOrder } from "@/lib/orders";

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  marketingOptIn: boolean;
  hasAccount: boolean;
  brands: Brand[];
  orderCount: number;
  totalSpentGhs: number;
  avgOrderGhs: number;
  lastOrderAt: Date | null;
  createdAt: Date;
}

type PrismaCustomerWithOrders = Customer & {
  orders: (Order & {
    deliveryRegion: DeliveryRegion;
    items: (OrderItem & { product: Product; variant: ProductVariant })[];
  })[];
};

// Only ever called from server components, same reasoning as
// lib/orders.ts's mapAdminOrder.
//
// An Order row is created the moment checkout starts, before Paystack
// confirms payment — so unpaid orders (abandoned carts, failed charges)
// exist in the table too. Spend/order-count/last-order here only count
// PAID orders, same as the Dashboard's own revenue figures, so this
// doesn't read as "how many times did they start checkout" — the
// per-order list elsewhere still shows every order, unpaid ones included,
// with its own status.
export function mapAdminCustomer(customer: PrismaCustomerWithOrders): AdminCustomer {
  const brands = new Set<Brand>();
  let totalSpentGhs = 0;
  let orderCount = 0;
  let lastOrderAt: Date | null = null;

  for (const order of customer.orders) {
    if (order.paymentStatus !== "PAID") continue;
    for (const item of order.items) brands.add(fromPrismaBrand(item.product.brand));
    totalSpentGhs += order.totalGhs;
    orderCount += 1;
    if (!lastOrderAt || order.createdAt > lastOrderAt) lastOrderAt = order.createdAt;
  }

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    marketingOptIn: customer.marketingOptIn,
    hasAccount: customer.authUserId !== null,
    brands: Array.from(brands),
    orderCount,
    totalSpentGhs,
    avgOrderGhs: orderCount === 0 ? 0 : Math.round(totalSpentGhs / orderCount),
    lastOrderAt,
    createdAt: customer.createdAt,
  };
}

export interface CustomerTopProduct {
  name: string;
  slug: string;
  image: string | null;
  unitsBought: number;
}

const TOP_PRODUCTS_LIMIT = 5;

// Same "paid orders only" reasoning as mapAdminCustomer above — an
// abandoned checkout shouldn't count as something they actually bought.
export function customerTopProducts(orders: AdminOrder[]): CustomerTopProduct[] {
  const byProduct = new Map<string, CustomerTopProduct>();

  for (const order of orders) {
    if (order.paymentStatus !== "PAID") continue;
    for (const item of order.items) {
      const existing = byProduct.get(item.productSlug);
      if (existing) {
        existing.unitsBought += item.quantity;
      } else {
        byProduct.set(item.productSlug, {
          name: item.productName,
          slug: item.productSlug,
          image: item.productImage,
          unitsBought: item.quantity,
        });
      }
    }
  }

  return Array.from(byProduct.values())
    .sort((a, b) => b.unitsBought - a.unitsBought)
    .slice(0, TOP_PRODUCTS_LIMIT);
}
