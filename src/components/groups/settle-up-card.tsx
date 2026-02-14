import { HandCoins } from "lucide-react";

import { SettleUpModal } from "@/components/expenses/settle-up-modal";
import { Member } from "@/types/expenses";

interface SettleUpCardProps {
  groupId: string;
  members: Member[];
  balances: Record<string, number>;
}

export function SettleUpCard({
  groupId,
  members,
  balances,
}: SettleUpCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-teal-50 p-6 shadow-sm">
      <div className="relative z-10 mb-4 flex items-center gap-4">
        <div className="rounded-xl bg-white/60 p-2.5 shadow-sm backdrop-blur-sm">
          <HandCoins className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-emerald-900">Pelunasan Hutang</h3>
          <p className="text-sm text-emerald-700/80">
            Catat pembayaran yang sudah selesai.
          </p>
        </div>
      </div>
      <div className="relative z-10">
        <SettleUpModal
          groupId={groupId}
          members={members}
          balances={balances}
        />
      </div>

      {/* Decoration */}
      <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-emerald-100/50 blur-2xl" />
      <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-teal-100/30 blur-3xl" />
    </div>
  );
}
