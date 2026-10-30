import type { AdminAction, AdminPage } from "@luxe/database";

export type { AdminAction, AdminPage };

// Dashboard isn't here — every active admin can see it, it's read-only.
// Team isn't here either — it's OWNER-only in application code, never a
// grantable permission, since letting a STAFF admin manage other admins
// would let them escalate their own access. No server-only imports here
// (unlike lib/permissions.ts) so client components can use this list too.
export const ADMIN_PAGES: { key: AdminPage; label: string; href: string }[] = [
  { key: "ORDERS", label: "Orders", href: "/orders" },
  { key: "PRODUCTS", label: "Products", href: "/products" },
  { key: "INSTAGRAM_DRAFTS", label: "Instagram Drafts", href: "/instagram-drafts" },
  { key: "CUSTOMERS", label: "Customers", href: "/customers" },
  { key: "DISCOUNT_CODES", label: "Discount Codes", href: "/discount-codes" },
  { key: "MARKETING", label: "Marketing", href: "/marketing" },
  { key: "HOMEPAGE", label: "Homepage", href: "/homepage" },
];

// The specific mutating actions grantable within each page. Pages absent
// from this list (Customers) have no mutations of their own — access to
// them is page-level only. Granting any action here implies (and
// auto-grants, in the UI) view access to its `page`.
export const ADMIN_ACTIONS: { key: AdminAction; page: AdminPage; label: string }[] = [
  { key: "ORDERS_UPDATE_STATUS", page: "ORDERS", label: "Update order status" },
  { key: "ORDERS_UNDO_STATUS", page: "ORDERS", label: "Undo a status change" },

  { key: "PRODUCTS_CREATE", page: "PRODUCTS", label: "Create products" },
  { key: "PRODUCTS_EDIT", page: "PRODUCTS", label: "Edit products" },
  { key: "PRODUCTS_DELETE", page: "PRODUCTS", label: "Delete products" },
  { key: "PRODUCTS_TOGGLE_ACTIVE", page: "PRODUCTS", label: "Activate / deactivate products" },
  { key: "PRODUCTS_MANAGE_VARIANTS", page: "PRODUCTS", label: "Manage variants & stock" },
  { key: "PRODUCTS_MANAGE_CATEGORIES", page: "PRODUCTS", label: "Manage categories" },

  { key: "INSTAGRAM_DRAFTS_SYNC", page: "INSTAGRAM_DRAFTS", label: "Sync drafts from Instagram" },
  { key: "INSTAGRAM_DRAFTS_REVIEW", page: "INSTAGRAM_DRAFTS", label: "Approve / decline drafts" },
  { key: "INSTAGRAM_DRAFTS_AI_SETTINGS", page: "INSTAGRAM_DRAFTS", label: "Edit AI settings" },

  { key: "DISCOUNT_CODES_CREATE", page: "DISCOUNT_CODES", label: "Create discount codes" },
  { key: "DISCOUNT_CODES_TOGGLE_ACTIVE", page: "DISCOUNT_CODES", label: "Activate / deactivate codes" },
  { key: "DISCOUNT_CODES_DELETE", page: "DISCOUNT_CODES", label: "Delete discount codes" },

  { key: "HOMEPAGE_EDIT_CONTENT", page: "HOMEPAGE", label: "Edit hero & newsletter content" },
  { key: "HOMEPAGE_EDIT_TILES", page: "HOMEPAGE", label: "Edit brand tiles" },
  { key: "HOMEPAGE_EDIT_PROMO_BANNER", page: "HOMEPAGE", label: "Edit promo banner" },
  { key: "HOMEPAGE_MANAGE_SOCIAL_LINKS", page: "HOMEPAGE", label: "Manage social links" },

  { key: "MARKETING_EDIT_TEMPLATES", page: "MARKETING", label: "Edit order-status email templates" },
  { key: "MARKETING_SEND_CAMPAIGN", page: "MARKETING", label: "Send marketing campaigns" },
  { key: "MARKETING_SEND_EMAIL", page: "MARKETING", label: "Send one-off emails" },
  { key: "MARKETING_REPLY_SUPPORT", page: "MARKETING", label: "Reply to support messages" },
];

// Granting an action always implies view access to the page it lives
// on — this derives the full set of pages a given set of action grants
// requires, so callers never end up with an action grant but no way to
// reach the page it acts on.
export function pagesForActions(actions: AdminAction[]): AdminPage[] {
  const pages = new Set<AdminPage>();
  for (const action of actions) {
    const entry = ADMIN_ACTIONS.find((a) => a.key === action);
    if (entry) pages.add(entry.page);
  }
  return [...pages];
}
