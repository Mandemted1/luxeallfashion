import type { DiscountCode as PrismaDiscountCode } from "@luxe/database";
import { fromPrismaBrand, type BrandFilter } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";

export type DiscountType = "percentage" | "fixed";

export interface AdminDiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  value: number; // percentage: 1-100. fixed: pesewas.
  brandFilter: BrandFilter;
  isActive: boolean;
  usageCount: number;
  usageLimit: number | null;
  expiresAt: string | null; // "YYYY-MM-DD"
  createdAt: string;
}

export function mapAdminDiscountCode(
  discountCode: PrismaDiscountCode,
): AdminDiscountCode {
  return {
    id: discountCode.id,
    code: discountCode.code,
    type: discountCode.type === "PERCENTAGE" ? "percentage" : "fixed",
    value: discountCode.value,
    brandFilter: discountCode.brand ? fromPrismaBrand(discountCode.brand) : "all",
    isActive: discountCode.isActive,
    usageCount: discountCode.usageCount,
    usageLimit: discountCode.usageLimit,
    expiresAt: discountCode.expiresAt
      ? discountCode.expiresAt.toISOString().slice(0, 10)
      : null,
    createdAt: discountCode.createdAt.toISOString().slice(0, 10),
  };
}

export function formatDiscountValue(
  code: Pick<AdminDiscountCode, "type" | "value">,
): string {
  return code.type === "percentage" ? `${code.value}% off` : `${formatGhs(code.value)} off`;
}

export function isExpired(code: Pick<AdminDiscountCode, "expiresAt">): boolean {
  if (!code.expiresAt) return false;
  return new Date(code.expiresAt) < new Date();
}

export function normalizeCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}
