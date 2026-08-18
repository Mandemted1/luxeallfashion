"use client";

import Image from "next/image";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { CloseIcon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { formatGhs } from "@/lib/currency";

export function BagContent() {
  const { items, subtotalGhs, removeItem, setQuantity } = useCart();

  return (
    <div>
      <BackButton label="Continue Shopping" />

      <h1 className="text-4xl font-semibold sm:text-5xl">Shopping bag</h1>
      <p className="mt-3 max-w-2xl text-black/70">
        Sign in to keep your items saved, unlock tailored recommendations,
        and enjoy a faster, frictionfree visit every time.
      </p>

      <div className="mt-8 border-t border-black/10" />

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-lg text-black/40">Your bag is empty.</p>
          <Link
            href="/new-in"
            className="text-sm font-medium uppercase tracking-[0.1em] underline underline-offset-4"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 py-10 lg:grid-cols-3">
          <ul className="flex flex-col divide-y divide-black/10 lg:col-span-2">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 py-6 first:pt-0">
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-28 w-24 shrink-0 overflow-hidden bg-stone-200 sm:h-32 sm:w-28"
                >
                  <Image
                    src={item.imageSrc}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                    sizes="120px"
                  />
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-medium hover:opacity-70"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name} from bag`}
                      className="shrink-0 text-black/50 transition-colors hover:text-black"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="mt-1 text-xs uppercase tracking-[0.08em] text-black/50">
                    Size {item.size}
                    {item.colorName ? ` · ${item.colorName}` : ""}
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {formatGhs(item.priceGhs)}
                  </p>

                  <div className="mt-auto flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-7 w-7 items-center justify-center border border-black/20 text-sm transition-colors hover:border-black"
                    >
                      −
                    </button>
                    <span className="w-4 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="flex h-7 w-7 items-center justify-center border border-black/20 text-sm transition-colors hover:border-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="lg:col-span-1">
            <div className="border-t border-black/10 pt-6 lg:border-t-0 lg:pt-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-black/60">Subtotal</span>
                <span className="font-semibold">{formatGhs(subtotalGhs)}</span>
              </div>
              <p className="mt-2 text-xs text-black/50">
                Shipping and delivery pricing calculated at checkout.
              </p>
              <Link
                href="/checkout"
                className="mt-6 block bg-black py-4 text-center text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
