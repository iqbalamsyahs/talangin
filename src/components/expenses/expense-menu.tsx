"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteExpense } from "@/actions/expenses";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExpenseMenu({
  expenseId,
  groupId,
  isOwner,
}: {
  expenseId: string;
  groupId: string;
  isOwner: boolean;
}) {
  const [openAlert, setOpenAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Kalau bukan yang bikin, jangan kasih menu apa-apa (atau cuma Edit kalau boleh)
  if (!isOwner) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteExpense(expenseId);
    setIsDeleting(false);
    setOpenAlert(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Tombol Edit (Nanti kita fungsikan) */}
          <DropdownMenuItem
            onClick={() => router.push(`/groups/${groupId}/edit/${expenseId}`)}
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>

          {/* Tombol Delete (Memicu Alert) */}
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setOpenAlert(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Pop-up Konfirmasi Hapus */}
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Saldo akan dihitung ulang
              otomatis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
