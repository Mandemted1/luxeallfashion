import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma, type AdminAction, type AdminPage, type AdminRole } from "@luxe/database";
import { auth } from "@/lib/auth";

export type { AdminAction, AdminPage };
export { ADMIN_ACTIONS, ADMIN_PAGES } from "@/lib/admin-pages";

export interface SessionAdmin {
  id: string;
  role: AdminRole;
  isActive: boolean;
  permissions: { page: AdminPage }[];
  actionGrants: { action: AdminAction }[];
}

// Exported so a route handler that isn't tied to one specific AdminPage
// (e.g. the upload presign route, used from several pages) can still
// check "is this a real, active admin session" without duplicating the
// isActive check inline — that duplication is exactly what let a
// deactivated admin's still-live session keep uploading files.
export async function getSessionAdmin(): Promise<SessionAdmin | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const adminUser = await prisma.adminUser.findUnique({
    where: { authUserId: session.user.id },
    include: {
      permissions: { select: { page: true } },
      actionGrants: { select: { action: true } },
    },
  });
  if (!adminUser || !adminUser.isActive) return null;

  return adminUser;
}

// OWNER always resolves to full access, everywhere — the permission and
// action-grant rows only ever get consulted for STAFF.
export function canView(admin: SessionAdmin, page: AdminPage): boolean {
  if (admin.role === "OWNER") return true;
  return admin.permissions.some((p) => p.page === page);
}

export function canDo(admin: SessionAdmin, action: AdminAction): boolean {
  if (admin.role === "OWNER") return true;
  return admin.actionGrants.some((g) => g.action === action);
}

// For a page.tsx — redirects home if this admin can't even view the
// page. Session/active-admin checks already happen once in (app)/layout,
// but this runs again here since that layout doesn't know which page
// permission applies to which route.
export async function requirePageAccess(page: AdminPage): Promise<SessionAdmin> {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/login");
  if (!canView(admin, page)) redirect("/");
  return admin;
}

// For a server action — returns an error instead of redirecting, matching
// the `{ error?: string }` convention every other action already uses.
export async function requireAction(action: AdminAction): Promise<{ error?: string }> {
  const admin = await getSessionAdmin();
  if (!admin) return { error: "Not authenticated." };
  if (!canDo(admin, action)) {
    return { error: "You don't have permission to do this." };
  }
  return {};
}

export async function requireOwner(): Promise<{ error?: string }> {
  const admin = await getSessionAdmin();
  if (!admin) return { error: "Not authenticated." };
  if (admin.role !== "OWNER") return { error: "Only an owner can do this." };
  return {};
}
