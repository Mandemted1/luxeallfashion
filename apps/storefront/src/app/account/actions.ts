"use server";

import { headers } from "next/headers";
import { prisma } from "@luxe/database";
import { auth } from "@/lib/auth";

export async function registerCustomer(
  name: string,
  email: string,
  phone: string,
  password: string,
): Promise<{ error?: string }> {
  // A Customer row with this email but no authUserId is a guest checkout,
  // not a real account — registering should upgrade it, not reject it.
  const existingByEmail = await prisma.customer.findUnique({ where: { email } });
  if (existingByEmail?.authUserId) {
    return { error: "An account with this email already exists." };
  }

  const existingByPhone = await prisma.customer.findUnique({ where: { phone } });
  if (existingByPhone && existingByPhone.email !== email) {
    return { error: "An account with this phone number already exists." };
  }

  // Creates the CustomerAuthUser + CustomerAuthAccount, and — since email
  // verification is required — sends the verification email rather than
  // signing them in immediately. Can't share a Prisma transaction with the
  // Customer write below, since this goes through Better-Auth's own API
  // rather than a direct Prisma call.
  const signUpResult = await auth.api.signUpEmail({
    body: { name, email, password },
    headers: await headers(),
    asResponse: false,
  });

  if (!signUpResult?.user) {
    return { error: "Could not create the account. Try again." };
  }

  // Brand new email — no existing order history to protect, so it's safe
  // to link right away (there's nothing here for anyone to have hijacked).
  // If this email already has guest order history, deliberately don't link
  // it here — that only happens once they've actually verified they own
  // the inbox (see ensureCustomerLinked, called once a verified session
  // exists), otherwise anyone who merely knew someone's email could claim
  // their past orders by "registering" under it.
  if (!existingByEmail) {
    await prisma.customer.create({
      data: { name, email, phone, authUserId: signUpResult.user.id },
    });
  }

  return {};
}
