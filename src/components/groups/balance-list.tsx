import { formatCurrency } from "@/lib/currency";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface Member {
    id: string;
    name: string;
    avatarUrl?: string | null;
}

interface BalanceListProps {
    members: Member[];
    balances: Record<string, number>;
}

export function BalanceList({ members, balances }: BalanceListProps) {
    // Urutkan: Yang paling berhak dapat duit (Positif terbesar) di paling atas
    const sortedMembers = [...members].sort((a, b) => {
        return (balances[b.id] || 0) - (balances[a.id] || 0);
    });

    return (
        <div className="space-y-3">
            {sortedMembers.map((member) => {
                const balance = balances[member.id] || 0;
                const isOwed = balance > 0; // Dia dapet duit
                const isDept = balance < 0; // Dia ngutang
                const isSettled = balance === 0; // Impas

                return (
                    <Card key={member.id} className="overflow-hidden">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {member.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {isSettled ? "Sudah lunas" : isOwed ? "Mendapat kembali" : "Harus membayar"}
                                    </p>
                                </div>
                            </div>

                            <div className={`font-bold ${isOwed ? "text-green-600" : isDept ? "text-red-500" : "text-gray-400"}`}>
                                {isSettled ? "Lunas" : formatCurrency(Math.abs(balance))}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}