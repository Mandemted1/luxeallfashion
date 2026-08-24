import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { DiscountCodesContent } from "@/components/discount-codes-content";
import { mapAdminDiscountCode } from "@/lib/discount-codes";

export const metadata: Metadata = {
  title: "Discount Codes | Luxe All Fashion Admin",
};

// Without this, Next.js can serve a cached render — toggling a code's
// active state genuinely updates the database, but the page never shows
// it, since it's reading the same stale response instead of the DB.
export const dynamic = "force-dynamic";

export default async function DiscountCodesPage() {
  const discountCodes = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <DiscountCodesContent codes={discountCodes.map(mapAdminDiscountCode)} />;
}
