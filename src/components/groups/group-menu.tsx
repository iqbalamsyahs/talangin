"use client";

import { MoreVertical, Settings, Trash2 } from "lucide-react";
import { useState } from "react";

import { deleteGroupAction } from "@/actions/groups"; // Import action tadi
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

export function GroupMenu({
  groupId,
  groupName,
  isOwner,
}: {
  groupId: string;
  groupName: string;
  isOwner: boolean;
}) {
  const [openAlert, setOpenAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Kalau bukan owner, jangan kasih menu hapus
  if (!isOwner) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteGroupAction(groupId);
    // Redirect dihandle server, tapi state loading perlu biar tombol gak diklik 2x
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled>
            <Settings className="mr-2 h-4 w-4" /> Edit Grup (Soon)
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setOpenAlert(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Hapus Grup
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus Grup &quot;{groupName}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini permanen! Semua data member, transaksi, dan riwayat utang
              di grup ini akan hilang selamanya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus Grup"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
