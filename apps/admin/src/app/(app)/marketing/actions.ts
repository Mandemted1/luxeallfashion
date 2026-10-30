"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma, type OrderStatus } from "@luxe/database";
import { escapeHtml, renderMarketingEmailHtml, renderOrderEmailHtml } from "@/lib/email-template";
import { getEmailBrand, saveEmailBrand, type EmailBrand } from "@/lib/email-brand";
import { applyOrderEmailTokens } from "@/lib/order-email-templates";
import { sendPersonalizedEmailCore } from "@/lib/personalized-email-core";
import { requireAction } from "@/lib/permissions";
import { resend } from "@/lib/resend";

const STOREFRONT_URL = process.env.STOREFRONT_URL ?? "https://luxeallfashion.com";

export async function saveOrderEmailTemplate(
  status: OrderStatus,
  input: { subject: string; heading: string; bodyText: string },
): Promise<{ error?: string }> {
  const guard = await requireAction("MARKETING_EDIT_TEMPLATES");
  if (guard.error) return guard;

  const subject = input.subject.trim();
  const heading = input.heading.trim();
  const bodyText = input.bodyText.trim();
  if (!subject || !heading || !bodyText) {
    return { error: "Fill in the subject, heading, and message." };
  }

  await prisma.orderEmailTemplate.upsert({
    where: { status },
    create: { status, subject, heading, bodyText },
    update: { subject, heading, bodyText },
  });

  revalidatePath("/marketing");
  return {};
}

// Renders exactly what sendOrderStatusEmail/markOrderPaid would actually
// send, using sample values — so the Sheet's preview can never drift from
// the real thing, both go through the same renderOrderEmailHtml call.
// Uses the currently-saved branding (not any unsaved edit in the
// Branding card below) — that card has its own live preview instead.
export async function previewOrderEmailTemplate(draft: {
  subject: string;
  heading: string;
  bodyText: string;
}): Promise<string> {
  const vars = { orderNumber: 1234, customerName: "Jane Doe" };
  const brand = await getEmailBrand();
  return renderOrderEmailHtml({
    heading: applyOrderEmailTokens(draft.heading, vars),
    introHtml: `<p>${escapeHtml(applyOrderEmailTokens(draft.bodyText, vars))}</p>`,
    items: [{ name: "Sample Item", quantity: 1, lineTotalGhs: 15000 }],
    totalGhs: 15000,
    brand,
  });
}

export async function saveEmailBrandSettings(brand: EmailBrand): Promise<{ error?: string }> {
  const guard = await requireAction("MARKETING_EDIT_TEMPLATES");
  if (guard.error) return guard;

  if (!/^#[0-9a-fA-F]{6}$/.test(brand.accentColor)) {
    return { error: "Enter a valid color." };
  }
  if (!["small", "medium", "large"].includes(brand.fontSize)) {
    return { error: "Invalid font size." };
  }

  await saveEmailBrand(brand);
  revalidatePath("/marketing");
  return {};
}

// Live preview for the Branding card as the admin adjusts an unsaved
// color/size — unlike previewOrderEmailTemplate above, this uses the
// draft brand directly rather than whatever's currently saved.
export async function previewEmailBrand(brand: EmailBrand): Promise<string> {
  return renderOrderEmailHtml({
    heading: "Your order is on its way",
    introHtml: "<p>Hi Jane Doe, this is a preview of your email style.</p>",
    items: [{ name: "Sample Item", quantity: 1, lineTotalGhs: 15000 }],
    totalGhs: 15000,
    brand,
  });
}

export type CampaignAudience = "subscribers" | "optedInCustomers" | "both" | "selectedCustomers";

interface CampaignRecipient {
  email: string;
  unsubscribeToken: string;
}

// Every recipient needs a real token before anything is sent to them —
// generated here for any row that doesn't have one yet (lazy backfill,
// no migration needed for existing rows).
async function ensureUnsubscribeToken<T extends { id: string; unsubscribeToken: string | null }>(
  row: T,
  model: "newsletterSubscriber" | "customer",
): Promise<string> {
  if (row.unsubscribeToken) return row.unsubscribeToken;
  const token = randomBytes(32).toString("hex");
  if (model === "newsletterSubscriber") {
    await prisma.newsletterSubscriber.update({ where: { id: row.id }, data: { unsubscribeToken: token } });
  } else {
    await prisma.customer.update({ where: { id: row.id }, data: { unsubscribeToken: token } });
  }
  return token;
}

async function resolveCampaignRecipients(
  audience: CampaignAudience,
  customerIds: string[],
): Promise<CampaignRecipient[]> {
  const byEmail = new Map<string, string>(); // lowercased email -> token

  if (audience === "subscribers" || audience === "both") {
    const subscribers = await prisma.newsletterSubscriber.findMany();
    for (const row of subscribers) {
      const token = await ensureUnsubscribeToken(row, "newsletterSubscriber");
      byEmail.set(row.email.toLowerCase(), token);
    }
  }

  if (audience === "optedInCustomers" || audience === "both") {
    const customers = await prisma.customer.findMany({ where: { marketingOptIn: true } });
    for (const row of customers) {
      const token = await ensureUnsubscribeToken(row, "customer");
      // A subscriber-table token (if this email is in both) wins — either
      // one unsubscribes them from this same send, doesn't matter which.
      if (!byEmail.has(row.email.toLowerCase())) byEmail.set(row.email.toLowerCase(), token);
    }
  }

  // Hand-picked recipients aren't filtered by marketingOptIn — the admin
  // chose each one individually, rather than this being a blast to
  // everyone. The unsubscribe link is still included either way, so
  // anyone who didn't want it still has a real way to opt out.
  if (audience === "selectedCustomers") {
    const customers = await prisma.customer.findMany({ where: { id: { in: customerIds } } });
    for (const row of customers) {
      const token = await ensureUnsubscribeToken(row, "customer");
      byEmail.set(row.email.toLowerCase(), token);
    }
  }

  return Array.from(byEmail, ([email, unsubscribeToken]) => ({ email, unsubscribeToken }));
}

export async function previewCampaignAudienceCount(audience: CampaignAudience): Promise<number> {
  const guard = await requireAction("MARKETING_SEND_CAMPAIGN");
  if (guard.error) return 0;

  const emails = new Set<string>();
  if (audience === "subscribers" || audience === "both") {
    const subscribers = await prisma.newsletterSubscriber.findMany({ select: { email: true } });
    for (const row of subscribers) emails.add(row.email.toLowerCase());
  }
  if (audience === "optedInCustomers" || audience === "both") {
    const customers = await prisma.customer.findMany({
      where: { marketingOptIn: true },
      select: { email: true },
    });
    for (const row of customers) emails.add(row.email.toLowerCase());
  }
  // selectedCustomers isn't counted here — the UI already knows exactly
  // how many it picked, no round trip needed.
  return emails.size;
}

const BATCH_SIZE = 100; // Resend's own per-call limit for batch sends.

export async function sendMarketingCampaign(input: {
  subject: string;
  bodyText: string;
  audience: CampaignAudience;
  customerIds?: string[];
}): Promise<{ error?: string; queuedCount?: number }> {
  const guard = await requireAction("MARKETING_SEND_CAMPAIGN");
  if (guard.error) return guard;

  const subject = input.subject.trim();
  const bodyText = input.bodyText.trim();
  if (!subject) return { error: "Enter a subject." };
  if (!bodyText) return { error: "Enter a message." };
  if (input.audience === "selectedCustomers" && (input.customerIds?.length ?? 0) === 0) {
    return { error: "Select at least one customer." };
  }

  const [recipients, brand] = await Promise.all([
    resolveCampaignRecipients(input.audience, input.customerIds ?? []),
    getEmailBrand(),
  ]);
  if (recipients.length === 0) return { error: "Nobody in that audience yet." };

  const bodyHtml = `<p>${escapeHtml(bodyText).replaceAll("\n", "<br />")}</p>`;

  // Returns immediately — the actual sending happens in this tail, same
  // non-blocking pattern already used for the delayed order-status email
  // in orders/actions.ts. Chunked into Resend's own 100-per-call batch
  // limit; this store's whole audience (every customer loads with no
  // pagination elsewhere on this page) is realistically far below the
  // point this would ever need to move off a single request.
  after(async () => {
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const chunk = recipients.slice(i, i + BATCH_SIZE);
      try {
        await resend.batch.send(
          chunk.map((recipient) => ({
            from: "Luxe All Fashion <marketing@luxeallfashion.com>",
            to: recipient.email,
            subject,
            html: renderMarketingEmailHtml({
              heading: subject,
              bodyHtml,
              unsubscribeUrl: `${STOREFRONT_URL}/unsubscribe/${recipient.unsubscribeToken}`,
              brand,
            }),
          })),
        );
      } catch (error) {
        console.error("[marketing campaign send error]", error);
      }
    }
  });

  return { queuedCount: recipients.length };
}

export async function sendCustomerEmail(input: {
  to: string;
  subject: string;
  bodyText: string;
}): Promise<{ error?: string }> {
  const guard = await requireAction("MARKETING_SEND_EMAIL");
  if (guard.error) return guard;
  return sendPersonalizedEmailCore(input.to, input.subject, input.bodyText);
}

export async function replyToSupportMessage(
  messageId: string,
  input: { subject: string; bodyText: string },
): Promise<{ error?: string }> {
  const guard = await requireAction("MARKETING_REPLY_SUPPORT");
  if (guard.error) return guard;

  const message = await prisma.supportMessage.findUnique({ where: { id: messageId } });
  if (!message) return { error: "Message not found." };

  const result = await sendPersonalizedEmailCore(message.email, input.subject, input.bodyText);
  if (result.error) return result;

  await prisma.supportMessage.update({ where: { id: messageId }, data: { repliedAt: new Date() } });
  revalidatePath("/marketing");
  return {};
}
