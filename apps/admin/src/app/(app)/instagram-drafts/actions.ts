"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@luxe/database";
import type { AiProvider } from "@luxe/database";
import {
  removeAiIntegrationSettings,
  saveAiIntegrationSettings,
  setInstagramAutoApprove,
  setInstagramSyncPaused,
} from "@/lib/ai-providers";
import {
  approveInstagramDraftCore,
  type ApproveInstagramDraftEdits,
} from "@/lib/instagram-drafts-core";
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
    return { error: "GitHub dispatch isn't configured yet. Set GITHUB_DISPATCH_TOKEN." };
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

// A draft only ever gets auto-approved if it already cleared the same
// confidence bar a human would check for (price, category, sizes all
// detected) — this toggle never lowers that bar, it just skips the
// click for the ones that already passed it. See runInstagramIngestion.
export async function setAutoApprove(enabled: boolean): Promise<{ error?: string }> {
  const guard = await requireAction("INSTAGRAM_DRAFTS_SYNC");
  if (guard.error) return guard;

  await setInstagramAutoApprove(enabled);
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

// Undoes a decline — same shape as retryInstagramDraft, for the other way
// a draft can end up stuck: declined by mistake rather than failed.
export async function restoreInstagramDraft(draftId: string): Promise<{ error?: string }> {
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
  edits: ApproveInstagramDraftEdits,
): Promise<{ error?: string; slug?: string; live?: boolean }> {
  const guard = await requireAction("INSTAGRAM_DRAFTS_REVIEW");
  if (guard.error) return guard;
  return approveInstagramDraftCore(draftId, edits);
}

export { approveInstagramDraftCore as approveInstagramDraftInternal };
