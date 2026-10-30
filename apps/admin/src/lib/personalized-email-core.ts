// Trusted-internal — no permission guard of its own. Deliberately not in
// a "use server" file so it can never become a directly client-callable
// server action (same pattern as products-core.ts and
// instagram-drafts-core.ts). Real callers: sendCustomerEmail (guarded on
// MARKETING_SEND_EMAIL) and replyToSupportMessage (guarded on
// MARKETING_REPLY_SUPPORT) in marketing/actions.ts — never call this from
// anywhere else.
import { escapeHtml, renderMarketingEmailHtml } from "@/lib/email-template";
import { resend, SUPPORT_EMAIL_FROM } from "@/lib/resend";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendPersonalizedEmailCore(
  to: string,
  subject: string,
  bodyText: string,
): Promise<{ error?: string }> {
  const trimmedTo = to.trim();
  const trimmedSubject = subject.trim();
  const trimmedBody = bodyText.trim();

  if (!EMAIL_PATTERN.test(trimmedTo)) return { error: "Enter a valid email address." };
  if (!trimmedSubject) return { error: "Enter a subject." };
  if (!trimmedBody) return { error: "Enter a message." };

  try {
    await resend.emails.send({
      from: SUPPORT_EMAIL_FROM,
      to: trimmedTo,
      subject: trimmedSubject,
      // This is a 1:1 reply/email, not a campaign — no unsubscribeUrl,
      // so renderMarketingEmailHtml omits that footer line entirely.
      html: renderMarketingEmailHtml({
        heading: trimmedSubject,
        bodyHtml: `<p>${escapeHtml(trimmedBody).replaceAll("\n", "<br />")}</p>`,
      }),
    });
    return {};
  } catch {
    return { error: "Couldn't send. Try again." };
  }
}
