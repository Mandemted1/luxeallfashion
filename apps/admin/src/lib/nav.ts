import {
  BagIcon,
  BoxIcon,
  GridIcon,
  HomeIcon,
  MegaphoneIcon,
  PercentIcon,
  ShieldIcon,
  TagIcon,
  UsersIcon,
} from "@/components/icons";

// Delivery Regions used to link here too, but there's no page behind it yet
// (see the ongoing mobile-responsiveness pass) — removed rather than left
// as a dead link until that page actually exists.
export const adminNav = [
  { label: "Dashboard", href: "/", icon: GridIcon, ownerOnly: false },
  { label: "Orders", href: "/orders", icon: BagIcon, ownerOnly: false },
  { label: "Products", href: "/products", icon: BoxIcon, ownerOnly: false },
  { label: "Categories", href: "/categories", icon: TagIcon, ownerOnly: false },
  { label: "Customers", href: "/customers", icon: UsersIcon, ownerOnly: false },
  {
    label: "Discount Codes",
    href: "/discount-codes",
    icon: PercentIcon,
    ownerOnly: false,
  },
  { label: "Marketing", href: "/marketing", icon: MegaphoneIcon, ownerOnly: false },
  { label: "Homepage", href: "/homepage", icon: HomeIcon, ownerOnly: false },
  // OWNER-only — see apps/admin/src/app/(app)/team/page.tsx
  { label: "Team", href: "/team", icon: ShieldIcon, ownerOnly: true },
] as const;
