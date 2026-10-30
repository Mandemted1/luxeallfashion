import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

// Keeps a provider's API key from sitting in the database as plain text —
// a leaked DATABASE_URL or any read access to the DB would otherwise hand
// over the live key immediately. The encryption key itself lives only in
// this env var, never in the database.
const ALGORITHM = "aes-256-gcm";
const ENCRYPTED_PREFIX = "gcm1:";

function deriveKey(secret: string): Buffer {
  // Fixed salt is fine here — the actual entropy comes from the secret
  // itself (a long random env value), this just adapts it to the 32-byte
  // key AES-256 needs, it isn't stretching a user-chosen password.
  return scryptSync(secret, "luxe-ai-provider-key", 32);
}

// Encryption is best-effort: if the secret isn't configured yet, this
// falls back to storing the value as-is (with a warning) rather than
// breaking the save entirely — the pipeline keeps working either way,
// and saving again once the secret is set encrypts it properly.
export function encryptSecret(plainText: string): string {
  const secret = process.env.AI_KEY_ENCRYPTION_SECRET;
  if (!secret) {
    console.warn("[ai-providers] AI_KEY_ENCRYPTION_SECRET isn't set — storing this key as plain text.");
    return plainText;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, deriveKey(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${ENCRYPTED_PREFIX}${iv.toString("base64")}:${authTag.toString("base64")}:${ciphertext.toString("base64")}`;
}

// Anything saved before encryption existed (or saved without the secret
// configured) is still plain text — returned as-is rather than failing,
// so an already-working integration doesn't break the moment this ships.
export function decryptSecret(stored: string): string {
  if (!stored.startsWith(ENCRYPTED_PREFIX)) return stored;

  const secret = process.env.AI_KEY_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("AI_KEY_ENCRYPTION_SECRET isn't set — can't decrypt the saved AI provider key.");
  }

  const [ivB64, authTagB64, ciphertextB64] = stored.slice(ENCRYPTED_PREFIX.length).split(":");
  const decipher = createDecipheriv(ALGORITHM, deriveKey(secret), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, "base64")),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
}
