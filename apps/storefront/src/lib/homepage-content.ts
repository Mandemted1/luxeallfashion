import { prisma, type Brand as PrismaBrand } from "@luxe/database";

export interface HeroContent {
  heroVideoUrl: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  newsletterHeading: string;
}

export interface StorefrontTile {
  title: string;
  ctaLabel: string;
  href: string;
  imageUrl: string;
}

export async function getHeroContent(): Promise<HeroContent> {
  const content = await prisma.homepageContent.findUniqueOrThrow({
    where: { id: "singleton" },
  });
  return {
    heroVideoUrl: content.heroVideoUrl,
    heroCtaLabel: content.heroCtaLabel,
    heroCtaHref: content.heroCtaHref,
    newsletterHeading: content.newsletterHeading,
  };
}

export async function getHomepageTiles(): Promise<Record<PrismaBrand, StorefrontTile>> {
  const tiles = await prisma.homepageTile.findMany();
  const byBrand = Object.fromEntries(
    tiles.map((tile) => [
      tile.brand,
      { title: tile.title, ctaLabel: tile.ctaLabel, href: tile.href, imageUrl: tile.imageUrl },
    ]),
  ) as Record<PrismaBrand, StorefrontTile>;
  return byBrand;
}

export async function getActivePromoBanner(brand: PrismaBrand): Promise<string | null> {
  const banner = await prisma.promoBanner.findUnique({ where: { brand } });
  return banner?.isActive ? banner.message : null;
}

export async function getEnabledSocialLinks() {
  return prisma.socialLink.findMany({
    where: { isEnabled: true },
    orderBy: { createdAt: "asc" },
  });
}
