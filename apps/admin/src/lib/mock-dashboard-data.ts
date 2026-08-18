// Placeholder data for building the admin layout before the backend/API
// and real orders exist. Shape mirrors what the real Order/Product models
// (packages/database) will eventually supply.

export const mockDashboardStats = {
  totalRevenueGhs: 4825000, // pesewas
  ordersToday: 6,
  totalOrders: 184,
};

export interface MockTopProduct {
  name: string;
  brand: string;
  unitsSold: number;
  revenueGhs: number;
}

export const mockTopProducts: MockTopProduct[] = [
  { name: "Suede Woven Loafers", brand: "OG Luxemen", unitsSold: 34, revenueGhs: 850000 },
  { name: "Satin Slip Midi Dress", brand: "Chicstyle", unitsSold: 29, revenueGhs: 928000 },
  { name: "Tropical Print Camp Shirt", brand: "OG Luxemen", unitsSold: 26, revenueGhs: 416000 },
  { name: "Denim Dungaree Overalls", brand: "Kiddies Space GH", unitsSold: 21, revenueGhs: 189000 },
  { name: "Cotton Oxford Shirt", brand: "OG Luxemen", unitsSold: 18, revenueGhs: 252000 },
];

export type OrderStatus = "Placed" | "Processing" | "Out for Delivery" | "Delivered";

export interface MockRecentOrder {
  orderNumber: string;
  customerName: string;
  totalGhs: number;
  status: OrderStatus;
  placedAt: string;
}

export const mockRecentOrders: MockRecentOrder[] = [
  { orderNumber: "#OG-1028", customerName: "Ama Serwaa", totalGhs: 258000, status: "Placed", placedAt: "12 minutes ago" },
  { orderNumber: "#OG-1027", customerName: "Kwabena Asante", totalGhs: 480000, status: "Processing", placedAt: "1 hour ago" },
  { orderNumber: "#OG-1026", customerName: "Efua Mensah", totalGhs: 160000, status: "Out for Delivery", placedAt: "3 hours ago" },
  { orderNumber: "#OG-1025", customerName: "Yaw Boateng", totalGhs: 320000, status: "Delivered", placedAt: "Yesterday" },
  { orderNumber: "#OG-1024", customerName: "Abena Owusu", totalGhs: 90000, status: "Delivered", placedAt: "Yesterday" },
];
