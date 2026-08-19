import { prisma, type Brand as PrismaBrand } from "@luxe/database";

export interface ResolvedDiscount {
  discountCodeId: string;
  code: string;
  discountGhs: number;
}

export async function resolveDiscountCode(
  code: string,
  itemsWithBrand: { brand: PrismaBrand; lineTotalGhs: number }[],
): Promise<{ error?: string; discount?: ResolvedDiscount }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { error: "Enter a discount code." };

  const discountCode = await prisma.discountCode.findUnique({
    where: { code: normalized },
  });

  if (!discountCode || !discountCode.isActive) {
    return { error: "Invalid discount code." };
  }
  if (discountCode.expiresAt && discountCode.expiresAt < new Date()) {
    return { error: "This code has expired." };
  }
  if (
    discountCode.usageLimit !== null &&
    discountCode.usageCount >= discountCode.usageLimit
  ) {
    return { error: "This code has reached its usage limit." };
  }

  const applicableGhs = discountCode.brand
    ? itemsWithBrand
        .filter((item) => item.brand === discountCode.brand)
        .reduce((sum, item) => sum + item.lineTotalGhs, 0)
    : itemsWithBrand.reduce((sum, item) => sum + item.lineTotalGhs, 0);

  if (applicableGhs <= 0) {
    return { error: "This code doesn't apply to any items in your bag." };
  }

  const discountGhs =
    discountCode.type === "PERCENTAGE"
      ? Math.round((applicableGhs * discountCode.value) / 100)
      : Math.min(discountCode.value, applicableGhs);

  return {
    discount: {
      discountCodeId: discountCode.id,
      code: discountCode.code,
      discountGhs,
    },
  };
}
