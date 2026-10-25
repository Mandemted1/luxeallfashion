import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@luxe/database";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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

  const adminUser = await prisma.adminUser.findUnique({
    where: { authUserId: session.user.id },
    include: { permissions: { select: { page: true } } },
  });

  // "Set Inactive" on the team page only flips this flag — it doesn't
  // revoke the session — so every request has to re-check it here, the
  // same way a missing session is re-checked above.
  if (!adminUser || !adminUser.isActive) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar
        userEmail={session.user.email}
        isOwner={adminUser.role === "OWNER"}
        accessiblePages={adminUser.permissions.map((p) => p.page)}
      />
      {/* SidebarInset already renders the <main> element itself — nesting
          another one inside it is invalid markup, so header/content go
          directly in here instead of inside a second <main>. */}
      <SidebarInset className="overflow-y-auto">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-black/10 px-4 sm:px-6 lg:px-10">
          <SidebarTrigger />
          <p className="text-sm font-semibold uppercase tracking-[0.1em] lg:hidden">
            Luxe All Admin
          </p>
        </header>
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
