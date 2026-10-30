import { prisma } from "@luxe/database";
import { escapeHtml, renderOrderEmailHtml } from "@/lib/email-template";
import { applyOrderEmailTokens, getPlacedEmailCopy } from "@/lib/order-email-templates";
import { ORDERS_EMAIL_FROM, resend, SHOP_NOTIFICATION_EMAIL } from "@/lib/resend";

// Called from both the Paystack webhook (source of truth, works even if
// the customer closes the tab before being redirected back) and the
// checkout/complete page (immediate confirmation on redirect) — either
// one might get there first, so this is safe to call twice: the
// paymentStatus check makes stock decrement and the email idempotent.
export async function markOrderPaid(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, customer: true, discountCode: true },
  });

  if (!order || order.paymentStatus === "PAID") return;

  // Stock and the discount code's usage limit are both checked again here,
  // atomically, rather than trusted from the check at checkout-start — two
  // customers can both pass that earlier check and both complete payment
  // for the same last unit or the same one-time code (the window between
  // "checked" and "paid" is the length of a whole Paystack checkout).
  // updateMany's where clause makes each decrement/increment conditional:
  // it only applies if doing so wouldn't go negative or over the limit.
  // Payment already succeeded either way, so the order is still marked
  // PAID regardless — anything that loses the race goes into
  // fulfillmentIssue for an admin to resolve by hand instead of silently
  // overselling or over-redeeming.
  const issues: string[] = [];

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    });

    for (const item of order.items) {
      const result = await tx.productVariant.updateMany({
        where: { id: item.variantId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });
      if (result.count === 0) {
        issues.push(`${item.product.name}: not enough stock left for ${item.quantity}.`);
      }
    }

    if (order.discountCodeId && order.discountCode) {
      const result = await tx.discountCode.updateMany({
        where: {
          id: order.discountCodeId,
          ...(order.discountCode.usageLimit === null
            ? {}
            : { usageCount: { lt: order.discountCode.usageLimit } }),
        },
        data: { usageCount: { increment: 1 } },
      });
      if (result.count === 0) {
        issues.push(`Discount code ${order.discountCode.code} had already reached its usage limit.`);
      }
    }

    if (issues.length > 0) {
      await tx.order.update({
        where: { id: order.id },
        data: { fulfillmentIssue: issues.join(" ") },
      });
    }
  });

  const items = order.items.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    lineTotalGhs: item.priceGhs * item.quantity,
  }));

  try {
    const copy = await getPlacedEmailCopy();
    const vars = { orderNumber: order.orderNumber, customerName: order.customer.name };
    await resend.emails.send({
      from: ORDERS_EMAIL_FROM,
      to: order.customer.email,
      subject: applyOrderEmailTokens(copy.subject, vars),
      html: renderOrderEmailHtml({
        heading: applyOrderEmailTokens(copy.heading, vars),
        introHtml: `<p>${escapeHtml(applyOrderEmailTokens(copy.bodyText, vars))}</p>`,
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
    const issueHtml =
      issues.length > 0
        ? `<p style="color:#b91c1c"><strong>Needs attention:</strong> ${issues.map(escapeHtml).join(" ")}</p>`
        : "";
    await resend.emails.send({
      from: ORDERS_EMAIL_FROM,
      to: SHOP_NOTIFICATION_EMAIL,
      subject: issues.length > 0
        ? `[Needs attention] New order: LUX-${order.orderNumber}`
        : `New order: LUX-${order.orderNumber}`,
      html: renderOrderEmailHtml({
        heading: `New order — LUX-${order.orderNumber}`,
        introHtml: `<p>New order from <strong>${escapeHtml(order.customer.name)}</strong> (${escapeHtml(order.customer.email)}).</p>${issueHtml}`,
        items,
        totalGhs: order.totalGhs,
      }),
    });
  } catch {
    // Same best-effort reasoning as the customer email above.
  }
}
