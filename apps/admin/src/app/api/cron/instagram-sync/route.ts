import { NextResponse } from "next/server";
import { runInstagramIngestion } from "@/lib/instagram-ingest";

// Kiddies Space GH's images alone have been observed taking 4-5 minutes
// through Gemini (likely extra child-safety content review on Google's
// side) — well past the 60s default, so this needs the platform's max.
export const maxDuration = 300;

// Triggered on a schedule by a GitHub Actions workflow (Vercel's own free
// cron tier only runs once/day, too infrequent for this) — guarded by a
// shared secret rather than a session, since the caller isn't a logged-in
// admin.
export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runInstagramIngestion();
  return NextResponse.json(result);
}
