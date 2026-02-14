import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { Member, Settlement } from "@/types/expenses";

export function SettlementPlan({
  plan,
  members,
}: {
  plan: Settlement[];
  members: Member[];
}) {
  if (plan.length === 0) return null;

  // Helper buat cari nama member berdasarkan ID
  const getName = (id: string) =>
    members.find((m) => m.id === id)?.name || "Unknown";

  return (
    <Card className="mt-6 gap-2 border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold tracking-wider text-orange-800 uppercase">
          Saran Pelunasan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {plan.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-lg border border-orange-100 bg-white p-3 shadow-sm"
          >
            {/* Sisi Kiri: Siapa ke Siapa */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-rose-600 dark:text-rose-400">
                {getName(item.from)}
              </span>
              <ArrowRight className="text-muted-foreground h-4 w-4" />
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {getName(item.to)}
              </span>
            </div>

            {/* Sisi Kanan: Nominal */}
            <div className="text-foreground font-bold">
              {formatCurrency(item.amount)}
            </div>
          </div>
        ))}
        <p className="text-muted-foreground mt-2 text-center text-[10px]">
          *Ikuti daftar ini agar saldo semua orang jadi nol.
        </p>
      </CardContent>
    </Card>
  );
}
