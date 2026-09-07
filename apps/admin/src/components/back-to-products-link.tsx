"use client";

import { useRouter } from "next/navigation";

export function BackToProductsLink() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-xs font-medium uppercase tracking-[0.1em] text-black/50 hover:text-black"
    >
      ← Back to Products
    </button>
  );
}
