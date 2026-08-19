"use client";

import { useState } from "react";
import { TrashIcon } from "@/components/icons";
import { brandLabel } from "@/lib/brands";
import {
  initialHomepageContent,
  socialPlatforms,
  type HomepageContent,
  type HomepageTile,
  type PromoBannerConfig,
  type SocialLink,
  type SocialPlatform,
} from "@/lib/mock-homepage-content";

// Session-only, like the rest of the admin's mock-data pages — and unlike
// those, this one can't "publish" at all yet: there's no image/video
// storage wired up, so an upload here only previews locally in this
// browser tab. Nothing here reaches the live storefront.

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
}: {
  tile: HomepageTile;
  onChange: (patch: Partial<HomepageTile>) => void;
}) {
  function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    onChange({ imageSrc: URL.createObjectURL(file) });
  }

  return (
    <div className="border border-black/10 bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
        {tile.title}
      </p>
      <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element -- previews mix static paths and local blob: URLs, which next/image can't optimize */}
        <img src={tile.imageSrc} alt={tile.title} className="h-full w-full object-cover" />
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImage}
        className="mt-3 w-full text-xs text-black/60 file:mr-3 file:border file:border-black/15 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:uppercase file:tracking-[0.08em] hover:file:border-black/40"
      />
      <div className="mt-4 flex flex-col gap-3">
        <Field label="Title">
          <input
            type="text"
            value={tile.title}
            onChange={(event) => onChange({ title: event.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Button Label">
          <input
            type="text"
            value={tile.ctaLabel}
            onChange={(event) => onChange({ ctaLabel: event.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Links To">
          <input
            type="text"
            value={tile.href}
            onChange={(event) => onChange({ href: event.target.value })}
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
    setPlatform(availablePlatforms.filter((p) => p !== platform)[0] ?? "");
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

export function HomepageContentEditor() {
  const [content, setContent] = useState<HomepageContent>(initialHomepageContent);

  function updateTile(id: HomepageTile["id"], patch: Partial<HomepageTile>) {
    setContent((current) => ({
      ...current,
      tiles: current.tiles.map((tile) => (tile.id === id ? { ...tile, ...patch } : tile)),
    }));
  }

  function updatePromoBanner(brand: PromoBannerConfig["brand"], patch: Partial<PromoBannerConfig>) {
    setContent((current) => ({
      ...current,
      promoBanners: current.promoBanners.map((banner) =>
        banner.brand === brand ? { ...banner, ...patch } : banner,
      ),
    }));
  }

  function handleVideoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setContent((current) => ({ ...current, heroVideoName: file.name }));
  }

  function addSocialLink(platform: SocialPlatform, url: string) {
    setContent((current) => ({
      ...current,
      socialLinks: [
        ...current.socialLinks,
        { id: `social-${Date.now()}`, platform, url, isEnabled: true },
      ],
    }));
  }

  function toggleSocialLink(id: string) {
    setContent((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((link) =>
        link.id === id ? { ...link, isEnabled: !link.isEnabled } : link,
      ),
    }));
  }

  function removeSocialLink(id: string) {
    setContent((current) => ({
      ...current,
      socialLinks: current.socialLinks.filter((link) => link.id !== id),
    }));
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Homepage</h1>

      <div className="mt-4 border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
        Preview only: edits here are local to this browser tab and don&apos;t
        publish to the live storefront yet. That needs image/video hosting
        wired up first.
      </div>

      <div className="mt-6 border border-black/10 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
          Promo Banners
        </p>
        <p className="mt-1 text-xs text-black/40">
          The thin strip at the top of each store&apos;s own page, great for a
          seasonal sale or a discount code callout.
        </p>
        <ul className="mt-4 flex flex-col divide-y divide-black/5">
          {content.promoBanners.map((banner) => (
            <li
              key={banner.brand}
              className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0"
            >
              <p className="w-36 shrink-0 text-sm font-medium">{brandLabel(banner.brand)}</p>
              <input
                type="text"
                value={banner.message}
                onChange={(event) =>
                  updatePromoBanner(banner.brand, { message: event.target.value })
                }
                placeholder="Promo message"
                className={`min-w-[240px] flex-1 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => updatePromoBanner(banner.brand, { isActive: !banner.isActive })}
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

      <div className="mt-6 border border-black/10 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
          Hero Video
        </p>
        <p className="mt-3 text-sm text-black/70">Current: {content.heroVideoName}</p>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className="mt-3 w-full max-w-sm text-xs text-black/60 file:mr-3 file:border file:border-black/15 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:uppercase file:tracking-[0.08em] hover:file:border-black/40"
        />
        <div className="mt-4 grid max-w-sm grid-cols-1 gap-3">
          <Field label="Button Label">
            <input
              type="text"
              value={content.heroCtaLabel}
              onChange={(event) =>
                setContent((current) => ({ ...current, heroCtaLabel: event.target.value }))
              }
              className={inputClass}
            />
          </Field>
          <Field label="Links To">
            <input
              type="text"
              value={content.heroCtaHref}
              onChange={(event) =>
                setContent((current) => ({ ...current, heroCtaHref: event.target.value }))
              }
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {content.tiles.map((tile) => (
          <TileEditor
            key={tile.id}
            tile={tile}
            onChange={(patch) => updateTile(tile.id, patch)}
          />
        ))}
      </div>

      <div className="mt-6 border border-black/10 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
          Newsletter Heading
        </p>
        <textarea
          value={content.newsletterHeading}
          onChange={(event) =>
            setContent((current) => ({ ...current, newsletterHeading: event.target.value }))
          }
          rows={2}
          className="mt-3 w-full max-w-2xl border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
        <p className="mt-4 max-w-xl text-xl font-normal leading-tight text-black/80">
          {content.newsletterHeading}
        </p>
      </div>

      <SocialLinksEditor
        links={content.socialLinks}
        onAdd={addSocialLink}
        onToggle={toggleSocialLink}
        onRemove={removeSocialLink}
      />
    </div>
  );
}
