"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { signOut } from "@/lib/auth-client";
import { adminNav } from "@/lib/nav";

type NavItem = (typeof adminNav)[number];

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-medium uppercase tracking-[0.1em] transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminSidebar({
  userEmail,
  isOwner,
}: {
  userEmail: string;
  isOwner: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleNav = adminNav.filter((item) => !item.ownerOnly || isOwner);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error("[sign out]", error);
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between bg-black px-4 text-white lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
          className="flex h-8 w-8 flex-col items-start justify-center gap-[5px]"
        >
          <span className="h-px w-6 bg-current" />
          <span className="h-px w-6 bg-current" />
          <span className="h-px w-6 bg-current" />
        </button>
        <div className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="" width={24} height={24} className="h-6 w-6" />
          <p className="text-xs font-semibold uppercase tracking-[0.15em]">Luxe All Admin</p>
        </div>
        <div className="h-8 w-8" aria-hidden="true" />
      </div>

      {/* Desktop sidebar — unchanged from before, just gated to lg+ */}
      <aside className="hidden h-full w-64 shrink-0 flex-col bg-black text-white lg:flex">
        <div className="flex items-center gap-3 px-6 py-7">
          <Image
            src="/logo-mark.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em]">
              Luxe All
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">
              Admin
            </p>
          </div>
        </div>

        <nav aria-label="Admin" className="flex-1 px-3">
          <NavList items={visibleNav} pathname={pathname} />
        </nav>

        <div className="border-t border-white/10 px-6 py-5">
          <p className="truncate text-xs text-white/50">{userEmail}</p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-2 flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-white/60 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-black text-white lg:hidden">
            <div className="flex items-center justify-between px-6 py-7">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-mark.png"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em]">
                    Luxe All
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">
                    Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3">
              <NavList
                items={visibleNav}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </nav>

            <div className="border-t border-white/10 px-6 py-5">
              <p className="truncate text-xs text-white/50">{userEmail}</p>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-2 flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-white/60 hover:text-white"
              >
                Sign Out
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
