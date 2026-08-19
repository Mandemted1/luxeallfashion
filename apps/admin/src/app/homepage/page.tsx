import type { Metadata } from "next";
import { HomepageContentEditor } from "@/components/homepage-content-editor";

export const metadata: Metadata = {
  title: "Homepage | Luxe All Fashion Admin",
};

export default function HomepagePage() {
  return <HomepageContentEditor />;
}
