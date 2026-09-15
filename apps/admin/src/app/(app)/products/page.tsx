import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import type { Prisma } from "@luxe/database";
import { ProductsContent } from "@/components/products-content";
import { fromPrismaBrand, toPrismaBrand, type Brand, type BrandFilter } from "@/lib/brands";
import type { AdminProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products | Luxe All Fashion Admin",
};

// Without this, Next.js can serve a cached render of admin-mutated data.
export const dynamic = "force-dynamic";

export const PRODUCTS_PAGE_SIZE = 50;

function readBrandParam(value: string | string[] | undefined): BrandFilter {
  const brandFilters: BrandFilter[] = ["og-luxemen", "chicstyle", "kiddies-space-gh"];
  return typeof value === "string" && brandFilters.includes(value as BrandFilter)
    ? (value as BrandFilter)
    : "all";
}

export default async function ProductsPage(props: PageProps<"/products">) {
  const searchParams = await props.searchParams;
  const brand = readBrandParam(searchParams.brand);
  const categoryId = typeof searchParams.category === "string" ? searchParams.category : "all";
  const search = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const pageParam = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const where: Prisma.ProductWhereInput = {};
  if (brand !== "all") where.brand = toPrismaBrand(brand as Brand);
  if (categoryId !== "all") where.categoryId = categoryId;
  if (search) where.name = { contains: search, mode: "insensitive" };

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: true, _count: { select: { orderItems: true } } },
      orderBy: { createdAt: "desc" },
      take: PRODUCTS_PAGE_SIZE,
      skip: (page - 1) * PRODUCTS_PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: [{ brand: "asc" }, { name: "asc" }] }),
  ]);

  const items: AdminProduct[] = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: fromPrismaBrand(product.brand),
    categoryId: product.categoryId,
    description: product.description,
    material: product.material,
    images: product.images,
    isActive: product.isActive,
    isNewIn: product.isNewIn,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      sku: variant.sku,
      quantity: variant.quantity,
      priceGhs: variant.priceGhs,
    })),
    orderCount: product._count.orderItems,
  }));

  const categoryItems = categories.map((category) => ({
    id: category.id,
    brand: fromPrismaBrand(category.brand),
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
  }));

  return (
    <ProductsContent
      products={items}
      categories={categoryItems}
      totalCount={totalCount}
      page={page}
      pageSize={PRODUCTS_PAGE_SIZE}
    />
  );
}
