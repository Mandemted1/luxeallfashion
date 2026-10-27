import { prisma } from "@luxe/database";
import type { Brand as PrismaBrand } from "@luxe/database";
import { approveInstagramDraftInternal } from "@/app/(app)/instagram-drafts/actions";
import {
  getActiveParser,
  getInstagramDiscoverSince,
  isInstagramAutoApproveEnabled,
  isInstagramSyncPaused,
} from "@/lib/ai-providers";
import { brandLabel, fromPrismaBrand } from "@/lib/brands";
import {
  collectPostImageUrls,
  downloadImage,
  fetchInstagramPost,
  fetchInstagramPosts,
  shrinkForAi,
} from "@/lib/instagram";
import { uploadR2Object } from "@/lib/r2";

// Caps how many new rows a single discovery pass can queue per account —
// so one account with a huge never-synced backlog can't flood the queue
// in one go. Discovery itself is cheap (no AI calls), this is just a
// sanity ceiling, not a timeout-driven limit.
const DISCOVERY_LIMIT_PER_ACCOUNT = 20;

// Kiddies Space GH's images alone have been observed taking the AI
// provider 4-5 minutes to respond (likely extra child-safety content
// review on the provider's side, given it's children's clothing).
// 300s was cutting it too close — confirmed live via real timeouts on
// this exact account — so this gives real margin above that 4-5 min
// observed ceiling instead of just barely covering it.
const AI_CALL_TIMEOUT_MS = 420_000;

// The worker loop keeps claiming and processing queued drafts until
// either the queue is empty or this budget is used up. Must stay
// comfortably above AI_CALL_TIMEOUT_MS — a single claimed post runs to
// completion of its own timeout regardless of where this outer check
// falls, so if the budget were smaller than one call's own timeout, a
// single slow post could already exceed the stated budget on its own.
// Runs primarily via the GitHub Actions worker now (run-instagram-sync.ts,
// no platform duration limit — see its own comment for why), not Vercel's
// Hobby-plan-capped cron route, so there's real room here: a few posts'
// worth of margin, not just one.
const WORKER_TIME_BUDGET_MS = 900_000;

// After this many failed attempts a draft stops being retried
// automatically and moves to FAILED — still visible, retryable by hand,
// but no longer silently retried forever on something permanently broken
// (a corrupted image, a post that's since been deleted).
const MAX_ATTEMPTS = 3;

// If a claim (processingStartedAt) is older than this, the worker that
// made it is assumed to have crashed or been killed mid-processing —
// the draft becomes reclaimable rather than stuck forever.
const STALE_CLAIM_MS = 10 * 60 * 1000;

// Starting stock for each variant of an auto-approved draft — the AI
// doesn't detect a real stock count from captions (the numbers in them
// are almost always sizes, e.g. "AVAILABLE: 44" for a shoe size, not a
// quantity), so this is just a reasonable default the admin can adjust
// from the Products page afterward.
const AUTO_APPROVE_STOCK_PER_VARIANT = 5;

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

// One shared never-expiring System User token (META_SYSTEM_USER_TOKEN)
// reads all three — each account is just a stable, non-secret Instagram
// Business Account ID looked up once via its linked Facebook Page.
const ACCOUNTS: { brand: PrismaBrand; igAccountId: string }[] = [
  { brand: "OG_LUXEMEN", igAccountId: "17841458547171967" },
  { brand: "CHICSTYLE", igAccountId: "17841477318956124" },
  { brand: "KIDDIES_SPACE_GH", igAccountId: "17841462776152729" },
];

export interface IngestionResult {
  queued: number;
  processed: number;
  approved: number;
  failed: number;
  errors: string[];
}

// Belt-and-suspenders on top of the prompt's own "no em/en dashes"
// instruction — a model can still slip one in. A dash surrounded by
// spaces was almost certainly used as a parenthetical break, so a comma
// reads naturally in its place; any other stray dash just becomes a
// plain hyphen rather than being dropped and possibly joining two words.
function stripDashes(text: string): string {
  return text.replace(/\s+[—–]\s+/g, ", ").replace(/[—–]/g, "-");
}

// Two phases, both run every call:
//
// 1. Discovery (fast, no AI calls) — list each account's recent posts,
//    queue a lightweight QUEUED row for any genuinely new one. Bounded
//    by Graph API latency only, never by the AI provider.
//
// 2. Worker loop (time-bounded, not count-bounded) — repeatedly claims
//    the oldest claimable queued draft across *all* accounts (not
//    per-account, so a slow account can't starve a fast one that was
//    discovered later) and fully processes it, until the queue's empty
//    or the time budget runs out. A slow post just eats more of one
//    run's budget; it can never block the others the way a purely
//    sequential, unbounded loop would.
export async function runInstagramIngestion(): Promise<IngestionResult> {
  const errors: string[] = [];
  let queued = 0;
  let processed = 0;
  let approved = 0;
  let failed = 0;

  if (await isInstagramSyncPaused()) {
    return { queued: 0, processed: 0, approved: 0, failed: 0, errors: ["Sync is paused."] };
  }

  const token = process.env.META_SYSTEM_USER_TOKEN;
  if (!token) {
    return {
      queued: 0,
      processed: 0,
      approved: 0,
      failed: 0,
      errors: ["Instagram isn't connected yet — set META_SYSTEM_USER_TOKEN."],
    };
  }

  // --- Phase 1: discovery ---
  const discoverSince = await getInstagramDiscoverSince();

  for (const account of ACCOUNTS) {
    try {
      const posts = await fetchInstagramPosts(token, account.igAccountId);
      let queuedThisAccount = 0;

      for (const post of posts) {
        if (queuedThisAccount >= DISCOVERY_LIMIT_PER_ACCOUNT) break;

        // Posts come back newest-first, so the moment one is older than
        // the cutoff, every post after it in this page is older too —
        // safe to stop here rather than just skipping this one post.
        if (discoverSince && post.timestamp && new Date(post.timestamp) < discoverSince) {
          break;
        }

        // Skips plain VIDEO/Reels posts outright — the client posts these
        // often, and there's no product photo to extract from one.
        if (post.media_type !== "IMAGE" && post.media_type !== "CAROUSEL_ALBUM") continue;
        if (collectPostImageUrls(post).length === 0) continue;

        const alreadySeen = await prisma.instagramDraft.findUnique({
          where: { instagramPostId: post.id },
          select: { id: true },
        });
        if (alreadySeen) continue;

        await prisma.instagramDraft.create({
          data: {
            instagramPostId: post.id,
            sourceAccount: account.brand,
            status: "QUEUED",
            permalink: post.permalink,
            originalCaption: post.caption ?? "",
          },
        });
        queued++;
        queuedThisAccount++;
      }
    } catch (err) {
      errors.push(`${account.brand} discovery: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // --- Phase 2: worker loop ---
  const active = await getActiveParser();
  if (!active) {
    errors.push("No AI provider configured yet — set one on the Instagram Drafts page.");
    return { queued, processed, approved, failed, errors };
  }

  const categoriesByBrand = new Map<PrismaBrand, { id: string; label: string }[]>();
  async function categoriesFor(brand: PrismaBrand) {
    const cached = categoriesByBrand.get(brand);
    if (cached) return cached;
    const rows = await prisma.category.findMany({
      where: { brand },
      select: { id: true, name: true, parentId: true },
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    const hasChildren = new Set(rows.filter((r) => r.parentId).map((r) => r.parentId!));
    // Only leaves are offered to the AI — a product should never be filed
    // directly under a parent like "Boys"/"Girls" that exists purely to
    // group its children. Prefixed with the parent's name wherever one
    // exists, so e.g. "Bottoms" under Boys and under Girls are two
    // distinct, matchable labels instead of indistinguishable duplicates
    // that the first-match .find() below could resolve to the wrong one.
    const leaves = rows
      .filter((r) => !hasChildren.has(r.id))
      .map((r) => {
        const parent = r.parentId ? byId.get(r.parentId) : null;
        return { id: r.id, label: parent ? `${parent.name} > ${r.name}` : r.name };
      });
    categoriesByBrand.set(brand, leaves);
    return leaves;
  }

  const startTime = Date.now();

  while (Date.now() - startTime < WORKER_TIME_BUDGET_MS) {
    // Re-checked every iteration, not just once at the top — a pause
    // toggled mid-run takes effect within roughly one item's processing
    // time instead of only on the next scheduled run.
    if (await isInstagramSyncPaused()) {
      errors.push("Sync was paused mid-run.");
      break;
    }

    const staleThreshold = new Date(Date.now() - STALE_CLAIM_MS);
    const candidate = await prisma.instagramDraft.findFirst({
      where: {
        status: "QUEUED",
        OR: [{ processingStartedAt: null }, { processingStartedAt: { lt: staleThreshold } }],
      },
      orderBy: { createdAt: "asc" },
    });
    if (!candidate) break; // queue empty

    // Atomic claim — Postgres's row locking makes this race-safe even if
    // another invocation is running concurrently: only one updateMany can
    // actually match this exact where clause and win.
    const claim = await prisma.instagramDraft.updateMany({
      where: {
        id: candidate.id,
        status: "QUEUED",
        OR: [{ processingStartedAt: null }, { processingStartedAt: { lt: staleThreshold } }],
      },
      data: { processingStartedAt: new Date() },
    });
    if (claim.count === 0) continue; // lost the race, try the next candidate

    try {
      // Re-fetched fresh, not trusted from discovery time — media_url is
      // a signed, expiring CDN link, and this post could have sat queued
      // for a while if the backlog was large.
      const post = await fetchInstagramPost(token, candidate.instagramPostId);
      const sourceImageUrls = collectPostImageUrls(post);
      if (sourceImageUrls.length === 0) {
        throw new Error("No image found on this post anymore.");
      }

      const imageBuffers = await Promise.all(sourceImageUrls.map(downloadImage));
      const categories = await categoriesFor(candidate.sourceAccount);

      // The AI call gets a shrunk, throwaway copy — vision tokens scale
      // with image size, and reading a price tag or a garment's color
      // doesn't need Instagram's full-resolution upload. The original
      // imageBuffers (unshrunk) are what get uploaded to R2 below and
      // shown on the live product page.
      const aiImageBuffers = await Promise.all(imageBuffers.map(shrinkForAi));

      const parsed = await withTimeout(
        active.parser.parseProduct({
          images: aiImageBuffers,
          caption: post.caption ?? candidate.originalCaption,
          storeLabel: brandLabel(fromPrismaBrand(candidate.sourceAccount)),
          categoryOptions: categories.map((c) => c.label),
        }),
        AI_CALL_TIMEOUT_MS,
        `${candidate.sourceAccount} post ${candidate.instagramPostId}`,
      );

      // Exact match only — the prompt requires the AI to copy a name
      // verbatim from the list it was given, so anything else (a typo,
      // an invented name) is treated as no match rather than guessed at.
      const suggestedCategoryId = categories.find((c) => c.label === parsed.categoryName)?.id ?? null;

      // Uploaded to R2 now, not at approval time — so the review queue
      // never shows a broken image if Instagram's own CDN link expires
      // before someone gets to it.
      const r2Urls = await Promise.all(
        imageBuffers.map((buffer, index) =>
          uploadR2Object(`instagram-drafts/${candidate.instagramPostId}-${index}.jpg`, buffer, "image/jpeg"),
        ),
      );

      const title = stripDashes(parsed.title);
      const description = stripDashes(parsed.description);

      await prisma.instagramDraft.update({
        where: { id: candidate.id },
        data: {
          status: "PENDING",
          aiProviderUsed: active.provider,
          images: r2Urls,
          title,
          brandName: parsed.brandName,
          description,
          detectedPriceGhs: parsed.detectedPriceGhs,
          sizes: parsed.sizes,
          color: parsed.color,
          suggestedCategoryId,
          missingFields: parsed.missingFields,
          processingStartedAt: null,
        },
      });
      processed++;

      // Only a draft that cleared every confidence check gets to skip
      // the review queue — a detected price, a matched category, at
      // least one size, and nothing else the AI itself flagged as
      // uncertain. This never lowers that bar, it only skips the click
      // for the ones that already passed it. Checked fresh per draft
      // (not cached for the whole run) so toggling it off mid-run stops
      // new auto-approvals within about one item's processing time.
      const confidentEnough =
        Boolean(suggestedCategoryId) &&
        Boolean(parsed.detectedPriceGhs) &&
        parsed.sizes.length > 0 &&
        parsed.missingFields.length === 0;

      if (confidentEnough && (await isInstagramAutoApproveEnabled())) {
        const approval = await approveInstagramDraftInternal(candidate.id, {
          title,
          brandName: parsed.brandName ?? "",
          description,
          categoryId: suggestedCategoryId!,
          priceGhs: parsed.detectedPriceGhs,
          sizes: parsed.sizes,
          color: parsed.color ?? "",
          stock: AUTO_APPROVE_STOCK_PER_VARIANT,
        });
        if (approval.error) {
          errors.push(
            `${candidate.sourceAccount} post ${candidate.instagramPostId}: auto-approve failed: ${approval.error}`,
          );
        } else {
          approved++;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const nextAttempts = candidate.attempts + 1;
      if (nextAttempts >= MAX_ATTEMPTS) {
        await prisma.instagramDraft.update({
          where: { id: candidate.id },
          data: { status: "FAILED", attempts: nextAttempts, lastError: message, processingStartedAt: null },
        });
        failed++;
      } else {
        await prisma.instagramDraft.update({
          where: { id: candidate.id },
          data: { attempts: nextAttempts, lastError: message, processingStartedAt: null },
        });
      }
      errors.push(`${candidate.sourceAccount} post ${candidate.instagramPostId}: ${message}`);
    }
  }

  return { queued, processed, approved, failed, errors };
}
