// Trusted-internal only — same reasoning as products-core.ts: kept out of
// a "use server" file so it can never become a client-callable server
// action on its own. Called from the guarded public approveInstagramDraft
// action in instagram-drafts/actions.ts (a real admin clicking Approve)
// and from runInstagramIngestion()'s auto-approve path, which runs with
// no admin session at all (the standalone sync script, outside any
// request context) — never call this from anywhere else.
import { prisma } from "@luxe/database";
import { fromPrismaBrand } from "@/lib/brands";
import { addVariantCore, createProductCore, toggleProductActiveCore } from "@/lib/products-core";
import { safeRevalidatePath } from "@/lib/safe-revalidate";

export interface ApproveInstagramDraftEdits {
  images: string[];
  title: string;
  brandName: string;
  description: string;
  categoryId: string;
  priceGhs: number | null;
  sizes: string[];
  color: string;
  stock: number;
}

export async function approveInstagramDraftCore(
  draftId: string,
  edits: ApproveInstagramDraftEdits,
): Promise<{ error?: string; slug?: string; live?: boolean }> {
  const draft = await prisma.instagramDraft.findUnique({ where: { id: draftId } });
  if (!draft) return { error: "Draft not found." };
  if (draft.status === "APPROVED") return { error: "This draft has already been approved." };

  const name = edits.title.trim();
  if (!name) return { error: "Enter a title." };
  if (!edits.categoryId) return { error: "Select a category." };

  const images = edits.images.filter((src) => src.trim().length > 0);
  if (images.length === 0) return { error: "Add at least one image." };

  const created = await createProductCore({
    name,
    brandName: edits.brandName.trim(),
    brand: fromPrismaBrand(draft.sourceAccount),
    categoryId: edits.categoryId,
    description: edits.description.trim() || draft.description,
    material: "",
    images,
    isNewIn: true,
  });
  if (created.error || !created.slug) {
    return { error: created.error ?? "Couldn't create the product." };
  }

  const product = await prisma.product.findUniqueOrThrow({ where: { slug: created.slug } });

  const validSizes = edits.sizes.map((size) => size.trim()).filter(Boolean);
  let live = false;

  if (validSizes.length > 0 && edits.priceGhs && edits.priceGhs > 0) {
    for (const size of validSizes) {
      await addVariantCore({
        productId: product.id,
        size,
        colorName: edits.color.trim() || "Default",
        colorHex: "#151515",
        priceGhs: edits.priceGhs,
        quantity: Math.max(0, Math.round(edits.stock)),
      });
    }
    const activated = await toggleProductActiveCore(product.id, true);
    live = !activated.error;
  }

  await prisma.instagramDraft.update({
    where: { id: draftId },
    data: { status: "APPROVED", productId: product.id },
  });

  safeRevalidatePath("/instagram-drafts");
  safeRevalidatePath("/products");
  return { slug: product.slug, live };
}
