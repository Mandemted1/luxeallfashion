import {
  BagIcon,
  BoxIcon,
  GridIcon,
  HomeIcon,
  MapPinIcon,
  MegaphoneIcon,
  PercentIcon,
  TagIcon,
  UsersIcon,
} from "@/components/icons";

export const adminNav = [
  { label: "Dashboard", href: "/", icon: GridIcon },
  { label: "Orders", href: "/orders", icon: BagIcon },
  { label: "Products", href: "/products", icon: BoxIcon },
  { label: "Categories", href: "/categories", icon: TagIcon },
  { label: "Customers", href: "/customers", icon: UsersIcon },
  { label: "Delivery Regions", href: "/delivery-regions", icon: MapPinIcon },
  { label: "Discount Codes", href: "/discount-codes", icon: PercentIcon },
  { label: "Marketing", href: "/marketing", icon: MegaphoneIcon },
  { label: "Homepage", href: "/homepage", icon: HomeIcon },
] as const;
