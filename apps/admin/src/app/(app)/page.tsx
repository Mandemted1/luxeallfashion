import type { Metadata } from "next";
import { DashboardContent } from "@/components/dashboard-content";
import { getDashboardData } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Luxe All Fashion Admin",
};

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardContent data={data} />;
}
