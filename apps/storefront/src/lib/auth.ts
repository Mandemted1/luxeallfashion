import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@luxe/database";

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

// No email verification required (guest checkout already creates a
// Customer with no password; setting one later is what turns a guest into
// a full account — see packages/database schema comment on Customer).
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
    requireEmailVerification: false,
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
