import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Reset Password | Luxe All Fashion",
};

export default async function ResetPasswordPage(props: PageProps<"/reset-password">) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : undefined;

  return (
    <>
      <SiteHeader />
      <div className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-10">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-2xl font-semibold">Invalid Link</h1>
            <p className="text-sm text-black/60">
              This password reset link is missing or invalid.
            </p>
            <Link href="/account" className="text-sm underline underline-offset-4">
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
