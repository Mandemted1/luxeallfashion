// Derived from mock-orders.ts rather than a separate hardcoded list, so a
// customer's order count/spend here always agrees with the Orders page.
// Once there's a real Customer table, this becomes a query instead.

import type { Brand } from "@/lib/brands";
import { mockOrders, orderBrands, orderTotalGhs, type MockOrder } from "@/lib/mock-orders";

export interface MockCustomer {
  id: string; // email, used as the natural key
  name: string;
  email: string;
  phone: string;
  brands: Brand[];
  marketingOptIn: boolean;
  orderCount: number;
  totalSpentGhs: number;
  lastOrderAt: string;
}

// Deterministic stand-in for a real marketingOptIn flag — same email
// always resolves the same way within a session.
function pseudoOptIn(email: string): boolean {
  let hash = 0;
  for (const char of email) hash = (hash + char.charCodeAt(0)) % 7;
  return hash % 2 === 0;
}

export function getCustomers(): MockCustomer[] {
  const byEmail = new Map<string, MockCustomer>();

  for (const order of mockOrders) {
    const spend = orderTotalGhs(order);
    const existing = byEmail.get(order.customerEmail);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpentGhs += spend;
      for (const brand of orderBrands(order)) {
        if (!existing.brands.includes(brand)) existing.brands.push(brand);
      }
    } else {
      byEmail.set(order.customerEmail, {
        id: order.customerEmail,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        brands: orderBrands(order),
        marketingOptIn: pseudoOptIn(order.customerEmail),
        orderCount: 1,
        totalSpentGhs: spend,
        lastOrderAt: order.placedAt,
      });
    }
  }

  return Array.from(byEmail.values()).sort((a, b) => b.totalSpentGhs - a.totalSpentGhs);
}

export function findCustomer(id: string): MockCustomer | undefined {
  return getCustomers().find((customer) => customer.id === id);
}

export function customerOrders(email: string): MockOrder[] {
  return mockOrders.filter((order) => order.customerEmail === email);
}
