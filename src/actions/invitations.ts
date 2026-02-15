"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "@/db";
import { groupMembers, invitations } from "@/db/schema";

// 1. GENERATE LINK (Dipanggil Admin)
export async function generateInviteLinkAction(
  memberId: string,
  groupId: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Validasi: Pastikan yg request adalah member grup itu (atau admin)
  // (Code validasi admin bisa ditaruh sini)

  // Buat Token Unik (Tiket VIP)
  const token = nanoid(10); // Contoh: "x7s9d-Ks2a"

  // Simpan ke DB
  await db.insert(invitations).values({
    token,
    groupId,
    memberId,
  });

  // Return URL lengkap
  // Di local: http://localhost:3000/invite/x7s9d-Ks2a
  // Di prod: https://namadomain.com/invite/x7s9d-Ks2a
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return { url: `${baseUrl}/invite/${token}` };
}

// 2. ACCEPT INVITE (Dipanggil User/Teman)
export async function acceptInviteAction(token: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Silakan login dulu" };

  // Cari Tiketnya
  const invite = await db.query.invitations.findFirst({
    where: eq(invitations.token, token),
    with: {
      member: true, // Kita butuh data member aslinya
    },
  });

  if (!invite) return { error: "Link tidak valid / kadaluarsa." };
  if (invite.usedAt) return { error: "Link ini sudah pernah dipakai." };

  // PROSES PERJODOHAN (MERGE)
  // Update member manual (invite.memberId) dengan User ID yang login sekarang
  await db
    .update(groupMembers)
    .set({ userId: userId }) // <--- INI KUNCINYA
    .where(eq(groupMembers.id, invite.memberId));

  // Tandai tiket sudah dipakai
  await db
    .update(invitations)
    .set({ usedAt: new Date() })
    .where(eq(invitations.id, invite.id));

  return { success: true, groupId: invite.groupId };
}
