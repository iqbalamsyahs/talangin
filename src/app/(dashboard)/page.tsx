import { db } from "@/db";
import { groupMembers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { GroupCard } from "@/components/groups/group-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
    // 1. Ambil User ID dari Clerk
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    // 2. Query: Cari grup di mana user ini menjadi MEMBER
    const userGroups = await db.query.groupMembers.findMany({
        where: eq(groupMembers.userId, userId),
        with: {
            group: {
                with: {
                    members: true, // Kita butuh hitung jumlah member
                },
            },
        },
        orderBy: desc(groupMembers.joinedAt), // Yang baru join di atas
    });

    return (
        <main className="container max-w-md mx-auto p-4 space-y-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Grup Saya</h1>
                    <p className="text-muted-foreground text-sm">
                        Kelola patungan bareng teman
                    </p>
                </div>
                {/* Tombol Buat Grup (Nanti kita bikin fungsinya) */}
                <Link href="/groups/create" className="hidden md:flex">
                    <Button size="sm" className="gap-2">
                        <Plus className="w-4 h-4" /> Buat Grup
                    </Button>
                </Link>
            </div>

            {/* List Grup */}
            <div className="space-y-4">
                {userGroups.length === 0 ? (
                    // Empty State (Kalau belum punya grup)
                    <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/30">
                        <p className="text-muted-foreground mb-4">
                            Belum ada grup. Yuk bikin!
                        </p>
                        <Link href="/groups/create">
                            <Button variant="outline">Buat Grup Baru</Button>
                        </Link>
                    </div>
                ) : (
                    // Mapping Data Grup
                    userGroups.map(({ group }) => (
                        <GroupCard
                            key={group.id}
                            id={group.id}
                            name={group.name}
                            memberCount={group.members.length}
                            role={group.createdBy === userId ? "admin" : "member"}
                        />
                    ))
                )}
            </div>
        </main>
    );
}