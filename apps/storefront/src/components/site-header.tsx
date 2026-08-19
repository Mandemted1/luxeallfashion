"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CloseIcon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { primaryNav } from "@/lib/nav";

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

interface SiteHeaderProps {
  // Only the homepage has a dark hero for the header to start transparent
  // over. Every other page defaults to the solid style from the start.
  transparentOverHero?: boolean;
}

export function SiteHeader({ transparentOverHero = false }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const scrolledPastHero = useIsScrolledPastHero();
  const scrolled = !transparentOverHero || scrolledPastHero;

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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${
        scrolled ? "text-black" : "text-white"
      }`}
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
            — OG Luxemen | Chicstyle | Kiddies Space GH —
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
        <div className="fixed inset-0 top-[64px] z-20 flex flex-col bg-black text-white lg:hidden">
          <nav
            aria-label="Main"
            className="flex flex-1 flex-col items-center justify-center gap-8"
          >
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium uppercase tracking-[0.2em]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium uppercase tracking-[0.2em] text-white/70"
            >
              Account
            </Link>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium uppercase tracking-[0.2em] text-white/70"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}

      {/* Search overlay: solid input panel over a blurred scrim of the
          page content, dropped down from directly below the header. */}
      {searchOpen && (
        <>
          <div
            className="fixed inset-x-0 top-[64px] bottom-0 z-40 bg-white/10 backdrop-blur-md"
            onClick={() => setSearchOpen(false)}
          />
          <div className="fixed inset-x-0 top-[64px] z-50 border-b border-black/10 bg-white px-4 py-6 text-black sm:px-6 lg:px-10">
            <div className="ml-auto flex w-full max-w-sm items-end gap-6 border-b border-black pb-2">
              <input
                type="text"
                autoFocus
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
            </div>
          </div>
        </>
      )}
    </header>
  );
}
