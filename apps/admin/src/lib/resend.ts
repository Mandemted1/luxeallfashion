import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Needs the domain verified in Resend to actually deliver — see
// apps/storefront/src/lib/contact-info.ts for the same caveat on that side.
export const ADMIN_EMAIL_FROM = "Luxe All Fashion Admin <admin@luxeallfashion.com>";

// Same address the storefront emails customers from (apps/storefront/src/lib/resend.ts) —
// used here for order-status emails, which are customer-facing, not internal admin mail.
export const ORDERS_EMAIL_FROM = "Luxe All Fashion <orders@luxeallfashion.com>";
