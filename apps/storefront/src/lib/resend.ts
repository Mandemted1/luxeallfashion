import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Needs the domain verified in Resend to actually deliver.
export const ORDERS_EMAIL_FROM = "Luxe All Fashion <orders@luxeallfashion.com>";

// The shop's own inbox, not any individual admin login — new-order and
// new-contact-message alerts go here only, regardless of who's active in
// AdminUser.
export const SHOP_NOTIFICATION_EMAIL = "luxeallfashion01@gmail.com";
