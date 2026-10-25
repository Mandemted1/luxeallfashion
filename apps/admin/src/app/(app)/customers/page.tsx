import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { CustomersContent } from "@/components/customers-content";
import { mapAdminCustomer } from "@/lib/customers";
import { requirePageAccess } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Customers | Luxe All Fashion Admin",
};

// Without this, Next.js can serve a cached render of admin-mutated data.
export const dynamic = "force-dynamic";

function startOfMonth(): Date {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default async function CustomersPage() {
  await requirePageAccess("CUSTOMERS");

  const customers = await prisma.customer.findMany({
    include: {
      orders: {
        include: {
          deliveryRegion: true,
          items: { include: { product: true, variant: true } },
        },
      },
    },
  });

  const items = customers
    .map(mapAdminCustomer)
    .sort((a, b) => b.totalSpentGhs - a.totalSpentGhs);

  const withOrders = items.filter((c) => c.orderCount > 0);
  const repeatCustomers = items.filter((c) => c.orderCount >= 2);
  const optedIn = items.filter((c) => c.marketingOptIn);
  const monthStart = startOfMonth();
  const newThisMonth = items.filter((c) => c.createdAt >= monthStart);

  const insights = {
    totalCustomers: items.length,
    repeatCount: repeatCustomers.length,
    repeatRatePct: withOrders.length === 0 ? 0 : (repeatCustomers.length / withOrders.length) * 100,
    avgCustomerValueGhs:
      withOrders.length === 0
        ? 0
        : Math.round(withOrders.reduce((sum, c) => sum + c.totalSpentGhs, 0) / withOrders.length),
    optedInCount: optedIn.length,
    optedInRatePct: items.length === 0 ? 0 : (optedIn.length / items.length) * 100,
    newThisMonthCount: newThisMonth.length,
  };

  return <CustomersContent customers={items} insights={insights} />;
}
