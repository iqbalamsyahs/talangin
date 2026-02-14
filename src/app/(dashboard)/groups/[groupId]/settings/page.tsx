import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, Ghost, User } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AddMemberModal } from "@/components/groups/add-member-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { groupMembers, groups } from "@/db/schema";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupSettingsPage({ params }: PageProps) {
  const { groupId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 1. Validasi Akses
  const membership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, userId)
    ),
  });
  if (!membership) redirect("/");

  // 2. Ambil Data Member
  const members = await db.query.groupMembers.findMany({
    where: eq(groupMembers.groupId, groupId),
    orderBy: groupMembers.joinedAt, // Urutkan berdasarkan waktu join
  });

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
  });
  if (!group) notFound();

  return (
    <div className="container mx-auto min-h-screen max-w-md p-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Link href={`/groups/${groupId}`}>
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pengaturan Grup</h1>
          <p className="text-muted-foreground text-xs">{group.name}</p>
        </div>
      </div>

      {/* Bagian Member */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Daftar Anggota</CardTitle>
          <CardDescription>
            {members.length} orang bergabung di grup ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tombol Tambah Member (Dialog) */}
          <AddMemberModal groupId={groupId} />

          {/* List Member */}
          <div className="mt-4 space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-muted/20 flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback
                      className={
                        member.userId
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {member.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-muted-foreground flex items-center gap-1 text-[10px]">
                      {member.userId ? (
                        <>
                          <User className="h-3 w-3" /> Akun Terdaftar
                        </>
                      ) : (
                        <>
                          <Ghost className="h-3 w-3" /> Member Manual
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {/* Kalau mau nambah tombol hapus member nanti disini */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tombol Logout/Delete Grup (Optional, hiasan dulu) */}
      <div className="text-center">
        <p className="text-muted-foreground text-xs">ID Grup: {groupId}</p>
      </div>
    </div>
  );
}
