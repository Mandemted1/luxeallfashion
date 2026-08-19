import { prisma } from "@luxe/database";
import { ORDERS_EMAIL_FROM, resend } from "@/lib/resend";
import { formatGhs } from "@/lib/currency";

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

  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${item.product.name} × ${item.quantity} (${formatGhs(item.priceGhs * item.quantity)})</li>`,
    )
    .join("");

  try {
    await resend.emails.send({
      from: ORDERS_EMAIL_FROM,
      to: order.customer.email,
      subject: `Order confirmed: LUX-${order.orderNumber}`,
      html: `
        <p>Hi ${order.customer.name}, your order #LUX-${order.orderNumber} is confirmed.</p>
        <ul>${itemsHtml}</ul>
        <p><strong>Total: ${formatGhs(order.totalGhs)}</strong></p>
        <p>We'll be in touch about delivery shortly.</p>
      `,
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

    if (adminUsers.length > 0) {
      await resend.emails.send({
        from: ORDERS_EMAIL_FROM,
        to: adminUsers.map((admin) => admin.email),
        subject: `New order: LUX-${order.orderNumber}`,
        html: `
          <p>New order from ${order.customer.name} (${order.customer.email}).</p>
          <ul>${itemsHtml}</ul>
          <p><strong>Total: ${formatGhs(order.totalGhs)}</strong></p>
        `,
      });
    }
  } catch {
    // Same best-effort reasoning as the customer email above.
  }
}
