// Shared across every provider so the extraction behaves the same
// regardless of which AI is actually configured.
export function buildExtractionPrompt(
  caption: string,
  storeLabel: string,
  categoryOptions: string[],
): string {
  const categoryList =
    categoryOptions.length > 0
      ? categoryOptions.map((name) => `- ${name}`).join("\n")
      : "(no categories set up for this store yet)";

  return `You are a catalog manager for LuxeAll Fashion (luxeallfashion.com), extracting a product listing from a post on the "${storeLabel}" Instagram account.

Caption: "${caption}"

Write a short, clean product title and a brief sales description — 1-2 sentences, under 40 words, no emojis, hashtags, social slang, or em dashes (—) or en dashes (–) anywhere in either one; use a comma or period instead. Detect the designer/manufacturer brand if the caption or image clearly shows one (e.g. "ZARA", "Nike") — leave it out if there's no real signal, don't guess. Detect currency, sizes, and primary color only if you're confident; leave them out and list them in missing_fields otherwise.

For price_cedis: report the plain number exactly as it appears next to the currency marker (Ghc, GHS, ₵) — do not convert, scale, or do any math on it. "Ghc 2650" -> 2650. "GHS2,650.00" -> 2650. Treat a comma as a thousands separator, not a decimal point. Null if no price is confidently detected.

This store's existing categories:
${categoryList}

Pick the single best-matching category from that exact list for category_name — copy the name exactly as listed, character for character. If nothing on the list is a confident fit, use null rather than guessing or inventing a new category name.`;
}

export const EXTRACTION_SCHEMA_DESCRIPTION = {
  title: "Short, clean, professional product name.",
  brandName: "Designer/manufacturer brand if clearly identifiable (e.g. ZARA), else null.",
  description: "Brief sales copy, 1-2 sentences, under 40 words — no emojis, hashtags, social slang, or dashes of any kind.",
  price_cedis: "Plain number as it appears next to the currency marker, no conversion applied by the AI, e.g. 'Ghc 2800' -> 2800. Null if not confidently detected.",
  currency: "Currency code if different from GHS, informational only.",
  sizes: "Array of detected sizes, e.g. ['S', 'M', 'L'] or ['42']. Empty array if none detected.",
  color: "Primary item color. Null if not confidently detected.",
  category_name: "Exact name copied from the provided category list, or null if none fit.",
  missing_fields: "Which of title/price_cedis/sizes/color could not be confidently determined.",
} as const;
