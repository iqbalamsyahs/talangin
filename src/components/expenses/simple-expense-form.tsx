"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput } from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createExpenseAction } from "@/actions/expenses";
import { formatCurrency } from "@/lib/currency";

interface Member {
    id: string;
    name: string;
}

export function SimpleExpenseForm({ groupId, members, mode }: { groupId: string, members: Member[], mode: 'SIMPLE' | 'ITEMIZED' }) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [payerId, setPayerId] = useState(members[0]?.id || "");

    // Default: Semua member terpilih (biasanya kan bagi rata semua)
    const [selectedMembers, setSelectedMembers] = useState<string[]>(
        members.map((m) => m.id)
    );

    const handleToggleMember = (memberId: string) => {
        if (selectedMembers.includes(memberId)) {
            setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
        } else {
            setSelectedMembers([...selectedMembers, memberId]);
        }
    };

    // Helper: Pilih Semua / Hapus Semua
    const toggleSelectAll = () => {
        if (selectedMembers.length === members.length) {
            setSelectedMembers([]); // Uncheck all
        } else {
            setSelectedMembers(members.map(m => m.id)); // Check all
        }
    };

    const handleSubmit = async () => {
        if (!amount || Number(amount) <= 0) return;

        await createExpenseAction({
            mode,
            groupId,
            description,
            payerMemberId: payerId,
            date: new Date(),
            totalAmount: Number(amount),
            splitWithMemberIds: selectedMembers,
        });
    };

    // Hitung per orang (Realtime preview)
    const splitAmount = selectedMembers.length > 0
        ? Math.round(Number(amount) / selectedMembers.length)
        : 0;

    return (
        <div className="space-y-6 pb-16">
            {/* 1. Detail Transaksi */}
            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <Label>Judul Transaksi</Label>
                        <Input
                            placeholder="Contoh: Gorengan Pagi"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            autoFocus
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
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </InputGroup>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Siapa yang nalangin?</Label>
                        <Select value={payerId} onValueChange={setPayerId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih yang nalangin" />
                            </SelectTrigger>
                            <SelectContent>
                                {members.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Pilih Member (Split) */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <Label>Dibagi ke siapa aja?</Label>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-primary"
                        onClick={toggleSelectAll}
                    >
                        {selectedMembers.length === members.length ? "Hapus Semua" : "Pilih Semua"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className={`flex items-center space-x-3 border p-3 rounded-lg transition-colors ${selectedMembers.includes(member.id) ? "bg-primary/5 border-primary" : "bg-white"
                                }`}
                        >
                            <Checkbox
                                id={member.id}
                                checked={selectedMembers.includes(member.id)}
                                onCheckedChange={() => handleToggleMember(member.id)}
                            />
                            <label
                                htmlFor={member.id}
                                className="text-sm font-medium leading-none cursor-pointer flex-1 flex items-center justify-between"
                            >
                                <span>{member.name}</span>
                                {/* Preview nominal per orang di sebelah nama */}
                                {selectedMembers.includes(member.id) && (
                                    <span className="text-xs text-muted-foreground">
                                        {formatCurrency(splitAmount)}
                                    </span>
                                )}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Footer Summary */}
            <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t shadow-lg z-50 md:bottom-0">
                <div className="container max-w-md mx-auto flex justify-between items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                            {selectedMembers.length} orang x {formatCurrency(splitAmount)}
                        </span>
                        <span className="font-bold text-lg">
                            Total {formatCurrency(Number(amount))}
                        </span>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={!description || !amount || selectedMembers.length === 0}
                        size="lg"
                    >
                        Simpan Transaksi
                    </Button>
                </div>
            </div>
        </div>
    );
}