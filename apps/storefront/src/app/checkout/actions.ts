"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { prisma, type Brand as PrismaBrand } from "@luxe/database";
import type { CartItem } from "@/lib/cart-context";
import { auth } from "@/lib/auth";
import { resolveDiscountCode } from "@/lib/discount";
import { initializeTransaction } from "@/lib/paystack";
import { isRateLimited } from "@/lib/rate-limit";

interface CheckoutInput {
  fullName: string;
  email: string;
  phone: string;
  deliveryRegionId: string;
  address: string;
  items: CartItem[];
  discountCode?: string;
}

interface ResolvedCartItem {
  productId: string;
  variantId: string;
  quantity: number;
  priceGhs: number;
  name: string;
  brand: PrismaBrand;
}

async function resolveCartItems(
  items: CartItem[],
): Promise<{ error?: string; resolvedItems?: ResolvedCartItem[] }> {
  const resolvedItems: ResolvedCartItem[] = [];

  for (const item of items) {
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
      brand: variant.product.brand,
    });
  }

  return { resolvedItems };
}

export async function previewDiscountCode(
  code: string,
  items: CartItem[],
): Promise<{ error?: string; discountGhs?: number }> {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  // Live-typed lookup with no account behind it — the endpoint an
  // attacker would script to brute-force valid codes. 8 tries/minute is
  // plenty for a real shopper mistyping a code, not for guessing one.
  if (isRateLimited(`discount-preview:${ip}`, 8, 60_000)) {
    return { error: "Too many attempts. Please wait a moment and try again." };
  }

  const { error, resolvedItems } = await resolveCartItems(items);
  if (error || !resolvedItems) return { error: error ?? "Your bag is empty." };

  const { error: discountError, discount } = await resolveDiscountCode(
    code,
    resolvedItems.map((item) => ({
      brand: item.brand,
      lineTotalGhs: item.priceGhs * item.quantity,
    })),
  );
  if (discountError || !discount) return { error: discountError };

  return { discountGhs: discount.discountGhs };
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
  const { error: itemsError, resolvedItems } = await resolveCartItems(
    input.items,
  );
  if (itemsError || !resolvedItems) {
    return { error: itemsError ?? "Your bag is empty." };
  }

  const subtotalGhs = resolvedItems.reduce(
    (sum, item) => sum + item.priceGhs * item.quantity,
    0,
  );

  let discountCodeId: string | undefined;
  let discountGhs = 0;
  if (input.discountCode) {
    const { error: discountError, discount } = await resolveDiscountCode(
      input.discountCode,
      resolvedItems.map((item) => ({
        brand: item.brand,
        lineTotalGhs: item.priceGhs * item.quantity,
      })),
    );
    if (discountError || !discount) {
      return { error: discountError ?? "Invalid discount code." };
    }
    discountCodeId = discount.discountCodeId;
    discountGhs = discount.discountGhs;
  }

  // Delivery fee is arranged directly with the courier, not charged
  // through the platform — shippingGhs stays 0.
  const totalGhs = subtotalGhs - discountGhs;

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

  // If they're checking out as the same logged-in customer this Customer
  // record belongs to, refresh their default address so next time's
  // checkout can be prefilled server-side (see checkout/page.tsx).
  const session = await auth.api.getSession({ headers: await headers() });
  if (session && customer.authUserId === session.user.id) {
    const existingDefault = await prisma.customerAddress.findFirst({
      where: { customerId: customer.id, isDefault: true },
    });
    if (existingDefault) {
      await prisma.customerAddress.update({
        where: { id: existingDefault.id },
        data: { deliveryRegionId: region.id, addressDetail: input.address },
      });
    } else {
      await prisma.customerAddress.create({
        data: {
          customerId: customer.id,
          deliveryRegionId: region.id,
          addressDetail: input.address,
          isDefault: true,
        },
      });
    }
  }

  // Random and unguessable — see the schema comment on confirmationToken.
  // The customer-facing "LUX-<number>" order number stays sequential and
  // human-friendly; it's just no longer what grants access to view an order.
  const confirmationToken = randomBytes(24).toString("hex");

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      deliveryRegionId: region.id,
      deliveryAddress: input.address,
      subtotalGhs,
      shippingGhs: 0,
      discountCodeId,
      discountGhs,
      totalGhs,
      confirmationToken,
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
  // "token" deliberately isn't named "reference" — Paystack appends its own
  // ?reference= (and ?trxref=) on redirect, and reusing that name produced
  // a duplicate query-string key once before, which Next.js parses as an
  // array instead of a string and silently broke the order lookup.
  const callbackUrl = `${process.env.BETTER_AUTH_URL}/checkout/complete?token=${confirmationToken}`;

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
