import { db } from "@/db";
import { groups, expenses, groupMembers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Settings, ChevronLeft, HandCoins } from "lucide-react";
import { ExpenseCard } from "@/components/expenses/expense-card";
import { calculateBalances } from "@/lib/balance";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BalanceList } from "@/components/groups/balance-list";
import { SettleUpModal } from "@/components/expenses/settle-up-modal";

// Next.js 15: params itu Promise, jadi harus ditunggu
interface PageProps {
    params: Promise<{ groupId: string }>;
    searchParams: Promise<{ tab?: string }>;
}

export default async function GroupDetailPage({ params, searchParams }: PageProps) {
    const { groupId } = await params;
    const { tab } = await searchParams;
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const activeTab = tab === "balances" ? "balances" : "expenses";

    // 1. Validasi: Cek apakah user adalah member grup ini?
    const membership = await db.query.groupMembers.findFirst({
        where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
    });
    if (!membership) redirect("/");

    // 2. Ambil Data Grup
    const groupData = await db.query.groups.findFirst({
        where: eq(groups.id, groupId),
        with: {
            members: true, // Ambil list member sekalian
        }
    });
    if (!groupData) notFound();

    // 3. Ambil Daftar Transaksi (Expenses)
    const expenseList = await db.query.expenses.findMany({
        where: eq(expenses.groupId, groupId),
        orderBy: [desc(expenses.date)],
        with: { payer: true },
    });

    // 4. Ambil Data Splits (Untuk hitung saldo)
    // Kita perlu query manual ke tabel splits berdasarkan list expenseId
    const allSplits = await db.query.expenseSplits.findMany({
        where: (splits, { inArray }) =>
            // Ambil split hanya dari expense yang ada di grup ini
            expenseList.length > 0
                ? inArray(splits.expenseId, expenseList.map(e => e.id))
                : undefined
    });

    const balances = calculateBalances(groupData.members, expenseList, allSplits);

    return (
        <div className="container max-w-md mx-auto p-4 relative bg-gray-50/30">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center mb-4 sticky top-0 backdrop-blur pb-2 z-10 border-b">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="-ml-2">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">{groupData.name}</h1>
                        <p className="text-xs text-muted-foreground">{groupData.members.length} Anggota</p>
                    </div>
                </div>
                <Link href={`/groups/${groupId}/settings`}>
                    <Button variant="ghost" size="icon"><Settings className="w-5 h-5" /></Button>
                </Link>
            </div>

            {/* --- TABS: RIWAYAT vs SALDO --- */}
            <Tabs key={activeTab} defaultValue={activeTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="expenses">Riwayat</TabsTrigger>
                    <TabsTrigger value="balances">Saldo Member</TabsTrigger>
                </TabsList>

                {/* --- TAB1: LIST TRANSAKSI --- */}
                <TabsContent value="expenses" className="space-y-2">
                    {expenseList.length === 0 ? (
                        // Empty State
                        <div className="text-center py-20 text-muted-foreground">
                            <p className="mb-2">Belum ada pengeluaran.</p>
                            <p className="text-sm">Klik tombol (+) buat mulai catat!</p>
                        </div>
                    ) : (
                        // Mapping List
                        expenseList.map((expense) => (
                            <ExpenseCard
                                key={expense.id}
                                expenseId={expense.id}
                                groupId={groupId}
                                isOwner={expense.createdBy === userId}
                                description={expense.description}
                                amount={expense.amount}
                                payerName={expense.payer.name} // Nama dari tabel member
                                date={expense.date}
                                category={expense.category || "EXPENSE"}
                            />
                        ))
                    )}
                </TabsContent>

                {/* TAB 2: SALDO MEMBER */}
                <TabsContent value="balances" className="space-y-4">
                    {/* TOMBOL PELUNASAN DI ATAS LIST SALDO */}
                    <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="bg-white/60 p-2.5 rounded-xl shadow-sm backdrop-blur-sm">
                                <HandCoins className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-900">Pelunasan Hutang</h3>
                                <p className="text-sm text-emerald-700/80">Catat pembayaran yang sudah selesai.</p>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <SettleUpModal groupId={groupId} members={groupData.members} />
                        </div>

                        {/* Decoration */}
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl" />
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-teal-100/30 rounded-full blur-3xl" />
                    </div>

                    <BalanceList members={groupData.members} balances={balances} />
                </TabsContent>
            </Tabs>


            {/* --- FLOATING ACTION BUTTON (FAB) --- */}
            <div className="fixed bottom-20 right-4 md:right-[calc(50%-200px)] md:bottom-6">
                <Link href={`/groups/${groupId}/add`}>
                    <Button size="icon" className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-transform hover:scale-105">
                        <Plus className="w-8 h-8" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}