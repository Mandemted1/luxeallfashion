import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { auth } from "@/lib/auth";

// Every route in this group requires a real session — checked here once,
// server-side, rather than per-page. /login and /invite/[token] sit
// outside this group deliberately, so they render without a sidebar and
// without needing a session themselves.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-full min-h-full">
      <AdminSidebar userEmail={session.user.email} />
      <main className="flex-1 overflow-y-auto px-10 py-10">{children}</main>
    </div>
  );
}
