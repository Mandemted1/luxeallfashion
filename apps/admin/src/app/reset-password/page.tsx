import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | Luxe All Fashion Admin",
};

export default async function ResetPasswordPage(props: PageProps<"/reset-password">) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : undefined;

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 px-4 text-center">
        <h1 className="text-xl font-semibold">Invalid Link</h1>
        <p className="text-sm text-black/60">
          This password reset link is missing or invalid.
        </p>
        <Link href="/login" className="text-sm underline underline-offset-4">
          Back to Sign In
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
