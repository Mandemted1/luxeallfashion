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
export function mapAdminCustomer(customer: PrismaCustomerWithOrders): AdminCustomer {
  const brands = new Set<Brand>();
  let totalSpentGhs = 0;
  let lastOrderAt: Date | null = null;

  for (const order of customer.orders) {
    totalSpentGhs += order.totalGhs;
    for (const item of order.items) brands.add(fromPrismaBrand(item.product.brand));
    if (!lastOrderAt || order.createdAt > lastOrderAt) lastOrderAt = order.createdAt;
  }

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    marketingOptIn: customer.marketingOptIn,
    brands: Array.from(brands),
    orderCount: customer.orders.length,
    totalSpentGhs,
    lastOrderAt,
  };
}
