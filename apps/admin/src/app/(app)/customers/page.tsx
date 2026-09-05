import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { CustomersContent } from "@/components/customers-content";
import { mapAdminCustomer } from "@/lib/customers";

export const metadata: Metadata = {
  title: "Customers | Luxe All Fashion Admin",
};

// Without this, Next.js can serve a cached render of admin-mutated data.
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
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

  return <CustomersContent customers={items} />;
}
