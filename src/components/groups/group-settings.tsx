"use client";

import { AlertTriangle, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteGroupAction, updateGroupNameAction } from "@/actions/groups"; // Pastikan action ini ada
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

interface GroupSettingsProps {
  groupId: string;
  groupName: string;
  isOwner: boolean;
}

export function GroupSettings({
  groupId,
  groupName,
  isOwner,
}: GroupSettingsProps) {
  const router = useRouter();

  const [openAlert, setOpenAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState(groupName);
  const [isSaving, setIsSaving] = useState(false);

  // --- LOGIC HAPUS GRUP ---
  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteGroupAction(groupId);
  };

  // --- LOGIC GANTI NAMA GROUP ---
  const handleUpdateName = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    const result = await updateGroupNameAction(groupId, name);
    setIsSaving(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Nama grup berhasil diubah!");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. EDIT INFORMASI GRUP */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Grup</CardTitle>
          <CardDescription>Ubah nama grup kamu di sini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Nama Grup</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isOwner}
          />
        </CardContent>
        <CardFooter className="border-t px-6 pt-4">
          <SubmitButton
            onClick={handleUpdateName}
            isLoading={isSaving}
            disabled={!isOwner || name === groupName || !name.trim()}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              "Menyimpan..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
              </>
            )}
          </SubmitButton>
        </CardFooter>
      </Card>

      {/* 2. DANGER ZONE (Hapus Grup) */}
      {isOwner && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" /> Danger Zone
            </CardTitle>
            <CardDescription>
              Tindakan ini tidak bisa dibatalkan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setOpenAlert(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Hapus Grup Permanen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ALERT DIALOG */}
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin hapus grup ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Grup <b>&quot;{groupName}&quot;</b> akan hilang selamanya beserta
              semua data utang di dalamnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Musnahkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="text-center">
        <p className="text-muted-foreground text-xs">ID Grup: {groupId}</p>
      </div>
    </div>
  );
}
