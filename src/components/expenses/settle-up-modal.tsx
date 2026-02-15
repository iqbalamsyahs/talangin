"use client";

import { ArrowRight, Banknote, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { createSettlement } from "@/actions/expenses";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import { Member } from "@/types/expenses";

interface SettleUpModalProps {
  groupId: string;
  members: Member[];
  balances: Record<string, number>;
}

export function SettleUpModal({
  groupId,
  members,
  balances,
}: SettleUpModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Default: Orang pertama bayar ke orang kedua
  const [fromId, setFromId] = useState(members[0]?.id || "");
  const [toId, setToId] = useState(members[1]?.id || "");

  // --- LOGIC SARAN OTOMATIS (AUTO-FILL) ---
  const suggestion = useMemo(() => {
    const payerBalance = balances[fromId] || 0; // Saldo Pengirim
    const receiverBalance = balances[toId] || 0; // Saldo Penerima

    // Syarat Saran Muncul:
    // 1. Pengirim punya utang (Saldo Negatif)
    // 2. Penerima punya piutang (Saldo Positif)
    if (payerBalance < 0 && receiverBalance > 0) {
      // Nominal saran adalah yang paling kecil antara:
      // - Total utang si pengirim (biar dia lunas)
      // - ATAU Total piutang si penerima (biar dia lunas)
      const value = Math.min(Math.abs(payerBalance), receiverBalance);
      return Math.round(value);
    }
    return 0;
  }, [fromId, toId, balances]);

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
      description: description,
    });

    router.push(`/groups/${groupId}?tab=expenses`);
    router.refresh();
    setOpen(false);
    setAmount("");
    setDescription("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
        >
          <Banknote className="mr-2 h-4 w-4" />
          Catat Pelunasan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Catat Pelunasan</DialogTitle>
          <DialogDescription>
            Catat pembayaran antar anggota untuk melunasi hutang.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-8 py-4">
          {/* FLOW: FROM -> TO */}
          <div className="bg-muted/50 relative flex items-center justify-between gap-4 rounded-lg p-4">
            {/* PAYER */}
            <div className="flex-1 space-y-2 text-center">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Yang Bayar
              </Label>
              <div className="flex flex-col items-center gap-2">
                <Select value={fromId} onValueChange={setFromId}>
                  <SelectTrigger className="flex h-auto w-full justify-center gap-2 border-none bg-transparent p-0 text-sm font-medium shadow-none focus:ring-0 [&>svg]:hidden">
                    <SelectValue placeholder="Pilih anggota" />
                  </SelectTrigger>
                  <SelectContent align="center">
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={m.avatarUrl || ""} />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                          {m.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ARROW */}
            <div className="bg-background flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm">
              <ArrowRight className="text-muted-foreground h-4 w-4" />
            </div>

            {/* RECEIVER */}
            <div className="flex-1 space-y-2 text-center">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Penerima
              </Label>
              <div className="flex flex-col items-center gap-2">
                <Select value={toId} onValueChange={setToId}>
                  <SelectTrigger className="flex h-auto w-full justify-center gap-2 border-none bg-transparent p-0 text-sm font-medium shadow-none focus:ring-0 [&>svg]:hidden">
                    <SelectValue placeholder="Pilih anggota" />
                  </SelectTrigger>
                  <SelectContent align="center">
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={m.avatarUrl || ""} />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                          {m.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* AMOUNT */}
          <div className="space-y-4 text-center">
            <Label className="text-muted-foreground">Jumlah Uang</Label>
            <InputGroup className="h-14">
              <InputGroupAddon className="px-3">
                <span className="text-muted-foreground text-lg font-bold">
                  Rp
                </span>
              </InputGroupAddon>
              <InputGroupInput
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-center text-2xl font-bold tracking-tight"
              />
            </InputGroup>

            {/* SUGGESTION */}
            {suggestion > 0 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-primary hover:bg-primary/10 w-full gap-2"
                onClick={() => setAmount(suggestion.toString())}
              >
                <Sparkles className="h-4 w-4" />
                <span>Isi Otomatis: {formatCurrency(suggestion)}</span>
              </Button>
            )}

            {/* DESCRIPTION */}
            <div className="space-y-2 text-left">
              <Label htmlFor="description" className="text-muted-foreground">
                Keterangan (Opsional)
              </Label>
              <Input
                id="description"
                placeholder="Contoh: Bayar makan siang"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full text-base font-semibold"
            disabled={!amount || !fromId || !toId}
          >
            Konfirmasi Pelunasan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
