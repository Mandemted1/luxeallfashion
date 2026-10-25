import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 is S3-compatible, so the regular AWS SDK works against it — just
// point the endpoint at Cloudflare instead of AWS.
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
  return { uploadUrl, publicUrl };
}

export async function deleteR2Object(publicUrl: string): Promise<void> {
  const prefix = `${process.env.R2_PUBLIC_URL}/`;
  if (!publicUrl.startsWith(prefix)) return;
  const key = publicUrl.slice(prefix.length);
  await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
}

// For server-side writes with the bytes already in hand (e.g. an image
// downloaded from Instagram during ingestion) — unlike
// createPresignedUploadUrl, which hands the browser a URL to PUT to
// itself.
export async function uploadR2Object(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
