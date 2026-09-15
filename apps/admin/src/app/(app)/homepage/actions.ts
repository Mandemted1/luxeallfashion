"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@luxe/database";
import { toPrismaBrand, type Brand } from "@/lib/brands";
import type { HeroMode, SocialPlatform } from "@/lib/homepage-content";

// Anything a real customer will actually see rendered as text or a link —
// unlike Products/Categories/Discount Codes, nothing here was checked
// before, so a blank field or a garbage href could go live on the
// storefront immediately (this page saves on blur, not on a form submit).
function requireNonEmpty(value: string, label: string): { error?: string } {
  return value.trim() ? {} : { error: `${label} can't be empty.` };
}

// Accepts an internal path ("/new-in") or an absolute URL — covers every
// real use on this page (hero/tile "Links To" fields point at storefront
// routes) without being so strict it rejects a legitimate href.
function requireValidHref(value: string, label: string): { error?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { error: `${label} can't be empty.` };
  if (trimmed.startsWith("/")) return {};
  try {
    new URL(trimmed);
    return {};
  } catch {
    return { error: `${label} must start with "/" or be a full URL (https://...).` };
  }
}

interface HomepageContentPatch {
  heroMode?: HeroMode;
  heroVideoUrl?: string;
  heroCtaLabel?: string;
  heroCtaHref?: string;
  newsletterHeading?: string;
  popupEnabled?: boolean;
  popupHeading?: string;
  popupBody?: string;
}

export async function updateHomepageContent(
  patch: HomepageContentPatch,
): Promise<{ error?: string }> {
  const data: HomepageContentPatch = { ...patch };

  if (patch.heroCtaLabel !== undefined) {
    const check = requireNonEmpty(patch.heroCtaLabel, "Button label");
    if (check.error) return check;
    data.heroCtaLabel = patch.heroCtaLabel.trim();
  }
  if (patch.heroCtaHref !== undefined) {
    const check = requireValidHref(patch.heroCtaHref, "Links To");
    if (check.error) return check;
    data.heroCtaHref = patch.heroCtaHref.trim();
  }
  if (patch.newsletterHeading !== undefined) {
    const check = requireNonEmpty(patch.newsletterHeading, "Newsletter heading");
    if (check.error) return check;
    data.newsletterHeading = patch.newsletterHeading.trim();
  }
  if (patch.popupHeading !== undefined) {
    const check = requireNonEmpty(patch.popupHeading, "Popup heading");
    if (check.error) return check;
    data.popupHeading = patch.popupHeading.trim();
  }
  if (patch.popupBody !== undefined) {
    const check = requireNonEmpty(patch.popupBody, "Popup body");
    if (check.error) return check;
    data.popupBody = patch.popupBody.trim();
  }

  await prisma.homepageContent.update({ where: { id: "singleton" }, data });
  revalidatePath("/homepage");
  return {};
}

interface TilePatch {
  title?: string;
  ctaLabel?: string;
  href?: string;
  imageUrl?: string;
  heroImageUrl?: string;
}

export async function updateHomepageTile(
  brand: Brand,
  patch: TilePatch,
): Promise<{ error?: string }> {
  const data: TilePatch = { ...patch };

  if (patch.title !== undefined) {
    const check = requireNonEmpty(patch.title, "Title");
    if (check.error) return check;
    data.title = patch.title.trim();
  }
  if (patch.ctaLabel !== undefined) {
    const check = requireNonEmpty(patch.ctaLabel, "Button label");
    if (check.error) return check;
    data.ctaLabel = patch.ctaLabel.trim();
  }
  if (patch.href !== undefined) {
    const check = requireValidHref(patch.href, "Links To");
    if (check.error) return check;
    data.href = patch.href.trim();
  }

  await prisma.homepageTile.update({ where: { brand: toPrismaBrand(brand) }, data });
  revalidatePath("/homepage");
  return {};
}

interface PromoBannerPatch {
  message?: string;
  isActive?: boolean;
}

export async function updatePromoBanner(
  brand: Brand,
  patch: PromoBannerPatch,
): Promise<{ error?: string }> {
  const data: PromoBannerPatch = { ...patch };

  // Only blocked while the banner is (or is being) turned on — an empty
  // message on an inactive banner is harmless, nothing renders it. The
  // caller only ever patches one of these two fields at a time, so at
  // most one extra read is needed to know the other's current value.
  if (patch.message !== undefined || patch.isActive === true) {
    const current = await prisma.promoBanner.findUniqueOrThrow({
      where: { brand: toPrismaBrand(brand) },
    });
    const message = patch.message ?? current.message;
    const isActive = patch.isActive ?? current.isActive;
    if (isActive && !message.trim()) {
      return { error: "Add a promo message before turning this banner on." };
    }
  }

  if (patch.message !== undefined) {
    data.message = patch.message.trim();
  }

  await prisma.promoBanner.update({ where: { brand: toPrismaBrand(brand) }, data });
  revalidatePath("/homepage");
  return {};
}

export async function addSocialLink(
  platform: SocialPlatform,
  url: string,
): Promise<{ error?: string }> {
  const trimmed = url.trim();
  if (!trimmed) return { error: "Enter a profile URL." };
  if (!/^https?:\/\//i.test(trimmed)) {
    return { error: "Profile URL must start with http:// or https://." };
  }
  try {
    new URL(trimmed);
  } catch {
    return { error: "That doesn't look like a valid URL." };
  }

  await prisma.socialLink.create({ data: { platform, url: trimmed, isEnabled: true } });
  revalidatePath("/homepage");
  return {};
}

export async function toggleSocialLink(id: string): Promise<{ error?: string }> {
  const link = await prisma.socialLink.findUniqueOrThrow({ where: { id } });
  await prisma.socialLink.update({ where: { id }, data: { isEnabled: !link.isEnabled } });
  revalidatePath("/homepage");
  return {};
}

export async function removeSocialLink(id: string): Promise<{ error?: string }> {
  await prisma.socialLink.delete({ where: { id } });
  revalidatePath("/homepage");
  return {};
}
