import { prisma } from "@luxe/database";

// Storefront's own small copy of apps/admin/src/lib/email-brand.ts — same
// accepted duplication as email-template.ts and order-email-templates.ts:
// both apps read the same EmailBrandSettings row, each keeps a thin
// reader rather than sharing a non-Prisma package.
export type EmailFontSize = "small" | "medium" | "large";

export interface EmailBrand {
  accentColor: string;
  fontSize: EmailFontSize;
}

const DEFAULT_EMAIL_BRAND: EmailBrand = {
  accentColor: "#000000",
  fontSize: "medium",
};

export async function getEmailBrand(): Promise<EmailBrand> {
  const settings = await prisma.emailBrandSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) return DEFAULT_EMAIL_BRAND;
  return { accentColor: settings.accentColor, fontSize: settings.fontSize as EmailFontSize };
}
