import type { Metadata } from "next";
import { CategoriesContent } from "@/components/categories-content";

export const metadata: Metadata = {
  title: "Categories — Luxe All Fashion Admin",
};

export default function CategoriesPage() {
  return <CategoriesContent />;
}
