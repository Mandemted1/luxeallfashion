import type { Metadata } from "next";
import { FaqAccordion } from "@/components/faq-accordion";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "FAQs | Luxe All Fashion",
};

const faqs = [
  {
    question: "Are your items genuine?",
    answer:
      "Yes. Every piece we sell is sourced and verified as a genuine original from the UK/US high-street label it's listed under before it goes up on the site.",
  },
  {
    question: "Do I need an account to order?",
    answer:
      "No, you can check out as a guest with just your name, phone number, and delivery details. Creating an account just makes it faster next time and lets you see your order history.",
  },
  {
    question: "How do I pay?",
    answer:
      "Payment is made online at checkout through Paystack, using your card or mobile money. We don't see or store your payment details.",
  },
  {
    question: "Is delivery included in the price?",
    answer:
      "No. The price you see at checkout is for the item only. Delivery is arranged separately with a courier, and the fee is paid to them directly.",
  },
  {
    question: "How does delivery work?",
    answer:
      "Once your order is confirmed, we'll reach out (usually on WhatsApp) to help you sort out delivery with a courier of your choice. It generally takes 24 to 48 hours, though the exact timeframe depends on the courier and your location.",
  },
  {
    question: "Can I exchange an item?",
    answer:
      "Yes, within 24 hours of delivery, for a different size or item of equal value, as long as it's unworn with tags still attached. We don't offer cash refunds, if an exchange isn't possible we may offer store credit instead. Message us on WhatsApp or email to start an exchange.",
  },
  {
    question: "Do you deliver across Ghana?",
    answer:
      "Yes, since you arrange delivery directly with a courier, we can get your order to you wherever they're able to deliver.",
  },
  {
    question: "How do I get in touch?",
    answer:
      "The fastest way is WhatsApp, you'll find the link on our Contact page along with our phone number and email.",
  },
];

export default function FaqsPage() {
  return (
    <>
      <SiteHeader />
      <div className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold sm:text-5xl">FAQs</h1>
          <p className="mt-3 max-w-md text-sm text-black/60">
            Answers to what we get asked most. Can&apos;t find what you need?
            Get in touch.
          </p>
          <div className="mt-10">
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </div>
    </>
  );
}
