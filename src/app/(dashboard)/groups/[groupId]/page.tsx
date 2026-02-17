import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { ChevronLeft, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ExpenseCard } from "@/components/expenses/expense-card";
import { BalanceList } from "@/components/groups/balance-list";
import { SettleUpCard } from "@/components/groups/settle-up-card";
import { SettlementPlan } from "@/components/groups/settlement-plan";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db";
import { expenses, groupMembers, groups } from "@/db/schema";
import { calculateBalances } from "@/lib/balance";
import { getSuggestedSettlements } from "@/lib/settlement";

// Next.js 15: params itu Promise, jadi harus ditunggu
interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function GroupDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { groupId } = await params;
  const { tab } = await searchParams;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const activeTab = tab === "balances" ? "balances" : "expenses";

  // 1. Validasi: Cek apakah user adalah member grup ini?
  const membership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, userId)
    ),
  });
  if (!membership) redirect("/");

  // 2. Ambil Data Grup
  const groupData = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
    with: {
      members: true, // Ambil list member sekalian
    },
  });
  if (!groupData) notFound();

  // 3. Ambil Daftar Transaksi (Expenses)
  const expenseList = await db.query.expenses.findMany({
    where: eq(expenses.groupId, groupId),
    orderBy: [desc(expenses.date), desc(expenses.createdAt)],
    with: { payer: true },
  });

  // 4. Ambil Data Splits (Untuk hitung saldo)
  // Kita perlu query manual ke tabel splits berdasarkan list expenseId
  const allSplits = await db.query.expenseSplits.findMany({
    where: (splits, { inArray }) =>
      // Ambil split hanya dari expense yang ada di grup ini
      expenseList.length > 0
        ? inArray(
            splits.expenseId,
            expenseList.map((e) => e.id)
          )
        : undefined,
  });

  // 5. Hitung Saldo
  const balances = calculateBalances(groupData.members, expenseList, allSplits);

  // 6. Hitung Saran Pelunasan (NEW)
  const settlementPlan = getSuggestedSettlements(balances);

  return (
    <div className="relative container mx-auto max-w-md p-4">
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-10 mb-4 flex items-center justify-between border-b pb-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg leading-tight font-bold">
              {groupData.name}
            </h1>
            <p className="text-muted-foreground text-xs">
              {groupData.members.length} Anggota
            </p>
          </div>
        </div>
        <Link href={`/groups/${groupId}/settings`}>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* --- TABS: RIWAYAT vs SALDO --- */}
      <Tabs key={activeTab} defaultValue={activeTab} className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="expenses">Riwayat</TabsTrigger>
          <TabsTrigger value="balances">Saldo Member</TabsTrigger>
        </TabsList>

        {/* --- TAB1: LIST TRANSAKSI --- */}
        <TabsContent value="expenses" className="space-y-2">
          {expenseList.length === 0 ? (
            // Empty State
            <div className="text-muted-foreground py-20 text-center">
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
          <div className="space-y-6">
            <SettleUpCard
              groupId={groupId}
              members={groupData.members}
              balances={balances}
            />

            <BalanceList members={groupData.members} balances={balances} />

            <SettlementPlan plan={settlementPlan} members={groupData.members} />
          </div>
        </TabsContent>
      </Tabs>

      {/* --- FLOATING ACTION BUTTON (FAB) --- */}
      <div className="fixed right-4 bottom-20 md:right-[calc(50%-200px)] md:bottom-6">
        <Link href={`/groups/${groupId}/add`}>
          <Button
            size="icon"
            className="bg-primary hover:bg-primary/90 h-14 w-14 rounded-full shadow-xl transition-transform hover:scale-105"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
