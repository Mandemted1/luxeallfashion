import OpenAI from "openai";
import { buildExtractionPrompt } from "./prompt";
import type { AiVisionParser, ParseProductInput, ParsedProductData } from "./types";

const productJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    brandName: { type: ["string", "null"] },
    description: { type: "string" },
    price_cedis: { type: ["number", "null"] },
    sizes: { type: "array", items: { type: "string" } },
    color: { type: ["string", "null"] },
    category_name: { type: ["string", "null"] },
    missing_fields: { type: "array", items: { type: "string" } },
  },
  required: [
    "title",
    "brandName",
    "description",
    "price_cedis",
    "sizes",
    "color",
    "category_name",
    "missing_fields",
  ],
  additionalProperties: false,
};

// Tried in order, same resilience pattern as the Gemini parser — a
// capacity/availability error on one falls through to the next.
const MODELS_TO_TRY = ["gpt-6-sol", "gpt-5.5", "gpt-5.4-mini"];

export class OpenAiParser implements AiVisionParser {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async parseProduct(input: ParseProductInput): Promise<ParsedProductData> {
    const prompt = buildExtractionPrompt(input.caption, input.storeLabel, input.categoryOptions);
    const imageInputs = input.images.map((buf) => ({
      type: "input_image" as const,
      detail: "auto" as const,
      image_url: `data:image/jpeg;base64,${buf.toString("base64")}`,
    }));

    let lastError: unknown;
    for (const model of MODELS_TO_TRY) {
      try {
        const response = await this.client.responses.create({
          model,
          input: [
            {
              role: "user",
              content: [{ type: "input_text", text: prompt }, ...imageInputs],
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "product_listing",
              schema: productJsonSchema,
              strict: true,
            },
          },
        });
        const parsed = JSON.parse(response.output_text);
        return {
          title: parsed.title ?? "Untitled",
          brandName: parsed.brandName || null,
          description: parsed.description ?? "",
          // Pesewas conversion happens here, in code — never trust the AI
          // to do the arithmetic itself (it consistently returned the raw
          // cedis figure unconverted when asked to multiply).
          detectedPriceGhs:
            typeof parsed.price_cedis === "number" ? Math.round(parsed.price_cedis * 100) : null,
          sizes: Array.isArray(parsed.sizes) ? parsed.sizes.filter(Boolean) : [],
          color: parsed.color || null,
          categoryName: parsed.category_name || null,
          missingFields: Array.isArray(parsed.missing_fields) ? parsed.missing_fields : [],
        };
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("OpenAI parsing failed.");
  }
}
