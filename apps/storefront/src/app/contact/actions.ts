"use server";

import { headers } from "next/headers";
import { prisma } from "@luxe/database";
import { escapeHtml } from "@/lib/email-template";
import { isRateLimited } from "@/lib/rate-limit";
import { resend, SHOP_NOTIFICATION_EMAIL } from "@/lib/resend";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<{ error?: string }> {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  // No account or captcha behind this form either — same reasoning as
  // the newsletter signup's limit.
  if (isRateLimited(`contact-message:${ip}`, 5, 60_000)) {
    return { error: "Too many attempts. Please wait a moment and try again." };
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const message = input.message.trim();

  if (!name) return { error: "Enter your name." };
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address." };
  if (!message) return { error: "Enter a message." };

  await prisma.supportMessage.create({ data: { name, email, message } });

  // Best-effort — the message is already saved and will show up in the
  // admin's Marketing page regardless of whether this notification
  // actually lands. Plain internal-only HTML, not the customer-facing
  // branded shell (renderOrderEmailHtml) — this has no order to show and
  // nobody outside the shop ever sees it.
  try {
    await resend.emails.send({
      from: "Luxe All Fashion <orders@luxeallfashion.com>",
      to: SHOP_NOTIFICATION_EMAIL,
      subject: `New contact message from ${name}`,
      html: `<p>From <strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}):</p><p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>`,
    });
  } catch {
    // Worth checking Resend's dashboard if this keeps happening.
  }

  return {};
}
