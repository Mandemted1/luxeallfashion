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

// The real fulfillment sequence — Cancelled isn't part of it, since it can
// happen from any of these stages rather than only at the end.
export const fulfillmentSequence: OrderStatus[] = [
  "Placed",
  "Processing",
  "Out for Delivery",
  "Delivered",
];

export function isFinalStatus(status: OrderStatus): boolean {
  return status === "Delivered" || status === "Cancelled";
}

// An order only ever moves forward through fulfillment (or gets
// cancelled) — never back to an earlier stage. Delivered and Cancelled
// are both final; nothing can follow either one. Enforced here so both
// the UI and the server action share one definition of "valid next step".
export function allowedNextStatuses(current: OrderStatus): OrderStatus[] {
  if (isFinalStatus(current)) return [];
  const currentIndex = fulfillmentSequence.indexOf(current);
  const forward = fulfillmentSequence.slice(currentIndex + 1);
  return [...forward, "Cancelled"];
}
