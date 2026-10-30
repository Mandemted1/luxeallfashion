import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { MarketingContent } from "@/components/marketing-content";
import { mapAdminCustomer } from "@/lib/customers";
import { mapAdminDiscountCode } from "@/lib/discount-codes";
import { mapAdminNewsletterSubscriber } from "@/lib/newsletter";
import { getOrderEmailTemplates, ORDER_EMAIL_STATUSES } from "@/lib/order-email-templates";
import { requirePageAccess } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Marketing | Luxe All Fashion Admin",
};

// Without this, Next.js can serve a cached render of admin-mutated data.
export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  await requirePageAccess("MARKETING");

  const [customers, discountCodes, subscribers, templates, supportMessages] = await Promise.all([
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
    getOrderEmailTemplates(),
    prisma.supportMessage.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <MarketingContent
      customers={customers.map(mapAdminCustomer)}
      discountCodes={discountCodes.map((code) => mapAdminDiscountCode(code))}
      subscribers={subscribers.map(mapAdminNewsletterSubscriber)}
      orderEmailStatuses={ORDER_EMAIL_STATUSES}
      orderEmailTemplates={templates}
      supportMessages={supportMessages.map((message) => ({
        id: message.id,
        name: message.name,
        email: message.email,
        message: message.message,
        createdAt: message.createdAt.toISOString(),
        repliedAt: message.repliedAt ? message.repliedAt.toISOString() : null,
      }))}
    />
  );
}
