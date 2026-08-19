import { formatGhs } from "@/lib/currency";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
}

// Inline-styled, table-free single column layout — the safest baseline for
// rendering consistently across email clients (Gmail, Outlook, Apple Mail
// all strip or mangle <style> blocks and modern CSS differently).
export function renderOrderEmailHtml({
  heading,
  introHtml,
  items,
  totalGhs,
  cta,
}: OrderEmailOptions): string {
  const itemsHtml =
    items && items.length > 0
      ? `
        <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;">
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
        <p style="margin:24px 0;font-size:14px;font-weight:600;color:#111827;">
          Total: ${formatGhs(totalGhs)}
        </p>`;

  const ctaHtml = cta
    ? `
      <a href="${cta.href}" style="display:block;margin-top:8px;padding:14px 24px;background:#000000;color:#ffffff;text-align:center;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">
        ${escapeHtml(cta.text)}
      </a>`
    : "";

  return `
<div style="background:#f5f5f4;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;">
    <div style="background:#000000;padding:24px;text-align:center;">
      <span style="color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;">Luxe All Fashion</span>
    </div>
    <div style="padding:32px 28px;">
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#111827;">${escapeHtml(heading)}</h1>
      <div style="font-size:14px;line-height:1.6;color:#44403c;">${introHtml}</div>
      ${itemsHtml}
      ${ctaHtml}
    </div>
    <div style="padding:20px 28px;border-top:1px solid #e7e5e4;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#a8a29e;">
        OG Luxemen &middot; Chicstyle &middot; Kiddies Space GH
      </p>
    </div>
  </div>
</div>`;
}
