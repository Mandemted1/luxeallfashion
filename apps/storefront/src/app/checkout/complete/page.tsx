import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@luxe/database";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";
import { SiteHeader } from "@/components/site-header";
import { formatGhs } from "@/lib/currency";
import { CONTACT_WHATSAPP_LOCAL } from "@/lib/contact-info";
import { markOrderPaid } from "@/lib/order-fulfillment";
import { verifyTransaction } from "@/lib/paystack";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Order Confirmed | Luxe All Fashion",
};

export default async function CheckoutCompletePage(
  props: PageProps<"/checkout/complete">,
) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : undefined;

  // Looked up by the random confirmationToken, not the sequential order
  // number/Paystack reference — those are fine as customer-facing labels,
  // but anyone could page through them to view other people's orders.
  const order = token
    ? await prisma.order.findUnique({
        where: { confirmationToken: token },
        include: { items: { include: { product: true } } },
      })
    : null;

  if (!order) {
    return (
      <>
        <SiteHeader />
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-semibold">We couldn&apos;t find that order</h1>
          <p className="text-sm text-black/60">
            If you were just charged, contact us and we&apos;ll sort it out.
          </p>
          <Link href="/new-in" className="text-sm underline underline-offset-4">
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  // The webhook is the source of truth, but it can arrive after this page
  // loads (or, in local dev, not at all — Paystack can't reach localhost).
  // Verifying directly here means the customer isn't stuck on a "pending"
  // screen for a payment that actually succeeded.
  let paymentStatus = order.paymentStatus;
  if (paymentStatus === "PENDING" && order.paystackReference) {
    const verification = await verifyTransaction(order.paystackReference);
    if (verification.data?.status === "success") {
      await markOrderPaid(order.id);
      paymentStatus = "PAID";
    }
  }
  const paid = paymentStatus === "PAID";

  const whatsappMessage = `Hi OG Luxemen, I just placed order #LUX-${order.orderNumber}. I'd like to confirm my delivery details.`;

  return (
    <>
      <SiteHeader />
      <div className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-10">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          {paid ? (
            <>
              <ClearCartOnMount />
              <h1 className="text-3xl font-semibold">Order Confirmed</h1>
              <p className="mt-2 text-sm text-black/60">
                Order #LUX-{order.orderNumber}, thank you for shopping with us.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-semibold">Payment Not Confirmed Yet</h1>
              <p className="mt-2 text-sm text-black/60">
                We haven&apos;t received confirmation for order #LUX-{order.orderNumber} yet.
                If you completed payment, this usually resolves within a minute, contact
                us if it doesn&apos;t.
              </p>
            </>
          )}

          <div className="mt-8 w-full border border-black/10 p-6 text-left">
            <ul className="flex flex-col divide-y divide-black/10">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between py-3 text-sm first:pt-0">
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatGhs(item.priceGhs * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-black/10 pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatGhs(order.totalGhs)}</span>
            </div>
          </div>

          {paid && (
            <a
              href={buildWhatsAppLink(CONTACT_WHATSAPP_LOCAL, whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full bg-black py-4 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800"
            >
              Chat With Us On WhatsApp
            </a>
          )}

          <Link
            href="/new-in"
            className="mt-6 text-sm font-medium uppercase tracking-[0.1em] underline underline-offset-4"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
}
