"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { groupMembers, groups, users } from "@/db/schema"; // <--- Tambah import 'users'

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
