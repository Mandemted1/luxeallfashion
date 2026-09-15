"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PasswordInput } from "@/components/password-input";
import { resetPassword } from "@/lib/auth-client";

const labelClass =
  "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-black/50";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const { error: resetError } = await resetPassword({ newPassword: password, token });
    setSubmitting(false);
    if (resetError) {
      setError(
        "This link is invalid or has expired. Request a new one from the sign-in page.",
      );
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mt-10 w-full max-w-xl bg-stone-200 p-8 sm:p-12">
          <h1 className="text-xl font-normal">Password Updated</h1>
          <p className="mt-4 text-sm text-black/70">
            Your password has been reset. You can now sign in with it.
          </p>
          <button
            type="button"
            onClick={() => router.push("/account")}
            className="mt-6 bg-black px-8 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mt-10 w-full max-w-xl bg-stone-200 p-8 sm:p-12">
        <h1 className="text-xl font-normal border-b border-black/15 pb-6">
          Set a New Password
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-password" className={labelClass}>
              New Password
            </label>
            <PasswordInput
              id="new-password"
              value={password}
              onChange={setPassword}
              minLength={8}
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-black py-4 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
