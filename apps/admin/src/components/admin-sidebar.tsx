"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "@/lib/nav";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-black text-white">
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
        <ul className="flex flex-col gap-0.5">
          {adminNav.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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
      </nav>

      <div className="border-t border-white/10 px-6 py-5">
        <p className="truncate text-xs text-white/50">
          admin@luxeallfashion.com
        </p>
        <button
          type="button"
          className="mt-2 flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-white/60 hover:text-white"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
