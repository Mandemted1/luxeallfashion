"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { BackButton } from "@/components/back-button";
import { ChevronDownIcon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { formatGhs } from "@/lib/currency";
import { mockDeliveryRegions } from "@/lib/mock-delivery-regions";

const labelClass =
  "text-xs font-medium uppercase tracking-[0.1em] text-black/50";
const inputClass =
  "mt-1.5 w-full border border-black/20 bg-white px-4 py-3 text-sm focus:border-black focus:outline-none";
const errorClass = "mt-1 text-xs text-red-600";

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  region?: string;
  address?: string;
}

export function CheckoutContent() {
  const { items, subtotalGhs } = useCart();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regionSlug, setRegionSlug] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const selectedRegion = mockDeliveryRegions.find(
    (region) => region.slug === regionSlug,
  );
  const shippingGhs = selectedRegion?.priceGhs ?? 0;
  const totalGhs = subtotalGhs + shippingGhs;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!phone.trim()) nextErrors.phone = "Phone number is required.";
    if (!regionSlug) nextErrors.region = "Please select a delivery region.";
    if (!address.trim()) nextErrors.address = "Delivery address is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Payment integration pending</h1>
        <p className="max-w-md text-sm text-black/60">
          Your order details are ready. This is where Paystack checkout
          takes over once it&apos;s connected. Nothing has been charged.
        </p>
        <Link
          href="/new-in"
          className="mt-4 text-sm font-medium uppercase tracking-[0.1em] underline underline-offset-4"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <BackButton label="Continue Shopping" />
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-lg text-black/40">Your bag is empty.</p>
          <Link
            href="/new-in"
            className="text-sm font-medium uppercase tracking-[0.1em] underline underline-offset-4"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackButton label="Back to Bag" />
      <h1 className="text-4xl font-semibold sm:text-5xl">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3"
      >
        <div className="flex flex-col gap-10 lg:col-span-2">
          <section>
            <h2 className={labelClass}>Contact</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="checkout-full-name" className={labelClass}>
                  Full name
                </label>
                <input
                  id="checkout-full-name"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className={inputClass}
                />
                {errors.fullName && (
                  <p className={errorClass}>{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="checkout-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="checkout-phone" className={labelClass}>
                  Phone
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClass}
                />
                {errors.phone && <p className={errorClass}>{errors.phone}</p>}
              </div>
            </div>
          </section>

          <section>
            <h2 className={labelClass}>Delivery</h2>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label htmlFor="checkout-region" className={labelClass}>
                  Region
                </label>
                <div className="relative">
                  <select
                    id="checkout-region"
                    value={regionSlug}
                    onChange={(event) => setRegionSlug(event.target.value)}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">Select your region</option>
                    {mockDeliveryRegions.map((region) => (
                      <option key={region.slug} value={region.slug}>
                        {region.name} ({formatGhs(region.priceGhs)})
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                </div>
                {errors.region && <p className={errorClass}>{errors.region}</p>}
              </div>

              <div>
                <label htmlFor="checkout-address" className={labelClass}>
                  Delivery address
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Street, landmark, house number"
                  className={inputClass}
                />
                {errors.address && (
                  <p className={errorClass}>{errors.address}</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="border border-black/10 p-6">
            <h2 className={labelClass}>Order Summary</h2>

            <ul className="mt-4 flex flex-col divide-y divide-black/10">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-3 first:pt-0">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-stone-200">
                    <Image
                      src={item.imageSrc}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                      sizes="60px"
                    />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-0.5 text-black/50">
                      Size {item.size}
                      {item.colorName ? ` · ${item.colorName}` : ""} · Qty{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold">
                    {formatGhs(item.priceGhs * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-black/60">Subtotal</span>
                <span>{formatGhs(subtotalGhs)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60">Shipping</span>
                <span>{selectedRegion ? formatGhs(shippingGhs) : "–"}</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatGhs(totalGhs)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full bg-black py-4 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800"
            >
              Pay with Paystack
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
