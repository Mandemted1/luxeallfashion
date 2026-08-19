"use client";

import { useState, type FormEvent } from "react";
import { CONTACT_EMAIL } from "@/lib/contact-info";

const labelClass =
  "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-black/50";
const inputClass =
  "border border-black/20 bg-white px-4 py-3 text-sm text-black normal-case tracking-normal focus:border-black focus:outline-none";

// There's no backend to receive this yet, so submitting hands off to the
// visitor's own email app (pre-filled) rather than claiming it was sent.
export function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = `Message from ${fullName}`;
    const body = `${message}\n\nFrom: ${fullName} (${email})`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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

      <button
        type="submit"
        className="mt-2 bg-black py-4 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800"
      >
        Send Message
      </button>
      <p className="text-xs text-black/40">
        This opens your email app with the message pre-filled.
      </p>
    </form>
  );
}
