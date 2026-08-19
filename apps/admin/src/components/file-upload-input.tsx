"use client";

import { useId, useState } from "react";
import { uploadFile } from "@/lib/upload-file";

export function FileUploadInput({
  folder,
  accept = "image/*",
  label = "Upload",
  onUploaded,
}: {
  folder: string;
  accept?: string;
  label?: string;
  onUploaded: (url: string) => void;
}) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await uploadFile(file, folder);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div>
      <label
        htmlFor={id}
        className={`inline-flex cursor-pointer items-center border border-black/15 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.08em] text-black/70 transition-colors hover:border-black/40 hover:text-black ${
          uploading ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {uploading ? "Uploading..." : label}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={uploading}
        onChange={handleChange}
        className="sr-only"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
