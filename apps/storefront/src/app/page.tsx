import Link from "next/link";
import { CollectionTile } from "@/components/collection-tile";
import { HeroVideo } from "@/components/hero-video";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <HeroVideo>
        <div className="absolute inset-x-0 bottom-[10%] flex justify-center px-4">
          <Link
            href="/new-in"
            className="border border-white px-10 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black"
          >
            Shop Now
          </Link>
        </div>
      </HeroVideo>

      <section className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <CollectionTile title="OG Luxemen" ctaLabel="Shop Men" href="/og-luxemen" />
        <CollectionTile title="Chicstyle" ctaLabel="Shop Women" href="/chicstyle" />
      </section>
    </>
  );
}
