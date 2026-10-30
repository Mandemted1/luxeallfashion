import { prisma } from "@luxe/database";

// Storefront's own small copy of apps/admin/src/lib/order-email-templates.ts,
// PLACED only — this is the one status the storefront itself sends (see
// order-fulfillment.ts's markOrderPaid), the other four are sent from the
// admin app. Same accepted duplication as email-template.ts: both apps
// read the same OrderEmailTemplate table, each keeps its own thin reader
// rather than sharing a non-Prisma package.
export const DEFAULT_PLACED_EMAIL_COPY = {
  subject: "Order confirmed: LUX-{{orderNumber}}",
  heading: "Order confirmed — LUX-{{orderNumber}}",
  bodyText: "Hi {{customerName}}, your order is confirmed. We'll be in touch about delivery shortly.",
};

export function applyOrderEmailTokens(
  text: string,
  vars: { orderNumber: number; customerName: string },
): string {
  return text
    .replaceAll("{{orderNumber}}", String(vars.orderNumber))
    .replaceAll("{{customerName}}", vars.customerName);
}

export async function getPlacedEmailCopy() {
  const override = await prisma.orderEmailTemplate.findUnique({ where: { status: "PLACED" } });
  return override ?? DEFAULT_PLACED_EMAIL_COPY;
}
