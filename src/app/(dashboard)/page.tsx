import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { GroupCard } from "@/components/groups/group-card";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { groupMembers } from "@/db/schema";

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
    <main className="container mx-auto max-w-md space-y-6 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grup Saya</h1>
          <p className="text-muted-foreground text-sm">
            Kelola patungan bareng teman
          </p>
        </div>
        {/* Tombol Buat Grup (Nanti kita bikin fungsinya) */}
        <Link href="/groups/create" className="hidden md:flex">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Buat Grup
          </Button>
        </Link>
      </div>

      {/* List Grup */}
      <div className="space-y-4">
        {userGroups.length === 0 ? (
          // Empty State (Kalau belum punya grup)
          <div className="bg-muted/30 rounded-xl border-2 border-dashed py-10 text-center">
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
