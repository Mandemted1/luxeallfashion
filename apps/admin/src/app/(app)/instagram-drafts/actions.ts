"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@luxe/database";
import type { AiProvider } from "@luxe/database";
import {
  addVariantInternal,
  createProductInternal,
  toggleProductActiveInternal,
} from "@/app/(app)/products/actions";
import { removeAiIntegrationSettings, saveAiIntegrationSettings } from "@/lib/ai-providers";
import { fromPrismaBrand } from "@/lib/brands";
import { runInstagramIngestion, type IngestionResult } from "@/lib/instagram-ingest";
import { requireAction } from "@/lib/permissions";

export async function syncInstagramDraftsNow(): Promise<IngestionResult> {
  const guard = await requireAction("INSTAGRAM_DRAFTS_SYNC");
  if (guard.error) return { queued: 0, processed: 0, failed: 0, errors: [guard.error] };

  const result = await runInstagramIngestion();
  revalidatePath("/instagram-drafts");
  return result;
}

export async function saveAiSettings(input: {
  provider: AiProvider;
  apiKey: string;
}): Promise<{ error?: string }> {
  const guard = await requireAction("INSTAGRAM_DRAFTS_AI_SETTINGS");
  if (guard.error) return guard;

  const apiKey = input.apiKey.trim();
  if (!apiKey) return { error: "Enter an API key." };
  await saveAiIntegrationSettings(input.provider, apiKey);
  revalidatePath("/instagram-drafts");
  return {};
}

export async function removeAiSettings(): Promise<{ error?: string }> {
  const guard = await requireAction("INSTAGRAM_DRAFTS_AI_SETTINGS");
  if (guard.error) return guard;

  await removeAiIntegrationSettings();
  revalidatePath("/instagram-drafts");
  return {};
}

export async function declineInstagramDraft(draftId: string): Promise<{ error?: string }> {
  const guard = await requireAction("INSTAGRAM_DRAFTS_REVIEW");
  if (guard.error) return guard;

  await prisma.instagramDraft.update({
    where: { id: draftId },
    data: { status: "REJECTED" },
  });
  revalidatePath("/instagram-drafts");
  return {};
}

// Puts a FAILED draft back in the queue for the next sync to pick up —
// a fresh start, not just one more of the same 3 attempts that already
// failed.
export async function retryInstagramDraft(draftId: string): Promise<{ error?: string }> {
  const guard = await requireAction("INSTAGRAM_DRAFTS_REVIEW");
  if (guard.error) return guard;

  await prisma.instagramDraft.update({
    where: { id: draftId },
    data: { status: "QUEUED", attempts: 0, lastError: null, processingStartedAt: null },
  });
  revalidatePath("/instagram-drafts");
  return {};
}

export async function approveInstagramDraft(
  draftId: string,
  edits: {
    title: string;
    brandName: string;
    description: string;
    categoryId: string;
    priceGhs: number | null;
    sizes: string[];
    color: string;
    stock: number;
  },
): Promise<{ error?: string; slug?: string; live?: boolean }> {
  const guard = await requireAction("INSTAGRAM_DRAFTS_REVIEW");
  if (guard.error) return guard;

  const draft = await prisma.instagramDraft.findUnique({ where: { id: draftId } });
  if (!draft) return { error: "Draft not found." };
  if (draft.status === "APPROVED") return { error: "This draft has already been approved." };

  const name = edits.title.trim();
  if (!name) return { error: "Enter a title." };
  if (!edits.categoryId) return { error: "Select a category." };

  const created = await createProductInternal({
    name,
    brandName: edits.brandName.trim(),
    brand: fromPrismaBrand(draft.sourceAccount),
    categoryId: edits.categoryId,
    description: edits.description.trim() || draft.description,
    material: "",
    images: draft.images,
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
      await addVariantInternal({
        productId: product.id,
        size,
        colorName: edits.color.trim() || "Default",
        colorHex: "#151515",
        priceGhs: edits.priceGhs,
        quantity: Math.max(0, Math.round(edits.stock)),
      });
    }
    const activated = await toggleProductActiveInternal(product.id, true);
    live = !activated.error;
  }

  await prisma.instagramDraft.update({
    where: { id: draftId },
    data: { status: "APPROVED", productId: product.id },
  });

  revalidatePath("/instagram-drafts");
  revalidatePath("/products");
  return { slug: product.slug, live };
}
