"use server";

import { prisma } from "@luxe/database";
import type { CartItem } from "@/lib/cart-context";
import { initializeTransaction } from "@/lib/paystack";

interface CheckoutInput {
  fullName: string;
  email: string;
  phone: string;
  deliveryRegionId: string;
  address: string;
  items: CartItem[];
}

export async function createOrderAndInitiatePayment(
  input: CheckoutInput,
): Promise<{ error?: string; authorizationUrl?: string }> {
  if (input.items.length === 0) return { error: "Your bag is empty." };

  const region = await prisma.deliveryRegion.findUnique({
    where: { id: input.deliveryRegionId },
  });
  if (!region) return { error: "Please select a delivery region." };

  // Revalidate every cart item against real stock/price server-side —
  // never trust what the client cached, prices or availability may have
  // changed since it was added.
  const resolvedItems: {
    productId: string;
    variantId: string;
    quantity: number;
    priceGhs: number;
    name: string;
  }[] = [];

  for (const item of input.items) {
    const variant = await prisma.productVariant.findFirst({
      where: {
        size: item.size,
        colorName: item.colorName ?? "Default",
        product: { slug: item.slug },
      },
      include: { product: true },
    });

    if (!variant) {
      return {
        error: `${item.name} (${item.size}${item.colorName ? `, ${item.colorName}` : ""}) is no longer available.`,
      };
    }
    if (variant.quantity < item.quantity) {
      return {
        error: `Only ${variant.quantity} left of ${item.name} (${item.size}${item.colorName ? `, ${item.colorName}` : ""}).`,
      };
    }

    resolvedItems.push({
      productId: variant.productId,
      variantId: variant.id,
      quantity: item.quantity,
      priceGhs: variant.priceGhs,
      name: variant.product.name,
    });
  }

  const subtotalGhs = resolvedItems.reduce(
    (sum, item) => sum + item.priceGhs * item.quantity,
    0,
  );
  // Delivery fee is arranged directly with the courier, not charged
  // through the platform — shippingGhs stays 0.
  const totalGhs = subtotalGhs;

  let customer;
  try {
    customer = await prisma.customer.upsert({
      where: { email: input.email },
      update: { name: input.fullName, phone: input.phone },
      create: { name: input.fullName, email: input.email, phone: input.phone },
    });
  } catch {
    return {
      error: "That phone number is already associated with a different account.",
    };
  }

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      deliveryRegionId: region.id,
      deliveryAddress: input.address,
      subtotalGhs,
      shippingGhs: 0,
      totalGhs,
      items: {
        create: resolvedItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          priceGhs: item.priceGhs,
        })),
      },
      statusHistory: { create: { status: "PLACED" } },
    },
  });

  const reference = `LUX-${order.orderNumber}`;
  const callbackUrl = `${process.env.BETTER_AUTH_URL}/checkout/complete?reference=${reference}`;

  const paystackResponse = await initializeTransaction({
    email: input.email,
    amountGhs: totalGhs,
    reference,
    callbackUrl,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
  });

  if (!paystackResponse.status || !paystackResponse.data) {
    return { error: "Could not start payment. Please try again." };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paystackReference: reference },
  });

  return { authorizationUrl: paystackResponse.data.authorization_url };
}
