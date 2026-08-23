import type {
  HomepageContent as PrismaHomepageContent,
  HomepageTile as PrismaHomepageTile,
  PromoBanner as PrismaPromoBanner,
  SocialLink as PrismaSocialLink,
} from "@luxe/database";
import { fromPrismaBrand, type Brand } from "@/lib/brands";

export interface HomepageTile {
  brand: Brand;
  title: string;
  ctaLabel: string;
  href: string;
  imageUrl: string;
  heroImageUrl: string;
}

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
  heroVideoUrl: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  newsletterHeading: string;
  tiles: HomepageTile[];
  promoBanners: PromoBannerConfig[];
  socialLinks: SocialLink[];
}

export function mapHomepageContent(
  content: PrismaHomepageContent,
  tiles: PrismaHomepageTile[],
  promoBanners: PrismaPromoBanner[],
  socialLinks: PrismaSocialLink[],
): HomepageContent {
  return {
    heroVideoUrl: content.heroVideoUrl,
    heroCtaLabel: content.heroCtaLabel,
    heroCtaHref: content.heroCtaHref,
    newsletterHeading: content.newsletterHeading,
    tiles: tiles.map((tile) => ({
      brand: fromPrismaBrand(tile.brand),
      title: tile.title,
      ctaLabel: tile.ctaLabel,
      href: tile.href,
      imageUrl: tile.imageUrl,
      heroImageUrl: tile.heroImageUrl,
    })),
    promoBanners: promoBanners.map((banner) => ({
      brand: fromPrismaBrand(banner.brand),
      message: banner.message,
      isActive: banner.isActive,
    })),
    // Platform is admin-entered from a fixed <select> of socialPlatforms,
    // so this narrowing can't actually fail in practice.
    socialLinks: socialLinks.map((link) => ({
      id: link.id,
      platform: link.platform as SocialPlatform,
      url: link.url,
      isEnabled: link.isEnabled,
    })),
  };
}
