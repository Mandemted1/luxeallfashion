"use server";

import { headers } from "next/headers";
import { prisma } from "@luxe/database";
import { auth } from "@/lib/auth";

export async function acceptInvite(
  token: string,
  name: string,
  password: string,
): Promise<{ error?: string }> {
  const invite = await prisma.adminInvite.findUnique({ where: { token } });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return { error: "This invite is no longer valid." };
  }

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: invite.email },
  });
  if (existingAdmin) {
    return { error: "An account with this email already exists." };
  }

  // Creates the AdminAuthUser + AdminAuthAccount and sets the session
  // cookie (via the nextCookies() plugin) — this can't share a Prisma
  // transaction with the AdminUser/AdminInvite writes below, since it
  // goes through Better-Auth's own API rather than a direct Prisma call.
  const signUpResult = await auth.api.signUpEmail({
    body: { name, email: invite.email, password },
    headers: await headers(),
    asResponse: false,
  });

  if (!signUpResult?.user) {
    return { error: "Could not create the account. Try again." };
  }

  await prisma.$transaction([
    prisma.adminUser.create({
      data: {
        name,
        email: invite.email,
        role: invite.role,
        authUserId: signUpResult.user.id,
      },
    }),
    prisma.adminInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return {};
}
