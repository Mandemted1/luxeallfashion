import { prisma } from "@luxe/database";
import { AnthropicParser } from "./anthropic";
import { GeminiParser } from "./gemini";
import { OpenAiParser } from "./openai";
import type { AiVisionParser } from "./types";

export type { AiVisionParser, ParsedProductData, ParseProductInput } from "./types";

const SETTINGS_ID = "singleton";

export interface AiIntegrationStatus {
  provider: "GEMINI" | "OPENAI" | "ANTHROPIC";
  hasApiKey: boolean;
  updatedAt: Date | null;
  isPaused: boolean;
}

export async function getAiIntegrationStatus(): Promise<AiIntegrationStatus> {
  const settings = await prisma.aiIntegrationSettings.findUnique({ where: { id: SETTINGS_ID } });
  return {
    provider: settings?.provider ?? "GEMINI",
    hasApiKey: Boolean(settings?.apiKey),
    updatedAt: settings?.apiKey ? settings.updatedAt : null,
    isPaused: settings?.isPaused ?? false,
  };
}

// Global on/off switch for the whole ingestion pipeline — checked inside
// runInstagramIngestion() itself, so it applies no matter which entry
// point calls it (the GitHub Actions cron, a manual dispatch from the
// admin UI, or a local run of the script).
export async function setInstagramSyncPaused(paused: boolean): Promise<void> {
  await prisma.aiIntegrationSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, isPaused: paused },
    update: { isPaused: paused },
  });
}

export async function isInstagramSyncPaused(): Promise<boolean> {
  const settings = await prisma.aiIntegrationSettings.findUnique({
    where: { id: SETTINGS_ID },
    select: { isPaused: true },
  });
  return settings?.isPaused ?? false;
}

// Posts from before this point are never queued by discovery — a
// one-time "start from here" line, not a rolling daily window. Null
// means no cutoff is set.
export async function getInstagramDiscoverSince(): Promise<Date | null> {
  const settings = await prisma.aiIntegrationSettings.findUnique({
    where: { id: SETTINGS_ID },
    select: { discoverSince: true },
  });
  return settings?.discoverSince ?? null;
}

export async function setInstagramDiscoverSince(date: Date | null): Promise<void> {
  await prisma.aiIntegrationSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, discoverSince: date },
    update: { discoverSince: date },
  });
}

export async function saveAiIntegrationSettings(
  provider: "GEMINI" | "OPENAI" | "ANTHROPIC",
  apiKey: string,
): Promise<void> {
  await prisma.aiIntegrationSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, provider, apiKey },
    update: { provider, apiKey },
  });
}

// Clears the key but keeps the provider choice — sync just goes back to
// "not connected" until a new key is saved, same as if one had never
// been set.
export async function removeAiIntegrationSettings(): Promise<void> {
  await prisma.aiIntegrationSettings.updateMany({
    where: { id: SETTINGS_ID },
    data: { apiKey: "" },
  });
}

// Returns null when no provider is configured yet (no key saved) — callers
// should treat that as "ingestion can't run right now", not throw.
export async function getActiveParser(): Promise<{
  parser: AiVisionParser;
  provider: "GEMINI" | "OPENAI" | "ANTHROPIC";
} | null> {
  const settings = await prisma.aiIntegrationSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (!settings?.apiKey) return null;

  switch (settings.provider) {
    case "GEMINI":
      return { parser: new GeminiParser(settings.apiKey), provider: "GEMINI" };
    case "OPENAI":
      return { parser: new OpenAiParser(settings.apiKey), provider: "OPENAI" };
    case "ANTHROPIC":
      return { parser: new AnthropicParser(settings.apiKey), provider: "ANTHROPIC" };
  }
}
