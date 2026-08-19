import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@luxe/database";

// Fully separate from the admin app's Better-Auth instance (apps/admin) —
// different secret, different cookie, different tables (prefixed
// Customer* below) — a customer session must never be valid on the admin
// subdomain, or vice versa, even though both share the same Neon database.
//
// No email verification required (guest checkout already creates a
// Customer with no password; setting one later is what turns a guest into
// a full account — see packages/database schema comment on Customer).
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
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
  // Must be last — lets server actions (not just route handlers) set the
  // session cookie correctly. See Better-Auth's Next.js integration docs.
  plugins: [nextCookies()],
});
