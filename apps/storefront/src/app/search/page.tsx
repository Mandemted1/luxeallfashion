import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { searchProducts } from "@/lib/catalog";

// Results depend on the query string — without this, Next.js would cache
// the first search and keep serving it for every later query.
export const dynamic = "force-dynamic";

function getQuery(searchParams: Awaited<PageProps<"/search">["searchParams"]>): string {
  return typeof searchParams.q === "string" ? searchParams.q.trim() : "";
}

export async function generateMetadata(
  props: PageProps<"/search">,
): Promise<Metadata> {
  const query = getQuery(await props.searchParams);
  return {
    title: query ? `"${query}" | Luxe All Fashion` : "Search | Luxe All Fashion",
  };
}

export default async function SearchPage(props: PageProps<"/search">) {
  const query = getQuery(await props.searchParams);
  const products = query ? await searchProducts(query) : [];

  return (
    <CatalogPage
      title={query ? `Results for "${query}"` : "Search"}
      products={products}
    />
  );
}
