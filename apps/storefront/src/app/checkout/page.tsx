import type { Metadata } from "next";
import { CheckoutContent } from "@/components/checkout-content";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Checkout — Luxe All Fashion",
};

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <div className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-10">
        <CheckoutContent />
      </div>
    </>
  );
}
