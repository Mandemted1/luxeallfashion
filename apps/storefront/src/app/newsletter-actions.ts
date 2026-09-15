"use server";

import { prisma } from "@luxe/database";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeToNewsletter(
  email: string,
  source: "popup" | "footer",
): Promise<{ error?: string }> {
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) {
    return { error: "Enter a valid email address." };
  }

  // Someone re-submitting an email already on the list isn't an error
  // from their point of view — just leave the existing row as is.
  await prisma.newsletterSubscriber.upsert({
    where: { email: normalized },
    update: {},
    create: { email: normalized, source },
  });

  return {};
}
