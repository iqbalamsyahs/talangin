"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { addGhostMember } from "@/actions/members";
import { useRouter } from "next/navigation";

export function AddMemberModal({ groupId }: { groupId: string }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await addGhostMember(groupId, name);

        if (result?.success) {
            setOpen(false); // Tutup dialog
            setName("");    // Reset form
            router.refresh(); // Paksa refresh client
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full gap-2" variant="outline">
                    <UserPlus className="w-4 h-4" /> Tambah Teman Manual
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tambah Anggota Baru</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Teman</Label>
                        <Input
                            id="name"
                            placeholder="Contoh: Budi, Siti, Udin"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
                        {loading ? "Menambahkan..." : "Simpan"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
