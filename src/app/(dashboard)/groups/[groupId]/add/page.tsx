import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddExpenseWrapper } from "@/components/expenses/add-expense-wrapper";
import { db } from "@/db";
import { groupMembers, groups } from "@/db/schema";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function AddExpensePage({ params }: PageProps) {
  const { groupId } = await params;

  // 1. Ambil Nama Grup (buat judul)
  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
  });
  if (!group) notFound();

  // 2. Ambil Daftar Member (buat dropdown siapa yang makan)
  const members = await db.query.groupMembers.findMany({
    where: eq(groupMembers.groupId, groupId),
  });

  return (
    <div className="container mx-auto max-w-md p-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Link href={`/groups/${groupId}`}>
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Tambah Pengeluaran</h1>
          <p className="text-muted-foreground text-xs">{group.name}</p>
        </div>
      </div>

      {/* Tabs Wrapper (Simple vs Itemized) */}
      <AddExpenseWrapper groupId={groupId} members={members} />
    </div>
  );
}
