import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@luxe/database";
import { StatusBadge } from "@/components/status-badge";
import { brandLabel } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import { mapAdminCustomer } from "@/lib/customers";
import { formatPlacedAt, mapAdminOrder, orderDisplayNumber, orderTotalGhs } from "@/lib/orders";
import { buildWhatsAppLink } from "@/lib/whatsapp";

async function findCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          customer: true,
          deliveryRegion: true,
          items: { include: { product: true, variant: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return customer;
}

export async function generateMetadata(
  props: PageProps<"/customers/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const customer = await findCustomer(id);
  return {
    title: customer
      ? `${customer.name} | Customers | Luxe All Fashion Admin`
      : "Customer | Luxe All Fashion Admin",
  };
}

export default async function CustomerDetailPage(props: PageProps<"/customers/[id]">) {
  const { id } = await props.params;
  const customerRow = await findCustomer(id);

  if (!customerRow) {
    notFound();
  }

  const customer = mapAdminCustomer(customerRow);
  const orders = customerRow.orders.map(mapAdminOrder);
  const whatsappMessage = `Hi ${customer.name}, this is Luxe All Fashion.`;

  return (
    <div>
      <Link
        href="/customers"
        className="text-xs font-medium uppercase tracking-[0.1em] text-black/50 hover:text-black"
      >
        ← Back to Customers
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{customer.name}</h1>
          <p className="mt-1 text-sm text-black/50">
            {customer.brands.length > 0 ? customer.brands.map(brandLabel).join(" + ") : "No orders yet"}
          </p>
        </div>
        <a
          href={buildWhatsAppLink(customer.phone, whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black px-5 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-stone-800"
        >
          Message on WhatsApp
        </a>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-black/10 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
            Total Orders
          </p>
          <p className="mt-3 text-3xl font-semibold">{customer.orderCount}</p>
        </div>
        <div className="border border-black/10 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
            Total Spent
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {formatGhs(customer.totalSpentGhs)}
          </p>
        </div>
        <div className="border border-black/10 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
            Contact
          </p>
          <p className="mt-3 text-sm font-medium">{customer.phone}</p>
          <p className="text-sm text-black/60">{customer.email}</p>
          <p className="mt-2 text-xs text-black/40">
            {customer.marketingOptIn ? "Opted in to marketing" : "Not opted in to marketing"}
          </p>
        </div>
      </div>

      <div className="mt-6 border border-black/10 bg-white">
        <div className="border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
            Order History
          </p>
        </div>
        {orders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-black/40">No orders yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs font-medium uppercase tracking-[0.08em] text-black/50">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Placed</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-black/5 last:border-b-0">
                  <td className="px-5 py-4">
                    <Link
                      href={`/orders/${order.orderNumber}`}
                      className="font-medium hover:underline"
                    >
                      #{orderDisplayNumber(order)}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-black/60">{formatPlacedAt(order.placedAt)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {formatGhs(orderTotalGhs(order))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
