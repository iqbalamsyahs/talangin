import { formatCurrency } from "@/lib/currency";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Bahasa Indonesia
import { Receipt, ArrowRightLeft } from "lucide-react";

interface ExpenseCardProps {
    description: string;
    amount: number;
    payerName: string;
    date: Date | null;
    category: "EXPENSE" | "SETTLEMENT";
}

export function ExpenseCard({ description, amount, payerName, date, category }: ExpenseCardProps) {
    const isSettlement = category === "SETTLEMENT";

    return (
        <Card className={`mb-3 border-l-4 ${isSettlement ? "border-l-green-500 bg-green-50/50" : "border-l-blue-500"}`}>
            <CardContent className="p-4 flex justify-between items-center">
                {/* Kiri: Icon & Detail */}
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isSettlement ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                        {isSettlement ? <ArrowRightLeft className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm line-clamp-1">{description}</h3>
                        <p className="text-xs text-muted-foreground">
                            {payerName} • {date ? format(date, "d MMM", { locale: id }) : "-"}
                        </p>
                    </div>
                </div>

                {/* Kanan: Nominal */}
                <div className={`font-bold ${isSettlement ? "text-green-600" : "text-gray-900"}`}>
                    {formatCurrency(amount)}
                </div>
            </CardContent>
        </Card>
    );
}