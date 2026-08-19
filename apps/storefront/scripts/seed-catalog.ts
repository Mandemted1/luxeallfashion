// Seeds real Category/Product/ProductVariant rows from the storefront's
// existing mock catalog (src/lib/mock-products.ts), matching every real
// slug/size/color combination the storefront can actually add to a cart —
// checkout needs to resolve cart items against real database rows, since
// CartItem only carries slug/size/colorName, not a database id.
//
// This makes the catalog data real for checkout purposes, but the
// storefront's browsing pages (catalog/product-detail) still read from
// the mock module directly — migrating those to Prisma is separate,
// follow-up work. Safe to re-run: upserts by slug.

import { prisma, type Brand } from "@luxe/database";
import {
  getProductDescription,
  getProductImages,
  getSizeOptions,
  mockChicstyleProducts,
  mockKiddiesSpaceProducts,
  mockNewInProducts,
  mockOgLuxemenProducts,
  type MockProduct,
} from "../src/lib/mock-products";

interface CategorySeed {
  brand: Brand;
  name: string;
  slug: string;
}

const categories: CategorySeed[] = [
  { brand: "OG_LUXEMEN", name: "Shirts", slug: "shirts" },
  { brand: "OG_LUXEMEN", name: "Trousers", slug: "trousers" },
  { brand: "OG_LUXEMEN", name: "Outerwear", slug: "outerwear" },
  { brand: "OG_LUXEMEN", name: "Footwear", slug: "footwear" },
  { brand: "OG_LUXEMEN", name: "Accessories", slug: "accessories" },
  { brand: "CHICSTYLE", name: "Dresses", slug: "dresses" },
  { brand: "CHICSTYLE", name: "Tops", slug: "tops" },
  { brand: "CHICSTYLE", name: "Bottoms", slug: "bottoms" },
  { brand: "CHICSTYLE", name: "Bags & Accessories", slug: "bags-accessories" },
  { brand: "CHICSTYLE", name: "Footwear", slug: "footwear" },
  { brand: "CHICSTYLE", name: "Outerwear", slug: "outerwear" },
  { brand: "KIDDIES_SPACE_GH", name: "Boys", slug: "boys" },
  { brand: "KIDDIES_SPACE_GH", name: "Girls", slug: "girls" },
  { brand: "KIDDIES_SPACE_GH", name: "Footwear", slug: "footwear" },
];

function categorySlugFor(brand: Brand, name: string, index: number): string {
  const n = name.toLowerCase();
  if (brand === "OG_LUXEMEN") {
    if (/shirt/.test(n)) return "shirts";
    if (/trouser|chino/.test(n)) return "trousers";
    if (/blazer|coat|jacket/.test(n)) return "outerwear";
    if (/loafer|boot|sneaker/.test(n)) return "footwear";
    return "accessories";
  }
  if (brand === "CHICSTYLE") {
    if (/dress/.test(n)) return "dresses";
    if (/blouse|top|cardigan/.test(n)) return "tops";
    if (/trouser|skirt/.test(n)) return "bottoms";
    if (/blazer|coat|jacket/.test(n)) return "outerwear";
    if (/heel|sneaker|boot/.test(n)) return "footwear";
    return "bags-accessories";
  }
  if (/sneaker|boot/.test(n)) return "footwear";
  return index % 2 === 0 ? "boys" : "girls";
}

const neutralColor = { name: "Default", hex: "#151515" };

async function seedCollection(
  products: MockProduct[],
  brand: Brand,
  categoryIds: Record<string, string>,
) {
  let created = 0;
  for (const [index, product] of products.entries()) {
    const categorySlug = categorySlugFor(brand, product.name, index);
    const categoryId = categoryIds[categorySlug];
    if (!categoryId) throw new Error(`No category id for slug ${categorySlug}`);

    const dbProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: getProductDescription(product),
        brand,
        categoryId,
        images: getProductImages(product),
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: getProductDescription(product),
        brand,
        categoryId,
        images: getProductImages(product),
      },
    });

    const sizes = getSizeOptions(product);
    const colors = product.colors && product.colors.length > 0 ? product.colors : [neutralColor];

    for (const size of sizes) {
      for (const color of colors) {
        const sku = `${product.slug}-${size}-${color.name}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");

        await prisma.productVariant.upsert({
          where: { productId_size_colorName: { productId: dbProduct.id, size, colorName: color.name } },
          update: { priceGhs: product.priceGhs, colorHex: color.hex },
          create: {
            productId: dbProduct.id,
            size,
            colorName: color.name,
            colorHex: color.hex,
            sku,
            quantity: 25,
            priceGhs: product.priceGhs,
          },
        });
      }
    }
    created++;
  }
  return created;
}

async function main() {
  const categoryIds: Record<string, string> = {};
  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { brand_slug: { brand: category.brand, slug: category.slug } },
      update: { name: category.name },
      create: category,
    });
    // Multiple brands can share a slug (e.g. "footwear") — key by
    // brand+slug so seedCollection looks up the right one.
    categoryIds[`${category.brand}:${category.slug}`] = row.id;
  }

  // Rewrap categorySlugFor's plain slug into the brand-scoped lookup key
  // used by seedCollection.
  function scopedIds(brand: Brand): Record<string, string> {
    const scoped: Record<string, string> = {};
    for (const category of categories.filter((c) => c.brand === brand)) {
      scoped[category.slug] = categoryIds[`${brand}:${category.slug}`];
    }
    return scoped;
  }

  const ogCount = await seedCollection(
    [...mockNewInProducts, ...mockOgLuxemenProducts],
    "OG_LUXEMEN",
    scopedIds("OG_LUXEMEN"),
  );
  const chicCount = await seedCollection(
    mockChicstyleProducts,
    "CHICSTYLE",
    scopedIds("CHICSTYLE"),
  );
  const kidsCount = await seedCollection(
    mockKiddiesSpaceProducts,
    "KIDDIES_SPACE_GH",
    scopedIds("KIDDIES_SPACE_GH"),
  );

  console.log(
    `Seeded ${categories.length} categories and ${ogCount + chicCount + kidsCount} products (OG Luxemen: ${ogCount}, Chicstyle: ${chicCount}, Kiddies Space GH: ${kidsCount}).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
