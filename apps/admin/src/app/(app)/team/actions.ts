"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@luxe/database";
import type { AdminRole } from "@luxe/database";
import { auth } from "@/lib/auth";
import { ADMIN_EMAIL_FROM, resend } from "@/lib/resend";

const INVITE_EXPIRY_DAYS = 7;

async function requireOwner() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const adminUser = await prisma.adminUser.findUnique({
    where: { authUserId: session.user.id },
  });
  if (adminUser?.role !== "OWNER") return null;

  return adminUser;
}

export async function createInvite(
  emailInput: string,
  role: AdminRole,
): Promise<{ error?: string; inviteLink?: string; emailSent?: boolean }> {
  const owner = await requireOwner();
  if (!owner) return { error: "Not authorized." };

  // Better-Auth itself normalizes email to lowercase for the actual login
  // record, so an un-normalized duplicate check here can miss a real
  // match (inviting "Admin@x.com" when "admin@x.com" already exists) —
  // normalizing at the point of entry keeps every downstream read/write
  // (this check, the stored invite, AdminUser.email) consistent with it.
  const email = emailInput.trim().toLowerCase();
  if (!email) return { error: "Enter an email." };

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email } });
  if (existingAdmin) return { error: "An account with this email already exists." };

  const existingInvite = await prisma.adminInvite.findFirst({
    where: { email, acceptedAt: null, expiresAt: { gt: new Date() } },
  });
  if (existingInvite) return { error: "There's already a pending invite for this email." };

  const token = randomBytes(32).toString("hex");
  const inviteLink = `${process.env.BETTER_AUTH_URL}/invite/${token}`;

  await prisma.adminInvite.create({
    data: {
      email,
      role,
      token,
      invitedById: owner.id,
      expiresAt: new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  const { error: sendError } = await resend.emails.send({
    from: ADMIN_EMAIL_FROM,
    to: email,
    subject: "You've been invited to Luxe All Fashion Admin",
    html: `
      <p>${owner.name} has invited you to the Luxe All Fashion admin dashboard.</p>
      <p><a href="${inviteLink}">Accept the invite</a> to set up your account. This link expires in ${INVITE_EXPIRY_DAYS} days.</p>
    `,
  });

  return { inviteLink, emailSent: !sendError };
}

export async function revokeInvite(inviteId: string): Promise<{ error?: string }> {
  const owner = await requireOwner();
  if (!owner) return { error: "Not authorized." };

  await prisma.adminInvite.deleteMany({ where: { id: inviteId, acceptedAt: null } });
  return {};
}

export async function toggleAdminActive(adminUserId: string): Promise<{ error?: string }> {
  const owner = await requireOwner();
  if (!owner) return { error: "Not authorized." };
  if (adminUserId === owner.id) return { error: "You can't deactivate your own account." };

  const target = await prisma.adminUser.findUnique({ where: { id: adminUserId } });
  if (!target) return { error: "Account not found." };

  await prisma.adminUser.update({
    where: { id: adminUserId },
    data: { isActive: !target.isActive },
  });
  return {};
}

export async function deleteAdmin(adminUserId: string): Promise<{ error?: string }> {
  const owner = await requireOwner();
  if (!owner) return { error: "Not authorized." };
  if (adminUserId === owner.id) return { error: "You can't delete your own account." };

  const target = await prisma.adminUser.findUnique({ where: { id: adminUserId } });
  if (!target) return { error: "Account not found." };

  // Invites they sent (as a former OWNER) reference this row — clear those
  // first so the delete below doesn't hit a foreign-key block.
  await prisma.adminInvite.deleteMany({ where: { invitedById: adminUserId } });
  await prisma.adminUser.delete({ where: { id: adminUserId } });

  if (target.authUserId) {
    await prisma.adminAuthUser.delete({ where: { id: target.authUserId } });
  }

  return {};
}
