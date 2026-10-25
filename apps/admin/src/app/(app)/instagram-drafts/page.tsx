import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import type { InstagramDraftStatus } from "@luxe/database";
import type { AdminCategoryItem } from "@/components/categories-content";
import { InstagramDraftsContent, type AdminInstagramDraft } from "@/components/instagram-drafts-content";
import { fromPrismaBrand } from "@/lib/brands";
import { getAiIntegrationStatus } from "@/lib/ai-providers";
import { requirePageAccess } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Instagram Drafts | Luxe All Fashion Admin",
};

// Without this, Next.js can serve a cached render of admin-mutated data.
export const dynamic = "force-dynamic";

// Covers the syncInstagramDraftsNow server action invoked from this page
// (route segment config applies to actions called from it, but can't be
// exported directly from a "use server" file). Kiddies Space GH's images
// alone have been observed taking 4-5 minutes through Gemini.
export const maxDuration = 300;

type StatusFilter = "QUEUED" | "PENDING" | "APPROVED" | "REJECTED" | "ALL";

function readStatusParam(value: string | string[] | undefined): StatusFilter {
  const valid: StatusFilter[] = ["QUEUED", "PENDING", "APPROVED", "REJECTED", "ALL"];
  const upper = typeof value === "string" ? value.toUpperCase() : "PENDING";
  return valid.includes(upper as StatusFilter) ? (upper as StatusFilter) : "PENDING";
}

// The "Queued" tab covers both QUEUED (waiting its turn) and FAILED
// (exhausted its retries, needs a human) — one tab, not two, since both
// mean "not ready for review yet" and the card itself distinguishes them.
function whereForStatus(status: StatusFilter) {
  if (status === "ALL") return {};
  if (status === "QUEUED") return { status: { in: ["QUEUED", "FAILED"] as InstagramDraftStatus[] } };
  return { status };
}

export default async function InstagramDraftsPage(props: PageProps<"/instagram-drafts">) {
  await requirePageAccess("INSTAGRAM_DRAFTS");

  const searchParams = await props.searchParams;
  const status = readStatusParam(searchParams.status);

  const [drafts, statusCounts, categories, aiStatus] = await Promise.all([
    prisma.instagramDraft.findMany({
      where: whereForStatus(status),
      orderBy: { createdAt: "desc" },
      include: { product: { select: { slug: true } } },
    }),
    prisma.instagramDraft.groupBy({ by: ["status"], _count: true }),
    prisma.category.findMany({ orderBy: [{ brand: "asc" }, { name: "asc" }] }),
    getAiIntegrationStatus(),
  ]);

  const countFor = (s: InstagramDraftStatus) => statusCounts.find((c) => c.status === s)?._count ?? 0;
  const counts = {
    QUEUED: countFor("QUEUED") + countFor("FAILED"),
    PENDING: countFor("PENDING"),
    APPROVED: countFor("APPROVED"),
    REJECTED: countFor("REJECTED"),
    ALL: statusCounts.reduce((sum, c) => sum + c._count, 0),
  };

  const items: AdminInstagramDraft[] = drafts.map((draft) => ({
    id: draft.id,
    sourceAccount: fromPrismaBrand(draft.sourceAccount),
    status: draft.status,
    aiProviderUsed: draft.aiProviderUsed,
    permalink: draft.permalink,
    originalCaption: draft.originalCaption,
    images: draft.images,
    title: draft.title,
    brandName: draft.brandName,
    description: draft.description,
    detectedPriceGhs: draft.detectedPriceGhs,
    sizes: draft.sizes,
    color: draft.color,
    suggestedCategoryId: draft.suggestedCategoryId,
    missingFields: draft.missingFields,
    attempts: draft.attempts,
    lastError: draft.lastError,
    createdAt: draft.createdAt.toISOString(),
    productSlug: draft.product?.slug ?? null,
  }));

  const categoryItems: AdminCategoryItem[] = categories.map((category) => ({
    id: category.id,
    brand: fromPrismaBrand(category.brand),
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
  }));

  return (
    <InstagramDraftsContent
      drafts={items}
      categories={categoryItems}
      status={status}
      statusCounts={counts}
      aiStatus={aiStatus}
    />
  );
}
