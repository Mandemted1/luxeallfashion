"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  createOrderAndInitiatePayment,
  previewDiscountCode,
} from "@/app/checkout/actions";
import { BackButton } from "@/components/back-button";
import { ChevronDownIcon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { formatGhs } from "@/lib/currency";
import {
  loadGuestCheckoutDetails,
  saveGuestCheckoutDetails,
} from "@/lib/guest-checkout-details";

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

interface InitialCheckoutDetails {
  fullName: string;
  email: string;
  phone: string;
  deliveryRegionId: string;
  address: string;
}

export function CheckoutContent({
  regions,
  initialDetails,
  isLoggedIn,
}: {
  regions: { id: string; name: string }[];
  initialDetails: InitialCheckoutDetails | null;
  isLoggedIn: boolean;
}) {
  const { items, subtotalGhs } = useCart();
  const [fullName, setFullName] = useState(initialDetails?.fullName ?? "");
  const [email, setEmail] = useState(initialDetails?.email ?? "");
  const [phone, setPhone] = useState(initialDetails?.phone ?? "");
  const [deliveryRegionId, setDeliveryRegionId] = useState(
    initialDetails?.deliveryRegionId ?? "",
  );
  const [address, setAddress] = useState(initialDetails?.address ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Logged-in customers are prefilled server-side (initialDetails, above) —
  // this is only for guests, prefilling from whatever they last checked out
  // with on this browser. Deliberately an effect, not useState's
  // initializer: the server (and first client render, for hydration) must
  // see blank fields, since localStorage doesn't exist there. This is a
  // one-time sync from a browser-only external system, not state derived
  // from props — the case the set-state-in-effect rule itself carves out.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (isLoggedIn) return;
    const saved = loadGuestCheckoutDetails();
    if (!saved) return;

    setFullName(saved.fullName);
    setEmail(saved.email);
    setPhone(saved.phone);
    setAddress(saved.address);
    if (regions.some((region) => region.id === saved.deliveryRegionId)) {
      setDeliveryRegionId(saved.deliveryRegionId);
    }
  }, []); // Only ever runs once, right after mount.
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountGhs: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  async function handleApplyDiscount() {
    if (!discountInput.trim()) return;
    setApplyingDiscount(true);
    setDiscountError("");

    const result = await previewDiscountCode(discountInput, items);

    if (result.error || result.discountGhs === undefined) {
      setDiscountError(result.error ?? "Invalid discount code.");
      setAppliedDiscount(null);
    } else {
      setAppliedDiscount({
        code: discountInput.trim().toUpperCase(),
        discountGhs: result.discountGhs,
      });
    }
    setApplyingDiscount(false);
  }

  function handleRemoveDiscount() {
    setAppliedDiscount(null);
    setDiscountInput("");
    setDiscountError("");
  }

  const discountGhs = appliedDiscount?.discountGhs ?? 0;
  const totalGhs = subtotalGhs - discountGhs;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!phone.trim()) nextErrors.phone = "Phone number is required.";
    if (!deliveryRegionId) nextErrors.region = "Please select a delivery region.";
    if (!address.trim()) nextErrors.address = "Delivery address is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError("");

    const result = await createOrderAndInitiatePayment({
      fullName,
      email,
      phone,
      deliveryRegionId,
      address,
      items,
      discountCode: appliedDiscount?.code,
    });

    if (result.error) {
      setSubmitError(result.error);
      setSubmitting(false);
      return;
    }

    if (!isLoggedIn) {
      saveGuestCheckoutDetails({ fullName, email, phone, deliveryRegionId, address });
    }

    // Full navigation, not client-side routing — Paystack's hosted
    // checkout is a different origin.
    window.location.href = result.authorizationUrl!;
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
            <p className="mt-1 text-xs text-black/40">
              Delivery is arranged directly with a courier after checkout,
              the fee isn&apos;t part of the price you pay here.
            </p>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label htmlFor="checkout-region" className={labelClass}>
                  Region
                </label>
                <div className="relative">
                  <select
                    id="checkout-region"
                    value={deliveryRegionId}
                    onChange={(event) => setDeliveryRegionId(event.target.value)}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">Select your region</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
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

            <div className="mt-4 border-t border-black/10 pt-4">
              {appliedDiscount ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/60">
                    Code <span className="font-medium text-black">{appliedDiscount.code}</span> applied
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveDiscount}
                    className="text-xs underline underline-offset-2 hover:opacity-70"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountInput}
                    onChange={(event) => setDiscountInput(event.target.value)}
                    placeholder="Discount code"
                    className={`${inputClass} mt-0 flex-1`}
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={applyingDiscount || !discountInput.trim()}
                    className="shrink-0 border border-black px-4 text-xs font-medium uppercase tracking-[0.1em] transition-colors hover:bg-black hover:text-white disabled:opacity-50"
                  >
                    {applyingDiscount ? "Checking..." : "Apply"}
                  </button>
                </div>
              )}
              {discountError && <p className={errorClass}>{discountError}</p>}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-black/60">Subtotal</span>
                <span>{formatGhs(subtotalGhs)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between">
                  <span className="text-black/60">Discount</span>
                  <span>-{formatGhs(discountGhs)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-black/60">Shipping</span>
                <span className="text-black/50">Arranged with courier</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatGhs(totalGhs)}</span>
              </div>
            </div>

            {submitError && <p className={errorClass}>{submitError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full bg-black py-4 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
            >
              {submitting ? "Redirecting to Paystack..." : "Pay with Paystack"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
