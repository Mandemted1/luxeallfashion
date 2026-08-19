import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Needs the domain verified in Resend to actually deliver.
export const ORDERS_EMAIL_FROM = "Luxe All Fashion <orders@luxeallfashion.com>";
