"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@luxe/database";
import { toPrismaBrand, type Brand } from "@/lib/brands";
import type { SocialPlatform } from "@/lib/homepage-content";

interface HomepageContentPatch {
  heroVideoUrl?: string;
  heroCtaLabel?: string;
  heroCtaHref?: string;
  newsletterHeading?: string;
}

export async function updateHomepageContent(patch: HomepageContentPatch): Promise<void> {
  await prisma.homepageContent.update({ where: { id: "singleton" }, data: patch });
  revalidatePath("/homepage");
}

interface TilePatch {
  title?: string;
  ctaLabel?: string;
  href?: string;
  imageUrl?: string;
}

export async function updateHomepageTile(brand: Brand, patch: TilePatch): Promise<void> {
  await prisma.homepageTile.update({ where: { brand: toPrismaBrand(brand) }, data: patch });
  revalidatePath("/homepage");
}

interface PromoBannerPatch {
  message?: string;
  isActive?: boolean;
}

export async function updatePromoBanner(brand: Brand, patch: PromoBannerPatch): Promise<void> {
  await prisma.promoBanner.update({ where: { brand: toPrismaBrand(brand) }, data: patch });
  revalidatePath("/homepage");
}

export async function addSocialLink(platform: SocialPlatform, url: string): Promise<void> {
  await prisma.socialLink.create({ data: { platform, url, isEnabled: true } });
  revalidatePath("/homepage");
}

export async function toggleSocialLink(id: string): Promise<void> {
  const link = await prisma.socialLink.findUniqueOrThrow({ where: { id } });
  await prisma.socialLink.update({ where: { id }, data: { isEnabled: !link.isEnabled } });
  revalidatePath("/homepage");
}

export async function removeSocialLink(id: string): Promise<void> {
  await prisma.socialLink.delete({ where: { id } });
  revalidatePath("/homepage");
}
