import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CONTACT_WHATSAPP_LOCAL,
} from "@/lib/contact-info";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Us — Luxe All Fashion",
};

const labelClass =
  "text-xs font-medium uppercase tracking-[0.1em] text-black/50";

export default function ContactPage() {
  const whatsappLink = buildWhatsAppLink(
    CONTACT_WHATSAPP_LOCAL,
    "Hi Luxe All Fashion, I'd like to get in touch.",
  );

  return (
    <>
      <SiteHeader />
      <div className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-10">
        <h1 className="text-4xl font-semibold sm:text-5xl">Contact Us</h1>
        <p className="mt-3 max-w-md text-sm text-black/60">
          Reach out with a question about an order, a product, or anything
          else — we&apos;re happy to help.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <h2 className={labelClass}>Get In Touch</h2>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 border border-black/15 px-5 py-4 transition-colors hover:border-black"
            >
              <WhatsAppIcon className="h-6 w-6 shrink-0" />
              <div>
                <p className="text-sm font-medium">Chat on WhatsApp</p>
                <p className="text-xs text-black/50">{CONTACT_PHONE_DISPLAY}</p>
              </div>
            </a>

            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              className="flex items-center gap-4 border border-black/15 px-5 py-4 transition-colors hover:border-black"
            >
              <PhoneIcon className="h-6 w-6 shrink-0" />
              <div>
                <p className="text-sm font-medium">Call Us</p>
                <p className="text-xs text-black/50">{CONTACT_PHONE_DISPLAY}</p>
              </div>
            </a>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-4 border border-black/15 px-5 py-4 transition-colors hover:border-black"
            >
              <MailIcon className="h-6 w-6 shrink-0" />
              <div>
                <p className="text-sm font-medium">Email Us</p>
                <p className="text-xs text-black/50">{CONTACT_EMAIL}</p>
              </div>
            </a>
          </div>

          <div>
            <h2 className={labelClass}>Send A Message</h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
