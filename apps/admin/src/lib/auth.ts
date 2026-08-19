import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@luxe/database";

// Fully separate from the storefront's Better-Auth instance (apps/storefront)
// — different secret, different cookie, different tables (prefixed Admin*
// below) — an admin session must never be valid on the storefront, or vice
// versa, even though both share the same Neon database.
//
// No public sign-up: accounts are only created by accepting an AdminInvite
// (packages/database schema), which is our own logic sitting on top of
// this, not a Better-Auth primitive.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "AdminAuthUser",
  },
  session: {
    modelName: "AdminAuthSession",
  },
  account: {
    modelName: "AdminAuthAccount",
  },
  verification: {
    modelName: "AdminAuthVerification",
  },
  // Must be last — lets server actions (not just route handlers) set the
  // session cookie correctly. See Better-Auth's Next.js integration docs.
  plugins: [nextCookies()],
});
