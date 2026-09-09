import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPresignedUploadUrl } from "@/lib/r2";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

// HEIC/HEIF report as image/* but most browsers other than Safari can't
// actually display them — everything else under image/* is safe to accept,
// rather than trying to enumerate every MIME string a camera or OS might
// report (e.g. some send "image/jpg" instead of the standard "image/jpeg").
const BLOCKED_IMAGE_TYPES = ["image/heic", "image/heif"];

function isAllowedType(contentType: string): boolean {
  if (contentType.startsWith("image/")) {
    return !BLOCKED_IMAGE_TYPES.includes(contentType);
  }
  return ALLOWED_VIDEO_TYPES.includes(contentType);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const filename = typeof body?.filename === "string" ? body.filename : "";
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const folder = typeof body?.folder === "string" ? body.folder : "uploads";

  if (!isAllowedType(contentType)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "");
  const extension = filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const key = `${safeFolder || "uploads"}/${randomBytes(8).toString("hex")}.${extension}`;

  try {
    const { uploadUrl, publicUrl } = await createPresignedUploadUrl(key, contentType);
    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (error) {
    console.error("[R2 presign error]", error);
    return NextResponse.json({ error: "Could not start upload." }, { status: 500 });
  }
}
