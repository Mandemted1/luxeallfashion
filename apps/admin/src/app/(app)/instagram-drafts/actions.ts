"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@luxe/database";
import type { AiProvider } from "@luxe/database";
import {
  addVariantInternal,
  createProductInternal,
  toggleProductActiveInternal,
} from "@/app/(app)/products/actions";
import {
  removeAiIntegrationSettings,
  saveAiIntegrationSettings,
  setInstagramSyncPaused,
} from "@/lib/ai-providers";
import { fromPrismaBrand } from "@/lib/brands";
import { requireAction } from "@/lib/permissions";

const GITHUB_REPO = "Mandemted1/luxeallfashion";
const GITHUB_WORKFLOW_FILE = "instagram-sync.yml";

// Dispatches the GitHub Actions workflow instead of running the sync
// inline — Vercel's Hobby plan hard-caps function duration well below
// what a single Kiddies Space GH image can take through the AI provider
// (confirmed live via a 504 FUNCTION_INVOCATION_TIMEOUT), and that cap
// can't be raised in code. GitHub Actions has no such limit. This
// returns as soon as the dispatch is accepted, not when the sync
// finishes — the existing polling in the UI picks up progress from
// there as drafts actually move through the queue.
export async function syncInstagramDraftsNow(): Promise<{ error?: string; dispatched?: boolean }> {
  const guard = await requireAction("INSTAGRAM_DRAFTS_SYNC");
  if (guard.error) return guard;

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return { error: "GitHub dispatch isn't configured yet — set GITHUB_DISPATCH_TOKEN." };
  }

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${GITHUB_WORKFLOW_FILE}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main" }),
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { error: `Couldn't start the sync (${res.status}): ${body?.message ?? "unknown error"}` };
  }

  return { dispatched: true };
}

export async function pauseInstagramSync(): Promise<{ error?: string }> {
  const guard = await requireAction("INSTAGRAM_DRAFTS_SYNC");
  if (guard.error) return guard;

  await setInstagramSyncPaused(true);
  revalidatePath("/instagram-drafts");
  return {};
}

export async function resumeInstagramSync(): Promise<{ error?: string }> {
  const guard = await requireAction("INSTAGRAM_DRAFTS_SYNC");
  if (guard.error) return guard;

  await setInstagramSyncPaused(false);
  revalidatePath("/instagram-drafts");
  return {};
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
