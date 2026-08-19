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
  const existingEmail = await prisma.customer.findUnique({ where: { email } });
  if (existingEmail) return { error: "An account with this email already exists." };

  const existingPhone = await prisma.customer.findUnique({ where: { phone } });
  if (existingPhone) return { error: "An account with this phone number already exists." };

  // Creates the CustomerAuthUser + CustomerAuthAccount and sets the session
  // cookie (via the nextCookies() plugin) — can't share a Prisma transaction
  // with the Customer write below, since it goes through Better-Auth's own
  // API rather than a direct Prisma call.
  const signUpResult = await auth.api.signUpEmail({
    body: { name, email, password },
    headers: await headers(),
    asResponse: false,
  });

  if (!signUpResult?.user) {
    return { error: "Could not create the account. Try again." };
  }

  await prisma.customer.create({
    data: { name, email, phone, authUserId: signUpResult.user.id },
  });

  return {};
}
