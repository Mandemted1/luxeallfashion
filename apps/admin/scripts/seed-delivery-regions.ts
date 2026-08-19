// One-time seed for Ghana's 16 regions. priceGhs is kept on the table for
// potential future use, but isn't currently charged at checkout — delivery
// fees are arranged directly between the customer and courier, not through
// the platform. Safe to re-run: upserts by slug.

import { prisma } from "@luxe/database";

const regions = [
  { name: "Greater Accra", slug: "greater-accra", priceGhs: 3000 },
  { name: "Ashanti", slug: "ashanti", priceGhs: 4000 },
  { name: "Central", slug: "central", priceGhs: 4500 },
  { name: "Eastern", slug: "eastern", priceGhs: 4500 },
  { name: "Western", slug: "western", priceGhs: 5000 },
  { name: "Volta", slug: "volta", priceGhs: 5500 },
  { name: "Bono", slug: "bono", priceGhs: 6000 },
  { name: "Bono East", slug: "bono-east", priceGhs: 6000 },
  { name: "Ahafo", slug: "ahafo", priceGhs: 6000 },
  { name: "Western North", slug: "western-north", priceGhs: 6000 },
  { name: "Oti", slug: "oti", priceGhs: 6500 },
  { name: "Northern", slug: "northern", priceGhs: 8000 },
  { name: "Savannah", slug: "savannah", priceGhs: 8500 },
  { name: "North East", slug: "north-east", priceGhs: 9000 },
  { name: "Upper East", slug: "upper-east", priceGhs: 9000 },
  { name: "Upper West", slug: "upper-west", priceGhs: 9500 },
];

async function main() {
  for (const region of regions) {
    await prisma.deliveryRegion.upsert({
      where: { slug: region.slug },
      update: { name: region.name, priceGhs: region.priceGhs },
      create: region,
    });
  }
  console.log(`Seeded ${regions.length} delivery regions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
