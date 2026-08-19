import type { Metadata } from "next";
import { BagContent } from "@/components/bag-content";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Shopping Bag | Luxe All Fashion",
};

export default function BagPage() {
  return (
    <>
      <SiteHeader />
      <div className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-10">
        <BagContent />
      </div>
    </>
  );
}
