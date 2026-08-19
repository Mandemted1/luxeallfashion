// Social links used to be hardcoded here — they now come from the real
// SocialLink table (see @/lib/homepage-content, rendered in SiteFooter)
// instead, since the admin's Homepage editor can manage them for real.
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
] as const;
