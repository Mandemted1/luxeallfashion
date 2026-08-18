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
    // TODO: swap "#" for the real profile URLs once she sends them —
    // Instagram is the only one confirmed so far (@og_luxemen).
    links: [
      { label: "Instagram", href: "https://instagram.com/og_luxemen" },
      { label: "Tiktok", href: "#" },
      { label: "Snapchat", href: "#" },
      { label: "X", href: "#" },
    ],
  },
] as const;
