import { format } from "date-fns";
import { id } from "date-fns/locale"; // Bahasa Indonesia
import { ArrowRightLeft, Receipt } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

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
      className={cn(
        "mb-3 border-l-4 transition-colors",
        isSettlement
          ? "border-l-emerald-500 bg-emerald-50/40 dark:border-l-emerald-500 dark:bg-emerald-950/10"
          : "border-l-blue-500 dark:border-l-blue-500"
      )}
    >
      <CardContent className="flex items-center justify-between p-4">
        {/* Kiri: Icon & Detail */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "rounded-full p-2.5",
              isSettlement
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            )}
          >
            {isSettlement ? (
              <ArrowRightLeft className="h-5 w-5" />
            ) : (
              <Receipt className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="text-foreground line-clamp-1 text-sm font-semibold">
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
            className={cn(
              "font-bold tabular-nums",
              isSettlement
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-foreground"
            )}
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
