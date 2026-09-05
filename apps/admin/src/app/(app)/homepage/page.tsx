import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { HomepageContentEditor } from "@/components/homepage-content-editor";
import { mapHomepageContent } from "@/lib/homepage-content";

export const metadata: Metadata = {
  title: "Homepage | Luxe All Fashion Admin",
};

// Without this, Next.js can serve a cached render of admin-mutated data.
export const dynamic = "force-dynamic";

export default async function HomepagePage() {
  const [content, tiles, promoBanners, socialLinks] = await Promise.all([
    prisma.homepageContent.findUniqueOrThrow({ where: { id: "singleton" } }),
    prisma.homepageTile.findMany(),
    prisma.promoBanner.findMany(),
    prisma.socialLink.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <HomepageContentEditor
      content={mapHomepageContent(content, tiles, promoBanners, socialLinks)}
    />
  );
}
