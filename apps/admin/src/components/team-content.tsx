"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import type { AdminAction, AdminInvite, AdminPage, AdminRole } from "@luxe/database";
import {
  createInvite,
  deleteAdmin,
  revokeInvite,
  toggleAdminActive,
  updateAdminPermissions,
  type PermissionGrant,
} from "@/app/(app)/team/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ADMIN_ACTIONS, ADMIN_PAGES } from "@/lib/admin-pages";

type AdminUserWithPermissions = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  permissions: { page: AdminPage }[];
  actionGrants: { action: AdminAction }[];
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function toGrant(admin: AdminUserWithPermissions): PermissionGrant {
  return {
    pages: admin.permissions.map((p) => p.page),
    actions: admin.actionGrants.map((g) => g.action),
  };
}

// Shared by the invite form (role STAFF) and the per-admin edit dialog.
// Each page is a checkbox that grants view access to it; pages with
// their own mutating actions (see ADMIN_ACTIONS) reveal a sub-list of
// action checkboxes once checked. Checking an action always implies —
// and keeps checked — the page it lives on; unchecking a page clears
// every action under it too, since an action with no page access to
// reach it is meaningless.
function PermissionsEditor({
  value,
  onChange,
}: {
  value: PermissionGrant;
  onChange: (next: PermissionGrant) => void;
}) {
  function isPageChecked(page: AdminPage): boolean {
    return value.pages.includes(page) || value.actions.some((a) => actionPage(a) === page);
  }

  function actionPage(action: AdminAction): AdminPage {
    return ADMIN_ACTIONS.find((a) => a.key === action)!.page;
  }

  function togglePage(page: AdminPage, checked: boolean) {
    if (checked) {
      onChange({ ...value, pages: [...value.pages, page] });
      return;
    }
    const pageActions = new Set(ADMIN_ACTIONS.filter((a) => a.page === page).map((a) => a.key));
    onChange({
      pages: value.pages.filter((p) => p !== page),
      actions: value.actions.filter((a) => !pageActions.has(a)),
    });
  }

  function toggleAction(action: AdminAction, page: AdminPage, checked: boolean) {
    if (checked) {
      onChange({
        pages: value.pages.includes(page) ? value.pages : [...value.pages, page],
        actions: [...value.actions, action],
      });
      return;
    }
    onChange({ ...value, actions: value.actions.filter((a) => a !== action) });
  }

  return (
    <div className="flex flex-col divide-y divide-black/5">
      {ADMIN_PAGES.map((page) => {
        const pageActions = ADMIN_ACTIONS.filter((a) => a.page === page.key);
        const checked = isPageChecked(page.key);
        return (
          <div key={page.key} className="py-2.5 first:pt-0 last:pb-0">
            <label className="flex items-center gap-2.5">
              <Checkbox checked={checked} onCheckedChange={(v) => togglePage(page.key, v === true)} />
              <span className="text-sm font-medium">{page.label}</span>
            </label>
            {checked && pageActions.length > 0 && (
              <div className="mt-2 ml-6 flex flex-col gap-1.5">
                {pageActions.map((action) => (
                  <label key={action.key} className="flex items-center gap-2.5">
                    <Checkbox
                      checked={value.actions.includes(action.key)}
                      onCheckedChange={(v) => toggleAction(action.key, page.key, v === true)}
                    />
                    <span className="text-xs text-black/70">{action.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function permissionsSummary(admin: AdminUserWithPermissions): string {
  if (admin.permissions.length === 0) return "No page access";
  const pageWord = admin.permissions.length === 1 ? "page" : "pages";
  const actionWord = admin.actionGrants.length === 1 ? "action" : "actions";
  return `${admin.permissions.length} ${pageWord}, ${admin.actionGrants.length} ${actionWord}`;
}

function EditPermissionsDialog({
  admin,
  onSaved,
}: {
  admin: AdminUserWithPermissions;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PermissionGrant>(toGrant(admin));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    const result = await updateAdminPermissions(admin.id, draft);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    onSaved();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(toGrant(admin));
        setOpen(next);
      }}
    >
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Permissions
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{admin.name}&apos;s Permissions</DialogTitle>
        </DialogHeader>
        <PermissionsEditor value={draft} onChange={setDraft} />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TeamContent({
  currentAdminId,
  adminUsers,
  invites,
}: {
  currentAdminId: string;
  adminUsers: AdminUserWithPermissions[];
  invites: AdminInvite[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("STAFF");
  const [permissions, setPermissions] = useState<PermissionGrant>({ pages: [], actions: [] });
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ link: string; emailSent: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);

    const response = await createInvite(email, role, permissions);

    if (response.error) {
      setError(response.error);
    } else if (response.inviteLink) {
      setResult({ link: response.inviteLink, emailSent: Boolean(response.emailSent) });
      setEmail("");
      setPermissions({ pages: [], actions: [] });
      router.refresh();
    }
    setSubmitting(false);
  }

  async function handleRevoke(inviteId: string) {
    await revokeInvite(inviteId);
    router.refresh();
  }

  async function handleToggleActive(adminUserId: string) {
    await toggleAdminActive(adminUserId);
    router.refresh();
  }

  async function handleDeleteAdmin(adminUserId: string) {
    const response = await deleteAdmin(adminUserId);
    setConfirmDeleteId(null);
    if (response.error) {
      setDeleteError(response.error);
      return;
    }
    setDeleteError("");
    router.refresh();
  }

  const pendingInvites = invites.filter((invite) => !invite.acceptedAt);
  const deletingAdmin = adminUsers.find((a) => a.id === confirmDeleteId);

  return (
    <div>
      <h1 className="text-3xl font-semibold">Team</h1>
      <p className="mt-1 text-sm text-black/50">Invite and manage admin accounts.</p>

      <Card className="mt-6 gap-0 py-0">
        <div className="border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">Team Members</p>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Access</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">
                    {admin.name}
                    {admin.id === currentAdminId && <span className="ml-2 text-xs text-black/40">(you)</span>}
                  </TableCell>
                  <TableCell className="text-black/60">{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-transparent bg-stone-100 text-stone-600">
                      {admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-black/60">{formatDate(admin.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={admin.isActive}
                        disabled={admin.id === currentAdminId}
                        onCheckedChange={() => handleToggleActive(admin.id)}
                      />
                      <span className={`text-xs font-medium uppercase tracking-[0.06em] ${admin.isActive ? "text-emerald-700" : "text-stone-500"}`}>
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-black/60">
                    {admin.role === "OWNER" ? (
                      "Full access"
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{permissionsSummary(admin)}</span>
                        <EditPermissionsDialog admin={admin} onSaved={() => router.refresh()} />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {admin.id !== currentAdminId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setDeleteError("");
                          setConfirmDeleteId(admin.id);
                        }}
                        aria-label={`Delete ${admin.name}`}
                        className="text-black/40 hover:text-red-600"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {deleteError && <p className="border-t border-black/10 px-5 py-3 text-xs text-red-600">{deleteError}</p>}
      </Card>

      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingAdmin?.name}&apos;s account?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. They&apos;ll lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (confirmDeleteId) handleDeleteAdmin(confirmDeleteId);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="mt-4 gap-0 py-0">
        <div className="border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">Pending Invites</p>
        </div>
        {pendingInvites.length === 0 ? (
          <p className="px-5 py-6 text-sm text-black/40">No pending invites.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[480px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((invite) => {
                  const expired = invite.expiresAt < new Date();
                  return (
                    <TableRow key={invite.id}>
                      <TableCell>{invite.email}</TableCell>
                      <TableCell className="text-black/60">{invite.role}</TableCell>
                      <TableCell className="text-black/60">
                        {expired ? <span className="text-red-600">Expired</span> : formatDate(invite.expiresAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRevoke(invite.id)}>
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Invite Someone</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex w-full flex-col gap-1.5 sm:w-64">
                <span className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">Email</span>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">Role</span>
                <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="OWNER">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send Invite"}
              </Button>
            </div>

            {role === "STAFF" && (
              <div className="max-w-md border-t border-black/10 pt-4">
                <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
                  Page &amp; Action Access
                </p>
                <p className="mt-1 text-xs text-black/40">
                  Check a page to give them access to it, then pick exactly which actions they
                  can perform there. An unchecked page is hidden from their sidebar entirely.
                </p>
                <div className="mt-3">
                  <PermissionsEditor value={permissions} onChange={setPermissions} />
                </div>
              </div>
            )}
          </form>

          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

          {result && (
            <div
              className={`mt-4 px-4 py-3 text-sm ${
                result.emailSent ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
              }`}
            >
              <p>
                {result.emailSent
                  ? "Invite sent successfully."
                  : "Invite created, but the email couldn't be sent. Copy this link and share it directly:"}
              </p>
              {!result.emailSent && <p className="mt-1 font-mono text-xs break-all">{result.link}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
