"use server";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { contacts } from "@/db/schema";

// 1. AMBIL SEMUA KONTAK USER
export async function getContactsAction() {
  const { userId } = await auth();
  if (!userId) return [];

  const userContacts = await db.query.contacts.findMany({
    where: eq(contacts.ownerId, userId),
    orderBy: [desc(contacts.createdAt)], // Yang baru dibuat ada di atas
  });

  return userContacts;
}

// 2. TAMBAH KONTAK BARU (KE BUKU TELEPON)
export async function createContactAction(name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!name.trim()) return { error: "Nama tidak boleh kosong" };

  await db.insert(contacts).values({
    ownerId: userId,
    name: name.trim(),
  });

  revalidatePath("/contacts"); // Refresh halaman kontak (kalau ada)
  return { success: true };
}

// 3. HAPUS KONTAK
export async function deleteContactAction(contactId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(contacts).where(
    and(
      eq(contacts.id, contactId),
      eq(contacts.ownerId, userId) // Pastikan cuma bisa hapus punya sendiri
    )
  );

  revalidatePath("/contacts");
  return { success: true };
}
