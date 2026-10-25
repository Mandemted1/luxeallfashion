// Run directly by the GitHub Actions workflow (not through Vercel) — a
// single Kiddies Space GH image can take Gemini 4-5 minutes to respond,
// well past what Vercel's Hobby plan allows a serverless function to run
// regardless of the maxDuration set in code. GitHub Actions runners have
// no such limit (up to 6 hours per job), so the actual AI-calling work
// happens here instead; Vercel keeps serving the admin site as normal.
//
// Needs the same env vars the app itself uses at runtime — DATABASE_URL,
// META_SYSTEM_USER_TOKEN, and the R2_* credentials — sourced from GitHub
// Actions secrets, not a .env file (there isn't one in CI).
import { runInstagramIngestion } from "../src/lib/instagram-ingest";

async function main() {
  const result = await runInstagramIngestion();
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length > 0) {
    console.error(`${result.errors.length} error(s) occurred during this run.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
