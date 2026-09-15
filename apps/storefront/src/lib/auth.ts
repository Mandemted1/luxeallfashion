import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@luxe/database";
import { ORDERS_EMAIL_FROM, resend } from "@/lib/resend";

// Fully separate from the admin app's Better-Auth instance (apps/admin) —
// different secret, different cookie, different tables (prefixed
// Customer* below) — a customer session must never be valid on the admin
// subdomain, or vice versa, even though both share the same Neon database.
//
// Each brand also lives on its own subdomain (ogluxemen.luxeallfashion.com,
// etc.) — a login started there sends an Origin header that doesn't match
// baseURL, and the session cookie needs to be readable across all of them,
// so both trustedOrigins and the cookie's domain need to cover the whole
// *.luxeallfashion.com family. Only turned on when actually running on that
// domain — on localhost it would silently break cookies entirely, since a
// browser refuses to set a cookie whose Domain doesn't match the real host.
const baseURL = process.env.BETTER_AUTH_URL;
const isLuxeDomain = Boolean(baseURL && new URL(baseURL).hostname.endsWith("luxeallfashion.com"));

// Email verification is required specifically to stop a real vulnerability:
// a guest checkout creates a Customer row (name/phone/order history) with
// no password on it. Without verification, anyone who merely knew a real
// customer's email could register a new account under that address and get
// linked straight onto their existing order history — no proof they
// actually owned that inbox. Requiring a verified click closes that off.
// The one-time cost is that every signup now needs an email confirmation
// click before login works, not just the guest-claim case — Better-Auth
// doesn't support enabling this selectively per signup, and hand-rolling a
// narrower version would mean writing new security-critical token code
// instead of relying on this already-audited path.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: [
    "https://luxeallfashion.com",
    "https://www.luxeallfashion.com",
    "https://*.luxeallfashion.com",
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: ORDERS_EMAIL_FROM,
        to: user.email,
        subject: "Reset your password — Luxe All Fashion",
        html: `
          <p>Hi ${user.name},</p>
          <p>Click below to set a new password for your Luxe All Fashion account.</p>
          <p><a href="${url}">Reset my password</a></p>
          <p>If you didn't request this, you can ignore this email — your password won't change.</p>
        `,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    // Also resend automatically if someone tries to sign in before they've
    // verified — helps anyone who lost or never got the original email.
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: ORDERS_EMAIL_FROM,
        to: user.email,
        subject: "Verify your email — Luxe All Fashion",
        html: `
          <p>Hi ${user.name},</p>
          <p>Click below to verify your email and finish setting up your Luxe All Fashion account.</p>
          <p><a href="${url}">Verify my email</a></p>
          <p>If you didn't try to create an account, you can ignore this email.</p>
        `,
      });
    },
  },
  user: {
    modelName: "CustomerAuthUser",
  },
  session: {
    modelName: "CustomerAuthSession",
  },
  account: {
    modelName: "CustomerAuthAccount",
  },
  verification: {
    modelName: "CustomerAuthVerification",
  },
  advanced: isLuxeDomain
    ? {
        crossSubDomainCookies: {
          enabled: true,
          domain: "luxeallfashion.com",
        },
      }
    : undefined,
  // Must be last — lets server actions (not just route handlers) set the
  // session cookie correctly. See Better-Auth's Next.js integration docs.
  plugins: [nextCookies()],
});
