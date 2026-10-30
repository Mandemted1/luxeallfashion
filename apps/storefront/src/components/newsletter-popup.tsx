"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { subscribeToNewsletter } from "@/app/newsletter-actions";
import { CloseIcon } from "@/components/icons";
import { cookieDomain } from "@/lib/cookie-domain";

const DISMISSED_COOKIE = "luxe-newsletter-popup-dismissed";
const DISMISSED_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year
const SHOW_DELAY_MS = 6000;

// A cookie (not localStorage) so "already seen this" carries over between
// brand subdomains — localStorage is locked to the exact origin it was
// written on, so dismissing the popup on chicstyle.luxeallfashion.com
// wouldn't stop it from popping up again on ogluxemen.luxeallfashion.com.
function hasDismissedCookie(): boolean {
  return document.cookie.split("; ").some((entry) => entry.startsWith(`${DISMISSED_COOKIE}=`));
}

function setDismissedCookie() {
  const domain = cookieDomain();
  document.cookie = `${DISMISSED_COOKIE}=true; path=/; max-age=${DISMISSED_MAX_AGE_SECONDS}; samesite=lax${
    domain ? `; domain=${domain}` : ""
  }`;
}

export function NewsletterPopup({
  enabled,
  heading,
  body,
}: {
  enabled: boolean;
  heading: string;
  body: string;
}) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  // Shown once per browser, on a delay, to a visitor who hasn't already
  // seen it — recorded the moment it's shown (not just on dismiss/submit),
  // so leaving the page without closing it doesn't bring it back on the
  // next page.
  useEffect(() => {
    if (!enabled) return;
    if (hasDismissedCookie()) return;

    const timer = setTimeout(() => {
      setVisible(true);
      setDismissedCookie();
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  function dismiss() {
    setVisible(false);
    setDismissedCookie();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    const result = await subscribeToNewsletter(email, "popup");
    if (result.error) {
      setStatus("error");
      setError(result.error);
      return;
    }
    setStatus("success");
    setDismissedCookie();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={dismiss}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-white p-8 text-black sm:p-10">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 hover:opacity-60"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        {status === "success" ? (
          <div className="text-center">
            <h2 className="text-xl font-normal">Thank you</h2>
            <p className="mt-3 text-sm text-black/70">
              You&apos;re on the list — we&apos;ll be in touch.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-normal leading-tight sm:text-2xl">{heading}</h2>
            <p className="mt-3 text-sm text-black/70">{body}</p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email"
                className="border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-black/50 focus:border-black focus:outline-none"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="bg-black py-3 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
              >
                {status === "submitting" ? "Signing up..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-4 text-[11px] uppercase tracking-[0.03em] text-black/50">
              By signing up, I agree to receive the newsletter. For more
              information, read the{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}
