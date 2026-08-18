// Placeholder catalog data standing in for the real Product/ProductVariant
// tables until the admin CRUD is backed by Prisma. Shape mirrors the schema
// (packages/database) — variants carry their own size/color/sku/quantity/
// price, same as ProductVariant. Several products below reuse one another's
// photos as stand-ins (documented per-product) until real photography
// exists — the storefront's own mock-products.ts does the same thing.

import type { Brand } from "@/lib/brands";

export interface MockProductVariant {
  id: string;
  size: string;
  colorName: string;
  colorHex: string;
  sku: string;
  quantity: number;
  priceGhs: number; // pesewas
}

export interface MockAdminProduct {
  id: string;
  slug: string;
  name: string;
  brand: Brand;
  categoryId: string;
  description: string;
  images: string[];
  isActive: boolean;
  variants: MockProductVariant[];
  createdAt: string;
}

interface ProductColor {
  name: string;
  hex: string;
}

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL"];
const TROUSER_SIZES = ["30", "32", "34", "36", "38"];
const FOOTWEAR_SIZES = ["39", "40", "41", "42", "43", "44"];
const KIDS_SIZES = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"];
const ONE_SIZE = ["One Size"];

const neutralPalette: ProductColor[] = [
  { name: "Cream", hex: "#EDE6DA" },
  { name: "Charcoal", hex: "#4B4B4B" },
  { name: "Black", hex: "#151515" },
  { name: "Tan", hex: "#9C6B45" },
];

const womenswearPalette: ProductColor[] = [
  { name: "Ivory", hex: "#F3EDE4" },
  { name: "Black", hex: "#151515" },
  { name: "Camel", hex: "#B08D57" },
  { name: "Blush", hex: "#D9B8AE" },
  { name: "Olive", hex: "#6B705C" },
];

const kidswearPalette: ProductColor[] = [
  { name: "Denim", hex: "#5B7C99" },
  { name: "Cream", hex: "#F0EAE0" },
  { name: "Red", hex: "#B33A3A" },
  { name: "Yellow", hex: "#E0B23C" },
  { name: "Sage", hex: "#8A9A7E" },
];

// Deterministic (not random) so the same product always shows the same
// stock across reloads within a session — makes screenshots/QA reliable.
function buildVariants(
  skuPrefix: string,
  priceGhs: number,
  sizes: string[],
  colors: ProductColor[],
  stockSeed: number,
): MockProductVariant[] {
  const variants: MockProductVariant[] = [];
  let i = 0;
  for (const size of sizes) {
    for (const color of colors) {
      variants.push({
        id: `${skuPrefix}-${size}-${color.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        size,
        colorName: color.name,
        colorHex: color.hex,
        sku: `${skuPrefix}-${size}-${color.name.slice(0, 3).toUpperCase()}`,
        quantity: (stockSeed + i * 5) % 24,
        priceGhs,
      });
      i++;
    }
  }
  return variants;
}

export const mockProducts: MockAdminProduct[] = [
  {
    id: "og-1",
    slug: "tropical-print-camp-shirt",
    name: "Tropical Print Camp Shirt",
    brand: "og-luxemen",
    categoryId: "cat-1",
    description:
      "A relaxed camp-collar shirt in a tropical print, cut from breathable cotton poplin.",
    images: [
      "/mock/products/tropical-print-camp-shirt.jpg",
      "/mock/products/tropical-print-camp-shirt-2.jpg",
      "/mock/products/tropical-print-camp-shirt-3.jpg",
      "/mock/products/tropical-print-camp-shirt-4.jpg",
    ],
    isActive: true,
    variants: buildVariants(
      "OGL-TPCS",
      160000,
      APPAREL_SIZES,
      [neutralPalette[1], neutralPalette[2], neutralPalette[3]],
      6,
    ),
    createdAt: "2026-01-16",
  },
  {
    id: "og-2",
    slug: "cotton-oxford-shirt",
    name: "Cotton Oxford Shirt",
    brand: "og-luxemen",
    categoryId: "cat-1",
    description: "A tailored Oxford shirt in soft brushed cotton, built for everyday wear.",
    images: [
      "/mock/products/cotton-oxford-shirt-2.jpg",
      "/mock/products/cotton-oxford-shirt-3.jpg",
      "/mock/products/cotton-oxford-shirt-4.jpg",
    ],
    isActive: true,
    variants: buildVariants(
      "OGL-COS",
      140000,
      APPAREL_SIZES,
      [neutralPalette[0], neutralPalette[1], neutralPalette[2]],
      2,
    ),
    createdAt: "2026-01-16",
  },
  {
    id: "og-3",
    slug: "pleated-wide-leg-trousers",
    name: "Pleated Wide-Leg Trousers",
    brand: "og-luxemen",
    categoryId: "cat-2",
    description: "Fluid, pleated-front trousers with a wide leg and a soft drape.",
    images: ["/mock/products/pleated-wide-leg-trousers.jpg"],
    isActive: true,
    variants: buildVariants("OGL-PWLT", 250000, TROUSER_SIZES, neutralPalette, 9),
    createdAt: "2026-01-18",
  },
  {
    id: "og-4",
    slug: "double-breasted-linen-blazer",
    name: "Double-Breasted Linen Blazer",
    brand: "og-luxemen",
    categoryId: "cat-3",
    description: "A structured double-breasted blazer in lightweight linen.",
    images: ["/mock/products/double-breasted-linen-blazer.jpg"],
    isActive: true,
    variants: buildVariants("OGL-DBLB", 450000, APPAREL_SIZES, neutralPalette, 3),
    createdAt: "2026-01-18",
  },
  {
    id: "og-5",
    slug: "suede-woven-loafers",
    name: "Suede Woven Loafers",
    brand: "og-luxemen",
    categoryId: "cat-4",
    description: "Hand-woven suede loafers with a comfortable, flexible sole.",
    images: ["/mock/products/suede-woven-loafers.jpg"],
    isActive: true,
    variants: buildVariants("OGL-SWL", 250000, FOOTWEAR_SIZES, neutralPalette, 4),
    createdAt: "2026-01-20",
  },
  {
    id: "og-6",
    slug: "leather-woven-belt",
    name: "Leather Woven Belt",
    brand: "og-luxemen",
    categoryId: "cat-5",
    description: "A hand-woven leather belt with a matte metal buckle.",
    images: ["/mock/products/leather-woven-belt.jpg"],
    isActive: false,
    variants: buildVariants(
      "OGL-LWB",
      90000,
      ONE_SIZE,
      [neutralPalette[2], neutralPalette[3]],
      0,
    ),
    createdAt: "2026-01-22",
  },

  {
    id: "cs-1",
    slug: "satin-slip-midi-dress",
    name: "Satin Slip Midi Dress",
    brand: "chicstyle",
    categoryId: "cat-6",
    description: "A bias-cut satin slip dress that falls to the midi length.",
    images: ["/mock/products/floral-print-cotton-dress-2.jpg"],
    isActive: true,
    variants: buildVariants(
      "CS-SSMD",
      320000,
      APPAREL_SIZES,
      [womenswearPalette[0], womenswearPalette[1], womenswearPalette[3]],
      5,
    ),
    createdAt: "2026-01-16",
  },
  {
    id: "cs-2",
    slug: "tailored-wide-leg-trousers",
    name: "Tailored Wide-Leg Trousers",
    brand: "chicstyle",
    categoryId: "cat-8",
    description: "High-waisted, wide-leg tailored trousers in a fluid crepe.",
    images: ["/mock/products/pleated-wide-leg-trousers.jpg"],
    isActive: true,
    variants: buildVariants("CS-TWLT", 220000, TROUSER_SIZES, womenswearPalette, 7),
    createdAt: "2026-01-17",
  },
  {
    id: "cs-3",
    slug: "silk-wrap-blouse",
    name: "Silk Wrap Blouse",
    brand: "chicstyle",
    categoryId: "cat-7",
    description: "A silk blouse with a soft wrap front and tie waist.",
    images: ["/mock/products/cotton-oxford-shirt-2.jpg"],
    isActive: true,
    variants: buildVariants("CS-SWB", 190000, APPAREL_SIZES, womenswearPalette, 1),
    createdAt: "2026-01-17",
  },
  {
    id: "cs-4",
    slug: "leather-shoulder-bag",
    name: "Leather Shoulder Bag",
    brand: "chicstyle",
    categoryId: "cat-9",
    description: "A structured leather shoulder bag with a detachable strap.",
    images: ["/mock/products/rectangular-dial-leather-watch.jpg"],
    isActive: true,
    variants: buildVariants(
      "CS-LSB",
      340000,
      ONE_SIZE,
      [womenswearPalette[1], womenswearPalette[2]],
      12,
    ),
    createdAt: "2026-01-19",
  },
  {
    id: "cs-5",
    slug: "pointed-toe-stiletto-heels",
    name: "Pointed Toe Stiletto Heels",
    brand: "chicstyle",
    categoryId: "cat-13",
    description: "Sleek pointed-toe heels on a slim stiletto heel.",
    images: ["/mock/products/printed-leather-penny-loafers.jpg"],
    isActive: true,
    variants: buildVariants(
      "CS-PTSH",
      260000,
      FOOTWEAR_SIZES,
      [womenswearPalette[1], womenswearPalette[2]],
      0,
    ),
    createdAt: "2026-01-20",
  },
  {
    id: "cs-6",
    slug: "cropped-wool-blazer",
    name: "Cropped Wool Blazer",
    brand: "chicstyle",
    categoryId: "cat-14",
    description: "A cropped, single-button blazer in soft wool.",
    images: ["/mock/products/double-breasted-linen-blazer.jpg"],
    isActive: true,
    variants: buildVariants(
      "CS-CWB",
      380000,
      APPAREL_SIZES,
      [womenswearPalette[1], womenswearPalette[2], womenswearPalette[4]],
      8,
    ),
    createdAt: "2026-01-21",
  },

  {
    id: "ks-1",
    slug: "floral-print-cotton-dress",
    name: "Floral Print Cotton Dress",
    brand: "kiddies-space-gh",
    categoryId: "cat-11",
    description: "A lightweight cotton dress in a floral print, with a soft elastic waist.",
    images: [
      "/mock/products/floral-print-cotton-dress-2.jpg",
      "/mock/products/floral-print-cotton-dress-3.jpg",
      "/mock/products/floral-print-cotton-dress-4.jpg",
    ],
    isActive: true,
    variants: buildVariants(
      "KS-FPCD",
      85000,
      KIDS_SIZES,
      [kidswearPalette[1], kidswearPalette[4]],
      10,
    ),
    createdAt: "2026-01-18",
  },
  {
    id: "ks-2",
    slug: "denim-dungaree-overalls",
    name: "Denim Dungaree Overalls",
    brand: "kiddies-space-gh",
    categoryId: "cat-10",
    description: "Classic denim dungarees with adjustable straps and a front pocket.",
    images: ["/mock/products/tropical-print-camp-shirt.jpg"],
    isActive: true,
    variants: buildVariants(
      "KS-DDO",
      90000,
      KIDS_SIZES,
      [kidswearPalette[0], kidswearPalette[1]],
      3,
    ),
    createdAt: "2026-01-18",
  },
  {
    id: "ks-3",
    slug: "fleece-two-piece-tracksuit",
    name: "Fleece Two-Piece Tracksuit",
    brand: "kiddies-space-gh",
    categoryId: "cat-10",
    description: "A cosy fleece tracksuit set with an elastic waistband.",
    images: ["/mock/products/cable-knit-crewneck-sweater.jpg"],
    isActive: true,
    variants: buildVariants(
      "KS-FTPT",
      110000,
      KIDS_SIZES,
      [kidswearPalette[0], kidswearPalette[4], kidswearPalette[1]],
      15,
    ),
    createdAt: "2026-01-19",
  },
  {
    id: "ks-4",
    slug: "canvas-high-top-sneakers",
    name: "Canvas High-Top Sneakers",
    brand: "kiddies-space-gh",
    categoryId: "cat-12",
    description: "Durable canvas high-tops with a rubber sole, built for the playground.",
    images: ["/mock/products/printed-leather-penny-loafers.jpg"],
    isActive: true,
    variants: buildVariants(
      "KS-CHTS",
      70000,
      ["28", "29", "30", "31", "32", "33"],
      [kidswearPalette[2], kidswearPalette[1], kidswearPalette[0]],
      1,
    ),
    createdAt: "2026-01-20",
  },
  {
    id: "ks-5",
    slug: "striped-cotton-rompers",
    name: "Striped Cotton Rompers",
    brand: "kiddies-space-gh",
    categoryId: "cat-11",
    description: "Soft striped cotton rompers with snap-button closures.",
    images: ["/mock/products/cotton-oxford-shirt-2.jpg"],
    isActive: true,
    variants: buildVariants(
      "KS-SCR",
      65000,
      KIDS_SIZES.slice(0, 3),
      [kidswearPalette[1], kidswearPalette[2], kidswearPalette[3]],
      4,
    ),
    createdAt: "2026-01-21",
  },
  {
    id: "ks-6",
    slug: "denim-trucker-jacket",
    name: "Denim Trucker Jacket",
    brand: "kiddies-space-gh",
    categoryId: "cat-10",
    description: "A classic denim trucker jacket with button-flap chest pockets.",
    images: ["/mock/products/double-breasted-linen-blazer.jpg"],
    isActive: false,
    variants: buildVariants("KS-DTJ", 100000, KIDS_SIZES, [kidswearPalette[0]], 0),
    createdAt: "2026-01-22",
  },
];

export function findProduct(slug: string): MockAdminProduct | undefined {
  return mockProducts.find((product) => product.slug === slug);
}

export function productStockTotal(product: MockAdminProduct): number {
  return product.variants.reduce((sum, variant) => sum + variant.quantity, 0);
}

export function productPriceRangeGhs(product: MockAdminProduct): {
  min: number;
  max: number;
} {
  const prices = product.variants.map((variant) => variant.priceGhs);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function categoryProductCounts(
  products: MockAdminProduct[] = mockProducts,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const product of products) {
    counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
  }
  return counts;
}
