import {
  Camera,
  LayoutGrid,
  Megaphone,
  Package,
  Percent,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import type { AdminPage } from "@/lib/admin-pages";

// Delivery Regions used to link here too, but there's no page behind it yet
// (see the ongoing mobile-responsiveness pass) — removed rather than left
// as a dead link until that page actually exists.
//
// description is the short one-line guidance shown as a tooltip when the
// sidebar is collapsed to icons only. `page` is the permission key this
// item is gated by — absent for Dashboard (always visible) and Team
// (gated by ownerOnly instead, never a grantable STAFF permission).
export const adminNav: {
  label: string;
  href: string;
  icon: typeof LayoutGrid;
  description: string;
  ownerOnly: boolean;
  page?: AdminPage;
}[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutGrid,
    description: "Revenue, orders, and store performance at a glance.",
    ownerOnly: false,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingBag,
    description: "Track and fulfil customer orders.",
    ownerOnly: false,
    page: "ORDERS",
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    description: "Your catalogue across all three stores.",
    ownerOnly: false,
    page: "PRODUCTS",
  },
  {
    label: "Instagram Drafts",
    href: "/instagram-drafts",
    icon: Camera,
    description: "Review posts pulled in from Instagram before they go live.",
    ownerOnly: false,
    page: "INSTAGRAM_DRAFTS",
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
    description: "Everyone who has shopped with you.",
    ownerOnly: false,
    page: "CUSTOMERS",
  },
  {
    label: "Discount Codes",
    href: "/discount-codes",
    icon: Percent,
    description: "Create and manage promo codes.",
    ownerOnly: false,
    page: "DISCOUNT_CODES",
  },
  {
    label: "Marketing",
    href: "/marketing",
    icon: Megaphone,
    description: "Newsletter copy and subscriber list.",
    ownerOnly: false,
    page: "MARKETING",
  },
  {
    label: "Homepage",
    href: "/homepage",
    icon: Store,
    description: "Edit the storefront's hero, tiles, and banners.",
    ownerOnly: false,
    page: "HOMEPAGE",
  },
  {
    label: "Team",
    href: "/team",
    icon: ShieldCheck,
    description: "Invite and manage admin accounts.",
    // OWNER-only — see apps/admin/src/app/(app)/team/page.tsx
    ownerOnly: true,
  },
];
