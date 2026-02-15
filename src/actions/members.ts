"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { expenses, expenseSplits, groupMembers } from "@/db/schema";

export async function addGhostMember(groupId: string, name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Validasi simpel
  if (!name.trim()) return { error: "Nama tidak boleh kosong" };

  try {
    // Insert Member Baru (UserId = NULL karena ini Ghost Member)
    await db.insert(groupMembers).values({
      groupId: groupId,
      name: name,
      userId: null, // Menandakan ini user manual/ghost
    });

    // Refresh halaman biar list member langsung update
    revalidatePath(`/groups/${groupId}/settings`);
    revalidatePath(`/groups/${groupId}`); // Refresh dashboard juga

    return { success: true };
  } catch (error) {
    console.error("Gagal tambah member:", error);
    return { error: "Gagal menambahkan member" };
  }
}

export async function deleteMemberAction(memberId: string, groupId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 1. CEK: Apakah Member ini pernah bayar transaksi? (Payer)
  const isPayer = await db.query.expenses.findFirst({
    where: eq(expenses.payerMemberId, memberId),
  });
  if (isPayer) {
    return {
      error:
        "Gagal: Member ini pernah melakukan pembayaran. Hapus dulu transaksinya.",
    };
  }

  // 2. CEK: Apakah Member ini pernah kena tagihan? (Split)
  const isDebtor = await db.query.expenseSplits.findFirst({
    where: eq(expenseSplits.memberId, memberId),
  });
  if (isDebtor) {
    return {
      error:
        "Gagal: Member ini punya tagihan di transaksi. Edit transaksi terkait dulu.",
    };
  }

  // 3. AMAN -> HAPUS
  await db
    .delete(groupMembers)
    .where(
      and(eq(groupMembers.id, memberId), eq(groupMembers.groupId, groupId))
    );

  revalidatePath(`/groups/${groupId}`);
  return { success: "Member berhasil dihapus" };
}
