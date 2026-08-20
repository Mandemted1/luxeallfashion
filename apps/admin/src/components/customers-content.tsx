"use client";

import Link from "next/link";
import { useState } from "react";
import { brandLabel } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import { formatPlacedAt } from "@/lib/orders";
import type { AdminCustomer } from "@/lib/customers";

export function CustomersContent({ customers }: { customers: AdminCustomer[] }) {
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
        <h1 className="text-3xl font-semibold">Customers</h1>
        <p className="text-sm text-black/50">{customers.length} total</p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search name or email"
        className="mt-6 w-full border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none sm:w-64"
      />

      <div className="mt-6 overflow-x-auto border border-black/10 bg-white">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs font-medium uppercase tracking-[0.08em] text-black/50">
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Shops At</th>
              <th className="px-5 py-3 text-right font-medium">Orders</th>
              <th className="px-5 py-3 text-right font-medium">Total Spent</th>
              <th className="px-5 py-3 font-medium">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-black/40">
                  No customers match this search.
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-black/5 last:border-b-0 hover:bg-stone-50"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-medium hover:underline"
                    >
                      {customer.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-black/50">{customer.email}</p>
                  </td>
                  <td className="px-5 py-4 text-black/60">
                    {customer.brands.length > 0
                      ? customer.brands.map(brandLabel).join(" + ")
                      : "–"}
                  </td>
                  <td className="px-5 py-4 text-right">{customer.orderCount}</td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {formatGhs(customer.totalSpentGhs)}
                  </td>
                  <td className="px-5 py-4 text-black/60">
                    {customer.lastOrderAt ? formatPlacedAt(customer.lastOrderAt) : "–"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
