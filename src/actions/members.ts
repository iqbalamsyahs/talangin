"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { groupMembers } from "@/db/schema";

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
