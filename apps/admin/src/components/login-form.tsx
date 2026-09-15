"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/password-input";
import { requestPasswordReset, signIn } from "@/lib/auth-client";
import { verifyAdminActive } from "@/app/login/actions";

const labelClass =
  "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-black/50";
const inputClass =
  "border border-black/20 bg-white px-4 py-3 text-sm text-black normal-case tracking-normal focus:border-black focus:outline-none";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    if (forgotPassword) {
      const { error: resetError } = await requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      setSubmitting(false);
      if (resetError) {
        setError("Something went wrong. Try again.");
        return;
      }
      setResetLinkSent(true);
      return;
    }

    const { error: signInError } = await signIn.email({ email, password });

    if (signInError) {
      setError("Incorrect email or password.");
      setSubmitting(false);
      return;
    }

    const activeCheck = await verifyAdminActive();
    setSubmitting(false);
    if (!activeCheck.ok) {
      setError(activeCheck.error ?? "Something went wrong. Try again.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  function backToSignIn() {
    setForgotPassword(false);
    setResetLinkSent(false);
    setError("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/50">
          Luxe All Fashion
        </p>
        <h1 className="mt-1 text-xl font-semibold">
          {forgotPassword ? "Reset Password" : "Admin Sign In"}
        </h1>

        {resetLinkSent ? (
          <div className="mt-6">
            <p className="text-sm text-black/70">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a link
              to reset your password.
            </p>
            <button
              type="button"
              onClick={backToSignIn}
              className="mt-4 text-xs font-medium uppercase tracking-[0.1em] text-black underline underline-offset-2"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label className={labelClass}>
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </label>

            {!forgotPassword && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-password" className={labelClass}>
                  Password
                </label>
                <PasswordInput id="login-password" value={password} onChange={setPassword} />
              </div>
            )}

            {!forgotPassword && (
              <button
                type="button"
                onClick={() => setForgotPassword(true)}
                className="self-end text-xs text-black/50 underline underline-offset-2 hover:text-black"
              >
                Forgot password?
              </button>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 bg-black py-3 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
            >
              {forgotPassword
                ? submitting
                  ? "Sending..."
                  : "Send Reset Link"
                : submitting
                  ? "Signing In..."
                  : "Sign In"}
            </button>

            {forgotPassword && (
              <button
                type="button"
                onClick={backToSignIn}
                className="text-xs text-black/50 underline underline-offset-2 hover:text-black"
              >
                Back to Sign In
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
