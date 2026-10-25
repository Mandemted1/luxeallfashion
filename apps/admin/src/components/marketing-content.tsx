"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Megaphone, Percent, Users } from "lucide-react";
import { InsightCard } from "@/components/insight-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brandFilters, brandLabel, type Brand } from "@/lib/brands";
import type { AdminCustomer } from "@/lib/customers";
import { formatDiscountValue, type AdminDiscountCode } from "@/lib/discount-codes";
import type { AdminNewsletterSubscriber } from "@/lib/newsletter";

// There's no email/SMS sending backend yet, so this page stops at giving
// her the audience data and an easy way to copy it out — it doesn't offer
// a "Send Campaign" button that couldn't actually send anything.

const brands: Brand[] = brandFilters
  .map((filter) => filter.value)
  .filter((value): value is Brand => value !== "all");

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function sourceLabel(source: string): string {
  if (source === "popup") return "Signup Popup";
  if (source === "footer") return "Newsletter Section";
  return source;
}

function startOfMonth(): Date {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function MarketingContent({
  customers,
  discountCodes,
  subscribers,
}: {
  customers: AdminCustomer[];
  discountCodes: AdminDiscountCode[];
  subscribers: AdminNewsletterSubscriber[];
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [subscribersCopied, setSubscribersCopied] = useState(false);
  const [subscribersCopyError, setSubscribersCopyError] = useState("");
  const optedIn = customers.filter((c) => c.marketingOptIn);
  const optInRate = customers.length === 0 ? 0 : Math.round((optedIn.length / customers.length) * 100);
  const activeCodes = discountCodes.filter((code) => code.isActive);
  const monthStart = startOfMonth();
  const newSubscribersThisMonth = subscribers.filter((s) => s.createdAt >= monthStart).length;

  async function copyEmails() {
    const emails = optedIn.map((c) => c.email).join(", ");
    try {
      await navigator.clipboard.writeText(emails);
      setCopyError("");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("Couldn't copy. Your browser blocked clipboard access.");
    }
  }

  async function copySubscriberEmails() {
    const emails = subscribers.map((s) => s.email).join(", ");
    try {
      await navigator.clipboard.writeText(emails);
      setSubscribersCopyError("");
      setSubscribersCopied(true);
      setTimeout(() => setSubscribersCopied(false), 2000);
    } catch {
      setSubscribersCopyError("Couldn't copy. Your browser blocked clipboard access.");
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-semibold">Marketing</h1>
        <p className="mt-1 text-sm text-black/50">Newsletter copy and subscriber list.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          label="Total Customers"
          value={String(customers.length)}
          hint="Across all three stores"
          icon={Users}
        />
        <InsightCard
          label="Opted In to Marketing"
          value={String(optedIn.length)}
          hint="Customers you can email"
          icon={Mail}
        />
        <InsightCard
          label="Opt-In Rate"
          value={`${optInRate}%`}
          hint="Share of all customers"
          icon={Percent}
        />
        <InsightCard
          label="Newsletter Signups"
          value={String(subscribers.length)}
          hint={`${newSubscribersThisMonth} new this month`}
          icon={Megaphone}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Opt-In by Store</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
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
                    <Progress value={rate} className="mt-2 h-1" />
                    <p className="mt-1 text-xs text-black/50">{rate}% opted in</p>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Discount Codes</CardTitle>
            <CardAction>
              <Link
                href="/discount-codes"
                className="text-xs font-medium tracking-[0.08em] text-black/50 uppercase hover:text-black"
              >
                Manage
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {activeCodes.length === 0 ? (
              <p className="text-sm text-black/40">No active codes.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-black/5">
                {activeCodes.map((code) => (
                  <li key={code.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
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
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 gap-0 py-0">
        <div className="flex items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
            Opted-In Customers
          </p>
          <div className="flex items-center gap-3">
            {copyError && <p className="text-xs text-red-600">{copyError}</p>}
            <Button type="button" size="sm" onClick={copyEmails} disabled={optedIn.length === 0}>
              {copied ? "Copied" : "Copy Emails"}
            </Button>
          </div>
        </div>
        {optedIn.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-black/40">
            No customers have opted in yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[420px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Customer</TableHead>
                  <TableHead>Store</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {optedIn.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link
                        href={`/customers/${encodeURIComponent(customer.id)}`}
                        className="font-medium hover:underline"
                      >
                        {customer.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-black/50">{customer.email}</p>
                    </TableCell>
                    <TableCell className="text-black/60">
                      {customer.brands.length > 0 ? customer.brands.map(brandLabel).join(" + ") : "–"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="mt-4 gap-0 py-0">
        <div className="flex items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
            Newsletter Signups
          </p>
          <div className="flex items-center gap-3">
            {subscribersCopyError && <p className="text-xs text-red-600">{subscribersCopyError}</p>}
            <Button
              type="button"
              size="sm"
              onClick={copySubscriberEmails}
              disabled={subscribers.length === 0}
            >
              {subscribersCopied ? "Copied" : "Copy Emails"}
            </Button>
          </div>
        </div>
        {subscribers.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-black/40">
            No newsletter signups yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[420px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Signed Up</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-transparent bg-stone-100 text-stone-600">
                        {sourceLabel(subscriber.source)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-black/60">{formatDate(subscriber.createdAt)}</TableCell>
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
