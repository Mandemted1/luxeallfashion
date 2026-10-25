"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Repeat, Sparkles, Users } from "lucide-react";
import { InsightCard } from "@/components/insight-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { formatPlacedAt } from "@/lib/orders";
import type { AdminCustomer } from "@/lib/customers";

export interface CustomerInsights {
  totalCustomers: number;
  repeatCount: number;
  repeatRatePct: number;
  avgCustomerValueGhs: number;
  optedInCount: number;
  optedInRatePct: number;
  newThisMonthCount: number;
}

function SegmentBadge({ orderCount }: { orderCount: number }) {
  if (orderCount === 0) {
    return (
      <Badge variant="outline" className="border-transparent text-black/40">
        No orders yet
      </Badge>
    );
  }
  if (orderCount === 1) {
    return (
      <Badge variant="outline" className="border-transparent bg-sky-50 text-sky-700">
        New
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-transparent bg-emerald-50 text-emerald-700">
      Repeat
    </Badge>
  );
}

export function CustomersContent({
  customers,
  insights,
}: {
  customers: AdminCustomer[];
  insights: CustomerInsights;
}) {
  const [search, setSearch] = useState("");

  const term = search.trim().toLowerCase();
  const filtered = term
    ? customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(term) ||
          customer.email.toLowerCase().includes(term),
      )
    : customers;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Customers</h1>
          <p className="mt-1 text-sm text-black/50">Everyone who has shopped with you.</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          label="Total Customers"
          value={insights.totalCustomers.toLocaleString()}
          hint={`${insights.newThisMonthCount} new this month`}
          icon={Users}
        />
        <InsightCard
          label="Repeat Customers"
          value={`${Math.round(insights.repeatRatePct)}%`}
          hint={`${insights.repeatCount} have ordered twice or more`}
          icon={Repeat}
        />
        <InsightCard
          label="Avg Customer Value"
          value={formatGhs(insights.avgCustomerValueGhs)}
          hint="Among customers with a paid order"
          icon={Sparkles}
        />
        <InsightCard
          label="Marketing Opt-in"
          value={`${Math.round(insights.optedInRatePct)}%`}
          hint={`${insights.optedInCount} subscribed to updates`}
          icon={Mail}
        />
      </div>

      <Input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search name or email"
        className="mt-6 w-full sm:w-64"
      />

      <Card className="mt-6 gap-0 py-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[840px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Customer</TableHead>
                <TableHead>Shops At</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Avg Order</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-black/40">
                    No customers match this search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                        {customer.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-black/50">{customer.email}</p>
                    </TableCell>
                    <TableCell className="text-black/60">
                      {customer.brands.length > 0
                        ? customer.brands.map(brandLabel).join(" + ")
                        : "–"}
                    </TableCell>
                    <TableCell>
                      <SegmentBadge orderCount={customer.orderCount} />
                    </TableCell>
                    <TableCell className="text-right">{customer.orderCount}</TableCell>
                    <TableCell className="text-right text-black/60">
                      {customer.orderCount > 0 ? formatGhs(customer.avgOrderGhs) : "–"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatGhs(customer.totalSpentGhs)}
                    </TableCell>
                    <TableCell className="text-black/60">
                      {customer.lastOrderAt ? formatPlacedAt(customer.lastOrderAt) : "–"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
