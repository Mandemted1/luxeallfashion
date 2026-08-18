// Placeholder data standing in for a real DiscountCode table until the
// admin CRUD is backed by Prisma (no such model exists there yet).
// Editing an existing code's terms isn't offered here on purpose — once a
// code may have been used on real orders, retroactively changing its value
// gets confusing. The realistic flow is: deactivate the old one, add a new
// one with the terms you want.

import type { BrandFilter } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";

export type DiscountType = "percentage" | "fixed";

export interface MockDiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  value: number; // percentage: 1-100. fixed: pesewas.
  brandFilter: BrandFilter;
  isActive: boolean;
  usageCount: number;
  usageLimit: number | null; // null = unlimited
  expiresAt: string | null; // "YYYY-MM-DD", null = no expiry
  createdAt: string;
}

export const mockDiscountCodes: MockDiscountCode[] = [
  {
    id: "disc-1",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    brandFilter: "all",
    isActive: true,
    usageCount: 128,
    usageLimit: null,
    expiresAt: null,
    createdAt: "2026-01-10",
  },
  {
    id: "disc-2",
    code: "CHIC20",
    type: "percentage",
    value: 20,
    brandFilter: "chicstyle",
    isActive: true,
    usageCount: 34,
    usageLimit: 100,
    expiresAt: "2026-09-30",
    createdAt: "2026-02-01",
  },
  {
    id: "disc-3",
    code: "SAVE50",
    type: "fixed",
    value: 5000,
    brandFilter: "all",
    isActive: true,
    usageCount: 61,
    usageLimit: null,
    expiresAt: null,
    createdAt: "2026-02-15",
  },
  {
    id: "disc-4",
    code: "KIDS15",
    type: "percentage",
    value: 15,
    brandFilter: "kiddies-space-gh",
    isActive: true,
    usageCount: 9,
    usageLimit: 200,
    expiresAt: "2026-09-01",
    createdAt: "2026-03-01",
  },
  {
    id: "disc-5",
    code: "LAUNCH5",
    type: "percentage",
    value: 5,
    brandFilter: "og-luxemen",
    isActive: false,
    usageCount: 210,
    usageLimit: 200,
    expiresAt: "2026-06-30",
    createdAt: "2026-01-05",
  },
];

export function formatDiscountValue(code: Pick<MockDiscountCode, "type" | "value">): string {
  return code.type === "percentage" ? `${code.value}% off` : `${formatGhs(code.value)} off`;
}

export function isExpired(code: Pick<MockDiscountCode, "expiresAt">): boolean {
  if (!code.expiresAt) return false;
  return new Date(code.expiresAt) < new Date();
}

export function normalizeCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}
