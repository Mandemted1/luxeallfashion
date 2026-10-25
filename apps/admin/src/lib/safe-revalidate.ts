import { revalidatePath } from "next/cache";

// revalidatePath throws when called outside an active Next.js request
// context — specifically the standalone Instagram sync script
// (scripts/run-instagram-sync.ts), which runs entirely outside Next.js
// in GitHub Actions. Safe to swallow: there's no Next.js cache to
// invalidate in that context anyway, and left unhandled it would make
// an already-successful database write look like it failed to the
// caller, triggering a false retry on something that actually worked.
export function safeRevalidatePath(path: string): void {
  try {
    revalidatePath(path);
  } catch {
    // Not running inside a Next.js request — nothing to invalidate.
  }
}
