"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { updateExpenseAction } from "@/actions/expenses";
import { format } from "date-fns";

interface Member {
    id: string;
    name: string;
}

interface EditSettlementProps {
    groupId: string;
    members: Member[];
    initialData: {
        expenseId: string;
        amount: number;
        fromId: string; // Yang Bayar
        toId: string;   // Yang Terima
        date: Date;
    };
}

export function EditSettlementForm({ groupId, members, initialData }: EditSettlementProps) {
    const [amount, setAmount] = useState(initialData.amount.toString());
    const [fromId, setFromId] = useState(initialData.fromId);
    const [toId, setToId] = useState(initialData.toId);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState(
        format(initialData.date, "yyyy-MM-dd")
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !fromId || !toId) return;
        if (fromId === toId) {
            alert("Pengirim dan Penerima tidak boleh sama!");
            return;
        }

        setIsSubmitting(true);

        // Kita pakai updateExpenseAction mode "SIMPLE"
        // Triknya: splitWithMemberIds cuma diisi 1 orang (si Penerima)
        // Jadi 100% beban akan lari ke si Penerima.
        await updateExpenseAction({
            mode: "SIMPLE",
            expenseId: initialData.expenseId,
            groupId,
            description: "Pelunasan Utang", // Default text
            payerMemberId: fromId,           // Si Pengirim Uang
            date: new Date(date),
            totalAmount: Number(amount),
            splitWithMemberIds: [toId],      // Si Penerima Uang (kena beban saldo)
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Pelunasan</CardTitle>
                <CardDescription>Ubah detail pembayaran utang.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* FROM -> TO */}
                    <div className="space-y-2">
                        <Label>Tanggal Bayar</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 justify-between">
                        <div className="flex-1 space-y-2">
                            <Label>Yang Bayar</Label>
                            <select
                                className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                                value={fromId} onChange={(e) => setFromId(e.target.value)}
                            >
                                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>

                        <ArrowRight className="w-5 h-5 text-muted-foreground mt-8" />

                        <div className="flex-1 space-y-2">
                            <Label>Penerima</Label>
                            <select
                                className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                                value={toId} onChange={(e) => setToId(e.target.value)}
                            >
                                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
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

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                        {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}