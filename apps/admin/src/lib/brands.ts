import type { Brand as PrismaBrand } from "@luxe/database";

export type BrandFilter = "all" | "og-luxemen" | "chicstyle" | "kiddies-space-gh";
export type Brand = Exclude<BrandFilter, "all">;

export const brandFilters: { value: BrandFilter; label: string }[] = [
  { value: "all", label: "All Stores" },
  { value: "og-luxemen", label: "OG Luxemen" },
  { value: "chicstyle", label: "Chicstyle" },
  { value: "kiddies-space-gh", label: "Kiddies Space GH" },
];

export function brandLabel(brand: Brand): string {
  return brandFilters.find((b) => b.value === brand)!.label;
}

// The rest of the admin UI (nav, tabs, dashboard filters) is all built
// around this lowercase-hyphenated Brand type — Prisma's Brand enum uses
// SCREAMING_SNAKE_CASE instead, so anything reading/writing the real
// database converts at that boundary rather than rippling the enum
// shape through every component.
const TO_PRISMA_BRAND: Record<Brand, PrismaBrand> = {
  "og-luxemen": "OG_LUXEMEN",
  chicstyle: "CHICSTYLE",
  "kiddies-space-gh": "KIDDIES_SPACE_GH",
};

const FROM_PRISMA_BRAND: Record<PrismaBrand, Brand> = {
  OG_LUXEMEN: "og-luxemen",
  CHICSTYLE: "chicstyle",
  KIDDIES_SPACE_GH: "kiddies-space-gh",
};

export function toPrismaBrand(brand: Brand): PrismaBrand {
  return TO_PRISMA_BRAND[brand];
}

export function fromPrismaBrand(brand: PrismaBrand): Brand {
  return FROM_PRISMA_BRAND[brand];
}
