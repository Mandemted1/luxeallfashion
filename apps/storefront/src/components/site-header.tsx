"use client";

import type { Brand as PrismaBrand } from "@luxe/database";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { getMobileNavCategories } from "@/app/mobile-nav-actions";
import { ChevronRightIcon, CloseIcon } from "@/components/icons";
import type { StorefrontCategory } from "@/lib/catalog";
import { useCart } from "@/lib/cart-context";
import { primaryNav } from "@/lib/nav";

const brandTabs: { key: PrismaBrand; label: string; href: string }[] = [
  { key: "OG_LUXEMEN", label: "OG Luxemen", href: "/og-luxemen" },
  { key: "CHICSTYLE", label: "Chicstyle", href: "/chicstyle" },
  { key: "KIDDIES_SPACE_GH", label: "Kiddies Space GH", href: "/kiddies-space-gh" },
];

// Header starts transparent, overlaid on the hero. Once the hero scrolls
// out from under it, it switches to a solid white bar so nav text stays
// legible over whatever content is behind it.
const SCROLLED_THRESHOLD_OFFSET = 96;

function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("resize", callback);
  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("resize", callback);
  };
}

function getIsScrolledPastHero() {
  return window.scrollY > window.innerHeight - SCROLLED_THRESHOLD_OFFSET;
}

function getServerSnapshot() {
  return false;
}

function useIsScrolledPastHero() {
  return useSyncExternalStore(
    subscribeToScroll,
    getIsScrolledPastHero,
    getServerSnapshot,
  );
}

const iconLinkClass =
  "text-[11px] font-medium uppercase tracking-[0.18em] hover:opacity-70 transition-opacity";

const HEADER_HEIGHT = 64;
const BANNER_HEIGHT = 44;

interface SiteHeaderProps {
  // Only the homepage has a dark hero for the header to start transparent
  // over. Every other page defaults to the solid style from the start.
  transparentOverHero?: boolean;
  // A brand's promo strip — sits above the nav bar, full width, and pushes
  // the header (and everything positioned relative to it) down by its own
  // height rather than overlapping it.
  topBanner?: string | null;
}

export function SiteHeader({
  transparentOverHero = false,
  topBanner,
}: SiteHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBrandTab, setActiveBrandTab] = useState<PrismaBrand>("OG_LUXEMEN");
  const [navCategories, setNavCategories] = useState<Record<
    PrismaBrand,
    StorefrontCategory[]
  > | null>(null);
  const { itemCount } = useCart();
  const scrolledPastHero = useIsScrolledPastHero();
  const scrolled = !transparentOverHero || scrolledPastHero;
  const headerTop = topBanner ? BANNER_HEIGHT : 0;
  const overlayTop = HEADER_HEIGHT + headerTop;
  const activeTab = brandTabs.find((tab) => tab.key === activeBrandTab)!;

  // Lock body scroll while the mobile menu or search overlay is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  // Close search with Escape.
  useEffect(() => {
    if (!searchOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  // Categories are only needed once the mobile menu is actually opened —
  // fetched once and cached in state rather than on every page load.
  useEffect(() => {
    if (menuOpen && !navCategories) {
      getMobileNavCategories().then(setNavCategories);
    }
  }, [menuOpen, navCategories]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <>
      {topBanner && (
        <div
          className="fixed inset-x-0 top-0 z-40 flex items-center justify-center bg-black px-4 text-center text-xs font-medium uppercase tracking-[0.08em] text-white sm:px-6 lg:px-10"
          style={{ height: BANNER_HEIGHT }}
        >
          {topBanner}
        </div>
      )}
      <header
        className={`fixed inset-x-0 z-30 transition-colors duration-300 ${
          scrolled ? "text-black" : "text-white"
        }`}
        style={{ top: headerTop }}
      >
      <div
        className={`flex items-center justify-between gap-4 px-4 py-4 backdrop-blur-[2px] transition-colors duration-300 sm:px-6 lg:px-10 ${
          scrolled
            ? "border-b border-black/10 bg-white/95"
            : "bg-black/25"
        }`}
      >
        {/* Left: desktop nav / mobile menu toggle */}
        <div className="flex flex-1 items-center">
          <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href} className={iconLinkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 flex-col items-start justify-center gap-[5px] lg:hidden"
          >
            <span
              className={`h-px w-6 bg-current transition-transform ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-6 bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-px w-6 bg-current transition-transform ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </button>
        </div>

        {/* Center: logo mark */}
        <Link
          href="/"
          className="flex flex-1 flex-col items-center gap-1 text-center"
        >
          <span className="relative h-7 w-7">
            <Image
              src="/logo-mark.png"
              alt="Luxe All Fashion"
              fill
              sizes="28px"
              priority
              className={`object-contain transition-opacity duration-300 ${
                scrolled ? "opacity-0" : "opacity-100"
              }`}
            />
            <Image
              src="/logo-mark-dark.png"
              alt=""
              aria-hidden="true"
              fill
              sizes="28px"
              priority
              className={`object-contain transition-opacity duration-300 ${
                scrolled ? "opacity-100" : "opacity-0"
              }`}
            />
          </span>
          <span
            className={`hidden text-[9px] font-medium uppercase tracking-[0.15em] transition-colors duration-300 sm:block ${
              scrolled ? "text-black/70" : "text-white/80"
            }`}
          >
            OG Luxemen | Chicstyle | Kiddies Space GH
          </span>
        </Link>

        {/* Right: utility links */}
        <div className="flex flex-1 items-center justify-end gap-5">
          <Link
            href="/contact"
            className={`${iconLinkClass} hidden sm:inline`}
          >
            Contact
          </Link>
          <button
            type="button"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
            className={iconLinkClass}
          >
            Search
          </button>
          <Link
            href="/account"
            aria-label="Account"
            className={`${iconLinkClass} hidden sm:inline`}
          >
            Account
          </Link>
          <Link
            href="/bag"
            aria-label={`Bag${itemCount > 0 ? `, ${itemCount} item${itemCount === 1 ? "" : "s"}` : ""}`}
            className={`${iconLinkClass} inline-flex items-center gap-1.5`}
          >
            Bag
            {itemCount > 0 && (
              <span
                className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold normal-case tracking-normal ${
                  scrolled ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile full-screen nav */}
      {menuOpen && (
        <div
          className="fixed inset-x-0 bottom-0 z-20 overflow-y-auto bg-white text-black lg:hidden"
          style={{ top: overlayTop }}
        >
          <div className="px-4 sm:px-6">
            <Link
              href="/new-in"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between border-b border-black/10 py-4 text-base"
            >
              New In
              <ChevronRightIcon className="h-4 w-4 text-black/40" />
            </Link>

            <div className="flex items-center gap-6 border-b border-black/10">
              {brandTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveBrandTab(tab.key)}
                  aria-pressed={activeBrandTab === tab.key}
                  className={`py-3 text-xs font-medium uppercase tracking-[0.1em] transition-colors ${
                    activeBrandTab === tab.key
                      ? "border-b-2 border-black text-black"
                      : "text-black/40 hover:text-black/70"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <nav aria-label={activeTab.label} className="flex flex-col divide-y divide-black/10">
              <Link
                href={activeTab.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-4 text-base"
              >
                {activeTab.label}
                <ChevronRightIcon className="h-4 w-4 text-black/40" />
              </Link>
              {(navCategories?.[activeBrandTab] ?? []).map((category) => (
                <Link
                  key={category.id}
                  href={`${activeTab.href}?category=${category.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-4 text-base"
                >
                  {category.name}
                  <ChevronRightIcon className="h-4 w-4 text-black/40" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-8 px-4 sm:px-6">
            <h2 className="text-lg font-semibold">My Account</h2>
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="mt-4 block bg-black py-4 text-center text-sm font-medium uppercase tracking-[0.1em] text-white"
            >
              Sign In
            </Link>
            <Link
              href="/account?mode=register"
              onClick={() => setMenuOpen(false)}
              className="mt-3 block border border-black py-4 text-center text-sm font-medium uppercase tracking-[0.1em] text-black"
            >
              Create Account
            </Link>
          </div>

          <div className="mt-8 px-4 pb-6 sm:px-6">
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between py-4 text-base"
            >
              Contact
              <ChevronRightIcon className="h-4 w-4 text-black/40" />
            </Link>
          </div>
        </div>
      )}

      {/* Search overlay: solid input panel over a blurred scrim of the
          page content, dropped down from directly below the header. */}
      {searchOpen && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 z-40 bg-white/10 backdrop-blur-md"
            style={{ top: overlayTop }}
            onClick={() => setSearchOpen(false)}
          />
          <div
            className="fixed inset-x-0 z-50 border-b border-black/10 bg-white px-4 py-6 text-black sm:px-6 lg:px-10"
            style={{ top: overlayTop }}
          >
            <form
              onSubmit={handleSearchSubmit}
              className="ml-auto flex w-full max-w-sm items-end gap-6 border-b border-black pb-2"
            >
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Enter keyword"
                className="flex-1 bg-transparent text-xs uppercase tracking-[0.15em] text-black placeholder:text-black/50 focus:outline-none sm:text-sm"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
                className="shrink-0 hover:opacity-60"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      )}
      </header>
    </>
  );
}
