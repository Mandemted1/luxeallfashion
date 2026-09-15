import { prisma } from "@luxe/database";

// Completes the "claim my past guest orders" link that registerCustomer
// deliberately skips at signup time. Only ever called with a session whose
// email is already verified (see apps/storefront/src/app/account/page.tsx)
// — that's the actual proof of ownership this whole flow exists to require.
// Safe to call on every account page load: a no-op once already linked.
export async function ensureCustomerLinked(userId: string, email: string): Promise<void> {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || customer.authUserId) return;

  await prisma.customer.update({
    where: { id: customer.id },
    data: { authUserId: userId },
  });
}
