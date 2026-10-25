import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Receipt, ShoppingBag, Wallet } from "lucide-react";
import { prisma } from "@luxe/database";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brandLabel } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import { customerTopProducts, mapAdminCustomer } from "@/lib/customers";
import { formatPlacedAt, mapAdminOrder, orderDisplayNumber, orderTotalGhs } from "@/lib/orders";
import { requirePageAccess } from "@/lib/permissions";
import { buildWhatsAppLink } from "@/lib/whatsapp";

// Without this, Next.js can serve a cached render of admin-mutated data.
export const dynamic = "force-dynamic";

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
      addresses: { include: { deliveryRegion: true }, orderBy: { isDefault: "desc" } },
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
  await requirePageAccess("CUSTOMERS");

  const { id } = await props.params;
  const customerRow = await findCustomer(id);

  if (!customerRow) {
    notFound();
  }

  const customer = mapAdminCustomer(customerRow);
  const orders = customerRow.orders.map(mapAdminOrder);
  const topProducts = customerTopProducts(orders);
  const whatsappMessage = `Hi ${customer.name}, this is Luxe All Fashion.`;
  const customerSince = customer.createdAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      <Link
        href="/customers"
        className="text-xs font-medium uppercase tracking-[0.1em] text-black/50 hover:text-black"
      >
        &larr; Back to Customers
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{customer.name}</h1>
          <p className="mt-1 text-sm text-black/50">
            {customer.brands.length > 0 ? customer.brands.map(brandLabel).join(" + ") : "No orders yet"}
            {" · "}Customer since {customerSince}
            {" · "}
            {customer.hasAccount ? "Registered account" : "Guest checkout"}
          </p>
        </div>
        <Button asChild>
          <a
            href={buildWhatsAppLink(customer.phone, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message on WhatsApp
          </a>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-4 text-black/50" />
              <p className="text-sm text-black/60">Total Orders</p>
            </div>
            <p className="text-3xl font-semibold">{customer.orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-black/50" />
              <p className="text-sm text-black/60">Total Spent</p>
            </div>
            <p className="text-3xl font-semibold">{formatGhs(customer.totalSpentGhs)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Receipt className="size-4 text-black/50" />
              <p className="text-sm text-black/60">Avg Order Value</p>
            </div>
            <p className="text-3xl font-semibold">
              {customer.orderCount > 0 ? formatGhs(customer.avgOrderGhs) : "–"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <p className="text-sm font-medium">{customer.phone}</p>
            <p className="text-sm text-black/60">{customer.email}</p>
            <Badge
              variant="outline"
              className={`mt-2 w-fit border-transparent ${
                customer.marketingOptIn ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"
              }`}
            >
              {customer.marketingOptIn ? "Opted in to marketing" : "Not opted in to marketing"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            {customerRow.addresses.length === 0 ? (
              <p className="text-sm text-black/40">No saved addresses.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-black/5">
                {customerRow.addresses.map((address) => (
                  <li key={address.id} className="flex items-start gap-2 py-2.5 first:pt-0 last:pb-0">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-black/30" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {address.label || address.deliveryRegion.name}
                        {address.isDefault && (
                          <span className="ml-2 text-xs font-normal text-black/40">Default</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-black/50">
                        {address.addressDetail}, {address.deliveryRegion.name}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favorite Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-black/40">No purchases yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-black/5">
                {topProducts.map((product) => (
                  <li key={product.slug} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-stone-100"
                    >
                      {product.image && (
                        <Image src={product.image} alt="" fill sizes="36px" className="object-cover" />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        <Link href={`/products/${product.slug}`} className="hover:underline">
                          {product.name}
                        </Link>
                      </p>
                      <p className="text-xs text-black/50">
                        {product.unitsBought} bought
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 gap-0 py-0">
        <div className="border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">Order History</p>
        </div>
        {orders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-black/40">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[480px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Order</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/orders/${order.orderNumber}`} className="font-medium hover:underline">
                        #{orderDisplayNumber(order)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-black/60">{formatPlacedAt(order.placedAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatGhs(orderTotalGhs(order))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
