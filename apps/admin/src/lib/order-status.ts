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
