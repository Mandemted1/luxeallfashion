import { prisma, type Brand as PrismaBrand } from "@luxe/database";

export interface ResolvedDiscount {
  discountCodeId: string;
  code: string;
  discountGhs: number;
}

// expiresAt is stored from a bare admin-picked date, which lands at
// midnight UTC — comparing directly against it would expire a code
// picked to "expire Sept 20" from the very start of the 20th instead of
// through the end of it. Ghana has no UTC offset, so the end of that
// calendar day in Ghana time is exactly 23:59:59.999 UTC on the same date
// stored, regardless of what time-of-day the timestamp itself carries.
function isPastExpiry(expiresAt: Date, now: Date): boolean {
  const endOfExpiryDay = new Date(
    Date.UTC(
      expiresAt.getUTCFullYear(),
      expiresAt.getUTCMonth(),
      expiresAt.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
  return now > endOfExpiryDay;
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
  if (discountCode.expiresAt && isPastExpiry(discountCode.expiresAt, new Date())) {
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
