"use server";

import { headers } from "next/headers";
import { prisma } from "@luxe/database";
import { auth } from "@/lib/auth";

// Better-Auth's own sign-in has no concept of AdminUser.isActive, so a
// deactivated admin's credentials still work there. Called right after a
// successful client-side sign-in to catch that case immediately, with a
// clear message, instead of letting them land on "/" and silently bounce
// back to /login via the (app) layout's own isActive check.
export async function verifyAdminActive(): Promise<{ ok: boolean; error?: string }> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) {
    return { ok: false, error: "Something went wrong. Try again." };
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!adminUser || !adminUser.isActive) {
    await auth.api.signOut({ headers: requestHeaders });
    return { ok: false, error: "This account has been deactivated." };
  }

  return { ok: true };
}
