import { db } from "@/db";
import { groupMembers, groups } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AddExpenseWrapper } from "@/components/expenses/add-expense-wrapper";

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
        <div className="container max-w-md mx-auto p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <Link href={`/groups/${groupId}`}>
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="font-bold text-xl">Tambah Pengeluaran</h1>
                    <p className="text-xs text-muted-foreground">{group.name}</p>
                </div>
            </div>

            {/* Tabs Wrapper (Simple vs Itemized) */}
            <AddExpenseWrapper groupId={groupId} members={members} />
        </div>
    );
}