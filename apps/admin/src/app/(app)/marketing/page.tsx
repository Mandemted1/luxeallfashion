import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { MarketingContent } from "@/components/marketing-content";
import { mapAdminCustomer } from "@/lib/customers";
import { mapAdminDiscountCode } from "@/lib/discount-codes";
import { mapAdminNewsletterSubscriber } from "@/lib/newsletter";

export const metadata: Metadata = {
  title: "Marketing | Luxe All Fashion Admin",
};

// Without this, Next.js can serve a cached render of admin-mutated data.
export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const [customers, discountCodes, subscribers] = await Promise.all([
    prisma.customer.findMany({
      include: {
        orders: {
          include: {
            deliveryRegion: true,
            items: { include: { product: true, variant: true } },
          },
        },
      },
    }),
    prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <MarketingContent
      customers={customers.map(mapAdminCustomer)}
      discountCodes={discountCodes.map(mapAdminDiscountCode)}
      subscribers={subscribers.map(mapAdminNewsletterSubscriber)}
    />
  );
}
