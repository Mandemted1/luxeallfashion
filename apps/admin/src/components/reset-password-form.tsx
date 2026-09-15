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
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-sm bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">Password Updated</h1>
          <p className="mt-3 text-sm text-black/70">
            Your password has been reset. You can now sign in with it.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-6 w-full bg-black py-3 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/50">
          Luxe All Fashion Admin
        </p>
        <h1 className="mt-1 text-xl font-semibold">Set a New Password</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-password" className={labelClass}>
              New Password
            </label>
            <PasswordInput id="new-password" value={password} onChange={setPassword} />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-black py-3 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
