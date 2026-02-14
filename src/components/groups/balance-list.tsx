import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { Member } from "@/types/expenses";

interface BalanceListProps {
  members: Member[];
  balances: Record<string, number>;
}

export function BalanceList({ members, balances }: BalanceListProps) {
  // Urutkan: Yang paling berhak dapat duit (Positif terbesar) di paling atas
  const sortedMembers = [...members].sort((a, b) => {
    return (balances[b.id] || 0) - (balances[a.id] || 0);
  });

  // Cari nilai balance terbesar (absolut) untuk visualisasi bar relative
  const maxBalance = Math.max(
    ...Object.values(balances).map((b) => Math.abs(b)),
    0
  );

  return (
    <Card className="h-full gap-2 border-slate-200 bg-slate-50/50 shadow-none md:border md:shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold tracking-wider text-slate-800 uppercase">
          Status Saldo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedMembers.map((member) => {
          const balance = balances[member.id] || 0;
          const isOwed = balance > 0; // Dia dapet duit
          const isDept = balance < 0; // Dia ngutang
          const isSettled = balance === 0; // Impas

          // Hitung persentase bar relatif terhadap maxBalance
          // Minimal 1% biar bar nya keliatan dikit kalo nilainya kecil
          const percentage =
            maxBalance > 0
              ? Math.max(Math.abs(balance) / maxBalance, 0.01) * 100
              : 0;

          return (
            <div
              key={member.id}
              className="relative flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-4 shadow-sm hover:bg-slate-50/50 md:px-6"
            >
              {/* Background Bar Visual */}
              {!isSettled && (
                <div
                  className={cn(
                    "absolute bottom-0 left-0 h-[3px] rounded-br-lg rounded-bl-lg transition-all duration-500",
                    isOwed ? "bg-emerald-500/50" : "bg-rose-500/50"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="flex items-center gap-3 md:gap-4">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarImage src={member.avatarUrl || undefined} />
                  <AvatarFallback
                    className={cn(
                      "text-sm font-semibold",
                      isOwed
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : isDept
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {member.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-foreground/90 leading-none font-medium">
                    {member.name}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      isOwed
                        ? "text-emerald-600 dark:text-emerald-400"
                        : isDept
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-muted-foreground"
                    )}
                  >
                    {isSettled
                      ? "Sudah lunas"
                      : isOwed
                        ? "Mendapat kembali"
                        : "Harus membayar"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={cn(
                    "font-bold tabular-nums md:text-lg",
                    isOwed
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isDept
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground"
                  )}
                >
                  {isSettled ? (
                    <span className="text-sm font-medium">Lunas</span>
                  ) : (
                    formatCurrency(Math.abs(balance))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
