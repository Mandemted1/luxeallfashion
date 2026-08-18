import type { Metadata } from "next";
import { CustomersContent } from "@/components/customers-content";

export const metadata: Metadata = {
  title: "Customers — Luxe All Fashion Admin",
};

export default function CustomersPage() {
  return <CustomersContent />;
}
