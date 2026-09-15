import type { Customer, DeliveryRegion, Order, OrderItem, Product, ProductVariant } from "@luxe/database";
import { fromPrismaBrand, type Brand } from "@/lib/brands";

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  marketingOptIn: boolean;
  brands: Brand[];
  orderCount: number;
  totalSpentGhs: number;
  lastOrderAt: Date | null;
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
    brands: Array.from(brands),
    orderCount,
    totalSpentGhs,
    lastOrderAt,
  };
}
