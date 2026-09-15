import type { OrderStatus as PrismaOrderStatus } from "@luxe/database";

export type OrderStatus =
  | "Placed"
  | "Processing"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export const orderStatuses: OrderStatus[] = [
  "Placed",
  "Processing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const TO_PRISMA: Record<OrderStatus, PrismaOrderStatus> = {
  Placed: "PLACED",
  Processing: "PROCESSING",
  "Out for Delivery": "OUT_FOR_DELIVERY",
  Delivered: "DELIVERED",
  Cancelled: "CANCELLED",
};

const FROM_PRISMA: Record<PrismaOrderStatus, OrderStatus> = {
  PLACED: "Placed",
  PROCESSING: "Processing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function toPrismaOrderStatus(status: OrderStatus): PrismaOrderStatus {
  return TO_PRISMA[status];
}

export function fromPrismaOrderStatus(status: PrismaOrderStatus): OrderStatus {
  return FROM_PRISMA[status];
}

// Mirrors STATUS_COPY in lib/order-emails.ts — every status except Placed
// sends the customer a notification email when an order changes to it.
// Kept here (not imported from order-emails.ts, which pulls in the Resend
// client) purely so client components can show "this will email the
// customer" without bundling server-only code.
export function orderStatusChangeSendsEmail(status: OrderStatus): boolean {
  return status !== "Placed";
}
