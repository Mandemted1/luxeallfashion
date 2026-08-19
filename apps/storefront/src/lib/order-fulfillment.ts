import { prisma } from "@luxe/database";
import { escapeHtml, renderOrderEmailHtml } from "@/lib/email-template";
import { ORDERS_EMAIL_FROM, resend } from "@/lib/resend";

// Not tied to any admin login — always gets new-order alerts alongside
// whichever AdminUser accounts are active.
const DEDICATED_ORDER_NOTIFICATION_EMAIL = "luxeallfashion01@gmail.com";

// Called from both the Paystack webhook (source of truth, works even if
// the customer closes the tab before being redirected back) and the
// checkout/complete page (immediate confirmation on redirect) — either
// one might get there first, so this is safe to call twice: the
// paymentStatus check makes stock decrement and the email idempotent.
export async function markOrderPaid(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, customer: true },
  });

  if (!order || order.paymentStatus === "PAID") return;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    }),
    ...order.items.map((item) =>
      prisma.productVariant.update({
        where: { id: item.variantId },
        data: { quantity: { decrement: item.quantity } },
      }),
    ),
    ...(order.discountCodeId
      ? [
          prisma.discountCode.update({
            where: { id: order.discountCodeId },
            data: { usageCount: { increment: 1 } },
          }),
        ]
      : []),
  ]);

  const items = order.items.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    lineTotalGhs: item.priceGhs * item.quantity,
  }));

  try {
    await resend.emails.send({
      from: ORDERS_EMAIL_FROM,
      to: order.customer.email,
      subject: `Order confirmed: LUX-${order.orderNumber}`,
      html: renderOrderEmailHtml({
        heading: `Order confirmed — LUX-${order.orderNumber}`,
        introHtml: `<p>Hi ${escapeHtml(order.customer.name)}, your order is confirmed. We'll be in touch about delivery shortly.</p>`,
        items,
        totalGhs: order.totalGhs,
      }),
    });
  } catch {
    // Payment succeeded and stock is decremented regardless — a failed
    // confirmation email shouldn't undo any of that. Worth checking
    // Resend's dashboard if this keeps happening.
  }

  try {
    const adminUsers = await prisma.adminUser.findMany({
      where: { isActive: true },
      select: { email: true },
    });
    const recipients = [
      ...new Set([
        ...adminUsers.map((admin) => admin.email),
        DEDICATED_ORDER_NOTIFICATION_EMAIL,
      ]),
    ];

    await resend.emails.send({
      from: ORDERS_EMAIL_FROM,
      to: recipients,
      subject: `New order: LUX-${order.orderNumber}`,
      html: renderOrderEmailHtml({
        heading: `New order — LUX-${order.orderNumber}`,
        introHtml: `<p>New order from <strong>${escapeHtml(order.customer.name)}</strong> (${escapeHtml(order.customer.email)}).</p>`,
        items,
        totalGhs: order.totalGhs,
      }),
    });
  } catch {
    // Same best-effort reasoning as the customer email above.
  }
}
