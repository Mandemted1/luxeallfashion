"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { AdminInvite, AdminRole, AdminUser } from "@luxe/database";
import { createInvite, revokeInvite, toggleAdminActive } from "@/app/(app)/team/actions";

const inputClass =
  "border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TeamContent({
  currentAdminId,
  adminUsers,
  invites,
}: {
  currentAdminId: string;
  adminUsers: AdminUser[];
  invites: AdminInvite[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("STAFF");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ link: string; emailSent: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);

    const response = await createInvite(email, role);

    if (response.error) {
      setError(response.error);
    } else if (response.inviteLink) {
      setResult({ link: response.inviteLink, emailSent: Boolean(response.emailSent) });
      setEmail("");
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

  const pendingInvites = invites.filter((invite) => !invite.acceptedAt);

  return (
    <div>
      <h1 className="text-3xl font-semibold">Team</h1>

      <div className="mt-6 border border-black/10 bg-white">
        <div className="border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
            Team Members
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs font-medium uppercase tracking-[0.08em] text-black/50">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((admin) => (
                <tr key={admin.id} className="border-b border-black/5 last:border-b-0">
                  <td className="px-5 py-4 font-medium">
                    {admin.name}
                    {admin.id === currentAdminId && (
                      <span className="ml-2 text-xs text-black/40">(you)</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-black/60">{admin.email}</td>
                  <td className="px-5 py-4 text-black/60">{admin.role}</td>
                  <td className="px-5 py-4 text-black/60">{formatDate(admin.createdAt)}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={admin.id === currentAdminId}
                      onClick={() => handleToggleActive(admin.id)}
                      className={`px-2 py-0.5 text-xs font-medium uppercase tracking-[0.06em] disabled:cursor-not-allowed disabled:opacity-50 ${
                        admin.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {admin.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 border border-black/10 bg-white">
        <div className="border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
            Pending Invites
          </p>
        </div>
        {pendingInvites.length === 0 ? (
          <p className="px-5 py-6 text-sm text-black/40">No pending invites.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs font-medium uppercase tracking-[0.08em] text-black/50">
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Expires</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {pendingInvites.map((invite) => {
                  const expired = invite.expiresAt < new Date();
                  return (
                    <tr key={invite.id} className="border-b border-black/5 last:border-b-0">
                      <td className="px-5 py-4">{invite.email}</td>
                      <td className="px-5 py-4 text-black/60">{invite.role}</td>
                      <td className="px-5 py-4 text-black/60">
                        {expired ? (
                          <span className="text-red-600">Expired</span>
                        ) : (
                          formatDate(invite.expiresAt)
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRevoke(invite.id)}
                          className="text-xs font-medium uppercase tracking-[0.06em] text-black/50 hover:text-red-600"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 border border-black/10 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-black/50">
          Invite Someone
        </p>
        <form onSubmit={handleInvite} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex w-full flex-col gap-1 text-xs text-black/50 sm:w-64">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`w-full ${inputClass}`}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-black/50">
            Role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as AdminRole)}
              className={inputClass}
            >
              <option value="STAFF">Staff</option>
              <option value="OWNER">Owner</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="bg-black px-5 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Invite"}
          </button>
        </form>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        {result && (
          <div
            className={`mt-4 px-4 py-3 text-sm ${
              result.emailSent
                ? "bg-emerald-50 text-emerald-800"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            <p>
              {result.emailSent
                ? "Invite sent."
                : "Invite created, but the email couldn't be sent. Copy this link and share it directly:"}
            </p>
            <p className="mt-1 break-all font-mono text-xs">{result.link}</p>
          </div>
        )}
      </div>
    </div>
  );
}
