import type { Metadata } from "next";
import { DiscountCodesContent } from "@/components/discount-codes-content";

export const metadata: Metadata = {
  title: "Discount Codes | Luxe All Fashion Admin",
};

export default function DiscountCodesPage() {
  return <DiscountCodesContent />;
}
