import Anthropic from "@anthropic-ai/sdk";
import { buildExtractionPrompt } from "./prompt";
import type { AiVisionParser, ParseProductInput, ParsedProductData } from "./types";

const EXTRACT_TOOL_NAME = "extract_product_listing";

const extractTool = {
  name: EXTRACT_TOOL_NAME,
  description: "Record the extracted product listing fields.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string" },
      brandName: { type: "string", description: "Null/omitted if no designer brand is identifiable." },
      description: { type: "string" },
      price_cedis: { type: "number", description: "Plain number as written, no conversion. Omit if not confidently detected." },
      sizes: { type: "array", items: { type: "string" } },
      color: { type: "string", description: "Omit if not confidently detected." },
      category_name: { type: "string", description: "Omit if nothing in the provided list is a confident fit." },
      missing_fields: { type: "array", items: { type: "string" } },
    },
    required: ["title", "description", "sizes", "missing_fields"],
  },
};

// Tried in order, same resilience pattern as the other providers.
const MODELS_TO_TRY = ["claude-haiku-4-5-20251001", "claude-sonnet-5"];

export class AnthropicParser implements AiVisionParser {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async parseProduct(input: ParseProductInput): Promise<ParsedProductData> {
    const prompt = buildExtractionPrompt(input.caption, input.storeLabel, input.categoryOptions);
    const imageBlocks = input.images.map((buf) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: "image/jpeg" as const,
        data: buf.toString("base64"),
      },
    }));

    let lastError: unknown;
    for (const model of MODELS_TO_TRY) {
      try {
        const response = await this.client.messages.create({
          model,
          max_tokens: 1024,
          tools: [extractTool],
          tool_choice: { type: "tool", name: EXTRACT_TOOL_NAME },
          messages: [
            {
              role: "user",
              content: [...imageBlocks, { type: "text", text: prompt }],
            },
          ],
        });

        const toolUse = response.content.find(
          (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
        );
        if (!toolUse) throw new Error("Anthropic response had no tool_use block.");

        const parsed = toolUse.input as Record<string, unknown>;
        return {
          title: typeof parsed.title === "string" ? parsed.title : "Untitled",
          brandName: typeof parsed.brandName === "string" && parsed.brandName ? parsed.brandName : null,
          description: typeof parsed.description === "string" ? parsed.description : "",
          // Pesewas conversion happens here, in code — never trust the AI
          // to do the arithmetic itself (it consistently returned the raw
          // cedis figure unconverted when asked to multiply).
          detectedPriceGhs:
            typeof parsed.price_cedis === "number" ? Math.round(parsed.price_cedis * 100) : null,
          sizes: Array.isArray(parsed.sizes) ? parsed.sizes.filter(Boolean) : [],
          color: typeof parsed.color === "string" && parsed.color ? parsed.color : null,
          categoryName:
            typeof parsed.category_name === "string" && parsed.category_name ? parsed.category_name : null,
          missingFields: Array.isArray(parsed.missing_fields) ? (parsed.missing_fields as string[]) : [],
        };
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Anthropic parsing failed.");
  }
}
