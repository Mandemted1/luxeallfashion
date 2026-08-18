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
  // Illustrative only — there's no Products table wired up yet, so this
  // isn't derived from anything real.
  productCount: number;
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
  { id: "cat-1", brand: "og-luxemen", name: "Shirts", slug: "shirts", productCount: 18, createdAt: "2026-01-14" },
  { id: "cat-2", brand: "og-luxemen", name: "Trousers", slug: "trousers", productCount: 12, createdAt: "2026-01-14" },
  { id: "cat-3", brand: "og-luxemen", name: "Outerwear", slug: "outerwear", productCount: 9, createdAt: "2026-01-14" },
  { id: "cat-4", brand: "og-luxemen", name: "Footwear", slug: "footwear", productCount: 14, createdAt: "2026-01-14" },
  { id: "cat-5", brand: "og-luxemen", name: "Accessories", slug: "accessories", productCount: 7, createdAt: "2026-01-20" },

  { id: "cat-6", brand: "chicstyle", name: "Dresses", slug: "dresses", productCount: 21, createdAt: "2026-01-14" },
  { id: "cat-7", brand: "chicstyle", name: "Tops", slug: "tops", productCount: 16, createdAt: "2026-01-14" },
  { id: "cat-8", brand: "chicstyle", name: "Bottoms", slug: "bottoms", productCount: 11, createdAt: "2026-01-14" },
  { id: "cat-9", brand: "chicstyle", name: "Bags & Accessories", slug: "bags-accessories", productCount: 8, createdAt: "2026-01-20" },

  { id: "cat-10", brand: "kiddies-space-gh", name: "Boys", slug: "boys", productCount: 13, createdAt: "2026-01-14" },
  { id: "cat-11", brand: "kiddies-space-gh", name: "Girls", slug: "girls", productCount: 15, createdAt: "2026-01-14" },
  { id: "cat-12", brand: "kiddies-space-gh", name: "Footwear", slug: "footwear", productCount: 6, createdAt: "2026-01-20" },
];
