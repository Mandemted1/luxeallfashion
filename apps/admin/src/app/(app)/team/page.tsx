import type { Metadata } from "next";
import { headers } from "next/headers";
import { prisma } from "@luxe/database";
import { TeamContent } from "@/components/team-content";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Team | Luxe All Fashion Admin",
};

// Without this, Next.js can serve a cached render of admin-mutated data.
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentAdmin = session
    ? await prisma.adminUser.findUnique({ where: { authUserId: session.user.id } })
    : null;

  if (currentAdmin?.role !== "OWNER") {
    return (
      <div>
        <h1 className="text-3xl font-semibold">Team</h1>
        <p className="mt-4 text-sm text-black/60">
          Only the account owner can manage the team.
        </p>
      </div>
    );
  }

  const [adminUsers, invites] = await Promise.all([
    prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.adminInvite.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <TeamContent
      currentAdminId={currentAdmin.id}
      adminUsers={adminUsers}
      invites={invites}
    />
  );
}
