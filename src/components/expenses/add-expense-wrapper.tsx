"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SimpleExpenseForm } from "./simple-expense-form";
import { ItemizedExpenseForm } from "./itemized-expense-form";

interface Member {
    id: string;
    name: string;
}

export function AddExpenseWrapper({ groupId, members }: { groupId: string, members: Member[] }) {
    const [mode, setMode] = useState<'SIMPLE' | 'ITEMIZED'>("SIMPLE");

    return (
        <Tabs defaultValue="SIMPLE" className="w-full" onValueChange={(value) => setMode(value as "SIMPLE" | "ITEMIZED")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
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