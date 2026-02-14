"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Member } from "@/types/expenses";

import { ItemizedExpenseForm } from "./itemized-expense-form";
import { SimpleExpenseForm } from "./simple-expense-form";

export function AddExpenseWrapper({
  groupId,
  members,
}: {
  groupId: string;
  members: Member[];
}) {
  const [mode, setMode] = useState<"SIMPLE" | "ITEMIZED">("SIMPLE");

  return (
    <Tabs
      defaultValue="SIMPLE"
      className="w-full"
      onValueChange={(value) => setMode(value as "SIMPLE" | "ITEMIZED")}
    >
      <TabsList className="mb-4 grid w-full grid-cols-2">
        <TabsTrigger value="SIMPLE">Simple Split</TabsTrigger>
        <TabsTrigger value="ITEMIZED">Detail Struk</TabsTrigger>
      </TabsList>

      <TabsContent value="SIMPLE">
        <SimpleExpenseForm groupId={groupId} members={members} mode={mode} />
      </TabsContent>

      <TabsContent value="ITEMIZED">
        <ItemizedExpenseForm groupId={groupId} members={members} mode={mode} />
      </TabsContent>
    </Tabs>
  );
}
