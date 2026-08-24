"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  addSocialLink,
  removeSocialLink,
  toggleSocialLink,
  updateHomepageContent,
  updateHomepageTile,
  updatePromoBanner,
} from "@/app/(app)/homepage/actions";
import { FileUploadInput } from "@/components/file-upload-input";
import { TrashIcon } from "@/components/icons";
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-black/50">
      {label}
      {children}
    </label>
  );
}

const inputClass =
  "border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none";

function TileEditor({
  tile,
  onChange,
  onBlurSave,
  onImageUploaded,
}: {
  tile: HomepageTile;
  onChange: (patch: Partial<HomepageTile>) => void;
  onBlurSave: () => void;
  onImageUploaded: (url: string) => void;
}) {
  return (
    <div className="border border-black/10 bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
        {tile.title}
      </p>
      <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element -- R2 URLs aren't in next/image's remotePatterns for this component's plain preview use */}
        <img src={tile.imageUrl} alt={tile.title} className="h-full w-full object-cover" />
      </div>
      <div className="mt-3">
        <FileUploadInput folder="homepage" label="Replace Image" onUploaded={onImageUploaded} />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <Field label="Title">
          <input
            type="text"
            value={tile.title}
            onChange={(event) => onChange({ title: event.target.value })}
            onBlur={onBlurSave}
            className={inputClass}
          />
        </Field>
        <Field label="Button Label">
          <input
            type="text"
            value={tile.ctaLabel}
            onChange={(event) => onChange({ ctaLabel: event.target.value })}
            onBlur={onBlurSave}
            className={inputClass}
          />
        </Field>
        <Field label="Links To">
          <input
            type="text"
            value={tile.href}
            onChange={(event) => onChange({ href: event.target.value })}
            onBlur={onBlurSave}
            className={inputClass}
          />
        </Field>
      </div>
    </div>
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
    <div className="border border-black/10 bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
        {tile.title}
      </p>
      <div className="relative mt-3 aspect-[9/16] w-full overflow-hidden bg-stone-100">
        {tile.heroImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- R2 URLs aren't in next/image's remotePatterns for this component's plain preview use
          <img src={tile.heroImageUrl} alt={tile.title} className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-[0.15em] text-stone-400">
            No image yet
          </div>
        )}
      </div>
      <div className="mt-3">
        <FileUploadInput folder="homepage" label="Replace Image" onUploaded={onImageUploaded} />
      </div>
    </div>
  );
}

function HeroVideoEditor({
  heroVideoUrl,
  heroCtaLabel,
  heroCtaHref,
  onVideoUploaded,
  onFieldChange,
  onFieldBlurSave,
}: {
  heroVideoUrl: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  onVideoUploaded: (url: string) => void;
  onFieldChange: (patch: { heroCtaLabel?: string; heroCtaHref?: string }) => void;
  onFieldBlurSave: () => void;
}) {
  return (
    <div className="border border-black/10 bg-white p-6">
      {heroVideoUrl ? (
        <video key={heroVideoUrl} src={heroVideoUrl} controls className="max-w-sm bg-stone-100" />
      ) : (
        <div className="flex aspect-video max-w-sm items-center justify-center bg-stone-100 text-[11px] uppercase tracking-[0.15em] text-stone-400">
          No video yet
        </div>
      )}
      <div className="mt-3">
        <FileUploadInput
          folder="homepage"
          accept="video/*"
          label="Replace Video"
          onUploaded={onVideoUploaded}
        />
      </div>
      <div className="mt-4 grid max-w-sm grid-cols-1 gap-3">
        <Field label="Button Label">
          <input
            type="text"
            value={heroCtaLabel}
            onChange={(event) => onFieldChange({ heroCtaLabel: event.target.value })}
            onBlur={onFieldBlurSave}
            className={inputClass}
          />
        </Field>
        <Field label="Links To">
          <input
            type="text"
            value={heroCtaHref}
            onChange={(event) => onFieldChange({ heroCtaHref: event.target.value })}
            onBlur={onFieldBlurSave}
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  );
}

function SocialLinksEditor({
  links,
  onAdd,
  onToggle,
  onRemove,
}: {
  links: SocialLink[];
  onAdd: (platform: SocialPlatform, url: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const availablePlatforms = socialPlatforms.filter(
    (platform) => !links.some((link) => link.platform === platform),
  );
  const [platform, setPlatform] = useState<SocialPlatform | "">(availablePlatforms[0] ?? "");
  const [url, setUrl] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!platform || !url.trim()) return;
    onAdd(platform, url.trim());
    setUrl("");
  }

  return (
    <div className="mt-6 border border-black/10 bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
        Social Media
      </p>
      <p className="mt-1 text-xs text-black/40">
        Shown in the site footer. Add as few or as many as you like, and
        toggle one off without deleting it.
      </p>

      {links.length > 0 && (
        <ul className="mt-4 flex flex-col divide-y divide-black/5">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <p className="w-24 shrink-0 text-sm font-medium">{link.platform}</p>
              <p className="min-w-[200px] flex-1 truncate text-sm text-black/60">
                {link.url}
              </p>
              <button
                type="button"
                onClick={() => onToggle(link.id)}
                className={`shrink-0 px-3 py-2 text-xs font-medium uppercase tracking-[0.06em] ${
                  link.isEnabled
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {link.isEnabled ? "Active" : "Inactive"}
              </button>
              <button
                type="button"
                onClick={() => onRemove(link.id)}
                aria-label={`Remove ${link.platform}`}
                className="shrink-0 p-1.5 text-black/40 hover:text-red-600"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      {availablePlatforms.length > 0 && (
        <form
          onSubmit={submit}
          className="mt-4 flex flex-wrap items-end gap-3 border-t border-black/10 pt-4"
        >
          <Field label="Platform">
            <select
              value={platform}
              onChange={(event) => setPlatform(event.target.value as SocialPlatform)}
              className={inputClass}
            >
              {availablePlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Profile URL">
            <input
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
              className={`w-64 ${inputClass}`}
            />
          </Field>
          <button
            type="submit"
            className="bg-black px-5 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-stone-800"
          >
            Add
          </button>
        </form>
      )}
    </div>
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

  function updateTileLocal(brand: HomepageTile["brand"], patch: Partial<HomepageTile>) {
    setDraft((current) => ({
      ...current,
      tiles: current.tiles.map((tile) => (tile.brand === brand ? { ...tile, ...patch } : tile)),
    }));
  }

  async function saveTile(brand: HomepageTile["brand"], patch: Partial<HomepageTile>) {
    await updateHomepageTile(brand, patch);
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

  async function savePromoBanner(brand: PromoBannerConfig["brand"], patch: Partial<PromoBannerConfig>) {
    await updatePromoBanner(brand, patch);
    router.refresh();
  }

  async function setHeroMode(heroMode: HeroMode) {
    setDraft((current) => ({ ...current, heroMode }));
    await updateHomepageContent({ heroMode });
    router.refresh();
  }

  async function handleAddSocialLink(platform: SocialPlatform, url: string) {
    await addSocialLink(platform, url);
    router.refresh();
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
      <p className="mt-2 text-sm text-black/50">
        Changes here go live on the storefront immediately.
      </p>

      <div className="mt-6 border border-black/10 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
          Promo Banners
        </p>
        <p className="mt-1 text-xs text-black/40">
          The thin strip at the top of each store&apos;s own page, great for a
          seasonal sale or a discount code callout.
        </p>
        <ul className="mt-4 flex flex-col divide-y divide-black/5">
          {draft.promoBanners.map((banner) => (
            <li
              key={banner.brand}
              className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0"
            >
              <p className="w-36 shrink-0 text-sm font-medium">{brandLabel(banner.brand)}</p>
              <input
                type="text"
                value={banner.message}
                onChange={(event) =>
                  updatePromoBannerLocal(banner.brand, { message: event.target.value })
                }
                onBlur={() => savePromoBanner(banner.brand, { message: banner.message })}
                placeholder="Promo message"
                className={`min-w-[240px] flex-1 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => {
                  const isActive = !banner.isActive;
                  updatePromoBannerLocal(banner.brand, { isActive });
                  savePromoBanner(banner.brand, { isActive });
                }}
                className={`shrink-0 px-3 py-2 text-xs font-medium uppercase tracking-[0.06em] ${
                  banner.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {banner.isActive ? "Active" : "Inactive"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
              Hero Section
            </p>
            <p className="mt-1 text-xs text-black/40">
              The full-screen banner at the top of the homepage — a single
              video, or a slideshow with one slide per store.
            </p>
          </div>
          <div className="flex border border-black/15">
            <button
              type="button"
              onClick={() => setHeroMode("VIDEO")}
              className={`px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] transition-colors ${
                draft.heroMode === "VIDEO" ? "bg-black text-white" : "bg-white text-black/50 hover:text-black"
              }`}
            >
              Video
            </button>
            <button
              type="button"
              onClick={() => setHeroMode("SLIDER")}
              className={`px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] transition-colors ${
                draft.heroMode === "SLIDER" ? "bg-black text-white" : "bg-white text-black/50 hover:text-black"
              }`}
            >
              Slideshow
            </button>
          </div>
        </div>

        {draft.heroMode === "VIDEO" ? (
          <div className="mt-4">
            <HeroVideoEditor
              heroVideoUrl={draft.heroVideoUrl}
              heroCtaLabel={draft.heroCtaLabel}
              heroCtaHref={draft.heroCtaHref}
              onVideoUploaded={async (url) => {
                setDraft((current) => ({ ...current, heroVideoUrl: url }));
                await updateHomepageContent({ heroVideoUrl: url });
                router.refresh();
              }}
              onFieldChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
              onFieldBlurSave={async () => {
                await updateHomepageContent({
                  heroCtaLabel: draft.heroCtaLabel,
                  heroCtaHref: draft.heroCtaHref,
                });
                router.refresh();
              }}
            />
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-xs text-black/40">
              Only the image can be changed here; the name and shop button are
              fixed to each store&apos;s identity.
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

      <div className="mt-6 border border-black/10 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
          Newsletter Heading
        </p>
        <textarea
          value={draft.newsletterHeading}
          onChange={(event) =>
            setDraft((current) => ({ ...current, newsletterHeading: event.target.value }))
          }
          onBlur={async () => {
            await updateHomepageContent({ newsletterHeading: draft.newsletterHeading });
            router.refresh();
          }}
          rows={2}
          className="mt-3 w-full max-w-2xl border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
        <p className="mt-4 max-w-xl text-xl font-normal leading-tight text-black/80">
          {draft.newsletterHeading}
        </p>
      </div>

      <SocialLinksEditor
        links={draft.socialLinks}
        onAdd={handleAddSocialLink}
        onToggle={handleToggleSocialLink}
        onRemove={handleRemoveSocialLink}
      />
    </div>
  );
}
