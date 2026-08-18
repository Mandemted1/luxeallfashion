"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { primaryNav } from "@/lib/nav";

const iconLinkClass =
  "text-[11px] font-medium uppercase tracking-[0.18em] hover:opacity-70 transition-opacity";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="absolute inset-x-0 top-0 z-30 text-white">
      <div className="flex items-center justify-between gap-4 bg-black/25 px-4 py-4 backdrop-blur-[2px] sm:px-6 lg:px-10">
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
          <Image
            src="/logo-mark.png"
            alt="Luxe All Fashion"
            width={112}
            height={112}
            priority
            className="h-7 w-7 object-contain"
          />
          <span className="hidden text-[9px] font-medium uppercase tracking-[0.15em] text-white/80 sm:block">
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
