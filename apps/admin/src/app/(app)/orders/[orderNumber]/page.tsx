import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusControl } from "@/components/order-status-control";
import { brandLabel } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import {
  findOrder,
  orderBrands,
  orderSubtotalGhs,
  orderTotalGhs,
} from "@/lib/mock-orders";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export async function generateMetadata(
  props: PageProps<"/orders/[orderNumber]">,
): Promise<Metadata> {
  const { orderNumber } = await props.params;
  const order = findOrder(orderNumber);
  return {
    title: order
      ? `#${order.orderNumber} | Orders | Luxe All Fashion Admin`
      : "Order | Luxe All Fashion Admin",
  };
}

export default async function OrderDetailPage(
  props: PageProps<"/orders/[orderNumber]">,
) {
  const { orderNumber } = await props.params;
  const order = findOrder(orderNumber);

  if (!order) {
    notFound();
  }

  const brands = orderBrands(order);
  const whatsappMessage = `Hi ${order.customerName}, this is Luxe All Fashion regarding your order #${order.orderNumber}.`;

  return (
    <div>
      <Link
        href="/orders"
        className="text-xs font-medium uppercase tracking-[0.1em] text-black/50 hover:text-black"
      >
        ← Back to Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">#{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-black/50">
            {brands.map(brandLabel).join(" + ")} · {order.placedAt}
          </p>
        </div>
        <OrderStatusControl initialStatus={order.status} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="border border-black/10 bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs font-medium uppercase tracking-[0.08em] text-black/50">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Store</th>
                  <th className="px-5 py-3 font-medium">Size / Color</th>
                  <th className="px-5 py-3 text-center font-medium">Qty</th>
                  <th className="px-5 py-3 text-right font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr
                    key={`${item.productName}-${index}`}
                    className="border-b border-black/5 last:border-b-0"
                  >
                    <td className="px-5 py-4 font-medium">
                      {item.productName}
                    </td>
                    <td className="px-5 py-4 text-black/60">
                      {brandLabel(item.brand)}
                    </td>
                    <td className="px-5 py-4 text-black/60">
                      {item.size}
                      {item.colorName ? ` · ${item.colorName}` : ""}
                    </td>
                    <td className="px-5 py-4 text-center">{item.quantity}</td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {formatGhs(item.unitPriceGhs * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-col gap-2 border-t border-black/10 px-5 py-5 text-sm">
              <div className="flex justify-between">
                <span className="text-black/60">Subtotal</span>
                <span>{formatGhs(orderSubtotalGhs(order))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60">Shipping</span>
                <span>{formatGhs(order.shippingGhs)}</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatGhs(orderTotalGhs(order))}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-black/10 bg-white p-6">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
              Customer
            </p>
            <p className="mt-3 text-sm font-medium">{order.customerName}</p>
            <p className="mt-1 text-sm text-black/60">{order.customerPhone}</p>
            <p className="text-sm text-black/60">{order.customerEmail}</p>
            <a
              href={buildWhatsAppLink(order.customerPhone, whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block bg-black py-3 text-center text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-stone-800"
            >
              Message on WhatsApp
            </a>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
              Delivery
            </p>
            <p className="mt-3 text-sm font-medium">{order.deliveryRegion}</p>
            <p className="mt-1 text-sm text-black/60">
              {order.deliveryAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
