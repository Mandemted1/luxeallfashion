"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import {
  addSocialLink,
  removeSocialLink,
  toggleSocialLink,
  updateHomepageContent,
  updateHomepageTile,
  updatePromoBanner,
} from "@/app/(app)/homepage/actions";
import { FileUploadInput } from "@/components/file-upload-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { brandLabel } from "@/lib/brands";
import {
  socialPlatforms,
  type HeroMode,
  type HomepageContent,
  type HomepageTile,
  type PromoBannerConfig,
  type SocialLink,
  type SocialPlatform,
} from "@/lib/homepage-content";

const labelClass = "text-xs font-medium tracking-[0.1em] text-black/50 uppercase";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function ActiveSwitch({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={active} onCheckedChange={onToggle} />
      <span className={`text-xs font-medium uppercase tracking-[0.06em] ${active ? "text-emerald-700" : "text-stone-500"}`}>
        {active ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

function TileEditor({
  tile,
  error,
  onChange,
  onBlurSave,
  onImageUploaded,
}: {
  tile: HomepageTile;
  error?: string;
  onChange: (patch: Partial<HomepageTile>) => void;
  onBlurSave: () => void;
  onImageUploaded: (url: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
          {tile.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element -- R2 URLs aren't in next/image's remotePatterns for this component's plain preview use */}
          <img src={tile.imageUrl} alt={tile.title} className="h-full w-full object-cover" />
        </div>
        <FileUploadInput folder="homepage" label="Replace Image" onUploaded={onImageUploaded} />
        <Field label="Title">
          <Input value={tile.title} onChange={(e) => onChange({ title: e.target.value })} onBlur={onBlurSave} />
        </Field>
        <Field label="Button Label">
          <Input value={tile.ctaLabel} onChange={(e) => onChange({ ctaLabel: e.target.value })} onBlur={onBlurSave} />
        </Field>
        <Field label="Links To">
          <Input value={tile.href} onChange={(e) => onChange({ href: e.target.value })} onBlur={onBlurSave} />
        </Field>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}

// Background image for one slide of the storefront's homepage hero
// slider. Title/button/link intentionally aren't editable here — they're
// the brand's fixed identity and come straight from the tile below.
function HeroSlideImageEditor({
  tile,
  onImageUploaded,
}: {
  tile: HomepageTile;
  onImageUploaded: (url: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
          {tile.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-stone-100">
          {tile.heroImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- R2 URLs aren't in next/image's remotePatterns for this component's plain preview use
            <img src={tile.heroImageUrl} alt={tile.title} className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[11px] tracking-[0.15em] text-stone-400 uppercase">
              No image yet
            </div>
          )}
        </div>
        <FileUploadInput folder="homepage" label="Replace Image" onUploaded={onImageUploaded} />
      </CardContent>
    </Card>
  );
}

function HeroVideoEditor({
  heroVideoUrl,
  heroCtaLabel,
  heroCtaHref,
  error,
  onVideoUploaded,
  onFieldChange,
  onFieldBlurSave,
}: {
  heroVideoUrl: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  error?: string;
  onVideoUploaded: (url: string) => void;
  onFieldChange: (patch: { heroCtaLabel?: string; heroCtaHref?: string }) => void;
  onFieldBlurSave: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        {heroVideoUrl ? (
          <video key={heroVideoUrl} src={heroVideoUrl} controls className="max-w-sm rounded-lg bg-stone-100" />
        ) : (
          <div className="flex aspect-video max-w-sm items-center justify-center rounded-lg bg-stone-100 text-[11px] tracking-[0.15em] text-stone-400 uppercase">
            No video yet
          </div>
        )}
        <div className="max-w-sm">
          <FileUploadInput folder="homepage" accept="video/*" label="Replace Video" onUploaded={onVideoUploaded} />
        </div>
        <div className="grid max-w-sm grid-cols-1 gap-4">
          <Field label="Button Label">
            <Input
              value={heroCtaLabel}
              onChange={(e) => onFieldChange({ heroCtaLabel: e.target.value })}
              onBlur={onFieldBlurSave}
            />
          </Field>
          <Field label="Links To">
            <Input
              value={heroCtaHref}
              onChange={(e) => onFieldChange({ heroCtaHref: e.target.value })}
              onBlur={onFieldBlurSave}
            />
          </Field>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function SocialLinksEditor({
  links,
  onAdd,
  onToggle,
  onRemove,
}: {
  links: SocialLink[];
  onAdd: (platform: SocialPlatform, url: string) => Promise<{ error?: string }>;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const availablePlatforms = socialPlatforms.filter(
    (platform) => !links.some((link) => link.platform === platform),
  );
  const [platform, setPlatform] = useState<SocialPlatform | "">(availablePlatforms[0] ?? "");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!platform || !url.trim()) return;
    setSubmitting(true);
    const result = await onAdd(platform, url.trim());
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError("");
    setUrl("");
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Social Media</CardTitle>
        <p className="text-xs text-black/40">
          Shown in the site footer. Add as few or as many as you like, and toggle one off without
          deleting it.
        </p>
      </CardHeader>
      <CardContent>
        {links.length > 0 && (
          <ul className="flex flex-col divide-y divide-black/5">
            {links.map((link) => (
              <li key={link.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                <p className="w-24 shrink-0 text-sm font-medium">{link.platform}</p>
                <p className="min-w-[200px] flex-1 truncate text-sm text-black/60">{link.url}</p>
                <ActiveSwitch active={link.isEnabled} onToggle={() => onToggle(link.id)} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemove(link.id)}
                  aria-label={`Remove ${link.platform}`}
                  className="shrink-0 text-black/40 hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {availablePlatforms.length > 0 && (
          <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-3 border-t border-black/10 pt-4">
            <Field label="Platform">
              <Select value={platform} onValueChange={(v) => setPlatform(v as SocialPlatform)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availablePlatforms.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Profile URL">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-64"
              />
            </Field>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add"}
            </Button>
          </form>
        )}
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}

// Thin wrapper so the form below can be remounted (via `key`) whenever the
// server's copy of the content changes — the standard React way to reset
// local draft state from a prop change without an effect. Each save
// triggers router.refresh(), which re-fetches `content` from the server
// and, since it's a new object, changes the key and remounts the form
// with the fresh values as its new starting draft.
export function HomepageContentEditor({ content }: { content: HomepageContent }) {
  return <HomepageEditorForm key={JSON.stringify(content)} content={content} />;
}

function HomepageEditorForm({ content }: { content: HomepageContent }) {
  const router = useRouter();
  const [draft, setDraft] = useState<HomepageContent>(content);
  const [tileErrors, setTileErrors] = useState<Partial<Record<HomepageTile["brand"], string>>>({});
  const [promoBannerErrors, setPromoBannerErrors] = useState<
    Partial<Record<PromoBannerConfig["brand"], string>>
  >({});
  const [heroFieldsError, setHeroFieldsError] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [popupError, setPopupError] = useState("");

  function updateTileLocal(brand: HomepageTile["brand"], patch: Partial<HomepageTile>) {
    setDraft((current) => ({
      ...current,
      tiles: current.tiles.map((tile) => (tile.brand === brand ? { ...tile, ...patch } : tile)),
    }));
  }

  async function saveTile(brand: HomepageTile["brand"], patch: Partial<HomepageTile>) {
    const result = await updateHomepageTile(brand, patch);
    setTileErrors((current) => ({ ...current, [brand]: result.error ?? "" }));
    if (result.error) return;
    router.refresh();
  }

  function updatePromoBannerLocal(brand: PromoBannerConfig["brand"], patch: Partial<PromoBannerConfig>) {
    setDraft((current) => ({
      ...current,
      promoBanners: current.promoBanners.map((banner) =>
        banner.brand === brand ? { ...banner, ...patch } : banner,
      ),
    }));
  }

  // Doesn't apply patch to local state until the save actually succeeds —
  // the isActive toggle used to flip itself on optimistically even when
  // the server rejected the change (e.g. no message set), leaving the
  // button showing "Active" for a banner that was still off underneath.
  async function savePromoBanner(brand: PromoBannerConfig["brand"], patch: Partial<PromoBannerConfig>) {
    const result = await updatePromoBanner(brand, patch);
    setPromoBannerErrors((current) => ({ ...current, [brand]: result.error ?? "" }));
    if (result.error) return;
    updatePromoBannerLocal(brand, patch);
    router.refresh();
  }

  async function setHeroMode(heroMode: HeroMode) {
    setDraft((current) => ({ ...current, heroMode }));
    await updateHomepageContent({ heroMode });
    router.refresh();
  }

  async function saveHeroFields(patch: { heroCtaLabel: string; heroCtaHref: string }) {
    const result = await updateHomepageContent(patch);
    setHeroFieldsError(result.error ?? "");
    if (result.error) return;
    router.refresh();
  }

  async function saveNewsletterHeading(newsletterHeading: string) {
    const result = await updateHomepageContent({ newsletterHeading });
    setNewsletterError(result.error ?? "");
    if (result.error) return;
    router.refresh();
  }

  async function savePopupField(patch: { popupHeading?: string; popupBody?: string }) {
    const result = await updateHomepageContent(patch);
    setPopupError(result.error ?? "");
    if (result.error) return;
    router.refresh();
  }

  async function handleAddSocialLink(platform: SocialPlatform, url: string) {
    const result = await addSocialLink(platform, url);
    if (result.error) return result;
    router.refresh();
    return result;
  }

  async function handleToggleSocialLink(id: string) {
    await toggleSocialLink(id);
    router.refresh();
  }

  async function handleRemoveSocialLink(id: string) {
    await removeSocialLink(id);
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Homepage</h1>
      <p className="mt-1 text-sm text-black/50">Changes here go live on the storefront immediately.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Promo Banners</CardTitle>
          <p className="text-xs text-black/40">
            The thin strip at the top of each store&apos;s own page, great for a seasonal sale or a
            discount code callout.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y divide-black/5">
            {draft.promoBanners.map((banner) => (
              <li key={banner.brand} className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0">
                <p className="w-36 shrink-0 text-sm font-medium">{brandLabel(banner.brand)}</p>
                <Input
                  value={banner.message}
                  onChange={(e) => updatePromoBannerLocal(banner.brand, { message: e.target.value })}
                  onBlur={() => savePromoBanner(banner.brand, { message: banner.message })}
                  placeholder="Promo message"
                  className="min-w-[240px] flex-1"
                />
                <ActiveSwitch
                  active={banner.isActive}
                  onToggle={() => savePromoBanner(banner.brand, { isActive: !banner.isActive })}
                />
                {promoBannerErrors[banner.brand] && (
                  <p className="w-full text-xs text-red-600">{promoBannerErrors[banner.brand]}</p>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={labelClass}>Hero Section</p>
            <p className="mt-1 text-xs text-black/40">
              The full-screen banner at the top of the homepage. A single video, or a slideshow with
              one slide per store.
            </p>
          </div>
          <ToggleGroup
            type="single"
            value={draft.heroMode}
            onValueChange={(value) => value && setHeroMode(value as HeroMode)}
          >
            <ToggleGroupItem value="VIDEO">Video</ToggleGroupItem>
            <ToggleGroupItem value="SLIDER">Slideshow</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {draft.heroMode === "VIDEO" ? (
          <div className="mt-4">
            <HeroVideoEditor
              heroVideoUrl={draft.heroVideoUrl}
              heroCtaLabel={draft.heroCtaLabel}
              heroCtaHref={draft.heroCtaHref}
              error={heroFieldsError}
              onVideoUploaded={async (url) => {
                setDraft((current) => ({ ...current, heroVideoUrl: url }));
                await updateHomepageContent({ heroVideoUrl: url });
                router.refresh();
              }}
              onFieldChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
              onFieldBlurSave={() =>
                saveHeroFields({ heroCtaLabel: draft.heroCtaLabel, heroCtaHref: draft.heroCtaHref })
              }
            />
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-xs text-black/40">
              Only the image can be changed here; the name and shop button are fixed to each
              store&apos;s identity.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {draft.tiles.map((tile) => (
                <HeroSlideImageEditor
                  key={tile.brand}
                  tile={tile}
                  onImageUploaded={(url) => {
                    updateTileLocal(tile.brand, { heroImageUrl: url });
                    saveTile(tile.brand, { heroImageUrl: url });
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {draft.tiles.map((tile) => (
          <TileEditor
            key={tile.brand}
            tile={tile}
            error={tileErrors[tile.brand]}
            onChange={(patch) => updateTileLocal(tile.brand, patch)}
            onBlurSave={() => {
              const current = draft.tiles.find((t) => t.brand === tile.brand)!;
              saveTile(tile.brand, {
                title: current.title,
                ctaLabel: current.ctaLabel,
                href: current.href,
              });
            }}
            onImageUploaded={(url) => {
              updateTileLocal(tile.brand, { imageUrl: url });
              saveTile(tile.brand, { imageUrl: url });
            }}
          />
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Newsletter Heading</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            value={draft.newsletterHeading}
            onChange={(e) => setDraft((current) => ({ ...current, newsletterHeading: e.target.value }))}
            onBlur={() => saveNewsletterHeading(draft.newsletterHeading)}
            rows={2}
            className="max-w-2xl"
          />
          {newsletterError && <p className="text-xs text-red-600">{newsletterError}</p>}
          <p className="max-w-xl text-xl leading-tight font-normal text-black/80">
            {draft.newsletterHeading}
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Signup Popup</CardTitle>
          <ActiveSwitch
            active={draft.popupEnabled}
            onToggle={async () => {
              const popupEnabled = !draft.popupEnabled;
              setDraft((current) => ({ ...current, popupEnabled }));
              await updateHomepageContent({ popupEnabled });
              router.refresh();
            }}
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-xs text-black/50">
            Shows once to first-time visitors, a few seconds after they land on the site. Add a
            discount mention here yourself whenever you want to run one. There&apos;s no separate
            discount field, it&apos;s just this text.
          </p>

          <Field label="Heading">
            <Input
              value={draft.popupHeading}
              onChange={(e) => setDraft((current) => ({ ...current, popupHeading: e.target.value }))}
              onBlur={() => savePopupField({ popupHeading: draft.popupHeading })}
              className="max-w-2xl"
            />
          </Field>

          <Field label="Body">
            <Textarea
              value={draft.popupBody}
              onChange={(e) => setDraft((current) => ({ ...current, popupBody: e.target.value }))}
              onBlur={() => savePopupField({ popupBody: draft.popupBody })}
              rows={2}
              className="max-w-2xl"
            />
          </Field>
          {popupError && <p className="text-xs text-red-600">{popupError}</p>}
        </CardContent>
      </Card>

      <SocialLinksEditor
        links={draft.socialLinks}
        onAdd={handleAddSocialLink}
        onToggle={handleToggleSocialLink}
        onRemove={handleRemoveSocialLink}
      />
    </div>
  );
}
