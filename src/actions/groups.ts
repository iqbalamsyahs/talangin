"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  expenseItems,
  expenses,
  expenseSplits,
  groupMembers,
  groups,
  users,
} from "@/db/schema"; // <--- Tambah import 'users'

export async function createGroup(formData: FormData) {
  // 1. Cek Login & Ambil Data User Lengkap
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) throw new Error("Harus login dulu!");

  // 2. Ambil data dari Form
  const groupName = formData.get("name") as string;
  if (!groupName) return;

  try {
    // --- FIX: Sinkronisasi User ke Database Dulu ---
    // Sebelum bikin grup, pastikan User ID ini sudah ada di tabel 'users'
    // Kita pakai .onConflictDoUpdate biar kalau sudah ada, dia update data terbaru aja (misal ganti foto profil)
    await db
      .insert(users)
      .values({
        id: userId,
        name: user.firstName || user.fullName || "User",
        email: user.emailAddresses[0]?.emailAddress || "no-email",
        avatarUrl: user.imageUrl,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: user.firstName || user.fullName || "User",
          avatarUrl: user.imageUrl,
        },
      });
    // ------------------------------------------------

    // 3. Database Transaction (Insert Grup + Insert Member)
    // Sekarang aman, karena User ID pasti sudah ada di tabel users
    const [newGroup] = await db
      .insert(groups)
      .values({
        name: groupName,
        createdBy: userId, // Foreign Key ini sekarang valid!
      })
      .returning();

    // 4. Masukkan User pembuat sebagai Member Pertama (Admin)
    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId: userId,
      name: user.firstName || "Admin",
    });

    // 5. Redirect berhasil
  } catch (error) {
    console.error("Gagal membuat grup:", error);
    // Di real app, kita bisa return error state ke form
    throw new Error("Gagal membuat grup. Coba lagi.");
  }

  // Redirect harus di luar try-catch di Next.js action
  redirect("/");
}

export async function updateGroupNameAction(groupId: string, newName: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!newName || newName.trim().length === 0) {
    return { error: "Nama grup tidak boleh kosong" };
  }

  // 1. Cek Validasi Owner
  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
  });

  if (!group) return { error: "Grup tidak ditemukan" };
  if (group.createdBy !== userId)
    return { error: "Hanya pembuat grup yang bisa mengganti nama!" };

  // 2. Update Database
  await db.update(groups).set({ name: newName }).where(eq(groups.id, groupId));

  // 3. Refresh Halaman
  revalidatePath(`/groups/${groupId}`); // Refresh halaman grup
  revalidatePath(`/groups/${groupId}/settings`); // Refresh halaman settings
  revalidatePath("/"); // Refresh halaman home (list grup)

  return { success: true };
}

export async function deleteGroupAction(groupId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 1. Cek apakah user adalah Pemilik Grup (Optional: atau Admin)
  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
  });

  if (!group) return { error: "Grup tidak ditemukan" };
  if (group.createdBy !== userId)
    return { error: "Hanya pembuat grup yang bisa menghapus ini!" };

  // 2. AMBIL SEMUA EXPENSE ID (Penting buat hapus anak-anaknya)
  const groupExpenses = await db.query.expenses.findMany({
    where: eq(expenses.groupId, groupId),
    columns: { id: true },
  });

  const expenseIds = groupExpenses.map((e) => e.id);

  // 3. HAPUS DATA SECARA BERURUTAN (Dari Cucu -> Anak -> Induk)

  // A. Hapus Item & Split (Cucu) kalau ada transaksinya
  if (expenseIds.length > 0) {
    await db
      .delete(expenseItems)
      .where(inArray(expenseItems.expenseId, expenseIds));
    await db
      .delete(expenseSplits)
      .where(inArray(expenseSplits.expenseId, expenseIds));

    // B. Hapus Transaksi (Anak)
    await db.delete(expenses).where(inArray(expenses.id, expenseIds));
  }

  // C. Hapus Member Grup
  await db.delete(groupMembers).where(eq(groupMembers.groupId, groupId));

  // D. Terakhir: Hapus Grupnya (Induk Utama)
  await db.delete(groups).where(eq(groups.id, groupId));

  // 4. Balik ke Home
  redirect("/");
}
