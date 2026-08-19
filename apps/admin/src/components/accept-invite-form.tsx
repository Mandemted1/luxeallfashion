"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { acceptInvite } from "@/app/invite/[token]/actions";
import { PasswordInput } from "@/components/password-input";

const labelClass =
  "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-black/50";
const inputClass =
  "border border-black/20 bg-white px-4 py-3 text-sm text-black normal-case tracking-normal focus:border-black focus:outline-none";

export function AcceptInviteForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await acceptInvite(token, name, password);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/50">
          Luxe All Fashion
        </p>
        <h1 className="mt-1 text-xl font-semibold">Set Up Your Account</h1>
        <p className="mt-2 text-sm text-black/60">{email}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
          <div className="flex flex-col gap-1.5">
            <label htmlFor="invite-password" className={labelClass}>
              Password
            </label>
            <PasswordInput
              id="invite-password"
              value={password}
              onChange={setPassword}
              minLength={8}
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-black py-3 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
