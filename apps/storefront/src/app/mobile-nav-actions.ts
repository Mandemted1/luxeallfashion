"use server";

import type { Brand as PrismaBrand } from "@luxe/database";
import { getCategoriesByBrand, type StorefrontCategory } from "@/lib/catalog";

export async function getMobileNavCategories(): Promise<
  Record<PrismaBrand, StorefrontCategory[]>
> {
  const [ogLuxemen, chicstyle, kiddiesSpaceGh] = await Promise.all([
    getCategoriesByBrand("OG_LUXEMEN"),
    getCategoriesByBrand("CHICSTYLE"),
    getCategoriesByBrand("KIDDIES_SPACE_GH"),
  ]);
  return {
    OG_LUXEMEN: ogLuxemen,
    CHICSTYLE: chicstyle,
    KIDDIES_SPACE_GH: kiddiesSpaceGh,
  };
}
