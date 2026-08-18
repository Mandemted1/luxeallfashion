import Image from "next/image";
import Link from "next/link";

interface CollectionTileProps {
  title: string;
  ctaLabel: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
}

// Two of these sit side by side on the homepage. imageSrc is optional so the
// layout is verifiable before real campaign photography is supplied — swap
// in a src once the file lands in /public.
export function CollectionTile({
  title,
  ctaLabel,
  href,
  imageSrc,
  imageAlt,
}: CollectionTileProps) {
  return (
    <div className="flex flex-col items-center px-4 py-8 sm:py-10">
      <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.25em] sm:mb-8 sm:text-base">
        {title}
      </h2>

      <Link
        href={href}
        aria-label={`${ctaLabel} — ${title}`}
        className="relative aspect-[10/11] w-full max-w-2xl overflow-hidden bg-stone-200"
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt ?? title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-stone-200 to-stone-300 text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Image pending
          </div>
        )}
      </Link>

      <Link
        href={href}
        className="mt-6 border border-black px-10 py-3 text-xs font-medium uppercase tracking-[0.2em] transition-colors hover:bg-black hover:text-white sm:mt-8"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
