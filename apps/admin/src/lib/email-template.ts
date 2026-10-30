import { formatGhs } from "@/lib/currency";
import type { EmailBrand } from "@/lib/email-brand";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Deliberately small — a color and a font size, not a full design system.
// Every render* function below defaults to this when no brand is passed,
// so a caller that forgets to thread one through still gets a correct,
// on-brand-looking email rather than an error.
const DEFAULT_BRAND: EmailBrand = { accentColor: "#000000", fontSize: "medium" };

const FONT_SIZE_PX: Record<EmailBrand["fontSize"], number> = {
  small: 13,
  medium: 14,
  large: 16,
};

export interface OrderEmailItem {
  name: string;
  quantity: number;
  lineTotalGhs: number;
}

export interface OrderEmailOptions {
  heading: string;
  introHtml: string;
  items?: OrderEmailItem[];
  totalGhs: number;
  cta?: { text: string; href: string };
  brand?: EmailBrand;
}

// Inline-styled, table-free single column layout — the safest baseline for
// rendering consistently across email clients (Gmail, Outlook, Apple Mail
// all strip or mangle <style> blocks and modern CSS differently). Kept in
// sync with apps/storefront/src/lib/email-template.ts by hand — the two
// apps don't share a package for this.
export function renderOrderEmailHtml({
  heading,
  introHtml,
  items,
  totalGhs,
  cta,
  brand = DEFAULT_BRAND,
}: OrderEmailOptions): string {
  const bodyPx = FONT_SIZE_PX[brand.fontSize];
  const itemsHtml =
    items && items.length > 0
      ? `
        <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:${bodyPx}px;">
          ${items
            .map(
              (item) => `
            <tr>
              <td style="padding:8px 0;border-top:1px solid #e7e5e4;color:#44403c;">
                ${escapeHtml(item.name)} &times; ${item.quantity}
              </td>
              <td style="padding:8px 0;border-top:1px solid #e7e5e4;color:#111827;text-align:right;white-space:nowrap;">
                ${formatGhs(item.lineTotalGhs)}
              </td>
            </tr>`,
            )
            .join("")}
          <tr>
            <td style="padding:12px 0 0;border-top:1px solid #111827;font-weight:600;color:#111827;">
              Total
            </td>
            <td style="padding:12px 0 0;border-top:1px solid #111827;font-weight:600;color:#111827;text-align:right;">
              ${formatGhs(totalGhs)}
            </td>
          </tr>
        </table>`
      : `
        <p style="margin:24px 0;font-size:${bodyPx}px;font-weight:600;color:#111827;">
          Total: ${formatGhs(totalGhs)}
        </p>`;

  const ctaHtml = cta
    ? `
      <a href="${cta.href}" style="display:block;margin-top:8px;padding:14px 24px;background:${brand.accentColor};color:#ffffff;text-align:center;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">
        ${escapeHtml(cta.text)}
      </a>`
    : "";

  return renderEmailShell({
    heading,
    bodyHtml: `<div style="font-size:${bodyPx}px;line-height:1.6;color:#44403c;">${introHtml}</div>${itemsHtml}${ctaHtml}`,
    brand,
  });
}

// Shared by renderOrderEmailHtml above and renderMarketingEmailHtml below —
// the header band, heading, and footer every outgoing email uses, with an
// optional extra footer line (e.g. an unsubscribe link) neither order
// email ever needs. accentColor drives the header band background; the
// heading itself stays a fixed dark gray rather than tinted, so a light
// accent color chosen by the admin can never make it unreadable on the
// white body background.
function renderEmailShell({
  heading,
  bodyHtml,
  footerExtraHtml,
  brand = DEFAULT_BRAND,
}: {
  heading: string;
  bodyHtml: string;
  footerExtraHtml?: string;
  brand?: EmailBrand;
}): string {
  return `
<div style="background:#f5f5f4;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;">
    <div style="background:${brand.accentColor};padding:24px;text-align:center;">
      <span style="color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;">Luxe All Fashion</span>
    </div>
    <div style="padding:32px 28px;">
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#111827;">${escapeHtml(heading)}</h1>
      ${bodyHtml}
    </div>
    <div style="padding:20px 28px;border-top:1px solid #e7e5e4;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#a8a29e;">
        OG Luxemen &middot; Chicstyle &middot; Kiddies Space GH
      </p>
      ${footerExtraHtml ?? ""}
    </div>
  </div>
</div>`;
}

export interface MarketingEmailOptions {
  heading: string;
  bodyHtml: string;
  // Present only for a bulk campaign send (never for a 1:1 personalized
  // email or a support reply) — omitting it omits the footer line
  // entirely, rather than ever rendering a broken/empty unsubscribe link.
  unsubscribeUrl?: string;
  brand?: EmailBrand;
}

export function renderMarketingEmailHtml({
  heading,
  bodyHtml,
  unsubscribeUrl,
  brand = DEFAULT_BRAND,
}: MarketingEmailOptions): string {
  const bodyPx = FONT_SIZE_PX[brand.fontSize];
  const unsubscribeHtml = unsubscribeUrl
    ? `
      <p style="margin:8px 0 0;font-size:11px;color:#a8a29e;">
        <a href="${unsubscribeUrl}" style="color:#a8a29e;">Unsubscribe</a> from marketing emails.
      </p>`
    : "";

  return renderEmailShell({
    heading,
    bodyHtml: `<div style="font-size:${bodyPx}px;line-height:1.6;color:#44403c;">${bodyHtml}</div>`,
    footerExtraHtml: unsubscribeHtml,
    brand,
  });
}
