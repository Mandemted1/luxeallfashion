"use client";

import Link from "next/link";
import { useState } from "react";
import { brandFilters, brandLabel, type Brand } from "@/lib/brands";
import type { AdminCustomer } from "@/lib/customers";
import { formatDiscountValue, type AdminDiscountCode } from "@/lib/discount-codes";

// There's no email/SMS sending backend yet, so this page stops at giving
// her the audience data and an easy way to copy it out — it doesn't offer
// a "Send Campaign" button that couldn't actually send anything.

const brands: Brand[] = brandFilters
  .map((filter) => filter.value)
  .filter((value): value is Brand => value !== "all");

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

export function MarketingContent({
  customers,
  discountCodes,
}: {
  customers: AdminCustomer[];
  discountCodes: AdminDiscountCode[];
}) {
  const [copied, setCopied] = useState(false);
  const optedIn = customers.filter((c) => c.marketingOptIn);
  const optInRate = customers.length === 0 ? 0 : Math.round((optedIn.length / customers.length) * 100);
  const activeCodes = discountCodes.filter((code) => code.isActive);

  async function copyEmails() {
    const emails = optedIn.map((c) => c.email).join(", ");
    await navigator.clipboard.writeText(emails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Marketing</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Customers" value={String(customers.length)} />
        <StatCard label="Opted In to Marketing" value={String(optedIn.length)} />
        <StatCard label="Opt-In Rate" value={`${optInRate}%`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-black/10 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
            Opt-In by Store
          </p>
          <ul className="mt-4 flex flex-col gap-4">
            {brands.map((brand) => {
              const brandCustomers = customers.filter((c) => c.brands.includes(brand));
              const brandOptedIn = brandCustomers.filter((c) => c.marketingOptIn);
              const rate =
                brandCustomers.length === 0
                  ? 0
                  : Math.round((brandOptedIn.length / brandCustomers.length) * 100);
              return (
                <li key={brand}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{brandLabel(brand)}</p>
                    <p className="text-sm font-semibold">
                      {brandOptedIn.length} / {brandCustomers.length}
                    </p>
                  </div>
                  <div className="mt-2 h-1 w-full bg-black/5">
                    <div className="h-1 bg-black" style={{ width: `${rate}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-black/50">{rate}% opted in</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border border-black/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
              Active Discount Codes
            </p>
            <Link
              href="/discount-codes"
              className="text-xs font-medium uppercase tracking-[0.1em] underline underline-offset-2 hover:text-black"
            >
              Manage
            </Link>
          </div>
          {activeCodes.length === 0 ? (
            <p className="mt-4 text-sm text-black/40">No active codes.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-black/5">
              {activeCodes.map((code) => (
                <li
                  key={code.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold">{code.code}</p>
                    <p className="mt-0.5 text-xs text-black/50">
                      {code.brandFilter === "all" ? "All Stores" : brandLabel(code.brandFilter)}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{formatDiscountValue(code)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 border border-black/10 bg-white">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
            Opted-In Customers
          </p>
          <button
            type="button"
            onClick={copyEmails}
            disabled={optedIn.length === 0}
            className="bg-black px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-stone-800 disabled:opacity-40"
          >
            {copied ? "Copied" : "Copy Emails"}
          </button>
        </div>
        {optedIn.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-black/40">
            No customers have opted in yet.
          </p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs font-medium uppercase tracking-[0.08em] text-black/50">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Store</th>
              </tr>
            </thead>
            <tbody>
              {optedIn.map((customer) => (
                <tr key={customer.id} className="border-b border-black/5 last:border-b-0">
                  <td className="px-5 py-4">
                    <Link
                      href={`/customers/${encodeURIComponent(customer.id)}`}
                      className="font-medium hover:underline"
                    >
                      {customer.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-black/50">{customer.email}</p>
                  </td>
                  <td className="px-5 py-4 text-black/60">
                    {customer.brands.map(brandLabel).join(" + ")}
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
