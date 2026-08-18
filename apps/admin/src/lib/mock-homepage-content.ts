// Mirrors the storefront's current hardcoded homepage content
// (apps/storefront/src/app/page.tsx) so the admin editor starts from what's
// actually live. There's no image/video hosting wired up yet, so edits
// here are a local preview only — see the banner on the Homepage page.

export interface HomepageTile {
  id: "og-luxemen" | "chicstyle" | "kiddies-space-gh";
  title: string;
  ctaLabel: string;
  href: string;
  imageSrc: string;
}

export interface HomepageContent {
  heroVideoName: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  tiles: HomepageTile[];
  newsletterHeading: string;
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
};
