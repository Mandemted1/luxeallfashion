import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@luxe/database";
import { markOrderPaid } from "@/lib/order-fulfillment";
import { verifyWebhookSignature } from "@/lib/paystack";

// Source of truth for payment confirmation — works even if the customer
// closes the tab before Paystack redirects them back to /checkout/complete.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const reference = event.data?.reference as string | undefined;
    if (reference) {
      const order = await prisma.order.findUnique({ where: { paystackReference: reference } });
      if (order) await markOrderPaid(order.id);
    }
  }

  return NextResponse.json({ received: true });
}
