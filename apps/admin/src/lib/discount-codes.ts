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
  // From real paid orders that used this code — 0 until page.tsx merges
  // in the aggregate query, same "paid only" reasoning as everywhere else.
  revenueGeneratedGhs: number;
  discountGivenGhs: number;
}

export function mapAdminDiscountCode(
  discountCode: PrismaDiscountCode,
  usage?: { revenueGeneratedGhs: number; discountGivenGhs: number },
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
    revenueGeneratedGhs: usage?.revenueGeneratedGhs ?? 0,
    discountGivenGhs: usage?.discountGivenGhs ?? 0,
  };
}

// A code within this many days of its expiry date is worth calling out —
// same reasoning as StockBadge's low-stock threshold: a number alone
// doesn't prompt action, a visible warning does.
export const EXPIRING_SOON_DAYS = 7;

export function isExpiringSoon(code: Pick<AdminDiscountCode, "expiresAt">): boolean {
  if (!code.expiresAt) return false;
  if (isExpired(code)) return false;
  const msUntilExpiry = new Date(`${code.expiresAt}T23:59:59.999Z`).getTime() - Date.now();
  return msUntilExpiry <= EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000;
}

export function formatDiscountValue(
  code: Pick<AdminDiscountCode, "type" | "value">,
): string {
  return code.type === "percentage" ? `${code.value}% off` : `${formatGhs(code.value)} off`;
}

// code.expiresAt is a bare "YYYY-MM-DD" — parsing it directly gives
// midnight UTC, making a code picked to "expire Sept 20" already show
// Expired from the very start of the 20th instead of through the end of
// it. Ghana has no UTC offset, so the end of that calendar day in Ghana
// time is exactly 23:59:59.999 UTC.
export function isExpired(code: Pick<AdminDiscountCode, "expiresAt">): boolean {
  if (!code.expiresAt) return false;
  return new Date(`${code.expiresAt}T23:59:59.999Z`) < new Date();
}

export function normalizeCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}
