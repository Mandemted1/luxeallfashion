import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/contact-info";

// Deployment check 2 — safe to remove.
export const metadata: Metadata = {
  title: "Terms & Conditions | Luxe All Fashion",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="August 2026"
      intro="These terms apply whenever you shop with us across OG Luxemen, Chicstyle, or Kiddies Space GH. By placing an order, you agree to them."
      sections={[
        {
          heading: "Our Products",
          body: [
            "Every item we sell is sourced and verified as genuine from the UK/US high-street labels we list. We check each piece before it's listed, and product photos are as accurate as we can make them, but slight variations in colour or finish can occur between different batches of the same style.",
          ],
        },
        {
          heading: "Orders & Payment",
          body: [
            "Prices are shown in Ghana cedis (GHS) and are fixed at the time you order. Delivery is not included in the item price, see Delivery below.",
            "Payment is made online through Paystack at checkout. We don't see or store your card details, Paystack handles that directly.",
          ],
        },
        {
          heading: "Delivery",
          body: [
            "Once your order is confirmed, you'll arrange delivery directly with a courier, and we'll be in touch (usually via WhatsApp) to help coordinate this. Delivery fees are paid separately and aren't part of the item price you pay at checkout.",
            "Delivery generally takes between 24 and 48 hours from when your order is confirmed, though the exact timeframe depends on the courier you choose and your location, they'll be able to give you a more precise estimate directly.",
          ],
        },
        {
          heading: "Exchanges",
          body: [
            "We accept exchanges within 24 hours of delivery, for a different size or item of equal value. To qualify, the item must be unworn, unwashed, and in its original condition with tags attached.",
            `To start an exchange, message us on WhatsApp or email ${CONTACT_EMAIL} within the 24-hour window with your order number.`,
          ],
        },
        {
          heading: "Refund Policy",
          body: [
            "We don't offer cash refunds on any order. If you're unhappy with an item, an exchange under the policy above is the option we're able to offer.",
            "If an exchange isn't possible, for example the size or item you'd like isn't available, we may offer store credit instead, to use toward a future order.",
          ],
        },
        {
          heading: "Order Cancellations",
          body: [
            "If you need to cancel an order, contact us as soon as possible. We can cancel free of charge before it's been dispatched to a courier; once it's out for delivery, our exchange policy above applies instead.",
          ],
        },
        {
          heading: "Accounts",
          body: [
            "You can check out as a guest or create an account. If you create one, you're responsible for keeping your login details secure and for anything that happens under your account.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "We aren't responsible for delays or issues caused by third parties, such as your chosen courier or payment provider, once your order has left our hands.",
          ],
        },
        {
          heading: "Governing Law",
          body: ["These terms are governed by the laws of Ghana."],
        },
        {
          heading: "Contact",
          body: [`Questions about these terms? Reach us at ${CONTACT_EMAIL} or ${CONTACT_PHONE_DISPLAY}.`],
        },
      ]}
    />
  );
}
