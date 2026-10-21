"use client";

// Client-side counterpart to paystack.ts's initializeTransaction: resumes a
// transaction that was already initialized server-side (with the secret
// key, which locks in the server-computed amount) using only its access
// code — Paystack's documented pattern for Inline v2 ("initialize on your
// server, then resume on the client"). This is what lets the Card/Mobile
// Money choice happen in an overlay on our own site instead of a redirect
// to Paystack's hosted page.
const INLINE_SCRIPT_URL = "https://js.paystack.co/v2/inline.js";

export interface PaystackResumeHandlers {
  onSuccess: () => void;
  onCancel: () => void;
  onError?: (error: { message: string }) => void;
}

interface PaystackPopInstance {
  resumeTransaction(accessCode: string, handlers: PaystackResumeHandlers): void;
}

declare global {
  interface Window {
    PaystackPop?: new () => PaystackPopInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadInlineScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = INLINE_SCRIPT_URL;
      script.onload = () => resolve();
      script.onerror = () => {
        // Lets a retry (e.g. after the visitor's connection recovers) try again.
        scriptPromise = null;
        reject(new Error("Could not load Paystack."));
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

// onSuccess here is only a client-side signal that the popup closed with a
// completed charge — the webhook (and the /checkout/complete page's own
// fallback verify) are what actually confirm the payment and mark the
// order paid, exactly as the redirect flow worked before this.
export async function resumePaystackCheckout(
  accessCode: string,
  handlers: PaystackResumeHandlers,
): Promise<void> {
  await loadInlineScript();
  if (!window.PaystackPop) throw new Error("Could not load Paystack.");
  new window.PaystackPop().resumeTransaction(accessCode, handlers);
}
