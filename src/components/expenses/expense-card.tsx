import { format } from "date-fns";
import { id } from "date-fns/locale"; // Bahasa Indonesia
import { ArrowRightLeft, Receipt } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";

import { ExpenseMenu } from "./expense-menu";

interface ExpenseCardProps {
  expenseId: string;
  groupId: string;
  isOwner: boolean;
  description: string;
  amount: number;
  payerName: string;
  date: Date | null;
  category: "EXPENSE" | "SETTLEMENT";
}

export function ExpenseCard({
  expenseId,
  groupId,
  isOwner,
  description,
  amount,
  payerName,
  date,
  category,
}: ExpenseCardProps) {
  const isSettlement = category === "SETTLEMENT";

  return (
    <Card
      className={`mb-3 border-l-4 ${isSettlement ? "border-l-green-500 bg-green-50/50" : "border-l-blue-500"}`}
    >
      <CardContent className="flex items-center justify-between p-4">
        {/* Kiri: Icon & Detail */}
        <div className="flex items-center gap-3">
          <div
            className={`rounded-full p-2 ${isSettlement ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
          >
            {isSettlement ? (
              <ArrowRightLeft className="h-5 w-5" />
            ) : (
              <Receipt className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="line-clamp-1 text-sm font-semibold">
              {description}
            </h3>
            <p className="text-muted-foreground text-xs">
              {payerName} • {date ? format(date, "d MMM", { locale: id }) : "-"}
            </p>
          </div>
        </div>

        {/* Kanan: Nominal & Menu */}
        <div className="flex items-center gap-2">
          <div
            className={`font-bold ${isSettlement ? "text-green-600" : "text-gray-900"}`}
          >
            {formatCurrency(amount)}
          </div>

          <ExpenseMenu
            expenseId={expenseId}
            groupId={groupId}
            isOwner={isOwner}
          />
        </div>
      </CardContent>
    </Card>
  );
}
