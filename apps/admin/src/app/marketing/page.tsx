import type { Metadata } from "next";
import { MarketingContent } from "@/components/marketing-content";

export const metadata: Metadata = {
  title: "Marketing | Luxe All Fashion Admin",
};

export default function MarketingPage() {
  return <MarketingContent />;
}
