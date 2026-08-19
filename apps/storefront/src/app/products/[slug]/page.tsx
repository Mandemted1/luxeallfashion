import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { ProductGallery } from "@/components/product-gallery";
import { ProductGrid } from "@/components/product-grid";
import { ProductInfoPanel } from "@/components/product-info-panel";
import { SiteHeader } from "@/components/site-header";
import {
  findProductBySlug,
  getProductDescription,
  getProductImages,
  getRelatedProducts,
  getSizeOptions,
} from "@/lib/mock-products";

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = findProductBySlug(slug);
  return {
    title: product
      ? `${product.name} | Luxe All Fashion`
      : "Product | Luxe All Fashion",
  };
}

export default async function ProductPage(
  props: PageProps<"/products/[slug]">,
) {
  const { slug } = await props.params;
  const product = findProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const description = getProductDescription(product);
  const sizeOptions = getSizeOptions(product);
  const relatedProducts = getRelatedProducts(slug);

  return (
    <>
      <SiteHeader />
      <div className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-10">
        <BackButton />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery
            images={getProductImages(product)}
            alt={product.name}
          />
          <div className="lg:max-w-md">
            <ProductInfoPanel
              product={product}
              description={description}
              sizeOptions={sizeOptions}
            />
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="text-2xl font-normal sm:text-3xl">
              Recommendations
            </h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </>
  );
}
