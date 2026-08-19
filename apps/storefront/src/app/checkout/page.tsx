import type { Metadata } from "next";
import { headers } from "next/headers";
import { prisma } from "@luxe/database";
import { CheckoutContent } from "@/components/checkout-content";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Checkout | Luxe All Fashion",
};

// Delivery regions come straight from the database (admin can toggle
// isActive) — without this, Next.js would bake the list in at build
// time and it wouldn't reflect admin changes until the next deploy.
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [regions, session] = await Promise.all([
    prisma.deliveryRegion.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  let initialDetails = null;
  if (session) {
    const customer = await prisma.customer.findUnique({
      where: { authUserId: session.user.id },
      include: { addresses: { where: { isDefault: true }, take: 1 } },
    });
    if (customer) {
      const defaultAddress = customer.addresses[0];
      // The saved region could since have been deactivated — only prefill
      // it if it's still one of the currently selectable options.
      const regionStillActive =
        defaultAddress &&
        regions.some((region) => region.id === defaultAddress.deliveryRegionId);
      initialDetails = {
        fullName: customer.name,
        email: customer.email,
        phone: customer.phone,
        deliveryRegionId: regionStillActive ? defaultAddress.deliveryRegionId : "",
        address: defaultAddress?.addressDetail ?? "",
      };
    }
  }

  return (
    <>
      <SiteHeader />
      <div className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-10">
        <CheckoutContent
          regions={regions}
          initialDetails={initialDetails}
          isLoggedIn={!!session}
        />
      </div>
    </>
  );
}
