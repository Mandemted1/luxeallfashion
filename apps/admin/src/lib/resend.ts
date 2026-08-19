import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Needs the domain verified in Resend to actually deliver — see
// apps/storefront/src/lib/contact-info.ts for the same caveat on that side.
export const ADMIN_EMAIL_FROM = "Luxe All Fashion Admin <admin@luxeallfashion.com>";
