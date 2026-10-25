// Shared shape every provider's parser returns — this is what lets the
// ingestion pipeline (instagram-ingest.ts) stay provider-agnostic. Add a
// new provider by implementing this interface, not by branching on
// provider name anywhere else in the codebase.
export interface ParsedProductData {
  title: string;
  // The manufacturer/designer (e.g. "ZARA"), not the store — matches
  // Product.brandName. Null if the post gives no real signal of one.
  brandName: string | null;
  description: string;
  // Pesewas (GHS cents), same convention as the rest of the catalog.
  // Null if no price could be confidently read off the post.
  detectedPriceGhs: number | null;
  sizes: string[];
  color: string | null;
  // Must exactly match one of ParseProductInput.categoryOptions — null if
  // nothing in the list is a confident fit. Resolved to a real categoryId
  // by the caller (instagram-ingest.ts), never trusted as an id itself.
  categoryName: string | null;
  // Fields the admin should double check / fill in before approving.
  missingFields: string[];
}

export interface ParseProductInput {
  // JPEG bytes, already downloaded — up to 3 images from the post.
  images: Buffer[];
  caption: string;
  // e.g. "OG Luxemen" — passed into the prompt so the AI knows which
  // store's catalog voice to write in.
  storeLabel: string;
  // This store's existing category names — the AI picks from this closed
  // list rather than inventing one, since only an exact match can be
  // resolved back to a real categoryId afterward.
  categoryOptions: string[];
}

export interface AiVisionParser {
  parseProduct(input: ParseProductInput): Promise<ParsedProductData>;
}
