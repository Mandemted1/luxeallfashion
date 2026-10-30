"use server";

import { headers } from "next/headers";
import { prisma } from "@luxe/database";
import { isRateLimited } from "@/lib/rate-limit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeToNewsletter(
  email: string,
  source: "popup" | "footer",
): Promise<{ error?: string }> {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  // No account or captcha behind this form — without a limit, a script
  // could flood the subscriber list indefinitely. 5/minute is plenty for
  // someone genuinely retyping a mistyped address.
  if (isRateLimited(`newsletter-signup:${ip}`, 5, 60_000)) {
    return { error: "Too many attempts. Please wait a moment and try again." };
  }

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
