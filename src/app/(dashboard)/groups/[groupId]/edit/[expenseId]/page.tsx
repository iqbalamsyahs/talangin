import { db } from "@/db";
import { expenses, groupMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { SimpleExpenseForm } from "@/components/expenses/simple-expense-form";
import { ItemizedExpenseForm } from "@/components/expenses/itemized-expense-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditSettlementForm } from "@/components/expenses/edit-settlement-form";

interface PageProps {
    params: Promise<{ groupId: string; expenseId: string }>;
}

export default async function EditExpensePage({ params }: PageProps) {
    const { groupId, expenseId } = await params;
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    // 1. Ambil Data Transaksi
    const expense = await db.query.expenses.findFirst({
        where: eq(expenses.id, expenseId),
        with: {
            items: true,   // Ambil items (buat cek mode)
            splits: true,  // Ambil splits (buat tau siapa yg kena tagih)
        }
    });

    if (!expense) notFound();
    // Security Check: Cuma yang bikin yang boleh edit
    if (expense.createdBy !== userId) redirect(`/groups/${groupId}`);

    // 2. Ambil List Member (buat dropdown)
    const members = await db.query.groupMembers.findMany({
        where: eq(groupMembers.groupId, groupId),
    });

    // 3. Tentukan Mode (Simple vs Itemized)
    const isSettlement = expense.category === "SETTLEMENT";
    const isItemized = expense.items.length > 0;

    return (
        <div className="container max-w-md mx-auto p-4 min-h-screen bg-gray-50/50">
            <div className="flex items-center gap-2 mb-6">
                <Link href={`/groups/${groupId}`}>
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <div>
                    <h1 className="font-bold text-xl text-gray-900">Edit Transaksi</h1>
                    <p className="text-xs text-muted-foreground">Ubah detail pengeluaran</p>
                </div>
            </div>

            {isSettlement ? (
                // --- RENDER FORM SETTLEMENT ---
                <EditSettlementForm
                    groupId={groupId}
                    members={members}
                    initialData={{
                        expenseId: expense.id,
                        amount: expense.amount,
                        fromId: expense.payerMemberId,
                        // Di Settlement, si Penerima adalah satu-satunya orang di tabel splits
                        toId: expense.splits[0]?.memberId || members[0].id,
                        date: expense.date || new Date(),
                    }}
                />
            ) : isItemized ? (
                // --- RENDER FORM ITEMIZED ---
                <ItemizedExpenseForm
                    groupId={groupId}
                    members={members}
                    mode="ITEMIZED"
                    initialData={{
                        expenseId: expense.id,
                        description: expense.description,
                        payerId: expense.payerMemberId,
                        tax: expense.tax || 0,
                        discount: expense.discount || 0,
                        date: expense.date || new Date(),
                        items: expense.items.map(i => ({
                            // eslint-disable-next-line react-hooks/purity
                            id: Math.random(), // ID sementara buat key react
                            name: i.name,
                            price: i.price,
                            assignedTo: i.assignedToMemberId
                        }))
                    }}
                />
            ) : (
                // --- RENDER FORM SIMPLE ---
                <SimpleExpenseForm
                    mode="SIMPLE"
                    groupId={groupId}
                    members={members}
                    initialData={{
                        expenseId: expense.id,
                        description: expense.description,
                        amount: expense.amount,
                        payerId: expense.payerMemberId,
                        date: expense.date || new Date(),
                        // Ambil ID member dari tabel splits
                        selectedMemberIds: expense.splits.map(s => s.memberId),
                    }}
                />
            )}
        </div>
    );
}