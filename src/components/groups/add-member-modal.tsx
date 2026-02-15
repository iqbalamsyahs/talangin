"use client";

import { Loader2, Save, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Action baru (Pastikan file ini sudah dibuat)
import {
  createContactAction,
  deleteContactAction,
  getContactsAction,
} from "@/actions/contacts";
// Action lama kamu
import { addGhostMember } from "@/actions/members";
import { ContactList } from "@/components/groups/contact-list";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contact } from "@/types/contact";

export function AddMemberModal({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false); // Loading saat add to group
  const router = useRouter();

  // State Khusus Kontak
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false); // Loading saat fetch data
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  // 1. Load Kontak saat modal dibuka
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/immutability
      fetchContacts();
    }
  }, [open]);

  const fetchContacts = async () => {
    setLoadingContacts(true);
    const data = await getContactsAction();
    setContacts(data);
    setLoadingContacts(false);
  };

  // 2. Logic Masuk ke Grup (Dipakai Manual & Dari Kontak)
  const handleAddToGroup = async (targetName: string) => {
    if (!targetName.trim()) return;
    setLoading(true);

    const result = await addGhostMember(groupId, targetName);

    if (result?.success) {
      setOpen(false);
      setName("");
      router.refresh();
    } else {
      toast.error("Gagal menambahkan member");
    }

    setLoading(false);
  };

  // 3. Logic Simpan Nama ke Daftar Kontak (Tanpa masuk grup dulu)
  const handleSaveToContact = async () => {
    if (!name.trim()) return;
    setLoadingContacts(true); // Pake loading contacts buat indikator

    await createContactAction(name);
    await fetchContacts(); // Refresh list

    setLoadingContacts(false);
  };

  // 4. Logic Hapus Kontak dari List
  const handleDeleteContact = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Biar gak ke-trigger klik parent
    setContactToDelete(id);
  };

  const executeDeleteContact = async () => {
    if (!contactToDelete) return;

    setLoadingContacts(true);
    await deleteContactAction(contactToDelete);
    await fetchContacts();
    setLoadingContacts(false);
    setContactToDelete(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2" variant="outline" size="sm">
          <UserPlus className="h-4 w-4" /> Tambah Teman
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Teman Baru</DialogTitle>
          <DialogDescription>
            Masukkan manual atau pilih dari daftar temanmu.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Input Manual</TabsTrigger>
            <TabsTrigger value="contacts">Ambil Kontak</TabsTrigger>
          </TabsList>

          {/* TAB 1: INPUT MANUAL */}
          <TabsContent value="manual" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Teman</Label>
              <Input
                id="name"
                placeholder="Contoh: Budi, Siti"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <p className="text-muted-foreground text-[10px]">
                Ketik nama teman yang ingin dimasukkan ke grup ini.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {/* Tombol Save Contact (Muncul kalau ada teks) */}
              {name.trim().length > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveToContact}
                  disabled={loadingContacts}
                  title="Simpan ke daftar kontak agar tidak perlu ketik ulang nanti"
                >
                  {loadingContacts ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              )}

              {/* Tombol Submit Utama */}
              <Button
                onClick={() => handleAddToGroup(name)}
                className="flex-1"
                disabled={loading || !name.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Masuk Grup
                  </>
                ) : (
                  "Masuk Grup"
                )}
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: DARI KONTAK */}
          <TabsContent value="contacts" className="pt-4">
            <ContactList
              contacts={contacts}
              loading={loadingContacts}
              onAddMember={handleAddToGroup}
              onDeleteContact={handleDeleteContact}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>

      <AlertDialog
        open={!!contactToDelete}
        onOpenChange={(isOpen) => !isOpen && setContactToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kontak?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kontak ini akan dihapus dari
              daftar teman Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={executeDeleteContact}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
