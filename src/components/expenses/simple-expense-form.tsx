import { format } from "date-fns";
import { useState } from "react";

import { createExpenseAction, updateExpenseAction } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatCurrency } from "@/lib/currency";
import { Member, SimpleExpenseInitialData } from "@/types/expenses";

interface SimpleFormProps {
  groupId: string;
  members: Member[];
  mode: "SIMPLE" | "ITEMIZED";
  initialData?: SimpleExpenseInitialData;
}

export function SimpleExpenseForm({
  groupId,
  members,
  mode,
  initialData,
}: SimpleFormProps) {
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [amount, setAmount] = useState(initialData?.amount.toString() || "");
  const [payerId, setPayerId] = useState(
    initialData?.payerId || members[0]?.id || ""
  );
  const [date, setDate] = useState(
    initialData?.date
      ? format(initialData.date, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  );

  // Default: Semua member terpilih
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    initialData?.selectedMemberIds || members.map((m) => m.id)
  );

  const handleToggleMember = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map((m) => m.id));
    }
  };

  const formAction = async () => {
    if (!amount || Number(amount) <= 0) return;

    const payloadDate = new Date(date);

    const commonPayload = {
      mode,
      groupId,
      description,
      payerMemberId: payerId,
      date: payloadDate,
      totalAmount: Number(amount),
      splitWithMemberIds: selectedMembers,
    };

    if (initialData) {
      await updateExpenseAction({
        ...commonPayload,
        expenseId: initialData.expenseId,
      });
    } else {
      await createExpenseAction(commonPayload);
    }
  };

  const splitAmount =
    selectedMembers.length > 0
      ? Math.round(Number(amount) / selectedMembers.length)
      : 0;

  return (
    <form action={formAction} className="space-y-6 pb-40">
      {/* 1. Detail Transaksi */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label>Judul Transaksi</Label>
            <Input
              name="description"
              placeholder="Contoh: Gorengan Pagi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tanggal Transaksi</Label>
            <Input
              type="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Total Harga</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>Rp</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                type="number"
                name="amount"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </InputGroup>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Siapa yang nalangin?</Label>
            <Select value={payerId} onValueChange={setPayerId} name="payerId">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih yang nalangin" />
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
        </CardContent>
      </Card>

      {/* 2. Pilih Member (Split) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <Label>Dibagi ke siapa aja?</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary h-8 text-xs"
            onClick={toggleSelectAll}
          >
            {selectedMembers.length === members.length
              ? "Hapus Semua"
              : "Pilih Semua"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {members.map((member) => (
            <div
              key={member.id}
              className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors ${
                selectedMembers.includes(member.id)
                  ? "bg-primary/5 border-primary"
                  : "bg-white"
              }`}
            >
              <Checkbox
                id={member.id}
                checked={selectedMembers.includes(member.id)}
                onCheckedChange={() => handleToggleMember(member.id)}
              />
              <label
                htmlFor={member.id}
                className="flex flex-1 cursor-pointer items-center justify-between text-sm leading-none font-medium"
              >
                <span>{member.name}</span>
                {/* Preview nominal per orang di sebelah nama */}
                {selectedMembers.includes(member.id) && (
                  <span className="text-muted-foreground text-xs">
                    {formatCurrency(splitAmount)}
                  </span>
                )}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Footer Summary */}
      <div className="bg-background fixed right-0 bottom-16 left-0 z-50 border-t p-4 shadow-lg md:bottom-0">
        <div className="container mx-auto flex max-w-md items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              {selectedMembers.length} orang x {formatCurrency(splitAmount)}
            </span>
            <span className="text-lg font-bold">
              Total {formatCurrency(Number(amount))}
            </span>
          </div>
          <SubmitButton
            disabled={!description || !amount || selectedMembers.length === 0}
            size="lg"
            className="shadow-primary/20 hover:shadow-primary/30 h-11 text-base font-medium shadow-lg transition-all"
          >
            {initialData ? "Simpan Perubahan" : "Simpan Transaksi"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
