import { prisma, type OrderStatus as PrismaOrderStatus } from "@luxe/database";
import { escapeHtml, renderOrderEmailHtml } from "@/lib/email-template";
import { applyOrderEmailTokens, DEFAULT_ORDER_EMAIL_COPY } from "@/lib/order-email-templates";
import { ORDERS_EMAIL_FROM, resend } from "@/lib/resend";

interface OrderForEmail {
  orderNumber: number;
  totalGhs: number;
  customer: { name: string; email: string };
  items: { quantity: number; priceGhs: number; product: { name: string } }[];
}

// Only ever called for PROCESSING/OUT_FOR_DELIVERY/DELIVERED/CANCELLED —
// updateOrderStatus's allowedNextStatuses never offers PLACED as a
// transition target (it's the schema default, set once at order
// creation). PLACED's own confirmation email is sent from
// apps/storefront/src/lib/order-fulfillment.ts instead, reading the same
// OrderEmailTemplate table via its own small copy of order-email-templates.ts.
//
// Best-effort: a failed email shouldn't undo or block the status change
// itself, which has already been committed by the time this runs.
export async function sendOrderStatusEmail(
  order: OrderForEmail,
  status: PrismaOrderStatus,
): Promise<void> {
  if (status === "PLACED") return;

  const override = await prisma.orderEmailTemplate.findUnique({ where: { status } });
  const copy = override ?? DEFAULT_ORDER_EMAIL_COPY[status];
  const vars = { orderNumber: order.orderNumber, customerName: order.customer.name };

  try {
    await resend.emails.send({
      from: ORDERS_EMAIL_FROM,
      to: order.customer.email,
      subject: applyOrderEmailTokens(copy.subject, vars),
      html: renderOrderEmailHtml({
        heading: applyOrderEmailTokens(copy.heading, vars),
        introHtml: `<p>${escapeHtml(applyOrderEmailTokens(copy.bodyText, vars))}</p>`,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          lineTotalGhs: item.priceGhs * item.quantity,
        })),
        totalGhs: order.totalGhs,
      }),
    });
  } catch {
    // Worth checking Resend's dashboard if this keeps happening.
  }
}
