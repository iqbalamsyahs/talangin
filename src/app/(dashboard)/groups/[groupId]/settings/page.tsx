import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AddMemberModal } from "@/components/groups/add-member-modal";
import { GroupSettings } from "@/components/groups/group-settings";
import { MemberItem } from "@/components/groups/member-item";
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

  // 1. Validasi Akses Member
  const membership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, userId)
    ),
  });
  if (!membership) redirect("/");

  // 2. Ambil Data Grup
  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
  });
  if (!group) notFound();

  // 3. Ambil List Member
  const members = await db.query.groupMembers.findMany({
    where: eq(groupMembers.groupId, groupId),
    orderBy: groupMembers.joinedAt,
  });

  // 4. Cek apakah user adalah Owner (Pembuat Grup)
  const isOwner = group.createdBy === userId;

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

      {/* Bagian 1: Daftar Member */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Daftar Anggota</CardTitle>
          <CardDescription>
            {members.length} orang bergabung di grup ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddMemberModal groupId={groupId} />

          <div className="space-y-2">
            {members.map((member) => (
              <MemberItem
                key={member.id}
                member={member}
                groupId={groupId}
                isOwner={isOwner} // Oper status owner
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bagian 2: Pengaturan Grup & Hapus Grup */}
      <GroupSettings
        groupId={groupId}
        groupName={group.name}
        isOwner={isOwner}
      />
    </div>
  );
}
