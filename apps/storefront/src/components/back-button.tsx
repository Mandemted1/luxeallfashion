"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group mb-6 flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.15em] text-black/60 transition-colors hover:text-black"
    >
      <ChevronLeftIcon className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5" />
      Back
    </button>
  );
}
