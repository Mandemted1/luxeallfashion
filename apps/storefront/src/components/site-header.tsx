"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
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
  const scrolledPastHero = useIsScrolledPastHero();
  const scrolled = !transparentOverHero || scrolledPastHero;

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
          <Link href="/search" aria-label="Search" className={iconLinkClass}>
            Search
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className={`${iconLinkClass} hidden sm:inline`}
          >
            Account
          </Link>
          <Link href="/bag" aria-label="Bag" className={iconLinkClass}>
            Bag
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
          </nav>
        </div>
      )}
    </header>
  );
}
