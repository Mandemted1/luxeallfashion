// Mirrors the storefront's current hardcoded homepage content
// (apps/storefront/src/app/page.tsx) so the admin editor starts from what's
// actually live. There's no image/video hosting wired up yet, so edits
// here are a local preview only — see the banner on the Homepage page.

import type { Brand } from "@/lib/brands";

export interface HomepageTile {
  id: "og-luxemen" | "chicstyle" | "kiddies-space-gh";
  title: string;
  ctaLabel: string;
  href: string;
  imageSrc: string;
}

// Not shown on the homepage itself — this is the thin promo strip at the
// top of each brand's own storefront page (/og-luxemen, /chicstyle,
// /kiddies-space-gh), one message per store. Managed here anyway since
// it's the same kind of quick, no-code content edit as the rest of this
// page.
export interface PromoBannerConfig {
  brand: Brand;
  message: string;
  isActive: boolean;
}

export const socialPlatforms = [
  "Instagram",
  "Tiktok",
  "Snapchat",
  "X",
  "Facebook",
  "YouTube",
  "Pinterest",
] as const;

export type SocialPlatform = (typeof socialPlatforms)[number];

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  isEnabled: boolean;
}

export interface HomepageContent {
  heroVideoName: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  tiles: HomepageTile[];
  newsletterHeading: string;
  promoBanners: PromoBannerConfig[];
  socialLinks: SocialLink[];
}

export const initialHomepageContent: HomepageContent = {
  heroVideoName: "hero-video.mp4",
  heroCtaLabel: "Shop Now",
  heroCtaHref: "/new-in",
  tiles: [
    {
      id: "og-luxemen",
      title: "OG Luxemen",
      ctaLabel: "Shop Men",
      href: "/og-luxemen",
      imageSrc: "/og-luxemen-tile.jpg",
    },
    {
      id: "chicstyle",
      title: "Chicstyle",
      ctaLabel: "Shop Women",
      href: "/chicstyle",
      imageSrc: "/chicstyle-tile.jpg",
    },
    {
      id: "kiddies-space-gh",
      title: "Kiddies Space GH",
      ctaLabel: "Shop Kids",
      href: "/kiddies-space-gh",
      imageSrc: "/kiddies-space-banner.jpg",
    },
  ],
  newsletterHeading:
    "Be the first to discover the latest collections and exclusive launches.",
  promoBanners: [
    {
      brand: "og-luxemen",
      message: "New Season Arrivals: Free Delivery Over ₵1,000",
      isActive: true,
    },
    {
      brand: "chicstyle",
      message: "20% Off Dresses With Code CHIC20",
      isActive: true,
    },
    {
      brand: "kiddies-space-gh",
      message: "Back To School: 15% Off With Code KIDS15",
      isActive: false,
    },
  ],
  socialLinks: [
    {
      id: "social-1",
      platform: "Instagram",
      url: "https://instagram.com/og_luxemen",
      isEnabled: true,
    },
  ],
};
