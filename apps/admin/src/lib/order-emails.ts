import type { OrderStatus as PrismaOrderStatus } from "@luxe/database";
import { formatGhs } from "@/lib/currency";
import { ORDERS_EMAIL_FROM, resend } from "@/lib/resend";

interface OrderForEmail {
  orderNumber: number;
  totalGhs: number;
  customer: { name: string; email: string };
}

const STATUS_COPY: Partial<
  Record<PrismaOrderStatus, { subject: string; heading: string; body: string }>
> = {
  PROCESSING: {
    subject: "Your order is being processed",
    heading: "Your order is being processed",
    body: "We're getting your order ready.",
  },
  OUT_FOR_DELIVERY: {
    subject: "Your order is out for delivery",
    heading: "Out for delivery",
    body: "Your order is on its way to you.",
  },
  DELIVERED: {
    subject: "Your order has been delivered",
    heading: "Delivered",
    body: "Your order has been delivered. Thank you for shopping with us.",
  },
  CANCELLED: {
    subject: "Your order has been cancelled",
    heading: "Order cancelled",
    body: "Your order has been cancelled. Contact us if this isn't what you expected.",
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
      html: `
        <p>Hi ${order.customer.name},</p>
        <p><strong>${copy.heading}</strong></p>
        <p>${copy.body}</p>
        <p>Order #LUX-${order.orderNumber} · ${formatGhs(order.totalGhs)}</p>
      `,
    });
  } catch {
    // Worth checking Resend's dashboard if this keeps happening.
  }
}
