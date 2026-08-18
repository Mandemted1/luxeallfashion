// Placeholder delivery pricing until the admin's region-price tool exists
// (packages/database already models this as DeliveryRegion). Prices in
// pesewas, same convention as everywhere else.
export interface MockDeliveryRegion {
  name: string;
  slug: string;
  priceGhs: number;
}

export const mockDeliveryRegions: MockDeliveryRegion[] = [
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
