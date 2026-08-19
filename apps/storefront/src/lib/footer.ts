export const footerColumns = [
  {
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  {
    links: [
      { label: "Terms & conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
  {
    // Once there's a real backend, this should read from the admin's
    // Social Media settings (apps/admin, Homepage editor) instead of being
    // hardcoded here. For now it just lists what's actually confirmed.
    links: [{ label: "Instagram", href: "https://instagram.com/og_luxemen" }],
  },
] as const;
