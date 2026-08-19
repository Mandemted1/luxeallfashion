"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

// Order history and saved addresses aren't shown here yet — there's no
// real checkout/order backend wired up, so this stays honest about what
// actually exists: who you're signed in as, and a way to sign out.
export function AccountDashboard({ name, email }: { name: string; email: string }) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <h1 className="text-2xl font-normal">Welcome back, {name}</h1>
      <p className="mt-2 text-sm text-black/60">{email}</p>
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-8 border border-black px-8 py-3 text-xs font-medium uppercase tracking-[0.15em] transition-colors hover:bg-black hover:text-white"
      >
        Sign Out
      </button>
    </div>
  );
}
