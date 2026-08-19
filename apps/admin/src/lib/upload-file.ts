export async function uploadFile(file: File, folder: string): Promise<string> {
  const presignResponse = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, folder }),
  });

  if (!presignResponse.ok) {
    const body = await presignResponse.json().catch(() => ({}));
    throw new Error(body.error || "Could not start upload.");
  }

  const { uploadUrl, publicUrl } = await presignResponse.json();

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Upload to storage failed.");
  }

  return publicUrl as string;
}
