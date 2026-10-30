import { prisma } from "@luxe/database";

export type EmailFontSize = "small" | "medium" | "large";

export interface EmailBrand {
  accentColor: string;
  fontSize: EmailFontSize;
}

const SETTINGS_ID = "singleton";

const DEFAULT_EMAIL_BRAND: EmailBrand = {
  accentColor: "#000000",
  fontSize: "medium",
};

export async function getEmailBrand(): Promise<EmailBrand> {
  const settings = await prisma.emailBrandSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (!settings) return DEFAULT_EMAIL_BRAND;
  return { accentColor: settings.accentColor, fontSize: settings.fontSize as EmailFontSize };
}

export async function saveEmailBrand(brand: EmailBrand): Promise<void> {
  await prisma.emailBrandSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, accentColor: brand.accentColor, fontSize: brand.fontSize },
    update: { accentColor: brand.accentColor, fontSize: brand.fontSize },
  });
}
