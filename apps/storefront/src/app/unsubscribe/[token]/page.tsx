import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Unsubscribe | Luxe All Fashion",
};

// This performs a real write (delete/update) on every request — must
// never be statically optimized or cached.
export const dynamic = "force-dynamic";

// One-click by design (a real GET request, no confirmation step) —
// that's what "unsubscribe" links are expected to do. Tries the
// newsletter list first (deletes the row outright), then a customer's
// own marketing opt-in (flips the flag, never deletes the customer —
// order history depends on that row). Idempotent: a second click on an
// already-used link just shows the same "no longer valid" state rather
// than erroring, since by then neither lookup will match.
export default async function UnsubscribePage(props: PageProps<"/unsubscribe/[token]">) {
  const { token } = await props.params;

  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token } });
  if (subscriber) {
    await prisma.newsletterSubscriber.delete({ where: { id: subscriber.id } });
    return <Confirmation />;
  }

  const customer = await prisma.customer.findUnique({ where: { unsubscribeToken: token } });
  if (customer) {
    await prisma.customer.update({ where: { id: customer.id }, data: { marketingOptIn: false } });
    return <Confirmation />;
  }

  return (
    <>
      <SiteHeader />
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-2xl font-semibold">This link is no longer valid</h1>
        <p className="max-w-sm text-sm text-black/60">
          You may have already unsubscribed using this link.
        </p>
      </div>
    </>
  );
}

function Confirmation() {
  return (
    <>
      <SiteHeader />
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-2xl font-semibold">You&apos;ve been unsubscribed</h1>
        <p className="max-w-sm text-sm text-black/60">
          You won&apos;t receive marketing emails from us anymore. Order updates for any existing
          order will still be sent.
        </p>
      </div>
    </>
  );
}
