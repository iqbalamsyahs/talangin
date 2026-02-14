"use client";

import { ArrowRight, Banknote } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSettlement } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Member } from "@/types/expenses";

export function SettleUpModal({
  groupId,
  members,
}: {
  groupId: string;
  members: Member[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");

  // Default: Orang pertama bayar ke orang kedua
  const [fromId, setFromId] = useState(members[0]?.id || "");
  const [toId, setToId] = useState(members[1]?.id || "");

  const handleSubmit = async () => {
    if (!amount || !fromId || !toId) return;
    if (fromId === toId) {
      alert("Orang yang bayar dan menerima tidak boleh sama!");
      return;
    }

    await createSettlement({
      groupId,
      fromMemberId: fromId,
      toMemberId: toId,
      amount: Number(amount),
      date: new Date(),
    });

    router.push(`/groups/${groupId}?tab=expenses`);
    router.refresh();
    setOpen(false);
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:text-green-800"
        >
          <Banknote className="mr-2 h-4 w-4" />
          Catat Pelunasan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Catat Pelunasan</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* FROM -> TO */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 space-y-2">
              <Label>Yang Bayar</Label>
              <Select value={fromId} onValueChange={setFromId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih anggota" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ArrowRight className="text-muted-foreground mt-6 h-5 w-5" />

            <div className="flex-1 space-y-2">
              <Label>Penerima</Label>
              <Select value={toId} onValueChange={setToId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih anggota" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* NOMINAL */}
          <div className="space-y-2">
            <Label>Jumlah Uang (Rp)</Label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-bold"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white hover:bg-green-700"
          >
            Konfirmasi Pelunasan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
