"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { registerCustomer } from "@/app/account/actions";
import { UserIcon } from "@/components/icons";
import { PasswordInput } from "@/components/password-input";
import { signIn } from "@/lib/auth-client";

type Mode = "sign-in" | "register";

const labelClass =
  "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-black/50";
const inputClass =
  "border border-black/20 bg-white px-4 py-3 text-sm text-black normal-case tracking-normal focus:border-black focus:outline-none";

export function AuthForm({ initialMode = "sign-in" }: { initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const isSignIn = mode === "sign-in";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    if (isSignIn) {
      const { error: signInError } = await signIn.email({ email, password });
      if (signInError) {
        setError("Incorrect email or password.");
        setSubmitting(false);
        return;
      }
    } else {
      const result = await registerCustomer(name, email, phone, password);
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3 text-base">
        <button
          type="button"
          onClick={() => switchMode("sign-in")}
          className={isSignIn ? "font-semibold text-black" : "text-black/40 transition-colors hover:text-black"}
        >
          Sign In
        </button>
        <span className="text-black/30">/</span>
        <button
          type="button"
          onClick={() => switchMode("register")}
          className={!isSignIn ? "font-semibold text-black" : "text-black/40 transition-colors hover:text-black"}
        >
          Register
        </button>
      </div>

      <div className="mt-10 w-full max-w-xl bg-stone-200 p-8 sm:p-12">
        <div className="flex items-center gap-3 border-b border-black/15 pb-6">
          <UserIcon className="h-6 w-6" />
          <h1 className="text-xl font-normal">
            {isSignIn ? "Login" : "Create Account"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-6">
          {!isSignIn && (
            <label className={labelClass}>
              Full Name
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
              />
            </label>
          )}

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

          {!isSignIn && (
            <label className={labelClass}>
              Phone
              <input
                type="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={inputClass}
              />
            </label>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-password" className={labelClass}>
              Password
            </label>
            <PasswordInput
              id="auth-password"
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
            {submitting
              ? isSignIn
                ? "Signing In..."
                : "Creating Account..."
              : isSignIn
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>
      </div>

      <p className="mt-8 text-center text-xs uppercase tracking-[0.1em] text-black/50">
        {isSignIn ? (
          <>
            Do not have an account yet?{" "}
            <button
              type="button"
              onClick={() => switchMode("register")}
              className="text-black underline underline-offset-2"
            >
              Create Account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("sign-in")}
              className="text-black underline underline-offset-2"
            >
              Sign In
            </button>
          </>
        )}
      </p>
    </div>
  );
}
