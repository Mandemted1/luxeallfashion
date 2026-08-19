import type { Metadata } from "next";
import { prisma } from "@luxe/database";
import { AcceptInviteForm } from "@/components/accept-invite-form";

export const metadata: Metadata = {
  title: "Accept Invite | Luxe All Fashion Admin",
};

export default async function InvitePage(props: PageProps<"/invite/[token]">) {
  const { token } = await props.params;
  const invite = await prisma.adminInvite.findUnique({ where: { token } });

  const isInvalid = !invite || invite.acceptedAt || invite.expiresAt < new Date();

  if (isInvalid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-sm bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">Invite No Longer Valid</h1>
          <p className="mt-2 text-sm text-black/60">
            This invite link has already been used or has expired. Ask whoever
            invited you to send a new one.
          </p>
        </div>
      </div>
    );
  }

  return <AcceptInviteForm token={token} email={invite.email} />;
}
