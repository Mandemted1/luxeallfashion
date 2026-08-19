"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@luxe/database";
import { toPrismaBrand, type BrandFilter } from "@/lib/brands";
import { normalizeCode, type DiscountType } from "@/lib/discount-codes";

interface CreateDiscountCodeInput {
  code: string;
  type: DiscountType;
  value: number;
  brandFilter: BrandFilter;
  expiresAt: string;
}

export async function createDiscountCode(
  input: CreateDiscountCodeInput,
): Promise<{ error?: string }> {
  const normalized = normalizeCode(input.code);
  if (!normalized) return { error: "Enter a code." };

  if (!input.value || input.value <= 0) {
    return { error: "Enter a value greater than 0." };
  }
  if (input.type === "percentage" && input.value > 100) {
    return { error: "A percentage discount can't exceed 100%." };
  }

  const existing = await prisma.discountCode.findUnique({
    where: { code: normalized },
  });
  if (existing) {
    return { error: "A discount code with this name already exists." };
  }

  await prisma.discountCode.create({
    data: {
      code: normalized,
      type: input.type === "percentage" ? "PERCENTAGE" : "FIXED",
      value: input.type === "fixed" ? Math.round(input.value * 100) : input.value,
      brand: input.brandFilter === "all" ? null : toPrismaBrand(input.brandFilter),
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  });

  revalidatePath("/discount-codes");
  return {};
}

export async function toggleDiscountCodeActive(id: string): Promise<{ error?: string }> {
  const discountCode = await prisma.discountCode.findUniqueOrThrow({ where: { id } });
  await prisma.discountCode.update({
    where: { id },
    data: { isActive: !discountCode.isActive },
  });
  revalidatePath("/discount-codes");
  return {};
}

export async function deleteDiscountCode(id: string): Promise<{ error?: string }> {
  const orderCount = await prisma.order.count({ where: { discountCodeId: id } });
  if (orderCount > 0) {
    return {
      error: "Can't delete: this code has been used on real orders. Deactivate it instead.",
    };
  }

  await prisma.discountCode.delete({ where: { id } });
  revalidatePath("/discount-codes");
  return {};
}
