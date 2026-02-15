"use client";

import { Ghost, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteMemberAction } from "@/actions/members";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface MemberItemProps {
  member: {
    id: string;
    userId: string | null;
    name: string;
  };
  groupId: string;
  isOwner: boolean; // Cek apakah user yg login adalah owner grup
}

export function MemberItem({ member, groupId, isOwner }: MemberItemProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteMemberAction(member.id, groupId);
    setLoading(false);
    if (res?.error) {
      toast.success(res.error);
    } else {
      router.refresh(); // Refresh halaman biar member hilang dari list
    }
  };

  return (
    <div className="bg-muted/20 flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 border">
          <AvatarFallback
            className={
              member.userId
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }
          >
            {member.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{member.name}</p>
          <div className="text-muted-foreground flex items-center gap-1 text-[10px]">
            {member.userId ? (
              <>
                <User className="h-3 w-3" /> Terdaftar
              </>
            ) : (
              <>
                <Ghost className="h-3 w-3" /> Manual
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tombol Hapus: Hanya muncul jika User Login adalah Owner Grup */}
      {isOwner && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus {member.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Pastikan member ini tidak memiliki transaksi (bayar/utang) di
                grup ini. Jika ada, hapus dulu transaksinya.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
                disabled={loading}
              >
                {loading ? "Menghapus..." : "Ya, Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
