import type { Metadata } from "next";
import { headers } from "next/headers";
import { AccountDashboard } from "@/components/account-dashboard";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Account | Luxe All Fashion",
};

export default async function AccountPage(props: PageProps<"/account">) {
  const searchParams = await props.searchParams;
  const initialMode = searchParams.mode === "register" ? "register" : "sign-in";
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <SiteHeader />
      <div className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-10">
        {session ? (
          <AccountDashboard name={session.user.name} email={session.user.email} />
        ) : (
          <AuthForm initialMode={initialMode} />
        )}
      </div>
    </>
  );
}
