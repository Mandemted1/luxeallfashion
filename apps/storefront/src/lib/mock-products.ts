// Placeholder catalog data for building page layouts before the admin
// dashboard and real product uploads exist. Field names/shape mirror the
// Prisma schema (packages/database) so swapping this for a real query later
// is a drop-in change, not a rewrite.

export interface MockProductColor {
  name: string;
  hex: string;
}

export interface MockProduct {
  id: string;
  slug: string;
  name: string;
  priceGhs: number; // pesewas
  imageSrc?: string;
  colors?: MockProductColor[];
}

const neutralPalette: MockProductColor[] = [
  { name: "Cream", hex: "#EDE6DA" },
  { name: "Charcoal", hex: "#4B4B4B" },
  { name: "Black", hex: "#151515" },
  { name: "Tan", hex: "#9C6B45" },
  { name: "Stone", hex: "#A8A29A" },
];

export const mockNewInProducts: MockProduct[] = [
  {
    id: "1",
    slug: "suede-woven-loafers",
    name: "Suede Woven Loafers",
    priceGhs: 250000,
    colors: neutralPalette,
  },
  {
    id: "2",
    slug: "tropical-print-camp-shirt",
    name: "Tropical Print Camp Shirt",
    priceGhs: 160000,
    colors: [neutralPalette[1], neutralPalette[2], neutralPalette[3]],
  },
  {
    id: "3",
    slug: "cable-knit-crewneck-sweater",
    name: "Cable Knit Crewneck Sweater",
    priceGhs: 320000,
  },
  {
    id: "4",
    slug: "pleated-wide-leg-trousers",
    name: "Pleated Wide-Leg Trousers",
    priceGhs: 250000,
    colors: neutralPalette,
  },
  {
    id: "5",
    slug: "printed-leather-penny-loafers",
    name: "Printed Leather Penny Loafers",
    priceGhs: 160000,
    colors: [neutralPalette[1], neutralPalette[2], neutralPalette[3]],
  },
  {
    id: "6",
    slug: "rectangular-dial-leather-watch",
    name: "Rectangular Dial Leather Watch",
    priceGhs: 320000,
  },
  {
    id: "7",
    slug: "leather-woven-belt",
    name: "Leather Woven Belt",
    priceGhs: 90000,
    colors: [neutralPalette[2], neutralPalette[3]],
  },
  {
    id: "8",
    slug: "double-breasted-linen-blazer",
    name: "Double-Breasted Linen Blazer",
    priceGhs: 450000,
    colors: neutralPalette,
  },
  {
    id: "9",
    slug: "acetate-square-sunglasses",
    name: "Acetate Square Sunglasses",
    priceGhs: 120000,
  },
];
