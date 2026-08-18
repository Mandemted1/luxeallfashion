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
    imageSrc: "/mock/products/suede-woven-loafers.jpg",
    colors: neutralPalette,
  },
  {
    id: "2",
    slug: "tropical-print-camp-shirt",
    name: "Tropical Print Camp Shirt",
    priceGhs: 160000,
    imageSrc: "/mock/products/tropical-print-camp-shirt.jpg",
    colors: [neutralPalette[1], neutralPalette[2], neutralPalette[3]],
  },
  {
    id: "3",
    slug: "cable-knit-crewneck-sweater",
    name: "Cable Knit Crewneck Sweater",
    priceGhs: 320000,
    imageSrc: "/mock/products/cable-knit-crewneck-sweater.jpg",
  },
  {
    id: "4",
    slug: "pleated-wide-leg-trousers",
    name: "Pleated Wide-Leg Trousers",
    priceGhs: 250000,
    imageSrc: "/mock/products/pleated-wide-leg-trousers.jpg",
    colors: neutralPalette,
  },
  {
    id: "5",
    slug: "printed-leather-penny-loafers",
    name: "Printed Leather Penny Loafers",
    priceGhs: 160000,
    imageSrc: "/mock/products/printed-leather-penny-loafers.jpg",
    colors: [neutralPalette[1], neutralPalette[2], neutralPalette[3]],
  },
  {
    id: "6",
    slug: "rectangular-dial-leather-watch",
    name: "Rectangular Dial Leather Watch",
    priceGhs: 320000,
    imageSrc: "/mock/products/rectangular-dial-leather-watch.jpg",
  },
  {
    id: "7",
    slug: "leather-woven-belt",
    name: "Leather Woven Belt",
    priceGhs: 90000,
    imageSrc: "/mock/products/leather-woven-belt.jpg",
    colors: [neutralPalette[2], neutralPalette[3]],
  },
  {
    id: "8",
    slug: "double-breasted-linen-blazer",
    name: "Double-Breasted Linen Blazer",
    priceGhs: 450000,
    imageSrc: "/mock/products/double-breasted-linen-blazer.jpg",
    colors: neutralPalette,
  },
  {
    id: "9",
    slug: "acetate-square-sunglasses",
    name: "Acetate Square Sunglasses",
    priceGhs: 120000,
    imageSrc: "/mock/products/acetate-square-sunglasses.jpg",
  },
];

// Temporary stand-in: every collection below reuses the 9 New In photos
// (cycled in order) until each page gets its own product photography.
// Once real photos exist, just delete the `.map(withStandInImage)` call
// on that collection's export — imageSrc set directly on each item (like
// mockNewInProducts above) takes priority over nothing being set here.
const newInImageStandIns = mockNewInProducts.map((product) => product.imageSrc!);

function withStandInImage(product: MockProduct, index: number): MockProduct {
  return {
    ...product,
    imageSrc: newInImageStandIns[index % newInImageStandIns.length],
  };
}

const ogLuxemenProductsBase: MockProduct[] = [
  {
    id: "og-1",
    slug: "wool-blend-overcoat",
    name: "Wool Blend Overcoat",
    priceGhs: 550000,
    colors: neutralPalette,
  },
  {
    id: "og-2",
    slug: "cotton-oxford-shirt",
    name: "Cotton Oxford Shirt",
    priceGhs: 140000,
    colors: [neutralPalette[0], neutralPalette[1], neutralPalette[2]],
  },
  {
    id: "og-3",
    slug: "slim-fit-chino-trousers",
    name: "Slim Fit Chino Trousers",
    priceGhs: 180000,
    colors: neutralPalette,
  },
  {
    id: "og-4",
    slug: "leather-chelsea-boots",
    name: "Leather Chelsea Boots",
    priceGhs: 280000,
    colors: [neutralPalette[2], neutralPalette[3]],
  },
  {
    id: "og-5",
    slug: "merino-crewneck-sweater",
    name: "Merino Crewneck Sweater",
    priceGhs: 210000,
    colors: neutralPalette,
  },
  {
    id: "og-6",
    slug: "tailored-wool-blazer",
    name: "Tailored Wool Blazer",
    priceGhs: 480000,
    colors: [neutralPalette[1], neutralPalette[2]],
  },
  {
    id: "og-7",
    slug: "canvas-weekend-duffel",
    name: "Canvas Weekend Duffel",
    priceGhs: 320000,
  },
  {
    id: "og-8",
    slug: "silk-blend-tie",
    name: "Silk Blend Tie",
    priceGhs: 60000,
    colors: [neutralPalette[2], neutralPalette[3], neutralPalette[4]],
  },
  {
    id: "og-9",
    slug: "leather-card-holder",
    name: "Leather Card Holder",
    priceGhs: 45000,
    colors: [neutralPalette[2], neutralPalette[3]],
  },
];

export const mockOgLuxemenProducts: MockProduct[] =
  ogLuxemenProductsBase.map(withStandInImage);

const womenswearPalette: MockProductColor[] = [
  { name: "Ivory", hex: "#F3EDE4" },
  { name: "Black", hex: "#151515" },
  { name: "Camel", hex: "#B08D57" },
  { name: "Blush", hex: "#D9B8AE" },
  { name: "Olive", hex: "#6B705C" },
];

const chicstyleProductsBase: MockProduct[] = [
  {
    id: "cs-1",
    slug: "satin-slip-midi-dress",
    name: "Satin Slip Midi Dress",
    priceGhs: 320000,
    colors: [womenswearPalette[0], womenswearPalette[1], womenswearPalette[3]],
  },
  {
    id: "cs-2",
    slug: "tailored-wide-leg-trousers",
    name: "Tailored Wide-Leg Trousers",
    priceGhs: 220000,
    colors: womenswearPalette,
  },
  {
    id: "cs-3",
    slug: "pointed-toe-stiletto-heels",
    name: "Pointed Toe Stiletto Heels",
    priceGhs: 260000,
    colors: [womenswearPalette[1], womenswearPalette[2]],
  },
  {
    id: "cs-4",
    slug: "cropped-wool-blazer",
    name: "Cropped Wool Blazer",
    priceGhs: 380000,
    colors: [womenswearPalette[1], womenswearPalette[2], womenswearPalette[4]],
  },
  {
    id: "cs-5",
    slug: "silk-wrap-blouse",
    name: "Silk Wrap Blouse",
    priceGhs: 190000,
    colors: womenswearPalette,
  },
  {
    id: "cs-6",
    slug: "leather-shoulder-bag",
    name: "Leather Shoulder Bag",
    priceGhs: 340000,
    colors: [womenswearPalette[1], womenswearPalette[2]],
  },
  {
    id: "cs-7",
    slug: "pleated-satin-skirt",
    name: "Pleated Satin Skirt",
    priceGhs: 210000,
    colors: [womenswearPalette[0], womenswearPalette[1], womenswearPalette[3]],
  },
  {
    id: "cs-8",
    slug: "cashmere-knit-cardigan",
    name: "Cashmere Knit Cardigan",
    priceGhs: 290000,
    colors: womenswearPalette,
  },
  {
    id: "cs-9",
    slug: "gold-chain-link-necklace",
    name: "Gold Chain Link Necklace",
    priceGhs: 95000,
  },
];

export const mockChicstyleProducts: MockProduct[] =
  chicstyleProductsBase.map(withStandInImage);

const kidswearPalette: MockProductColor[] = [
  { name: "Denim", hex: "#5B7C99" },
  { name: "Cream", hex: "#F0EAE0" },
  { name: "Red", hex: "#B33A3A" },
  { name: "Yellow", hex: "#E0B23C" },
  { name: "Sage", hex: "#8A9A7E" },
];

const kiddiesSpaceProductsBase: MockProduct[] = [
  {
    id: "ks-1",
    slug: "denim-dungaree-overalls",
    name: "Denim Dungaree Overalls",
    priceGhs: 90000,
    colors: [kidswearPalette[0], kidswearPalette[1]],
  },
  {
    id: "ks-2",
    slug: "floral-print-cotton-dress",
    name: "Floral Print Cotton Dress",
    priceGhs: 85000,
    colors: [kidswearPalette[1], kidswearPalette[4]],
  },
  {
    id: "ks-3",
    slug: "fair-isle-knit-cardigan",
    name: "Fair Isle Knit Cardigan",
    priceGhs: 95000,
    colors: [kidswearPalette[1], kidswearPalette[2]],
  },
  {
    id: "ks-4",
    slug: "fleece-two-piece-tracksuit",
    name: "Fleece Two-Piece Tracksuit",
    priceGhs: 110000,
    colors: [kidswearPalette[0], kidswearPalette[4], kidswearPalette[1]],
  },
  {
    id: "ks-5",
    slug: "colour-block-hooded-sweatshirt",
    name: "Colour Block Hooded Sweatshirt",
    priceGhs: 80000,
    colors: kidswearPalette,
  },
  {
    id: "ks-6",
    slug: "canvas-high-top-sneakers",
    name: "Canvas High-Top Sneakers",
    priceGhs: 70000,
    colors: [kidswearPalette[2], kidswearPalette[1], kidswearPalette[0]],
  },
  {
    id: "ks-7",
    slug: "denim-trucker-jacket",
    name: "Denim Trucker Jacket",
    priceGhs: 100000,
    colors: [kidswearPalette[0]],
  },
  {
    id: "ks-8",
    slug: "striped-cotton-rompers",
    name: "Striped Cotton Rompers",
    priceGhs: 65000,
    colors: [kidswearPalette[1], kidswearPalette[2], kidswearPalette[3]],
  },
  {
    id: "ks-9",
    slug: "corduroy-pull-on-trousers",
    name: "Corduroy Pull-On Trousers",
    priceGhs: 75000,
    colors: [kidswearPalette[1], kidswearPalette[4], kidswearPalette[0]],
  },
];

export const mockKiddiesSpaceProducts: MockProduct[] =
  kiddiesSpaceProductsBase.map(withStandInImage);
