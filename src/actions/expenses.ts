"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { expenseItems, expenses, expenseSplits } from "@/db/schema";
import { calculateSplits } from "@/lib/calculations";

// Tipe data yang dikirim dari Form (Frontend)
type CreateExpenseData = {
  groupId: string;
  description: string;
  payerMemberId: string;
  date: Date;
  mode: "SIMPLE" | "ITEMIZED";

  // Data Simple
  totalAmount?: number;
  splitWithMemberIds?: string[];

  // Data Itemized
  subtotal?: number;
  tax?: number;
  discount?: number;
  items?: { name: string; price: number; assignedTo: string }[];
};

export type UpdateExpenseData = CreateExpenseData & {
  expenseId: string;
};

export async function createExpenseAction(data: CreateExpenseData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let finalAmount = 0;
  let newExpenseId = "";

  // --- LOGIC 1: SIMPLE SPLIT ---
  if (data.mode === "SIMPLE") {
    finalAmount = data.totalAmount || 0;

    // 1. Simpan Header
    const [newExpense] = await db
      .insert(expenses)
      .values({
        groupId: data.groupId,
        description: data.description,
        amount: finalAmount,
        payerMemberId: data.payerMemberId,
        createdBy: userId,
        category: "EXPENSE",
        date: data.date,
      })
      .returning();

    newExpenseId = newExpense.id;

    // 2. Hitung Split (Bagi Rata)
    const memberCount = data.splitWithMemberIds?.length || 1;
    const splitAmount = Math.round(finalAmount / memberCount);

    // 3. Simpan Split ke DB
    if (data.splitWithMemberIds && data.splitWithMemberIds.length > 0) {
      await db.insert(expenseSplits).values(
        data.splitWithMemberIds.map((memberId) => ({
          expenseId: newExpenseId,
          memberId: memberId,
          amountOwed: splitAmount,
        }))
      );
    }
  } else if (data.mode === "ITEMIZED") {
    finalAmount = (data.subtotal || 0) + (data.tax || 0) - (data.discount || 0);

    // 1. Simpan Header Transaksi (Tabel expenses)
    const [newExpense] = await db
      .insert(expenses)
      .values({
        groupId: data.groupId,
        description: data.description,
        amount: finalAmount,
        payerMemberId: data.payerMemberId,
        createdBy: userId,
        category: "EXPENSE",
        subtotal: data.subtotal,
        tax: data.tax,
        discount: data.discount,
        date: data.date,
      })
      .returning();

    newExpenseId = newExpense.id;

    // 2. Simpan Baris Item (Tabel expense_items)
    if (data.items && data.items.length > 0) {
      await db.insert(expenseItems).values(
        data.items.map((item) => ({
          expenseId: newExpenseId,
          name: item.name,
          price: item.price,
          assignedToMemberId: item.assignedTo,
        }))
      );
    }

    // 3. Hitung Siapa Utang Berapa (Pakai rumus di Step 1 tadi)
    const splits = calculateSplits(
      data.items || [],
      data.tax || 0,
      data.discount || 0
    );

    const splitInserts = Object.entries(splits).map(([memberId, amount]) => ({
      expenseId: newExpenseId,
      memberId: memberId,
      amountOwed: amount,
    }));

    if (splitInserts.length > 0) {
      await db.insert(expenseSplits).values(splitInserts);
    }
  }

  redirect(`/groups/${data.groupId}`);
}

export async function createSettlement(data: {
  groupId: string;
  fromMemberId: string; // Yang bayar utang
  toMemberId: string; // Yang nerima duit
  amount: number;
  date: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 1. Simpan Header Transaksi
  // Kategori: SETTLEMENT
  const [newExpense] = await db
    .insert(expenses)
    .values({
      groupId: data.groupId,
      description: "Pelunasan Utang", // Default description
      amount: data.amount,
      payerMemberId: data.fromMemberId, // Si Bayar Utang dianggap "Payer"
      createdBy: userId,
      category: "SETTLEMENT", // <--- PENTING!
      date: data.date,
    })
    .returning();

  // 2. Simpan Split
  // Di pelunasan, yang "mengkonsumsi" uangnya adalah si Penerima (toMemberId)
  await db.insert(expenseSplits).values({
    expenseId: newExpense.id,
    memberId: data.toMemberId,
    amountOwed: data.amount,
  });

  revalidatePath(`/groups/${data.groupId}`);
}

export async function deleteExpense(expenseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 1. Cek Kepemilikan (Optional: Hanya pembuat yang boleh hapus)
  const expense = await db.query.expenses.findFirst({
    where: eq(expenses.id, expenseId),
  });

  if (!expense) return { error: "Transaksi tidak ditemukan" };
  if (expense.createdBy !== userId) return { error: "Bukan punya kamu!" };

  // 2. Hapus Data Anak Dulu (Manual Cascade biar aman)
  await db.delete(expenseSplits).where(eq(expenseSplits.expenseId, expenseId));
  await db.delete(expenseItems).where(eq(expenseItems.expenseId, expenseId));

  // 3. Hapus Induk
  await db.delete(expenses).where(eq(expenses.id, expenseId));

  // 4. Refresh Halaman
  // Kita refresh path grup-nya
  redirect(`/groups/${expense.groupId}`);
}

export async function updateExpenseAction(data: UpdateExpenseData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 1. Validasi Owner (Hanya pembuat yang boleh edit)
  const existing = await db.query.expenses.findFirst({
    where: eq(expenses.id, data.expenseId),
  });
  if (!existing || existing.createdBy !== userId)
    throw new Error("Akses ditolak");

  let finalAmount = 0;

  // 2. BERSIHKAN DATA LAMA (Delete Child)
  // Kita hapus semua item & split lama, nanti kita insert ulang yang baru.
  await db
    .delete(expenseSplits)
    .where(eq(expenseSplits.expenseId, data.expenseId));
  await db
    .delete(expenseItems)
    .where(eq(expenseItems.expenseId, data.expenseId));

  // 3. LOGIC UPDATE (Mirip Create)
  if (data.mode === "SIMPLE") {
    finalAmount = data.totalAmount || 0;
    const memberCount = data.splitWithMemberIds?.length || 1;
    const splitAmount = Math.round(finalAmount / memberCount);

    // Update Header
    await db
      .update(expenses)
      .set({
        description: data.description,
        amount: finalAmount,
        payerMemberId: data.payerMemberId,
        subtotal: null, // Reset itemized fields
        tax: null,
        discount: null,
        date: data.date,
      })
      .where(eq(expenses.id, data.expenseId));

    if (data.splitWithMemberIds && data.splitWithMemberIds.length > 0) {
      await db.insert(expenseSplits).values(
        data.splitWithMemberIds.map((memberId) => ({
          expenseId: data.expenseId,
          memberId: memberId,
          amountOwed: splitAmount,
        }))
      );
    }
  } else if (data.mode === "ITEMIZED") {
    finalAmount = (data.subtotal || 0) + (data.tax || 0) - (data.discount || 0);

    // Update Header
    await db
      .update(expenses)
      .set({
        description: data.description,
        amount: finalAmount,
        payerMemberId: data.payerMemberId,
        subtotal: data.subtotal,
        tax: data.tax,
        discount: data.discount,
        date: data.date,
      })
      .where(eq(expenses.id, data.expenseId));

    // Insert Items Baru
    if (data.items && data.items.length > 0) {
      await db.insert(expenseItems).values(
        data.items.map((item) => ({
          expenseId: data.expenseId,
          name: item.name,
          price: item.price,
          assignedToMemberId: item.assignedTo,
        }))
      );
    }

    // Hitung & Insert Split Baru
    const splits = calculateSplits(
      data.items || [],
      data.tax || 0,
      data.discount || 0
    );
    const splitInserts = Object.entries(splits).map(([memberId, amount]) => ({
      expenseId: data.expenseId,
      memberId: memberId,
      amountOwed: amount,
    }));

    if (splitInserts.length > 0) {
      await db.insert(expenseSplits).values(splitInserts);
    }
  }

  redirect(`/groups/${data.groupId}`);
}
