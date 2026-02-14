import { db } from "@/db";
import { groupMembers, groups } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Ghost, User } from "lucide-react";
import Link from "next/link";
import { AddMemberModal } from "@/components/groups/add-member-modal";

interface PageProps {
    params: Promise<{ groupId: string }>;
}

export default async function GroupSettingsPage({ params }: PageProps) {
    const { groupId } = await params;
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    // 1. Validasi Akses
    const membership = await db.query.groupMembers.findFirst({
        where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
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
        <div className="container max-w-md mx-auto p-4 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <Link href={`/groups/${groupId}`}>
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <div>
                    <h1 className="font-bold text-xl text-gray-900">Pengaturan Grup</h1>
                    <p className="text-xs text-muted-foreground">{group.name}</p>
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
                    <div className="space-y-2 mt-4">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className={member.userId ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}>
                                            {member.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{member.name}</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            {member.userId ? (
                                                <><User className="w-3 h-3" /> Akun Terdaftar</>
                                            ) : (
                                                <><Ghost className="w-3 h-3" /> Member Manual</>
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
                <p className="text-xs text-muted-foreground">ID Grup: {groupId}</p>
            </div>
        </div>
    );
}