// Single source of truth for mock order data — the Dashboard's summary
// stats/lists derive from this too (see mock-dashboard-data.ts), so there's
// one place order data can drift out of sync, not two.

import type { Brand } from "@/lib/brands";

export type OrderStatus = "Placed" | "Processing" | "Out for Delivery" | "Delivered";

export const orderStatuses: OrderStatus[] = [
  "Placed",
  "Processing",
  "Out for Delivery",
  "Delivered",
];

export interface MockOrderItem {
  productName: string;
  brand: Brand;
  size: string;
  colorName?: string;
  quantity: number;
  unitPriceGhs: number;
}

export interface MockOrder {
  orderNumber: string; // no leading "#" — that's added for display only, since "#" breaks URL routing
  customerName: string;
  customerPhone: string; // local Ghana format, e.g. 024xxxxxxx
  customerEmail: string;
  deliveryRegion: string;
  deliveryAddress: string;
  status: OrderStatus;
  placedAt: string;
  shippingGhs: number;
  items: MockOrderItem[];
}

export const mockOrders: MockOrder[] = [
  {
    orderNumber: "OG-1030",
    customerName: "Efua Mensah",
    customerPhone: "0244881122",
    customerEmail: "efua.mensah@example.com",
    deliveryRegion: "Greater Accra",
    deliveryAddress: "12 Osu Oxford Street, near Papaye",
    status: "Placed",
    placedAt: "8 minutes ago",
    shippingGhs: 3000,
    items: [
      { productName: "Satin Slip Midi Dress", brand: "chicstyle", size: "M", colorName: "Ivory", quantity: 1, unitPriceGhs: 320000 },
    ],
  },
  {
    orderNumber: "OG-1029",
    customerName: "Yaw Boateng",
    customerPhone: "0201234567",
    customerEmail: "yaw.boateng@example.com",
    deliveryRegion: "Ashanti",
    deliveryAddress: "Adum, opposite Kingsway Building",
    status: "Placed",
    placedAt: "40 minutes ago",
    shippingGhs: 4000,
    items: [
      { productName: "Floral Print Cotton Dress", brand: "kiddies-space-gh", size: "Cream", quantity: 1, unitPriceGhs: 144500 },
    ],
  },
  {
    orderNumber: "OG-1028",
    customerName: "Ama Serwaa",
    customerPhone: "0551122334",
    customerEmail: "ama.serwaa@example.com",
    deliveryRegion: "Greater Accra",
    deliveryAddress: "East Legon, ARS Avenue, House 14",
    status: "Placed",
    placedAt: "12 minutes ago",
    shippingGhs: 3000,
    items: [
      { productName: "Tropical Print Camp Shirt", brand: "og-luxemen", size: "L", colorName: "Charcoal", quantity: 1, unitPriceGhs: 168000 },
      { productName: "Denim Dungaree Overalls", brand: "kiddies-space-gh", size: "Denim", quantity: 1, unitPriceGhs: 90000 },
    ],
  },
  {
    orderNumber: "OG-1027",
    customerName: "Kwabena Asante",
    customerPhone: "0277890123",
    customerEmail: "kwabena.asante@example.com",
    deliveryRegion: "Western",
    deliveryAddress: "Takoradi Market Circle, Shop 22",
    status: "Processing",
    placedAt: "1 hour ago",
    shippingGhs: 5000,
    items: [
      { productName: "Wool Blend Overcoat", brand: "og-luxemen", size: "XL", colorName: "Charcoal", quantity: 1, unitPriceGhs: 480000 },
    ],
  },
  {
    orderNumber: "OG-1026",
    customerName: "Efua Mensah",
    customerPhone: "0244881122",
    customerEmail: "efua.mensah@example.com",
    deliveryRegion: "Greater Accra",
    deliveryAddress: "12 Osu Oxford Street, near Papaye",
    status: "Out for Delivery",
    placedAt: "3 hours ago",
    shippingGhs: 3000,
    items: [
      { productName: "Pointed Toe Stiletto Heels", brand: "chicstyle", size: "38", colorName: "Black", quantity: 1, unitPriceGhs: 157000 },
    ],
  },
  {
    orderNumber: "OG-1025",
    customerName: "Yaw Boateng",
    customerPhone: "0201234567",
    customerEmail: "yaw.boateng@example.com",
    deliveryRegion: "Ashanti",
    deliveryAddress: "Adum, opposite Kingsway Building",
    status: "Delivered",
    placedAt: "Yesterday",
    shippingGhs: 4000,
    items: [
      { productName: "Suede Woven Loafers", brand: "og-luxemen", size: "42", colorName: "Tan", quantity: 1, unitPriceGhs: 250000 },
      { productName: "Leather Woven Belt", brand: "og-luxemen", size: "One Size", colorName: "Black", quantity: 1, unitPriceGhs: 70000 },
    ],
  },
  {
    orderNumber: "OG-1024",
    customerName: "Abena Owusu",
    customerPhone: "0209988776",
    customerEmail: "abena.owusu@example.com",
    deliveryRegion: "Ashanti",
    deliveryAddress: "Kumasi, Ahodwo Roundabout",
    status: "Delivered",
    placedAt: "Yesterday",
    shippingGhs: 4000,
    items: [
      { productName: "Denim Dungaree Overalls", brand: "kiddies-space-gh", size: "Denim", quantity: 1, unitPriceGhs: 90000 },
    ],
  },
  {
    orderNumber: "OG-1023",
    customerName: "Adjoa Boateng",
    customerPhone: "0266554433",
    customerEmail: "adjoa.boateng@example.com",
    deliveryRegion: "Central",
    deliveryAddress: "Cape Coast, Pedu Estate",
    status: "Delivered",
    placedAt: "2 days ago",
    shippingGhs: 4500,
    items: [
      { productName: "Leather Shoulder Bag", brand: "chicstyle", colorName: "Camel", size: "One Size", quantity: 1, unitPriceGhs: 312000 },
    ],
  },
];

export function findOrder(orderNumber: string): MockOrder | undefined {
  return mockOrders.find((order) => order.orderNumber === orderNumber);
}

export function orderSubtotalGhs(order: MockOrder): number {
  return order.items.reduce(
    (sum, item) => sum + item.unitPriceGhs * item.quantity,
    0,
  );
}

export function orderTotalGhs(order: MockOrder): number {
  return orderSubtotalGhs(order) + order.shippingGhs;
}

export function orderBrandPortionGhs(order: MockOrder, brand: Brand): number {
  return order.items
    .filter((item) => item.brand === brand)
    .reduce((sum, item) => sum + item.unitPriceGhs * item.quantity, 0);
}

export function orderBrands(order: MockOrder): Brand[] {
  return Array.from(new Set(order.items.map((item) => item.brand)));
}
