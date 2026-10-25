import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { buildExtractionPrompt } from "./prompt";
import type { AiVisionParser, ParseProductInput, ParsedProductData } from "./types";

const productSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    brandName: { type: Type.STRING, nullable: true },
    description: { type: Type.STRING },
    price_cedis: { type: Type.NUMBER, nullable: true },
    sizes: { type: Type.ARRAY, items: { type: Type.STRING } },
    color: { type: Type.STRING, nullable: true },
    category_name: { type: Type.STRING, nullable: true },
    missing_fields: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["title", "description", "sizes", "missing_fields"],
};

// Tried in order — a 503 (capacity) on one falls through to the next with
// backoff, rather than failing the whole ingestion run over a transient
// overload on a single model.
const MODELS_TO_TRY = ["gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash"];

export class GeminiParser implements AiVisionParser {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async parseProduct(input: ParseProductInput): Promise<ParsedProductData> {
    const imageParts = input.images.map((buf) => ({
      inlineData: { mimeType: "image/jpeg", data: buf.toString("base64") },
    }));
    const prompt = buildExtractionPrompt(input.caption, input.storeLabel, input.categoryOptions);

    let lastError: unknown;
    for (const modelName of MODELS_TO_TRY) {
      let retries = 3;
      let delay = 2000;
      while (retries > 0) {
        try {
          const response = await this.ai.models.generateContent({
            model: modelName,
            contents: [...imageParts, prompt],
            config: {
              responseMimeType: "application/json",
              responseSchema: productSchema,
              temperature: 0.2,
            },
          });
          const parsed = JSON.parse(response.text ?? "{}");
          return {
            title: parsed.title ?? "Untitled",
            brandName: parsed.brandName || null,
            description: parsed.description ?? "",
            // Pesewas conversion happens here, in code — never trust the
            // AI to do the arithmetic itself (it consistently returned
            // the raw cedis figure unconverted when asked to multiply).
            detectedPriceGhs:
              typeof parsed.price_cedis === "number" ? Math.round(parsed.price_cedis * 100) : null,
            sizes: Array.isArray(parsed.sizes) ? parsed.sizes.filter(Boolean) : [],
            color: parsed.color || null,
            categoryName: parsed.category_name || null,
            missingFields: Array.isArray(parsed.missing_fields) ? parsed.missing_fields : [],
          };
        } catch (err) {
          lastError = err;
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes("503")) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
            retries--;
          } else {
            break;
          }
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Gemini parsing failed.");
  }
}
