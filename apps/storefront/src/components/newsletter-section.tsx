"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { subscribeToNewsletter } from "@/app/newsletter-actions";

export function NewsletterSection({ heading }: { heading: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    const result = await subscribeToNewsletter(email, "footer");
    if (result.error) {
      setStatus("error");
      setError(result.error);
      return;
    }
    setStatus("success");
    setEmail("");
  }

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-10">
      <h2 className="max-w-xl text-2xl font-normal leading-tight sm:text-4xl">
        {heading}
      </h2>

      {status === "success" ? (
        <p className="mt-10 max-w-xl text-sm text-black/70 sm:mt-12">
          Thank you — you&apos;re on the list.
        </p>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="mt-10 flex items-end gap-6 border-b border-black/70 pb-2 sm:mt-12"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email"
              className="flex-1 bg-transparent text-xs uppercase tracking-[0.15em] text-black placeholder:text-black/50 focus:outline-none sm:text-sm"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="shrink-0 text-xs font-medium uppercase tracking-[0.15em] underline underline-offset-4 hover:opacity-70 disabled:opacity-50"
            >
              {status === "submitting" ? "Confirming..." : "Confirm"}
            </button>
          </form>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </>
      )}

      <p className="mt-4 max-w-3xl text-[11px] uppercase tracking-[0.03em] text-black/50">
        By confirming my subscription, I agree to receive the newsletter. For
        more information, read the{" "}
        <Link href="/privacy-policy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </section>
  );
}
