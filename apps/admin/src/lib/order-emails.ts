import type { OrderStatus as PrismaOrderStatus } from "@luxe/database";
import { escapeHtml, renderOrderEmailHtml } from "@/lib/email-template";
import { ORDERS_EMAIL_FROM, resend } from "@/lib/resend";

interface OrderForEmail {
  orderNumber: number;
  totalGhs: number;
  customer: { name: string; email: string };
  items: { quantity: number; priceGhs: number; product: { name: string } }[];
}

const STATUS_COPY: Partial<
  Record<PrismaOrderStatus, { subject: string; heading: string; body: string }>
> = {
  PROCESSING: {
    subject: "Your order is being processed",
    heading: "Your order is being processed",
    body: "we're getting your order ready.",
  },
  OUT_FOR_DELIVERY: {
    subject: "Your order is out for delivery",
    heading: "Out for delivery",
    body: "your order is on its way to you.",
  },
  DELIVERED: {
    subject: "Your order has been delivered",
    heading: "Delivered",
    body: "your order has been delivered. Thank you for shopping with us.",
  },
  CANCELLED: {
    subject: "Your order has been cancelled",
    heading: "Order cancelled",
    body: "your order has been cancelled. Contact us if this isn't what you expected.",
  },
};

// Best-effort: a failed email shouldn't undo or block the status change
// itself, which has already been committed by the time this runs.
export async function sendOrderStatusEmail(
  order: OrderForEmail,
  status: PrismaOrderStatus,
): Promise<void> {
  const copy = STATUS_COPY[status];
  if (!copy) return;

  try {
    await resend.emails.send({
      from: ORDERS_EMAIL_FROM,
      to: order.customer.email,
      subject: `${copy.subject} — LUX-${order.orderNumber}`,
      html: renderOrderEmailHtml({
        heading: copy.heading,
        introHtml: `<p>Hi ${escapeHtml(order.customer.name)}, ${copy.body}</p>`,
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
