import Image from "next/image";
import Link from "next/link";
import { formatGhs } from "@/lib/currency";
import type { MockProduct } from "@/lib/mock-products";

export function ProductCard({ product }: { product: MockProduct }) {
  const href = `/products/${product.slug}`;

  return (
    <div className="flex flex-col border-r border-b border-black">
      <Link
        href={href}
        aria-label={product.name}
        className="group relative block aspect-[4/5] overflow-hidden border-b border-black bg-white"
      >
        {product.imageSrc ? (
          <Image
            src={product.imageSrc}
            alt={product.name}
            fill
            className="object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-105 sm:p-10"
            sizes="(min-width: 1024px) 33vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-stone-200 to-stone-300 text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Image pending
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="text-sm text-black hover:opacity-70">
            {product.name}
          </Link>
          <button
            type="button"
            aria-label={`Quick add ${product.name} to bag`}
            className="shrink-0 text-xl leading-none text-black transition-opacity hover:opacity-60"
          >
            +
          </button>
        </div>

        <p className="mt-1 text-sm font-semibold text-black">
          {formatGhs(product.priceGhs)}
        </p>

        {product.colors && product.colors.length > 0 && (
          <div className="mt-3 flex gap-1.5">
            {product.colors.map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="h-3.5 w-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
