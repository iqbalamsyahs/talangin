"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput } from "@/components/ui/input-group";
import { Trash2, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { createExpenseAction, updateExpenseAction } from "@/actions/expenses"; // Server Action tadi
import { format } from "date-fns";

interface Member {
    id: string;
    name: string;
}

interface ItemData { id: number; name: string; price: number | string; assignedTo: string; }

interface InitialData {
    expenseId: string;
    description: string;
    payerId: string;
    tax: number;
    discount: number;
    items: ItemData[];
    date?: Date;
}

interface ItemizedExpenseFormProps {
    groupId: string;
    members: Member[];
    mode: 'SIMPLE' | 'ITEMIZED';
    initialData?: InitialData;
}

export function ItemizedExpenseForm({ groupId, members, mode, initialData }: ItemizedExpenseFormProps) {
    const [description, setDescription] = useState(initialData?.description || "");
    const [payerId, setPayerId] = useState(initialData?.payerId || members[0]?.id || "");

    // State untuk Angka-angka
    const [tax, setTax] = useState<number | string>(initialData?.tax || "");
    const [discount, setDiscount] = useState<number | string>(initialData?.discount || "");

    const [date, setDate] = useState(
        initialData?.date
            ? format(initialData.date, "yyyy-MM-dd")
            : format(new Date(), "yyyy-MM-dd")
    );

    // State untuk List Item Makanan
    const [items, setItems] = useState<ItemData[]>(
        initialData?.items || [
            { id: 1, name: "", price: 0, assignedTo: members[0]?.id || "" }
        ]
    );

    // Helper: Tambah Baris Kosong
    const addItem = () => {
        setItems([...items, { id: Date.now(), name: "", price: "", assignedTo: members[0]?.id || "" }]);
    };

    // Helper: Hapus Baris
    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    // Helper: Update Data Item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];

        // @ts-expect-error: field string indexing
        newItems[index][field] = value;
        setItems(newItems);
    };

    // Hitung Subtotal Otomatis
    const subtotal = items.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
    const totalAkhir = subtotal + Number(tax) - Number(discount);

    // Handle Submit
    const handleSubmit = async () => {
        const payloadDate = new Date(date);

        const commonPayload = {
            mode,
            groupId,
            description,
            payerMemberId: payerId,
            date: payloadDate,
            subtotal,
            tax: Number(tax),
            discount: Number(discount),
            items: items.map(i => ({
                name: i.name || "Item",
                price: Number(i.price),
                assignedTo: i.assignedTo
            }))
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

    return (
        <div className="space-y-6 pb-16">
            {/* 1. Judul & Payer */}
            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <Label>Judul Transaksi</Label>
                        <Input
                            placeholder="Contoh: Ayam Ria Rio"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Tanggal</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
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

            {/* 2. Global Info (Pajak/Diskon) */}
            <Card>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label>Ongkir/Pajak (+)</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>Rp</InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput type="number" placeholder="0" value={tax} onChange={(e) => setTax(e.target.value)} />
                        </InputGroup>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Diskon (-)</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>Rp</InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput type="number" placeholder="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                        </InputGroup>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Item List (Dagingnya) */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <Label>Rincian Pesanan</Label>
                    <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" /> Tambah Menu</Button>
                </div>

                {items.map((item, index) => (
                    <Card key={item.id} className="relative">
                        <CardContent className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-2">
                                {/* Nama Menu */}
                                <div className="flex-1 flex flex-col gap-2">
                                    <Label className="text-xs">Menu</Label>
                                    <Input
                                        placeholder="Nasi..."
                                        value={item.name}
                                        onChange={(e) => updateItem(index, "name", e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive shrink-0 h-8 w-8 mt-6"
                                    onClick={() => removeItem(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Harga */}
                                <div className="flex flex-col gap-2">
                                    <Label className="text-xs">Harga</Label>
                                    <InputGroup className="h-9">
                                        <InputGroupAddon className="px-2">
                                            <InputGroupText className="text-xs">Rp</InputGroupText>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            type="number"
                                            placeholder="0"
                                            value={item.price}
                                            onChange={(e) => updateItem(index, "price", e.target.value)}
                                            className="px-2 text-xs"
                                        />
                                    </InputGroup>
                                </div>

                                {/* Pemilik */}
                                <div className="flex flex-col gap-2">
                                    <Label className="text-xs">Milik</Label>
                                    <Select
                                        value={item.assignedTo}
                                        onValueChange={(value) => updateItem(index, "assignedTo", value)}
                                    >
                                        <SelectTrigger className="w-full h-9 text-xs px-2">
                                            <SelectValue placeholder="Pilih" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {members.map((m) => (
                                                <SelectItem key={m.id} value={m.id}>{m.name.split(" ")[0]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 4. Footer Summary & Save */}
            <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t shadow-lg md:bottom-0">
                <div className="container max-w-md mx-auto flex justify-between items-center">
                    <div>
                        <p className="text-xs text-muted-foreground">Total Bayar</p>
                        <p className="font-bold text-xl">{formatCurrency(totalAkhir)}</p>
                    </div>
                    <Button size="lg" onClick={handleSubmit} disabled={totalAkhir <= 0 || !description}>
                        Simpan Transaksi
                    </Button>
                </div>
            </div>
        </div>
    );
}
