import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { InviteCard } from "@/components/invite/invite-card";
import { db } from "@/db";
import { invitations } from "@/db/schema";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { userId } = await auth();

  // 1. Cek User Login
  if (!userId) {
    // Kalau belum login, suruh login dulu, nanti balik ke sini lagi
    redirect(`/sign-in?redirect_url=/invite/${token}`);
  }

  // 2. Validasi Tiket
  const invite = await db.query.invitations.findFirst({
    where: eq(invitations.token, token),
    with: {
      group: true,
      member: true, // Data "Budi Manual"
    },
  });

  if (!invite)
    return <div className="p-10 text-center">Tiket tidak valid.</div>;
  if (invite.usedAt)
    return <div className="p-10 text-center">Tiket ini sudah terpakai.</div>;

  // 3. Cek apakah User Login == Member yang dituju? (Opsional)
  // Di sini kita ASUMSIKAN user yang klik link adalah benar pemiliknya.

  const user = await currentUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <InviteCard
        groupName={invite.group.name}
        memberName={invite.member.name} // "Budi"
        token={token}
        userImage={user?.imageUrl}
      />
    </div>
  );
}
