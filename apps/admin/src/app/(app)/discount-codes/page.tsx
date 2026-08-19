import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { DiscountCodesContent } from "@/components/discount-codes-content";
import { mapAdminDiscountCode } from "@/lib/discount-codes";

export const metadata: Metadata = {
  title: "Discount Codes | Luxe All Fashion Admin",
};

export default async function DiscountCodesPage() {
  const discountCodes = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <DiscountCodesContent codes={discountCodes.map(mapAdminDiscountCode)} />;
}
