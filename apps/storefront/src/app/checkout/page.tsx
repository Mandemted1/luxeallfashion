import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { CheckoutContent } from "@/components/checkout-content";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Checkout | Luxe All Fashion",
};

// Delivery regions come straight from the database (admin can toggle
// isActive) — without this, Next.js would bake the list in at build
// time and it wouldn't reflect admin changes until the next deploy.
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const regions = await prisma.deliveryRegion.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      <SiteHeader />
      <div className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-10">
        <CheckoutContent regions={regions} />
      </div>
    </>
  );
}
