"use client";

import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { createExpenseAction, updateExpenseAction } from "@/actions/expenses"; // Server Action tadi
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatCurrency } from "@/lib/currency";
import {
  ExpenseItem,
  ItemizedExpenseInitialData,
  Member,
} from "@/types/expenses";

import { SubmitButton } from "../ui/submit-button";

interface ItemizedExpenseFormProps {
  groupId: string;
  members: Member[];
  mode: "SIMPLE" | "ITEMIZED";
  initialData?: ItemizedExpenseInitialData;
}

export function ItemizedExpenseForm({
  groupId,
  members,
  mode,
  initialData,
}: ItemizedExpenseFormProps) {
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [payerId, setPayerId] = useState(
    initialData?.payerId || members[0]?.id || ""
  );

  // State untuk Angka-angka
  const [tax, setTax] = useState<number | string>(initialData?.tax || "");
  const [discount, setDiscount] = useState<number | string>(
    initialData?.discount || ""
  );

  const [date, setDate] = useState(
    initialData?.date
      ? format(initialData.date, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  );

  // State untuk List Item Makanan
  const [items, setItems] = useState<ExpenseItem[]>(
    initialData?.items || [
      { id: 1, name: "", price: 0, assignedTo: members[0]?.id || "" },
    ]
  );

  // Helper: Tambah Baris Kosong
  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        name: "",
        price: "",
        assignedTo: members[0]?.id || "",
      },
    ]);
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
  const subtotal = items.reduce(
    (acc, item) => acc + (Number(item.price) || 0),
    0
  );
  const totalAkhir = subtotal + Number(tax) - Number(discount);

  // Handle Submit (Server Action Wrapper)
  const formAction = async () => {
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
      items: items.map((i) => ({
        name: i.name || "Item",
        price: Number(i.price),
        assignedTo: i.assignedTo,
      })),
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
    <form action={formAction} className="space-y-6 pb-48">
      {/* 1. Judul & Payer */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label>Judul Transaksi</Label>
            <Input
              name="description"
              placeholder="Contoh: Ayam Ria Rio"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tanggal</Label>
            <Input
              type="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
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

      {/* 2. Global Info (Pajak/Diskon) */}
      <Card>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Ongkir/Pajak (+)</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>Rp</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                type="number"
                name="tax"
                placeholder="0"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
              />
            </InputGroup>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Diskon (-)</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>Rp</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                type="number"
                name="discount"
                placeholder="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </InputGroup>
          </div>
        </CardContent>
      </Card>

      {/* 3. Item List (Dagingnya) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Rincian Pesanan</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-4 w-4" /> Tambah Menu
          </Button>
        </div>

        {items.map((item, index) => (
          <Card key={item.id} className="relative">
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                {/* Nama Menu */}
                <div className="flex flex-1 flex-col gap-2">
                  <Label className="text-xs">Menu</Label>
                  <Input
                    placeholder="Nasi..."
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    className="h-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive mt-6 h-8 w-8 shrink-0"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
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
                      onChange={(e) =>
                        updateItem(index, "price", e.target.value)
                      }
                      className="px-2 text-xs"
                    />
                  </InputGroup>
                </div>

                {/* Pemilik */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs">Milik</Label>
                  <Select
                    value={item.assignedTo}
                    onValueChange={(value) =>
                      updateItem(index, "assignedTo", value)
                    }
                  >
                    <SelectTrigger className="h-9 w-full px-2 text-xs">
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name.split(" ")[0]}
                        </SelectItem>
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
      <div className="bg-background fixed right-0 bottom-16 left-0 border-t p-4 shadow-lg md:bottom-0">
        <div className="container mx-auto flex max-w-md items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs">Total Bayar</p>
            <p className="text-xl font-bold">{formatCurrency(totalAkhir)}</p>
          </div>
          <SubmitButton
            size="lg"
            disabled={totalAkhir <= 0 || !description}
            className="shadow-primary/20 hover:shadow-primary/30 h-11 text-base font-medium shadow-lg transition-all"
          >
            {initialData ? "Simpan Perubahan" : "Simpan Transaksi"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
