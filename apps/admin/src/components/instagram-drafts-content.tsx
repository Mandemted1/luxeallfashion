"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ExternalLink, Loader2, Pause, Play, RefreshCw } from "lucide-react";
import {
  approveInstagramDraft,
  declineInstagramDraft,
  pauseInstagramSync,
  removeAiSettings,
  resumeInstagramSync,
  retryInstagramDraft,
  saveAiSettings,
  setAutoApprove,
  syncInstagramDraftsNow,
} from "@/app/(app)/instagram-drafts/actions";
import type { AdminCategoryItem } from "@/components/categories-content";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BrandTabs } from "@/components/brand-tabs";
import { brandLabel, type Brand, type BrandFilter } from "@/lib/brands";
import type { AiIntegrationStatus } from "@/lib/ai-providers";

export interface AdminInstagramDraft {
  id: string;
  sourceAccount: Brand;
  status: "QUEUED" | "PENDING" | "APPROVED" | "REJECTED" | "FAILED";
  aiProviderUsed: "GEMINI" | "OPENAI" | "ANTHROPIC" | null;
  permalink: string | null;
  originalCaption: string;
  images: string[];
  title: string;
  brandName: string | null;
  description: string;
  detectedPriceGhs: number | null;
  sizes: string[];
  color: string | null;
  suggestedCategoryId: string | null;
  missingFields: string[];
  attempts: number;
  lastError: string | null;
  createdAt: string;
  productSlug: string | null;
}

type StatusFilter = "QUEUED" | "PENDING" | "APPROVED" | "REJECTED" | "ALL";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "QUEUED", label: "Queued" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Declined" },
  { value: "ALL", label: "All" },
];

const labelClass = "mb-1 block text-[10px] font-medium tracking-[0.1em] text-black/50 uppercase";

interface EditForm {
  title: string;
  brandName: string;
  description: string;
  categoryId: string;
  priceGhs: string; // cedis, as typed
  sizes: string; // comma-separated, as typed
  color: string;
  stock: string;
}

function initialFormFor(draft: AdminInstagramDraft): EditForm {
  return {
    title: draft.title,
    brandName: draft.brandName ?? "",
    description: draft.description,
    categoryId: draft.suggestedCategoryId ?? "",
    priceGhs: draft.detectedPriceGhs ? String(draft.detectedPriceGhs / 100) : "",
    sizes: draft.sizes.join(", "),
    color: draft.color ?? "",
    stock: "0",
  };
}

// Same remount-on-filter-change trick used by Products/Homepage — a
// client-side nav between status tabs only changes the URL's query
// string, so without this the inner component wouldn't remount and
// per-draft edit state from the previous filter would linger.
export function InstagramDraftsContent(props: {
  drafts: AdminInstagramDraft[];
  categories: AdminCategoryItem[];
  status: StatusFilter;
  statusCounts: Record<StatusFilter, number>;
  brand: BrandFilter;
  aiStatus: AiIntegrationStatus;
}) {
  const searchParams = useSearchParams();
  return <InstagramDraftsInner key={searchParams.toString()} {...props} />;
}

function InstagramDraftsInner({
  drafts,
  categories,
  status,
  statusCounts,
  brand,
  aiStatus,
}: {
  drafts: AdminInstagramDraft[];
  categories: AdminCategoryItem[];
  status: StatusFilter;
  statusCounts: Record<StatusFilter, number>;
  brand: BrandFilter;
  aiStatus: AiIntegrationStatus;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [forms, setForms] = useState<Record<string, EditForm>>(() =>
    Object.fromEntries(drafts.map((d) => [d.id, initialFormFor(d)])),
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [cardSuccess, setCardSuccess] = useState<Record<string, string>>({});

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [pausing, setPausing] = useState(false);
  const [autoApproveSaving, setAutoApproveSaving] = useState(false);
  const [confirmAutoApprove, setConfirmAutoApprove] = useState(false);
  const [autoApproveError, setAutoApproveError] = useState("");

  // Drafts move from Queued to Pending one at a time as the worker loop
  // claims and processes them, not all at once — and that can keep
  // happening in the background (the GitHub Actions cron ticks every 5
  // minutes) even when nobody's sitting on this page clicking Sync. So
  // this polls whenever there's anything queued at all, not just while
  // this tab's own button shows "syncing" — otherwise a draft the cron
  // finishes processing would just sit stale until a manual refresh.
  // Skipped entirely while paused — nothing's going to change until
  // someone resumes it, so there's nothing worth polling for.
  useEffect(() => {
    if (aiStatus.isPaused) return;
    if (!syncing && statusCounts.QUEUED === 0) return;
    const interval = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(interval);
  }, [syncing, statusCounts.QUEUED, aiStatus.isPaused, router]);

  function updateForm(id: string, patch: Partial<EditForm>) {
    setForms((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  }

  function goToStatus(next: StatusFilter) {
    const params = new URLSearchParams();
    if (next !== "PENDING") params.set("status", next.toLowerCase());
    if (brand !== "all") params.set("brand", brand);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function goToBrand(next: BrandFilter) {
    const params = new URLSearchParams();
    if (status !== "PENDING") params.set("status", status.toLowerCase());
    if (next !== "all") params.set("brand", next);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  // Dispatches the GitHub Actions workflow and returns almost
  // immediately — it doesn't wait for the sync to finish, since that can
  // now take several minutes (no more Vercel duration limit to fit
  // inside). The existing polling below picks up real progress as
  // drafts actually move through the queue over the next few minutes.
  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncInstagramDraftsNow();
      if (result.error) {
        setSyncResult(result.error);
      } else {
        setSyncResult("Sync started. New drafts will appear here over the next few minutes.");
      }
    } catch {
      setSyncResult("Couldn't start the sync. Try again.");
    } finally {
      setSyncing(false);
    }
  }

  async function handlePause() {
    setPausing(true);
    try {
      await pauseInstagramSync();
      router.refresh();
    } finally {
      setPausing(false);
    }
  }

  async function handleResume() {
    setPausing(true);
    try {
      await resumeInstagramSync();
      router.refresh();
    } finally {
      setPausing(false);
    }
  }

  async function handleSetAutoApprove(enabled: boolean) {
    setAutoApproveSaving(true);
    setAutoApproveError("");
    try {
      const result = await setAutoApprove(enabled);
      if (result.error) {
        setAutoApproveError(result.error);
        return;
      }
      setConfirmAutoApprove(false);
      router.refresh();
    } catch {
      setAutoApproveError("Couldn't update auto-approve. Try again.");
    } finally {
      setAutoApproveSaving(false);
    }
  }

  async function handleRetry(draftId: string) {
    setBusyId(draftId);
    try {
      await retryInstagramDraft(draftId);
      router.refresh();
    } catch {
      setCardErrors((e) => ({ ...e, [draftId]: "Couldn't retry. Try again." }));
    } finally {
      setBusyId(null);
    }
  }

  async function handleApprove(draft: AdminInstagramDraft) {
    const form = forms[draft.id];
    setBusyId(draft.id);
    setCardErrors((e) => ({ ...e, [draft.id]: "" }));
    try {
      const result = await approveInstagramDraft(draft.id, {
        title: form.title,
        brandName: form.brandName,
        description: form.description,
        categoryId: form.categoryId,
        priceGhs: form.priceGhs ? Math.round(Number(form.priceGhs) * 100) : null,
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        color: form.color,
        stock: Number(form.stock) || 0,
      });
      if (result.error) {
        setCardErrors((e) => ({ ...e, [draft.id]: result.error! }));
        return;
      }
      setCardSuccess((s) => ({
        ...s,
        [draft.id]: result.live
          ? "Approved, live on the storefront."
          : "Approved, add a variant to make it live.",
      }));
      router.refresh();
    } catch {
      setCardErrors((e) => ({ ...e, [draft.id]: "Couldn't approve. Try again." }));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(draftId: string) {
    setBusyId(draftId);
    try {
      await declineInstagramDraft(draftId);
      router.refresh();
    } catch {
      setCardErrors((e) => ({ ...e, [draftId]: "Couldn't decline. Try again." }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Instagram Drafts</h1>
          <p className="mt-1 text-sm text-black/50">
            Review posts pulled in from Instagram before they go live.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {aiStatus.isPaused ? (
            <Button onClick={handleResume} disabled={pausing}>
              <Play />
              {pausing ? "Resuming..." : "Resume Sync"}
            </Button>
          ) : (
            <>
              <Button onClick={handleSync} disabled={syncing}>
                <RefreshCw className={syncing ? "animate-spin" : ""} />
                {syncing ? "Starting..." : "Sync Now"}
              </Button>
              <Button variant="ghost" onClick={handlePause} disabled={pausing}>
                <Pause />
                {pausing ? "Pausing..." : "Pause"}
              </Button>
            </>
          )}
        </div>
      </div>
      {aiStatus.isPaused && (
        <p className="mt-2 text-xs text-amber-700">
          Sync is paused. Nothing will run automatically or on demand until resumed.
        </p>
      )}
      {syncResult && <p className="mt-2 text-xs text-black/60">{syncResult}</p>}

      <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-black">Auto-approve confident drafts</p>
          <p className="text-xs text-black/50">
            Skips manual review and publishes live automatically, only for drafts where price,
            category, and sizes were all detected.
          </p>
          {autoApproveError && <p className="mt-1 text-xs text-red-600">{autoApproveError}</p>}
        </div>
        <Switch
          checked={aiStatus.autoApprove}
          disabled={autoApproveSaving}
          onCheckedChange={(next) => {
            if (next) {
              setConfirmAutoApprove(true);
            } else {
              handleSetAutoApprove(false);
            }
          }}
        />
      </div>
      <AlertDialog open={confirmAutoApprove} onOpenChange={setConfirmAutoApprove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Turn on auto-approve?</AlertDialogTitle>
            <AlertDialogDescription>
              Confident drafts (price, category, and sizes all detected) will be published
              live automatically with no review, with a default stock of 5 per size. Anything
              missing one of those will still wait for manual review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleSetAutoApprove(true);
              }}
              disabled={autoApproveSaving}
            >
              {autoApproveSaving ? "Turning on..." : "Turn on"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AiSettingsPanel aiStatus={aiStatus} />

      <div className="mt-6">
        <BrandTabs value={brand} onChange={goToBrand} />
      </div>

      <Tabs value={status} onValueChange={(next) => goToStatus(next as StatusFilter)} className="mt-8">
        <TabsList variant="line">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none"
            >
              {tab.label} <span className="ml-1 opacity-60">{statusCounts[tab.value]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {drafts.length === 0 ? (
        <p className="mt-10 text-center text-sm text-black/40">Nothing here.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {drafts.map((draft) => {
            const form = forms[draft.id];
            const categoriesForStore = categories.filter((c) => c.brand === draft.sourceAccount);
            // Grouped by parent (same pattern as the Products filter) so
            // e.g. "Bottoms" under Boys and under Girls render as two
            // distinct, labeled options instead of two identical-looking
            // entries with no way to tell them apart.
            const topLevelCategories = categoriesForStore.filter((c) => !c.parentId);
            const childCategoriesByParent = categoriesForStore.reduce<Record<string, AdminCategoryItem[]>>(
              (acc, c) => {
                if (!c.parentId) return acc;
                (acc[c.parentId] ??= []).push(c);
                return acc;
              },
              {},
            );
            const isBusy = busyId === draft.id;
            const error = cardErrors[draft.id];
            const success = cardSuccess[draft.id];

            const queuedOrFailed = draft.status === "QUEUED" || draft.status === "FAILED";

            return (
              <Card key={draft.id} className="overflow-hidden py-0">
                {draft.images.length > 0 && (
                  <div className="flex gap-1">
                    {draft.images.slice(0, 3).map((src, index) => (
                      <div
                        key={src}
                        className={`relative aspect-[4/5] flex-1 overflow-hidden bg-stone-100 ${
                          index === 0 ? "" : "max-w-[25%]"
                        }`}
                      >
                        <Image src={src} alt="" fill sizes="200px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <CardHeader className="pt-4">
                  <p className="text-[10px] font-medium tracking-[0.15em] text-black/40 uppercase">
                    {brandLabel(draft.sourceAccount)}
                    {draft.aiProviderUsed && <> · {draft.aiProviderUsed}</>} ·{" "}
                    {new Date(draft.createdAt).toLocaleDateString()}
                    {draft.permalink && (
                      <>
                        {" "}
                        ·{" "}
                        <a
                          href={draft.permalink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-black"
                        >
                          Source
                          <ExternalLink className="size-2.5" />
                        </a>
                      </>
                    )}
                  </p>
                </CardHeader>

                <CardContent>
                  {queuedOrFailed ? (
                    <div>
                      <p className="line-clamp-3 text-sm text-black/70">
                        {draft.originalCaption || "(no caption)"}
                      </p>
                      {draft.status === "QUEUED" ? (
                        <Badge
                          variant="outline"
                          className="mt-2 flex w-fit items-center gap-1 border-transparent bg-stone-100 text-[10px] tracking-[0.1em] uppercase"
                        >
                          <Loader2 className="size-2.5 animate-spin" />
                          Queued
                        </Badge>
                      ) : (
                        <>
                          <Badge
                            variant="outline"
                            className="mt-2 border-transparent bg-red-50 text-[10px] tracking-[0.1em] text-red-700 uppercase"
                          >
                            Failed after {draft.attempts} attempts
                          </Badge>
                          {draft.lastError && (
                            <p className="mt-1.5 text-[11px] text-red-600">{draft.lastError}</p>
                          )}
                        </>
                      )}
                      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
                    </div>
                  ) : draft.status !== "PENDING" ? (
                    <div>
                      <p className="text-lg font-semibold">{draft.title}</p>
                      <Badge variant="outline" className="mt-1 border-transparent bg-stone-100 text-[10px] tracking-[0.1em] uppercase">
                        {draft.status === "APPROVED" ? "Approved" : "Declined"}
                      </Badge>
                      {draft.productSlug && (
                        <Link
                          href={`/products/${draft.productSlug}`}
                          className="mt-2 block text-xs underline underline-offset-2 hover:text-black"
                        >
                          View Product →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className={labelClass}>Title</label>
                        <Input
                          value={form.title}
                          onChange={(e) => updateForm(draft.id, { title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Brand Name (optional)</label>
                        <Input
                          value={form.brandName}
                          onChange={(e) => updateForm(draft.id, { brandName: e.target.value })}
                          placeholder="ZARA, Nike, Reiss..."
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Category</label>
                        <Select
                          value={form.categoryId}
                          onValueChange={(next) => updateForm(draft.id, { categoryId: next })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {topLevelCategories.map((c) => {
                              const children = childCategoriesByParent[c.id] ?? [];
                              if (children.length === 0) {
                                return (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                  </SelectItem>
                                );
                              }
                              return (
                                <SelectGroup key={c.id}>
                                  <SelectLabel>{c.name}</SelectLabel>
                                  {children.map((child) => (
                                    <SelectItem key={child.id} value={child.id}>
                                      {child.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className={labelClass}>Description</label>
                        <Textarea
                          value={form.description}
                          onChange={(e) => updateForm(draft.id, { description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Price (GHS)</label>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.priceGhs}
                            onChange={(e) => updateForm(draft.id, { priceGhs: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Stock</label>
                          <Input
                            type="number"
                            min={0}
                            value={form.stock}
                            onChange={(e) => updateForm(draft.id, { stock: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Sizes</label>
                          <Input
                            value={form.sizes}
                            onChange={(e) => updateForm(draft.id, { sizes: e.target.value })}
                            placeholder="S, M, L"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Color</label>
                          <Input
                            value={form.color}
                            onChange={(e) => updateForm(draft.id, { color: e.target.value })}
                          />
                        </div>
                      </div>

                      {draft.missingFields.length > 0 && (
                        <p className="text-[11px] text-amber-700">
                          AI couldn&apos;t confidently detect: {draft.missingFields.join(", ")}
                        </p>
                      )}
                      {!form.priceGhs || form.sizes.split(",").map((s) => s.trim()).filter(Boolean).length === 0 ? (
                        <p className="text-[11px] text-black/40">
                          Add a price and at least one size to go live immediately on approval,
                          otherwise it&apos;s still created, just inactive until a variant is added.
                        </p>
                      ) : null}

                      {error && <p className="text-xs text-red-600">{error}</p>}
                      {success && <p className="text-xs text-emerald-700">{success}</p>}
                    </div>
                  )}
                </CardContent>

                {draft.status === "PENDING" && !success && (
                  <CardFooter className="flex items-center gap-4 border-t border-black/10 py-4">
                    <Button onClick={() => handleApprove(draft)} disabled={isBusy}>
                      {isBusy ? "Working..." : "Approve"}
                    </Button>
                    <Button variant="ghost" onClick={() => handleDecline(draft.id)} disabled={isBusy}>
                      Decline
                    </Button>
                  </CardFooter>
                )}

                {draft.status === "FAILED" && (
                  <CardFooter className="flex items-center gap-4 border-t border-black/10 py-4">
                    <Button onClick={() => handleRetry(draft.id)} disabled={isBusy}>
                      {isBusy ? "Working..." : "Retry"}
                    </Button>
                    <Button variant="ghost" onClick={() => handleDecline(draft.id)} disabled={isBusy}>
                      Decline
                    </Button>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AiSettingsPanel({ aiStatus }: { aiStatus: AiIntegrationStatus }) {
  const router = useRouter();
  const [open, setOpen] = useState(!aiStatus.hasApiKey);
  const [provider, setProvider] = useState(aiStatus.provider);
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const result = await saveAiSettings({ provider, apiKey });
      if (result.error) {
        setError(result.error);
        return;
      }
      setApiKey("");
      setSaved(true);
      router.refresh();
    } catch {
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    setError("");
    try {
      const result = await removeAiSettings();
      if (result.error) {
        setError(result.error);
        return;
      }
      setConfirmRemove(false);
      router.refresh();
    } catch {
      setError("Couldn't remove. Try again.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <Card className="mt-6 gap-0 py-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium tracking-[0.1em] text-black/60 uppercase"
      >
        AI Provider: {aiStatus.provider} ({aiStatus.hasApiKey ? "key set" : "no key set"})
        <ChevronDown className={`size-3.5 text-black/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-black/10 px-4 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            {aiStatus.hasApiKey ? (
              <p className="text-xs text-black/60">
                Currently active: <span className="font-medium text-black">{aiStatus.provider}</span>
                {aiStatus.updatedAt && (
                  <>, key saved {new Date(aiStatus.updatedAt).toLocaleDateString()}</>
                )}
              </p>
            ) : (
              <p className="text-xs text-black/40">No key saved yet. Instagram sync won&apos;t run until one is.</p>
            )}
            {aiStatus.hasApiKey && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmRemove(true)}
                className="text-red-600 hover:text-red-700"
              >
                Remove key
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className={labelClass}>Provider</label>
              <Select
                value={provider}
                onValueChange={(next) => setProvider(next as AiIntegrationStatus["provider"])}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GEMINI">Gemini</SelectItem>
                  <SelectItem value="OPENAI">OpenAI</SelectItem>
                  <SelectItem value="ANTHROPIC">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[220px] flex-1">
              <label className={labelClass}>API Key</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={aiStatus.hasApiKey ? "Enter a new key to replace the current one" : "Enter API key"}
              />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {saved && <p className="mt-2 text-xs text-emerald-700">Saved.</p>}
        </div>
      )}
      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove the {aiStatus.provider} key?</AlertDialogTitle>
            <AlertDialogDescription>
              Instagram sync won&apos;t be able to parse new posts until a key is saved again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleRemove();
              }}
              disabled={removing}
            >
              {removing ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
