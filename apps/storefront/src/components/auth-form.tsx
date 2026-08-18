"use client";

import { useState, type FormEvent } from "react";
import { UserIcon } from "@/components/icons";

type Mode = "sign-in" | "register";

const labelClass =
  "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-black/50";
const inputClass =
  "border border-black/20 bg-white px-4 py-3 text-sm text-black normal-case tracking-normal focus:border-black focus:outline-none";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const isSignIn = mode === "sign-in";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3 text-base">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={isSignIn ? "font-semibold text-black" : "text-black/40 transition-colors hover:text-black"}
        >
          Sign In
        </button>
        <span className="text-black/30">/</span>
        <button
          type="button"
          onClick={() => setMode("register")}
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
              <input type="text" required className={inputClass} />
            </label>
          )}

          <label className={labelClass}>
            Email
            <input type="email" required className={inputClass} />
          </label>

          {!isSignIn && (
            <label className={labelClass}>
              Phone
              <input type="tel" required className={inputClass} />
            </label>
          )}

          <label className={labelClass}>
            Password
            <input type="password" required minLength={8} className={inputClass} />
          </label>

          <button
            type="submit"
            className="mt-2 bg-black py-4 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800"
          >
            {isSignIn ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>

      <p className="mt-8 text-center text-xs uppercase tracking-[0.1em] text-black/50">
        {isSignIn ? (
          <>
            Do not have an account yet?{" "}
            <button
              type="button"
              onClick={() => setMode("register")}
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
              onClick={() => setMode("sign-in")}
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
