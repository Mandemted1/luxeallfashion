// Placeholder catalog data standing in for the real Category table until
// the admin CRUD is backed by Prisma. Shape mirrors the schema
// (packages/database) — brand-scoped, unique slug per brand — so wiring
// this up to a real API later is a drop-in change.

import type { Brand } from "@/lib/brands";

export interface MockCategory {
  id: string;
  brand: Brand;
  name: string;
  slug: string;
  createdAt: string;
}

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const mockCategories: MockCategory[] = [
  { id: "cat-1", brand: "og-luxemen", name: "Shirts", slug: "shirts", createdAt: "2026-01-14" },
  { id: "cat-2", brand: "og-luxemen", name: "Trousers", slug: "trousers", createdAt: "2026-01-14" },
  { id: "cat-3", brand: "og-luxemen", name: "Outerwear", slug: "outerwear", createdAt: "2026-01-14" },
  { id: "cat-4", brand: "og-luxemen", name: "Footwear", slug: "footwear", createdAt: "2026-01-14" },
  { id: "cat-5", brand: "og-luxemen", name: "Accessories", slug: "accessories", createdAt: "2026-01-20" },

  { id: "cat-6", brand: "chicstyle", name: "Dresses", slug: "dresses", createdAt: "2026-01-14" },
  { id: "cat-7", brand: "chicstyle", name: "Tops", slug: "tops", createdAt: "2026-01-14" },
  { id: "cat-8", brand: "chicstyle", name: "Bottoms", slug: "bottoms", createdAt: "2026-01-14" },
  { id: "cat-9", brand: "chicstyle", name: "Bags & Accessories", slug: "bags-accessories", createdAt: "2026-01-20" },
  { id: "cat-13", brand: "chicstyle", name: "Footwear", slug: "footwear", createdAt: "2026-01-20" },
  { id: "cat-14", brand: "chicstyle", name: "Outerwear", slug: "outerwear", createdAt: "2026-01-20" },

  { id: "cat-10", brand: "kiddies-space-gh", name: "Boys", slug: "boys", createdAt: "2026-01-14" },
  { id: "cat-11", brand: "kiddies-space-gh", name: "Girls", slug: "girls", createdAt: "2026-01-14" },
  { id: "cat-12", brand: "kiddies-space-gh", name: "Footwear", slug: "footwear", createdAt: "2026-01-20" },
];
