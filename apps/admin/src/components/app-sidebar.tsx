"use client";

import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth-client";
import type { AdminPage } from "@/lib/admin-pages";
import { adminNav } from "@/lib/nav";

function initialsFor(email: string): string {
  const name = email.split("@")[0] ?? "";
  return name.slice(0, 2).toUpperCase();
}

export function AppSidebar({
  userEmail,
  isOwner,
  accessiblePages,
}: {
  userEmail: string;
  isOwner: boolean;
  // Only consulted for items that name a `page` — Dashboard has none and
  // is always visible, Team is gated by isOwner instead.
  accessiblePages: AdminPage[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const visibleNav = adminNav.filter((item) => {
    if (item.ownerOnly) return isOwner;
    if (!item.page) return true;
    return isOwner || accessiblePages.includes(item.page);
  });

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
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4 group-data-[collapsible=icon]:px-0">
        {/* Horizontal padding drops to 0 and centers when collapsed to the
            3rem icon rail — stacking the header's own padding with more
            padding on this link left almost no room for the logo and
            squashed it. */}
        <Link
          href="/"
          className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center"
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 shrink-0"
          />
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold tracking-[0.15em] uppercase">
              Luxe All
            </p>
            <p className="text-[10px] tracking-[0.25em] text-sidebar-foreground/50 uppercase">
              Admin
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNav.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.description}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="gap-2.5">
              <Avatar size="sm">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">
                  {initialsFor(userEmail)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                {userEmail}
              </span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
