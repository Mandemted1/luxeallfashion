import Link from "next/link";
import { CollectionTile } from "@/components/collection-tile";
import { FullBleedBanner } from "@/components/full-bleed-banner";
import { HeroVideo } from "@/components/hero-video";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { getHeroContent, getHomepageTiles } from "@/lib/homepage-content";

// Hero video, CTA, and tiles come straight from the database — without
// this, Next.js would bake them in at build/first-render time and admin
// edits wouldn't show up until the next deploy.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [hero, tiles] = await Promise.all([getHeroContent(), getHomepageTiles()]);
  const ogLuxemenTile = tiles.OG_LUXEMEN;
  const chicstyleTile = tiles.CHICSTYLE;
  const kiddiesTile = tiles.KIDDIES_SPACE_GH;

  return (
    <>
      <SiteHeader transparentOverHero />
      <HeroVideo videoSrc={hero.heroVideoUrl}>
        <div className="absolute inset-x-0 bottom-[10%] flex justify-center px-4">
          <Link
            href={hero.heroCtaHref}
            className="border border-white px-10 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black"
          >
            {hero.heroCtaLabel}
          </Link>
        </div>
      </HeroVideo>

      <section className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <Reveal>
          <CollectionTile
            title={ogLuxemenTile.title}
            ctaLabel={ogLuxemenTile.ctaLabel}
            href={ogLuxemenTile.href}
            imageSrc={ogLuxemenTile.imageUrl}
          />
        </Reveal>
        <Reveal delayMs={120}>
          <CollectionTile
            title={chicstyleTile.title}
            ctaLabel={chicstyleTile.ctaLabel}
            href={chicstyleTile.href}
            imageSrc={chicstyleTile.imageUrl}
          />
        </Reveal>
      </section>

      {/* Mobile: matches the Men/Women tile treatment. Desktop: original
          full-bleed landscape banner, unchanged. */}
      <Reveal>
        <section className="lg:hidden">
          <CollectionTile
            title={kiddiesTile.title}
            ctaLabel={kiddiesTile.ctaLabel}
            href={kiddiesTile.href}
            imageSrc={kiddiesTile.imageUrl}
          />
        </section>
      </Reveal>

      <Reveal>
        <div className="hidden lg:block">
          <FullBleedBanner
            href={kiddiesTile.href}
            ctaLabel={kiddiesTile.ctaLabel}
            imageSrc={kiddiesTile.imageUrl}
          />
        </div>
      </Reveal>
    </>
  );
}
