export function buildWhatsAppLink(localPhone: string, message: string): string {
  const digits = localPhone.replace(/\D/g, "");
  const international = digits.startsWith("0") ? `233${digits.slice(1)}` : digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}
