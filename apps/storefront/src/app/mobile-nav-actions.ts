"use server";

import type { Brand as PrismaBrand } from "@luxe/database";
import { getCategoriesByBrand, type StorefrontCategory } from "@/lib/catalog";

// A section of the mobile nav's category list. `heading` is set when its
// categories are children of a real parent category (e.g. "Boys"/"Girls"
// under Kiddies Space GH) — that parent has no products of its own, it's
// purely an organizing bucket, so it renders as a label, not a link.
// `heading: null` covers brands with no such nesting (OG Luxemen,
// Chicstyle): their categories render as one flat, unlabeled list, same
// as before this grouping existed.
export interface MobileNavSection {
  heading: string | null;
  categories: StorefrontCategory[];
}

export type MobileNavCategoriesByBrand = Record<PrismaBrand, MobileNavSection[]>;

// getCategoriesByBrand returns every category flat (parents and children
// together, sorted by name) — fine for the catalog page's filter list,
// but the mobile menu needs children grouped under their parent instead
// of interleaved alphabetically with everything else. This only affects
// what the mobile menu renders; getCategoriesByBrand itself, and every
// other place that calls it, is untouched.
function groupIntoSections(categories: StorefrontCategory[]): MobileNavSection[] {
  const topLevel = categories.filter((category) => category.parentId === null);
  const sections: MobileNavSection[] = [];
  const standalone: StorefrontCategory[] = [];

  for (const parent of topLevel) {
    const children = categories.filter((category) => category.parentId === parent.id);
    if (children.length > 0) {
      sections.push({ heading: parent.name, categories: children });
    } else {
      standalone.push(parent);
    }
  }

  if (standalone.length > 0) {
    sections.unshift({ heading: null, categories: standalone });
  }

  return sections;
}

export async function getMobileNavCategories(): Promise<MobileNavCategoriesByBrand> {
  const [ogLuxemen, chicstyle, kiddiesSpaceGh] = await Promise.all([
    getCategoriesByBrand("OG_LUXEMEN"),
    getCategoriesByBrand("CHICSTYLE"),
    getCategoriesByBrand("KIDDIES_SPACE_GH"),
  ]);
  return {
    OG_LUXEMEN: groupIntoSections(ogLuxemen),
    CHICSTYLE: groupIntoSections(chicstyle),
    KIDDIES_SPACE_GH: groupIntoSections(kiddiesSpaceGh),
  };
}
