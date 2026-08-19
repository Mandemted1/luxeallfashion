import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL } from "@/lib/contact-info";

export const metadata: Metadata = {
  title: "Privacy Policy | Luxe All Fashion",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="August 2026"
      intro="This explains what information we collect when you shop with us, and how it's used."
      sections={[
        {
          heading: "Information We Collect",
          body: [
            "When you place an order or create an account, we collect your name, email address, phone number, and delivery details. We don't collect or store your card details, those go directly to Paystack.",
          ],
        },
        {
          heading: "How We Use It",
          body: [
            "We use your information to process orders, contact you about deliveries, and provide support. If you've opted in to marketing, we may also use your email or WhatsApp to let you know about new arrivals or promotions, you can opt out at any time.",
          ],
        },
        {
          heading: "Who We Share It With",
          body: [
            "Paystack processes our payments and handles your payment details directly. Our email service provider sends order and account emails on our behalf. If you arrange delivery through a courier, you'll share your delivery details with them directly.",
            "We don't sell your information to anyone.",
          ],
        },
        {
          heading: "Data Storage & Security",
          body: [
            "Your information is stored on secure servers with industry-standard protections. Access is limited to what's needed to run the store and fulfil your orders.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "We use cookies to keep your shopping bag and sign-in session working as you browse. We don't use cookies to track you across other websites.",
          ],
        },
        {
          heading: "Your Rights",
          body: [
            `Under Ghana's Data Protection Act, 2012 (Act 843), you can ask us what information we hold about you, ask us to correct it, or ask us to delete it. Email ${CONTACT_EMAIL} to make a request.`,
          ],
        },
        {
          heading: "Children's Privacy",
          body: [
            "Kiddies Space GH sells children's clothing, but our site itself is intended for use by parents and guardians, not by children directly.",
          ],
        },
        {
          heading: "Changes to This Policy",
          body: [
            "We may update this policy from time to time. Significant changes will be reflected here with an updated date at the top of the page.",
          ],
        },
        {
          heading: "Contact",
          body: [`Questions about this policy? Reach us at ${CONTACT_EMAIL}.`],
        },
      ]}
    />
  );
}
