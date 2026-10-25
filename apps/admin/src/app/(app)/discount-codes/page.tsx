import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { DiscountCodesContent } from "@/components/discount-codes-content";
import { requirePageAccess } from "@/lib/permissions";
import {
  isExpired,
  isExpiringSoon,
  mapAdminDiscountCode,
} from "@/lib/discount-codes";

export const metadata: Metadata = {
  title: "Discount Codes | Luxe All Fashion Admin",
};

// Without this, Next.js can serve a cached render — toggling a code's
// active state genuinely updates the database, but the page never shows
// it, since it's reading the same stale response instead of the DB.
export const dynamic = "force-dynamic";

export default async function DiscountCodesPage() {
  await requirePageAccess("DISCOUNT_CODES");

  const [discountCodes, usage] = await Promise.all([
    prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } }),
    // Only paid orders count as real usage — an abandoned checkout that
    // happened to carry a code shouldn't inflate how well it performed.
    prisma.order.groupBy({
      by: ["discountCodeId"],
      where: { paymentStatus: "PAID", discountCodeId: { not: null } },
      _sum: { totalGhs: true, discountGhs: true },
    }),
  ]);

  const usageByCodeId = new Map(
    usage
      .filter((row) => row.discountCodeId !== null)
      .map((row) => [
        row.discountCodeId as string,
        {
          revenueGeneratedGhs: row._sum.totalGhs ?? 0,
          discountGivenGhs: row._sum.discountGhs ?? 0,
        },
      ]),
  );

  const items = discountCodes.map((code) =>
    mapAdminDiscountCode(code, usageByCodeId.get(code.id)),
  );

  const activeCount = items.filter((c) => c.isActive && !isExpired(c)).length;
  const totalDiscountGivenGhs = items.reduce((sum, c) => sum + c.discountGivenGhs, 0);
  const mostUsed = items.reduce<(typeof items)[number] | null>(
    (best, c) => (c.usageCount > 0 && c.usageCount > (best?.usageCount ?? 0) ? c : best),
    null,
  );
  const expiringSoonCount = items.filter(isExpiringSoon).length;

  const insights = {
    activeCount,
    totalDiscountGivenGhs,
    mostUsedCode: mostUsed?.code ?? null,
    mostUsedCount: mostUsed?.usageCount ?? 0,
    expiringSoonCount,
  };

  return <DiscountCodesContent codes={items} insights={insights} />;
}
