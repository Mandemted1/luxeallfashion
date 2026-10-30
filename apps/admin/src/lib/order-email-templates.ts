import { prisma, type OrderStatus } from "@luxe/database";

export const ORDER_EMAIL_STATUSES: OrderStatus[] = [
  "PLACED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export interface OrderEmailCopy {
  subject: string;
  heading: string;
  // May contain {{orderNumber}} / {{customerName}} tokens — substituted
  // then HTML-escaped at send time (see applyOrderEmailTokens and its
  // callers), never rendered as raw HTML.
  bodyText: string;
}

// The exact wording that was previously hardcoded — PLACED in
// apps/storefront/src/lib/order-fulfillment.ts, the rest in this file's
// old STATUS_COPY map — just reshaped into the token format below so
// every status now shares one editable shape. A status with no saved
// OrderEmailTemplate row uses this unchanged.
export const DEFAULT_ORDER_EMAIL_COPY: Record<OrderStatus, OrderEmailCopy> = {
  PLACED: {
    subject: "Order confirmed: LUX-{{orderNumber}}",
    heading: "Order confirmed — LUX-{{orderNumber}}",
    bodyText: "Hi {{customerName}}, your order is confirmed. We'll be in touch about delivery shortly.",
  },
  PROCESSING: {
    subject: "Your order is being processed — LUX-{{orderNumber}}",
    heading: "Your order is being processed",
    bodyText: "Hi {{customerName}}, we're getting your order ready.",
  },
  OUT_FOR_DELIVERY: {
    subject: "Your order is out for delivery — LUX-{{orderNumber}}",
    heading: "Out for delivery",
    bodyText: "Hi {{customerName}}, your order is on its way to you.",
  },
  DELIVERED: {
    subject: "Your order has been delivered — LUX-{{orderNumber}}",
    heading: "Delivered",
    bodyText: "Hi {{customerName}}, your order has been delivered. Thank you for shopping with us.",
  },
  CANCELLED: {
    subject: "Your order has been cancelled — LUX-{{orderNumber}}",
    heading: "Order cancelled",
    bodyText: "Hi {{customerName}}, your order has been cancelled. Contact us if this isn't what you expected.",
  },
};

export function applyOrderEmailTokens(
  text: string,
  vars: { orderNumber: number; customerName: string },
): string {
  return text
    .replaceAll("{{orderNumber}}", String(vars.orderNumber))
    .replaceAll("{{customerName}}", vars.customerName);
}

export interface OrderEmailTemplateView extends OrderEmailCopy {
  isCustomized: boolean;
}

// Merges saved OrderEmailTemplate rows over the hardcoded defaults, for
// the admin page's template editor list.
export async function getOrderEmailTemplates(): Promise<Record<OrderStatus, OrderEmailTemplateView>> {
  const rows = await prisma.orderEmailTemplate.findMany();
  const byStatus = new Map(rows.map((row) => [row.status, row]));

  const result = {} as Record<OrderStatus, OrderEmailTemplateView>;
  for (const status of ORDER_EMAIL_STATUSES) {
    const row = byStatus.get(status);
    result[status] = row
      ? { subject: row.subject, heading: row.heading, bodyText: row.bodyText, isCustomized: true }
      : { ...DEFAULT_ORDER_EMAIL_COPY[status], isCustomized: false };
  }
  return result;
}
