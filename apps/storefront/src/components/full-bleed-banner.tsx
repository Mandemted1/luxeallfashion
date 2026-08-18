import Image from "next/image";
import Link from "next/link";

interface FullBleedBannerProps {
  href: string;
  ctaLabel: string;
  imageSrc?: string;
  imageAlt?: string;
}

// Full-width promo image with a solid CTA button overlaid near the bottom.
// imageSrc is optional so the layout is verifiable before real photography
// is supplied — swap in a src once the file lands in /public.
export function FullBleedBanner({
  href,
  ctaLabel,
  imageSrc,
  imageAlt,
}: FullBleedBannerProps) {
  return (
    <section className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 sm:aspect-[8/5]">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={imageAlt ?? ""}
          fill
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-stone-100 to-stone-200 text-[11px] uppercase tracking-[0.2em] text-stone-400">
          Image pending
        </div>
      )}

      <Link
        href={href}
        className="absolute bottom-[8%] left-1/2 -translate-x-1/2 bg-black px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-stone-800"
      >
        {ctaLabel}
      </Link>
    </section>
  );
}
