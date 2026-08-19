import type {
  Customer,
  DeliveryRegion,
  Order,
  OrderItem,
  Product,
  ProductVariant,
} from "@luxe/database";
import { fromPrismaBrand, type Brand } from "@/lib/brands";
import { fromPrismaOrderStatus, type OrderStatus } from "@/lib/order-status";

export interface AdminOrderItem {
  productName: string;
  brand: Brand;
  size: string;
  colorName: string;
  quantity: number;
  unitPriceGhs: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: number; // display as LUX-{orderNumber}
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryRegion: string;
  deliveryAddress: string;
  status: OrderStatus;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  placedAt: Date;
  shippingGhs: number;
  subtotalGhs: number;
  discountGhs: number;
  totalGhs: number;
  items: AdminOrderItem[];
}

export function orderDisplayNumber(order: Pick<AdminOrder, "orderNumber">): string {
  return `LUX-${order.orderNumber}`;
}

// These read the real stored values (frozen at checkout, same "value at
// time of purchase" reasoning as OrderItem.priceGhs) rather than
// re-summing items, so a discount code applied at checkout is never
// silently dropped from what's shown here.
export function orderSubtotalGhs(order: AdminOrder): number {
  return order.subtotalGhs;
}

export function orderTotalGhs(order: AdminOrder): number {
  return order.totalGhs;
}

// Pro-rates any order-level discount across brands by each brand's share
// of the subtotal — there's no per-item discount breakdown stored, so this
// is the closest a mixed-brand order's "this store's portion" can get to
// the real post-discount amount without inventing per-line allocation.
export function orderBrandPortionGhs(order: AdminOrder, brand: Brand): number {
  const brandSubtotalGhs = order.items
    .filter((item) => item.brand === brand)
    .reduce((sum, item) => sum + item.unitPriceGhs * item.quantity, 0);

  if (order.discountGhs === 0 || order.subtotalGhs === 0) return brandSubtotalGhs;

  const brandDiscountShareGhs = Math.round(
    (brandSubtotalGhs / order.subtotalGhs) * order.discountGhs,
  );
  return brandSubtotalGhs - brandDiscountShareGhs;
}

export function orderBrands(order: AdminOrder): Brand[] {
  return Array.from(new Set(order.items.map((item) => item.brand)));
}

type PrismaOrderWithRelations = Order & {
  customer: Customer;
  deliveryRegion: DeliveryRegion;
  items: (OrderItem & { product: Product; variant: ProductVariant })[];
};

// Only ever called from server components — the Prisma-generated relation
// types this accepts don't need to (and shouldn't) reach client bundles.
export function mapAdminOrder(order: PrismaOrderWithRelations): AdminOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    customerEmail: order.customer.email,
    deliveryRegion: order.deliveryRegion.name,
    deliveryAddress: order.deliveryAddress,
    status: fromPrismaOrderStatus(order.status),
    paymentStatus: order.paymentStatus,
    placedAt: order.createdAt,
    shippingGhs: order.shippingGhs,
    subtotalGhs: order.subtotalGhs,
    discountGhs: order.discountGhs,
    totalGhs: order.totalGhs,
    items: order.items.map((item) => ({
      productName: item.product.name,
      brand: fromPrismaBrand(item.product.brand),
      size: item.variant.size,
      colorName: item.variant.colorName,
      quantity: item.quantity,
      unitPriceGhs: item.priceGhs,
    })),
  };
}

export function formatPlacedAt(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
