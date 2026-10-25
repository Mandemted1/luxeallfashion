"use server";

import { headers } from "next/headers";
import { prisma } from "@luxe/database";
import { auth } from "@/lib/auth";

export async function acceptInvite(
  token: string,
  name: string,
  password: string,
): Promise<{ error?: string }> {
  const invite = await prisma.adminInvite.findUnique({
    where: { token },
    include: { permissions: true, actionGrants: true },
  });

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

  await prisma.$transaction(async (tx) => {
    const adminUser = await tx.adminUser.create({
      data: {
        name,
        email: invite.email,
        role: invite.role,
        authUserId: signUpResult.user.id,
      },
    });

    if (invite.permissions.length > 0) {
      await tx.adminPermission.createMany({
        data: invite.permissions.map((p) => ({
          adminUserId: adminUser.id,
          page: p.page,
        })),
      });
    }

    if (invite.actionGrants.length > 0) {
      await tx.adminActionGrant.createMany({
        data: invite.actionGrants.map((g) => ({
          adminUserId: adminUser.id,
          action: g.action,
        })),
      });
    }

    await tx.adminInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
  });

  return {};
}
