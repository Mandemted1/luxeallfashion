"use client";

import { useState, type FormEvent } from "react";
import { submitContactMessage } from "@/app/contact/actions";

const labelClass =
  "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-black/50";
const inputClass =
  "border border-black/20 bg-white px-4 py-3 text-sm text-black normal-case tracking-normal focus:border-black focus:outline-none";

export function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    const result = await submitContactMessage({ name: fullName, email, message });
    if (result.error) {
      setStatus("error");
      setError(result.error);
      return;
    }
    setStatus("success");
    setFullName("");
    setEmail("");
    setMessage("");
  }

  if (status === "success") {
    return (
      <p className="text-sm text-black/70">
        Thank you — your message has been sent. We&apos;ll be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className={labelClass}>
        Full Name
        <input
          type="text"
          required
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className={inputClass}
        />
      </label>

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

      <label className={labelClass}>
        Message
        <textarea
          required
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={inputClass}
        />
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 bg-black py-4 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
      >
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
